const fs = require('fs').promises;
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKIP_DIRS = new Set(['node_modules', '.next', 'out', 'dist', 'public']);
const EXTS = new Set(['.js', '.ts', '.jsx', '.tsx', '.mjs', '.cjs']);

function shouldSkipDir(name) {
  return SKIP_DIRS.has(name) || name.startsWith('.');
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory()) {
      if (shouldSkipDir(e.name)) continue;
      await walk(path.join(dir, e.name));
    } else if (e.isFile()) {
      const ext = path.extname(e.name);
      if (EXTS.has(ext)) await processFile(path.join(dir, e.name));
    }
  }
}

async function processFile(filePath) {
  try {
    const rel = path.relative(ROOT, filePath);
    if (rel.startsWith('node_modules') || rel.startsWith('.next')) return;

    const src = await fs.readFile(filePath, 'utf8');

    // skip declaration files
    if (filePath.endsWith('.d.ts')) return;

    // quick test: contains @supabase import
    const supabaseImport = /@supabase(?:\/|['"])/.test(src) || /from\s+['"]@supabase(?:\/|['"])/.test(src);
    if (!supabaseImport) return;

    // skip client components that explicitly declare "use client" at top
    const trimmed = src.trimStart();
    if (trimmed.startsWith(`'use client'`) || trimmed.startsWith(`"use client"`)) {
      console.log(`skip (use client): ${rel}`);
      return;
    }

    // already has runtime export?
    if (/export\s+const\s+runtime\s*=\s*['"]nodejs['"]/.test(src)) {
      console.log(`already set: ${rel}`);
      return;
    }

    // prepend runtime export (preserve shebang if present)
    let newSrc = src;
    if (src.startsWith('#!')) {
      const idx = src.indexOf('\n');
      newSrc = src.slice(0, idx + 1) + `export const runtime = 'nodejs';\n` + src.slice(idx + 1);
    } else {
      newSrc = `export const runtime = 'nodejs';\n` + src;
    }

    await fs.writeFile(filePath, newSrc, 'utf8');
    console.log(`patched: ${rel}`);
  } catch (err) {
    console.error(`error processing ${filePath}:`, err.message);
  }
}

(async () => {
  try {
    await walk(ROOT);
    console.log('apply-supabase-runtime: done');
  } catch (err) {
    console.error('apply-supabase-runtime: failed', err);
    process.exit(1);
  }
})();
