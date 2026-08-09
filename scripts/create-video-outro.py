#!/usr/bin/env python3
"""Render the approved-style vertical outro used at the end of Reels/Stories."""

from __future__ import annotations

import math
import os
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "social" / "video-branding"
LOGO_PATH = OUTPUT_DIR / "logo-outro-transparent-v2.png"
OUTPUT_PATH = OUTPUT_DIR / "climbing-cyprus-outro-v10-2s.mp4"
TRANSPARENT_OUTPUT_PATH = OUTPUT_DIR / "climbing-cyprus-outro-transparent-v10-2s.mov"
PREVIEW_PATH = OUTPUT_DIR / "climbing-cyprus-outro-v10-2s-preview.png"

WIDTH, HEIGHT = 1080, 1920
FPS = 30
DURATION = 2.0
YELLOW = (246, 194, 24)
WHITE = (255, 255, 255)


def clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return max(low, min(value, high))


def ease_out_cubic(value: float) -> float:
    value = clamp(value)
    return 1 - (1 - value) ** 3


def ease_out_back(value: float) -> float:
    value = clamp(value)
    c1 = 1.70158
    c3 = c1 + 1
    shifted = value - 1
    return 1 + c3 * shifted**3 + c1 * shifted**2


def alpha_composite_center(base: Image.Image, layer: Image.Image, center: tuple[int, int]) -> None:
    left = int(center[0] - layer.width / 2)
    top = int(center[1] - layer.height / 2)
    base.alpha_composite(layer, (left, top))


def tracked_text(draw: ImageDraw.ImageDraw, text: str, center_x: float, y: float, font: ImageFont.FreeTypeFont,
                 fill: tuple[int, int, int, int], tracking: int) -> None:
    widths = [draw.textlength(char, font=font) for char in text]
    total = sum(widths) + tracking * max(0, len(text) - 1)
    x = center_x - total / 2
    for char, char_width in zip(text, widths):
        draw.text((x, y), char, font=font, fill=fill, anchor="la")
        x += char_width + tracking


logo_source = Image.open(LOGO_PATH).convert("RGBA")
logo_alpha_bounds = logo_source.getchannel("A").getbbox()
if logo_alpha_bounds:
    logo_source = logo_source.crop(logo_alpha_bounds)
font_bold = ImageFont.truetype("/System/Library/Fonts/Avenir Next Condensed.ttc", 58, index=5)
font_url = ImageFont.truetype("/System/Library/Fonts/Avenir Next.ttc", 48, index=5)


def make_frame(t: float, transparent: bool = False) -> Image.Image:
    if transparent:
        frame = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    else:
        pixels = np.zeros((HEIGHT, WIDTH, 4), dtype=np.uint8)
        for y in range(HEIGHT):
            ratio = y / (HEIGHT - 1)
            pixels[y, :, 0] = int(12 + 12 * ratio)
            pixels[y, :, 1] = int(12 + 10 * ratio)
            pixels[y, :, 2] = int(16 + 2 * ratio)
            pixels[y, :, 3] = 255
        frame = Image.fromarray(pixels, "RGBA")

    glow = Image.new("RGBA", frame.size, (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    pulse = 0.86 + 0.14 * math.sin(t * math.pi * 1.25)
    glow_draw.ellipse((145, 565, 935, 1355), fill=(*YELLOW, int(42 * pulse)))
    glow = glow.filter(ImageFilter.GaussianBlur(105))
    frame.alpha_composite(glow)

    logo_progress = ease_out_back((t - 0.10) / 0.52)
    # Start from the twice-reduced unit (0.64), then enlarge it by 10%.
    badge_size = max(2, int((555 * 0.704) * (0.72 + 0.28 * logo_progress)))
    disk_size = badge_size + 68
    center = (WIDTH // 2, 1000)

    shadow = Image.new("RGBA", frame.size, (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    half = disk_size // 2
    shadow_draw.ellipse(
        (center[0] - half, center[1] - half + 18, center[0] + half, center[1] + half + 18),
        fill=(0, 0, 0, int(170 * logo_progress)),
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(42))
    frame.alpha_composite(shadow)

    badge = Image.new("RGBA", (disk_size, disk_size), (0, 0, 0, 0))
    badge_draw = ImageDraw.Draw(badge)
    badge_draw.ellipse((0, 0, disk_size - 1, disk_size - 1), fill=(*WHITE, int(255 * logo_progress)))

    # Keep the square wordmark inside the circle's safe area so no letters clip.
    inner_width = int(badge_size * 0.759)
    logo_aspect = logo_source.width / logo_source.height
    inner_height = int(inner_width / logo_aspect)
    resized_logo = logo_source.resize((inner_width, inner_height), Image.Resampling.LANCZOS)
    animated_alpha = resized_logo.getchannel("A").point(lambda alpha: int(alpha * logo_progress))
    resized_logo.putalpha(animated_alpha)
    alpha_composite_center(badge, resized_logo, (disk_size // 2, disk_size // 2))
    alpha_composite_center(frame, badge, center)

    ring_progress = clamp((t - 0.30) / 0.75)
    ring = Image.new("RGBA", frame.size, (0, 0, 0, 0))
    ring_draw = ImageDraw.Draw(ring)
    radius = disk_size / 2 + 5
    bounds = (center[0] - radius, center[1] - radius, center[0] + radius, center[1] + radius)
    start = -90 + t * 7
    ring_draw.arc(bounds, start=start, end=start + 360 * ring_progress, fill=(*YELLOW, int(255 * ring_progress)), width=6)
    outer_radius = radius + 20
    outer_bounds = (
        center[0] - outer_radius,
        center[1] - outer_radius,
        center[0] + outer_radius,
        center[1] + outer_radius,
    )
    ring_draw.arc(
        outer_bounds,
        start=90 - t * 10,
        end=90 - t * 10 + 360 * ring_progress,
        fill=(255, 255, 255, int(150 * ring_progress)),
        width=3,
    )
    frame.alpha_composite(ring)

    text_layer = Image.new("RGBA", frame.size, (0, 0, 0, 0))
    text_draw = ImageDraw.Draw(text_layer)
    motto_progress = ease_out_cubic((t - 0.85) / 0.55)
    motto_y = 1345 + int((1 - motto_progress) * 30)
    tracked_text(
        text_draw,
        "CLIMB  |  EXPLORE  |  CONNECT",
        WIDTH / 2,
        motto_y,
        font_bold,
        (255, 255, 255, int(255 * motto_progress)),
        3,
    )
    url_progress = ease_out_cubic((t - 1.25) / 0.45)
    text_draw.text(
        (WIDTH / 2, 1445 + int((1 - url_progress) * 18)),
        "climbing-cyprus.com",
        font=font_url,
        fill=(238, 238, 235, int(255 * url_progress)),
        anchor="ma",
    )
    frame.alpha_composite(text_layer)

    fade = clamp((DURATION - t) / 0.35)
    if fade < 1 and not transparent:
        frame.alpha_composite(Image.new("RGBA", frame.size, (0, 0, 0, int(255 * (1 - fade)))))
    if fade < 1 and transparent:
        faded_alpha = frame.getchannel("A").point(lambda alpha: int(alpha * fade))
        frame.putalpha(faded_alpha)
    return frame if transparent else frame.convert("RGB")


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    ffmpeg = os.environ.get("FFMPEG_BIN")
    if not ffmpeg:
        try:
            import imageio_ffmpeg

            ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
        except ImportError as exc:
            raise SystemExit("Install imageio-ffmpeg or set FFMPEG_BIN") from exc

    command = [
        ffmpeg,
        "-y",
        "-f",
        "rawvideo",
        "-pix_fmt",
        "rgb24",
        "-s",
        f"{WIDTH}x{HEIGHT}",
        "-r",
        str(FPS),
        "-i",
        "-",
        "-an",
        "-c:v",
        "libx264",
        "-preset",
        "medium",
        "-crf",
        "18",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        str(OUTPUT_PATH),
    ]

    process = subprocess.Popen(command, stdin=subprocess.PIPE)
    assert process.stdin is not None
    preview_frame = int(1.55 * FPS)
    for frame_index in range(int(DURATION * FPS)):
        frame = make_frame(frame_index / FPS)
        if frame_index == preview_frame:
            frame.save(PREVIEW_PATH, quality=95)
        process.stdin.write(np.asarray(frame, dtype=np.uint8).tobytes())
    process.stdin.close()
    return_code = process.wait()
    if return_code:
        raise SystemExit(return_code)

    transparent_command = [
        ffmpeg,
        "-y",
        "-f",
        "rawvideo",
        "-pix_fmt",
        "rgba",
        "-s",
        f"{WIDTH}x{HEIGHT}",
        "-r",
        str(FPS),
        "-i",
        "-",
        "-an",
        "-c:v",
        "prores_ks",
        "-profile:v",
        "4",
        "-pix_fmt",
        "yuva444p10le",
        "-alpha_bits",
        "16",
        str(TRANSPARENT_OUTPUT_PATH),
    ]
    transparent_process = subprocess.Popen(transparent_command, stdin=subprocess.PIPE)
    assert transparent_process.stdin is not None
    for frame_index in range(int(DURATION * FPS)):
        frame = make_frame(frame_index / FPS, transparent=True)
        transparent_process.stdin.write(np.asarray(frame, dtype=np.uint8).tobytes())
    transparent_process.stdin.close()
    transparent_return_code = transparent_process.wait()
    if transparent_return_code:
        raise SystemExit(transparent_return_code)

    print(OUTPUT_PATH)
    print(TRANSPARENT_OUTPUT_PATH)
    print(PREVIEW_PATH)


if __name__ == "__main__":
    main()
