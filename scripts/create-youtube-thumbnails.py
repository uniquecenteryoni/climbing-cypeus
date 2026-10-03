#!/usr/bin/env python3
"""Create a consistent vertical thumbnail set for the Cyprus bouldering playlist."""

from pathlib import Path
from urllib.request import urlopen
import ssl
from PIL import Image, ImageDraw, ImageFont, ImageEnhance

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "youtube-thumbnails"
SOURCE = OUT / "source"
OUT.mkdir(exist_ok=True)
SOURCE.mkdir(exist_ok=True)

VIDEOS = [
    ("epN1BNEgRNc", "RATATOUILLE", "6A (V3)"),
    ("SRHMxcG2Cac", "CARPACCIO", "6A+"),
    ("f99Y6tn190M", "THE MONTESSORI TEACH", "6A+"),
    ("zO5FReTJbM4", "TARTARE", "6B+"),
    ("9pDrJCdEiMQ", "ARGW", "6B+"),
    ("U_wgtZYHCUg", "VERTIGO", "6A+ (V3)"),
    ("7Ov_lbAC2s0", "LOWBALL", "6A (V3)"),
    ("tACH6tcqFeA", "RIFT", "6B"),
    ("n2QW7b0dn_E", "SKINNER", "6A (V3)"),
    ("CDMd0MRfvrk", "MIND OVER MAT", "6B+ (V4)"),
    ("rbvmwds_ljw", "MAKROVOUTI", "6B (V4)"),
    ("y7Io-dxm_eg", "RIHA EINAI RE MBEITE", "6A (V3)"),
    ("-zvkJetubm4", "DREAMS OF FLIGHT", "6A (V3)"),
    ("VAkeloSMAkE", "NIGHT BLINDNESS", "6B (V4)"),
    ("w8zV6-yqn9M", "OMICRON LIVES INSIDE ME", "6B+ (V4)"),
    ("mtR0TGni6RU", "ESCARGOT LIKES TO SIT", "6A (V3)"),
    ("j1cwPLWUPvo", "ESCARGOT POWER", "6B (V4)"),
    ("U7x6APw_pXc", "ROOM OF REQUIREMENT", "6C (V5)"),
    ("MpanhDBFW00", "SEISMIC WAVE", "6C+ (V5)"),
    ("bgMreZmM5Do", "RIDDLE ME THIS", "6C+ (V5)"),
    ("uAt1fGvGLjI", "PACHAMAMA", "7A+ (V7)"),
    ("UeHlRfCaxGQ", "O ZOGRAFOS", "7A (V6)"),
    ("Zn79JF_LT5g", "LIQUID SWORDS", "6B (V4)"),
    ("0axvzra_r1w", "IP MAN", "7A (V6)"),
    ("S9vQ6t3qTNg", "TYPEWRITER", "6A+ (V3)"),
    ("O8eWxrfF7vE", "SHIT IN THE DARK", "6A+ (V3)"),
    ("f47NDFT-FpQ", "DIASKOURI", "6C (V5)"),
    ("C-TvQnm3wI8", "HYDROPHOBIC", "6B (V4)"),
    ("tFGByYOnNeA", "GRAVEL PIT", "6B (V4)"),
    ("F2CbUaHU0kQ", "GLORY HOLE", "7A (V6)"),
    ("OEs7uWJwn6I", "EYES OF THE SPIDER", "6B (V4)"),
    ("53p8OfxR5-w", "SCOTTIE TOO HOTTIE", "7A (V6)"),
    ("DJCdxaEPol0", "CROSSFIT SDS", "7A (V6)"),
    ("ye1bPBLu4CI", "BLACK HEADED BUNTING", "7A (V6)"),
    ("yg7pxhwsAxA", "BANE", "7A (V6)"),
    ("6i8qq4RAikk", "ANCALAGON", "6B (V4)"),
]

FONT = "/System/Library/Fonts/Supplemental/DIN Condensed Bold.ttf"
ACCENT = (255, 212, 0)  # consistent yellow grade accent


def get_font(size):
    return ImageFont.truetype(FONT, size)


def fit_text(draw, text, max_width, start_size, min_size=42):
    size = start_size
    while size > min_size and draw.textbbox((0, 0), text, font=get_font(size))[2] > max_width:
        size -= 2
    return get_font(size)


def download_frame(video_id):
    path = SOURCE / f"{video_id}.jpg"
    if not path.exists():
        url = f"https://i.ytimg.com/vi/{video_id}/oar2.jpg"
        with urlopen(url, timeout=30, context=ssl._create_unverified_context()) as response:
            path.write_bytes(response.read())
    return path


def make_thumbnail(video_id, title, grade):
    image = Image.open(download_frame(video_id)).convert("RGB")
    image = image.resize((1080, 1920), Image.Resampling.LANCZOS)
    image = ImageEnhance.Contrast(image).enhance(1.08)
    image = ImageEnhance.Color(image).enhance(1.08)
    draw = ImageDraw.Draw(image, "RGBA")

    # Soft darkening keeps the climbing action visible while making the type readable.
    draw.rectangle((0, 0, 1080, 1920), fill=(0, 0, 0, 28))

    title_font = fit_text(draw, title, 900, 132)
    grade_font = get_font(112)
    title_box = draw.textbbox((0, 0), title, font=title_font, stroke_width=1)
    grade_box = draw.textbbox((0, 0), grade, font=grade_font, stroke_width=1)
    box_w = max(title_box[2], grade_box[2]) + 100
    box_h = (title_box[3] - title_box[1]) + (grade_box[3] - grade_box[1]) + 92
    x0 = (1080 - box_w) // 2
    y0 = 855
    draw.rounded_rectangle((x0, y0, x0 + box_w, y0 + box_h), radius=18, fill=(0, 0, 0, 220))

    title_x = (1080 - title_box[2]) // 2
    draw.text((title_x, y0 + 28), title, font=title_font, fill=(255, 255, 255, 255))
    grade_x = (1080 - grade_box[2]) // 2
    draw.text((grade_x, y0 + 28 + title_box[3] - title_box[1] + 10), grade,
              font=grade_font, fill=ACCENT)

    # Small channel mark, matching the reference layout without obscuring the action.
    mark_font = get_font(42)
    draw.text((48, 1815), "CLIMBING CYPRUS", font=mark_font, fill=(255, 255, 255, 230))

    image.save(OUT / f"{video_id}.jpg", quality=94, optimize=True)


for video_id, title, grade in VIDEOS:
    make_thumbnail(video_id, title, grade)

print(f"Created {len(VIDEOS)} thumbnails in {OUT}")
