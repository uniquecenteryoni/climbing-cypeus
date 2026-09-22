import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const output = path.join(root, 'en');
const pages = [
  'index.html', 'activities.html', 'activity-hiking.html', 'climber-guide.html',
  'course.html', 'equipment.html', 'safety-quiz.html', 'tour-arches.html',
  'tour-avakas.html', 'tour-caledonia.html', 'tour-cedar-valley.html',
  'tour-phinikaria.html', 'tour-winter-troodos.html'
];

fs.mkdirSync(output, { recursive: true });

function rewriteAssets(html) {
  return html
    .replace(/(src|href)="(translations\.js|script\.js|language-routing\.js|style\.css|tour-page\.css|homepage-about-override\.css|favicon\.webp|pics\/|climber-quiz\/|waiver\/)/g, '$1="../$2')
    .replace(/href="(https?:|#|mailto:|tel:|\/)/g, 'href="__KEEP__$1')
    .replace(/href="(?!__KEEP__)([^"?]+\.html)/g, 'href="$1')
    .replace(/href="__KEEP__/g, 'href="')
    .replace(/src="(https?:|\/)/g, 'src="__KEEP__$1')
    .replace(/src="__KEEP__/g, 'src="');
}

function rewriteEnglishSeo(html, page) {
  const publicPath = page === 'index.html' ? '/en/' : `/en/${page}`;
  const hebrewPath = page === 'index.html' ? '/' : `/${page}`;
  const alternateLinks = `
    <link rel="alternate" hreflang="he" href="https://climbing-cyprus.com${hebrewPath}">
    <link rel="alternate" hreflang="en" href="https://climbing-cyprus.com${publicPath}">
    <link rel="alternate" hreflang="x-default" href="https://climbing-cyprus.com${hebrewPath}">`;
  const rewritten = html
    .replace(/<meta name="description" content="[^"]*">/i,
      '<meta name="description" content="Rock climbing in Cyprus, guided climbing tours, rappelling, gear rental and lead climbing courses with Climbing Cyprus.">')
    .replace(/<meta property="og:description" content="[^"]*">/i,
      '<meta property="og:description" content="Rock climbing, rappelling and outdoor adventures in Cyprus.">')
    .replace(/<meta name="twitter:description" content="[^"]*">/i,
      '<meta name="twitter:description" content="Rock climbing, rappelling and outdoor adventures in Cyprus.">')
    .replace(/<meta property="og:url" content="[^"]*">/i,
      `<meta property="og:url" content="https://climbing-cyprus.com${publicPath}">`)
    .replace(/<link rel="canonical" href="[^"]*">/i,
      `<link rel="canonical" href="https://climbing-cyprus.com${publicPath}">`)
    .replace(/<\/head>/i, `${alternateLinks}\n</head>`);

  if (page === 'safety-quiz.html') {
    return rewritten
      .replace(/<title>[^<]*<\/title>/i, '<title>How Good Are You at Clipping Quickdraws? Take the Quiz | Climbing Cyprus</title>')
      .replace(/property="og:title" content="[^"]*"/i, 'property="og:title" content="How Good Are You at Clipping Quickdraws? Take the Quiz | Climbing Cyprus"')
      .replace(/name="twitter:title" content="[^"]*"/i, 'name="twitter:title" content="How Good Are You at Clipping Quickdraws? Take the Quiz | Climbing Cyprus"')
      .replace(/property="og:description" content="[^"]*"/i, 'property="og:description" content="Test your quickdraw clipping skills and lead-climbing decision-making with this short safety quiz."')
      .replace(/name="twitter:description" content="[^"]*"/i, 'name="twitter:description" content="Test your quickdraw clipping skills and lead-climbing decision-making with this short safety quiz."')
      .replaceAll('https://climbing-cyprus.com/pics/safety-quiz-share.webp', 'https://climbing-cyprus.com/pics/safety-quiz-share-en.webp')
      .replace(/property="og:image:alt" content="[^"]*"/i, 'property="og:image:alt" content="How good are you at clipping quickdraws? Safety quiz"')
      .replace(/property="og:image:width" content="[^"]*"/i, 'property="og:image:width" content="941"')
      .replace(/property="og:image:height" content="[^"]*"/i, 'property="og:image:height" content="1672"');
  }
  return rewritten;
}

function addHebrewSeo(html, page) {
  if (html.includes('hreflang="en"')) return html;
  const hebrewPath = page === 'index.html' ? '/' : `/${page}`;
  const alternateLinks = `
    <link rel="alternate" hreflang="he" href="https://climbing-cyprus.com${hebrewPath}">
    <link rel="alternate" hreflang="en" href="https://climbing-cyprus.com/en${hebrewPath}">
    <link rel="alternate" hreflang="x-default" href="https://climbing-cyprus.com${hebrewPath}">`;
  const canonical = html.includes('rel="canonical"')
    ? ''
    : `\n    <link rel="canonical" href="https://climbing-cyprus.com${hebrewPath}">`;
  return html.replace(/<\/head>/i, `${canonical}${alternateLinks}\n</head>`);
}

for (const page of pages) {
  const sourcePath = path.join(root, page);
  const source = addHebrewSeo(fs.readFileSync(sourcePath, 'utf8'), page);
  fs.writeFileSync(sourcePath, source);
  let generated = rewriteEnglishSeo(rewriteAssets(source), page)
    .replace(/<html lang="he"/i, '<html lang="en"')
    .replace(/<html([^>]*?)dir="rtl"/i, '<html$1dir="ltr"')
    .replace(/<title>[^<]*<\/title>/i, '<title>Climbing Cyprus | Rock Climbing and Adventure Tours</title>');
  if (page === 'safety-quiz.html') {
    generated = generated.replace(/<title>[^<]*<\/title>/i, '<title>How Good Are You at Clipping Quickdraws? Take the Quiz | Climbing Cyprus</title>');
  }
  fs.writeFileSync(path.join(output, page), generated);
}

const prerender = spawnSync('python3', [path.join(root, 'scripts/prerender-english.py')], {
  cwd: root,
  encoding: 'utf8'
});
if (prerender.status !== 0) {
  process.stderr.write(prerender.stderr || 'English prerender failed\n');
  process.exit(prerender.status || 1);
}
process.stdout.write(prerender.stdout);

console.log(`Generated ${pages.length} English page copies in /en/`);
