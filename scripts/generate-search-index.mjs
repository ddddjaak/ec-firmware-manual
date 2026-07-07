/**
 * Generate static search index using Flexsearch (built-in CJK support).
 */
import { writeFileSync, mkdirSync, readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const docsDir = join(__dirname, '..', 'content', 'docs');

function findMdxFiles(dir, base = '') {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'meta.json') continue;
    const full = join(dir, entry.name);
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...findMdxFiles(full, rel));
    else if (entry.name.endsWith('.mdx')) files.push({ full, rel });
  }
  return files;
}

function extractTitle(content) {
  const fm = content.match(/^---\n([\s\S]*?)\n---/);
  if (fm) {
    const t = fm[1].match(/^title:\s*(.+)$/m);
    if (t) return t[1].trim();
  }
  const h = content.match(/^#\s+(.+)$/m);
  return h ? h[1].trim() : '';
}

function buildUrl(relPath) {
  let slug = relPath.replace(/\.mdx$/, '');
  if (slug.endsWith('/index')) slug = slug.replace(/\/index$/, '');
  return `/docs/${slug}`;
}

function extractBodyText(content) {
  return content
    .replace(/^---\n[\s\S]*?\n---/, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/[#*`~>|\[\]()!\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 5000);
}

async function main() {
  const FlexSearch = (await import('flexsearch')).Document;

  // Flexsearch Document with CJK-capable settings
  const index = new FlexSearch({
    document: {
      id: 'id',
      index: ['title', 'content', 'keywords'],
      store: ['title', 'url', 'content'],
    },
    tokenize: 'forward',
    charset: 'latin:extra',
    language: 'en',
    cache: 100,
  });

  const mdxFiles = findMdxFiles(docsDir);
  let count = 0;

  for (const { full, rel } of mdxFiles) {
    const raw = readFileSync(full, 'utf-8');
    const title = extractTitle(raw);
    if (!title) continue;

    const url = buildUrl(rel);
    const body = extractBodyText(raw);

    index.add({
      id: count++,
      title,
      url,
      content: body,
      keywords: title,
    });
  }

  console.log(`Indexed ${count} pages`);

  // Flexsearch export uses callback pattern — collect all chunks
  const raw = {};
  await new Promise((resolve) => {
    let pending = 0;
    index.export((key, data) => {
      raw[key] = data;
      // Flexsearch may call callback synchronously multiple times,
      // resolve on next tick after all chunks collected
      clearTimeout(pending);
      pending = setTimeout(resolve, 50);
    });
  });

  const exported = { type: 'flexsearch', raw };

  const outDir = join(__dirname, '..', 'public', 'api');
  mkdirSync(outDir, { recursive: true });
  const outFile = join(outDir, 'search.json');
  writeFileSync(outFile, JSON.stringify(exported));
  console.log(`Search index: ${outFile} (${JSON.stringify(exported).length} bytes)`);
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
