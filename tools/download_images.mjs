#!/usr/bin/env node
/**
 * Download all remote images referenced in docs/**\/*.md and docs/**\/*.mdx files
 * to local storage, and update markdown references to use local paths.
 *
 * Usage:
 *   node tools/download_images.mjs --dry-run        # Preview only
 *   node tools/download_images.mjs                  # Download + replace
 *   node tools/download_images.mjs --force          # Re-download existing
 *   node tools/download_images.mjs --skip-external  # Skip third-party URLs
 */

import { readFileSync, writeFileSync, statSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join, relative, dirname, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOCS_DIR = join(__dirname, '..');
const IMAGES_DIR = join(DOCS_DIR, 'images');
const MANIFEST_PATH = join(__dirname, 'image_manifest.json');

const USER_AGENT = 'RAGFlow-Docs-ImageSync/1.0';

const CONTENT_TYPE_MAP = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
  'image/bmp': '.bmp',
};

// --- Pattern definitions ---
const URL_PATTERNS = [
  // Google Drive blob URLs (match before main ragflow-docs)
  {
    name: 'google-drive',
    regex: /https:\/\/github\.com\/infiniflow\/ragflow-docs\/blob\/[a-f0-9]+\/images\/google_drive\/([^)\s]+)\?raw=true/,
    buildPath: (match, alt) => `google_drive/${match[1]}`,
  },
  // Main ragflow-docs raw images
  {
    name: 'ragflow-docs',
    regex: /https:\/\/raw\.githubusercontent\.com\/infiniflow\/ragflow-docs\/main\/images\/([^)\s]+)/,
    buildPath: (match, alt) => match[1],
  },
  // GitHub user-attachments assets
  {
    name: 'user-attachments',
    regex: /https:\/\/github\.com\/user-attachments\/assets\/([a-f0-9-]+)/,
    buildPath: (match, alt) => {
      const uuid = match[1];
      const shortId = uuid.slice(0, 8);
      const prefix = sanitizeFilename(alt);
      const name = prefix ? `${prefix}_${shortId}` : shortId;
      return `github_assets/${name}`;
    },
  },
  // GitHub repo assets (infiniflow/ragflow)
  {
    name: 'repo-assets',
    regex: /https:\/\/github\.com\/infiniflow\/ragflow\/assets\/\d+\/([a-f0-9-]+)/,
    buildPath: (match, alt) => {
      const uuid = match[1];
      const shortId = uuid.slice(0, 8);
      const prefix = sanitizeFilename(alt);
      const name = prefix ? `${prefix}_${shortId}` : shortId;
      return `github_assets/${name}`;
    },
  },
  // External: langfuse
  {
    name: 'langfuse',
    regex: /https:\/\/langfuse\.com\/images\/docs\/ragflow\/([^)\s]+)/,
    buildPath: (match, alt) => `external/langfuse_${match[1]}`,
  },
  // External: llm-assets.readthedocs
  {
    name: 'readthedocs',
    regex: /https:\/\/llm-assets\.readthedocs\.io\/en\/latest\/_images\/([^)\s]+)/,
    buildPath: (match, alt) => `external/readthedocs_${match[1]}`,
  },
];

// --- Helpers ---

function sanitizeFilename(text) {
  if (!text) return '';
  let s = text.toLowerCase()
    .replace(/[^\w\-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  return s || 'image';
}

function extFromContentType(contentType) {
  if (!contentType) return null;
  const ct = contentType.split(';')[0].trim().toLowerCase();
  return CONTENT_TYPE_MAP[ct] || null;
}

function extFromUrl(url) {
  try {
    const pathname = new URL(url).pathname;
    const ext = extname(pathname).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.bmp'].includes(ext)) {
      return ext === '.jpeg' ? '.jpg' : ext;
    }
  } catch {}
  return null;
}

function findMdFiles(dir) {
  const results = [];
  function walk(d) {
    const entries = readdirSyncRecursive(d);
    for (const entry of entries) {
      const full = join(d, entry);
      if (entry.endsWith('.md') || entry.endsWith('.mdx')) {
        results.push(full);
      }
    }
  }
  walk(dir);
  return results;
}

function readdirSyncRecursive(dir) {
  const results = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    results.push(entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git') {
      const subResults = readdirSyncRecursive(join(dir, entry.name));
      for (const sub of subResults) {
        results.push(join(entry.name, sub));
      }
    }
  }
  return results;
}

function computeRelativePath(mdFile, imageSubpath) {
  const mdDir = dirname(mdFile);
  let rel;
  try {
    rel = relative(DOCS_DIR, mdDir);
  } catch {
    rel = '';
  }
  const depth = rel === '' ? 0 : rel.split(/[\\/]/).length;
  const prefix = depth > 0 ? '../'.repeat(depth) : './';
  return `${prefix}images/${imageSubpath}`;
}

function classifyUrl(url) {
  for (const pattern of URL_PATTERNS) {
    const m = url.match(pattern.regex);
    if (m) {
      return { sourceType: pattern.name, buildPath: pattern.buildPath, match: m };
    }
  }
  return null;
}

// --- HTTP download ---

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const mod = parsed.protocol === 'https:' ? https : http;
    const options = {
      headers: { 'User-Agent': USER_AGENT },
    };

    mod.get(url, options, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const chunks = [];
      let contentType = res.headers['content-type'] || '';
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const data = Buffer.concat(chunks);
        // Determine extension
        let ext = extFromContentType(contentType);
        if (!ext) ext = extFromUrl(url);
        if (!ext) ext = extname(destPath);
        resolve({ data, ext, size: data.length });
      });
    }).on('error', (err) => reject(err));
  });
}

async function downloadImage(url, localSubpath, force = false) {
  const localAbs = join(IMAGES_DIR, localSubpath);

  if (existsSync(localAbs) && !force) {
    return { success: true, ext: null, size: statSync(localAbs).size };
  }

  mkdirSync(dirname(localAbs), { recursive: true });

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const { data, ext, size } = await downloadFile(url, localSubpath);
      let finalPath = localAbs;
      let finalSubpath = localSubpath;

      // Update extension if needed
      if (ext && !localSubpath.toLowerCase().endsWith(ext.toLowerCase())) {
        const base = localSubpath.slice(0, localSubpath.lastIndexOf('.'));
        finalSubpath = base + ext;
        finalPath = join(IMAGES_DIR, finalSubpath);
      }

      mkdirSync(dirname(finalPath), { recursive: true });
      writeFileSync(finalPath, data);
      return { success: true, ext, size, updatedSubpath: finalSubpath };
    } catch (err) {
      if (attempt < 2) {
        await sleep(Math.pow(2, attempt) * 1000);
      } else {
        console.error(`  FAILED: ${url} -> ${err.message}`);
        return { success: false, ext: null, size: null };
      }
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// --- Main ---

const MD_IMAGE_RE = /!\[([^\]]*)\]\(([^)]+)\)/g;

async function run(dryRun = false, force = false, skipExternal = false, skipGithub = false) {
  // Pass 1: Discover
  console.log('='.repeat(60));
  console.log('PASS 1: Discovering and downloading images...');
  console.log('='.repeat(60));

  const imageMap = new Map(); // url -> { localSubpath, sourceType, altText }
  const fileRefs = new Map(); // mdFile -> [{url, altText, localSubpath}]

  const mdFiles = findMdFiles(DOCS_DIR).sort();
  for (const mdFile of mdFiles) {
    const content = readFileSync(mdFile, 'utf-8');
    const refs = [];
    let m;
    while ((m = MD_IMAGE_RE.exec(content)) !== null) {
      const altText = (m[1] || '').trim();
      const url = (m[2] || '').trim();

      if (!url.startsWith('http://') && !url.startsWith('https://')) continue;
      if (url.startsWith('./') || url.startsWith('../') || url.startsWith('images/')) continue;

      const result = classifyUrl(url);
      if (!result) continue;

      // Skip github.com domain images if --skip-github
      if (skipGithub && ['user-attachments', 'repo-assets', 'google-drive'].includes(result.sourceType)) continue;

      const localSubpath = result.buildPath(result.match, altText);
      imageMap.set(url, { localSubpath, sourceType: result.sourceType, altText });
      refs.push({ url, altText, localSubpath });
    }
    if (refs.length) fileRefs.set(mdFile, refs);
  }

  console.log(`\nFound ${imageMap.size} unique image URLs across ${fileRefs.size} files.\n`);

  if (dryRun) {
    console.log('--dry-run: skipping downloads. URL -> local path mappings:');
    const sorted = [...imageMap.entries()].sort((a, b) => a[1].localSubpath.localeCompare(b[1].localSubpath));
    for (const [url, { localSubpath: lp, sourceType }] of sorted) {
      console.log(`  [${sourceType}] ${url}`);
      console.log(`      -> images/${lp}`);
    }
    console.log('\nReference replacements that would be made:');
    for (const [mdFile, refs] of [...fileRefs.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
      const relFile = relative(DOCS_DIR, mdFile).replace(/\\/g, '/');
      console.log(`\n  ${relFile}:`);
      for (const { url, altText, localSubpath } of refs) {
        const rel = computeRelativePath(mdFile, localSubpath);
        console.log(`    ![${altText}](${url})`);
        console.log(`    -> ![${altText}](${rel})`);
      }
    }
    return;
  }

  // Download
  let successCount = 0;
  let skipCount = 0;
  const failed = [];
  const extensionUpdates = new Map();

  const sortedUrls = [...imageMap.entries()].sort((a, b) => a[1].localSubpath.localeCompare(b[1].localSubpath));
  for (const [url, { localSubpath, sourceType, altText }] of sortedUrls) {
    if (skipExternal && (sourceType === 'langfuse' || sourceType === 'readthedocs')) {
      console.log(`  SKIP (external): ${url}`);
      skipCount++;
      continue;
    }

    if (skipGithub && ['user-attachments', 'repo-assets', 'google-drive'].includes(sourceType)) {
      console.log(`  SKIP (github): ${url}`);
      skipCount++;
      continue;
    }

    const localAbs = join(IMAGES_DIR, localSubpath);
    if (existsSync(localAbs) && !force) {
      console.log(`  SKIP (exists): images/${localSubpath}`);
      skipCount++;
      continue;
    }

    console.log(`  DOWNLOAD [${sourceType}]: ${url}`);
    console.log(`         -> images/${localSubpath}`);

    const result = await downloadImage(url, localSubpath, force);
    if (result.success) {
      successCount++;
      if (result.updatedSubpath && result.updatedSubpath !== localSubpath) {
        extensionUpdates.set(localSubpath, result.updatedSubpath);
      }
    } else {
      failed.push(url);
    }
  }

  console.log(`\nDownload summary: ${successCount} downloaded, ${skipCount} skipped, ${failed.length} failed`);

  // Apply extension updates
  if (extensionUpdates.size > 0) {
    for (const [oldSp, newSp] of extensionUpdates) {
      for (const [url, entry] of imageMap) {
        if (entry.localSubpath === oldSp) {
          entry.localSubpath = newSp;
        }
      }
      for (const [mdFile, refs] of fileRefs) {
        for (const ref of refs) {
          if (ref.localSubpath === oldSp) {
            ref.localSubpath = newSp;
          }
        }
      }
    }
  }

  // Pass 2: Update references
  console.log('\n' + '='.repeat(60));
  console.log('PASS 2: Updating markdown references...');
  console.log('='.repeat(60));

  let updatedFiles = 0;

  for (const [mdFile, refs] of [...fileRefs.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    let content = readFileSync(mdFile, 'utf-8');
    const original = content;

    for (const { url, altText, localSubpath } of refs) {
      const rel = computeRelativePath(mdFile, localSubpath);
      const oldStr = `![${altText}](${url})`;
      const newStr = `![${altText}](${rel})`;
      if (content.includes(oldStr)) {
        content = content.split(oldStr).join(newStr);
      } else {
        // Fallback: regex replace by URL
        const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(`!\\[([^\\]]*)\\]\\(${escaped}\\)`, 'g');
        content = content.replace(re, (_, a) => `![${a}](${rel})`);
      }
    }

    if (content !== original) {
      writeFileSync(mdFile, content, 'utf-8');
      const relFile = relative(DOCS_DIR, mdFile).replace(/\\/g, '/');
      console.log(`  UPDATED: ${relFile}`);
      updatedFiles++;
    }
  }

  console.log(`\nUpdated ${updatedFiles} files.`);

  // Pass 3: Validation
  console.log('\n' + '='.repeat(60));
  console.log('PASS 3: Validation...');
  console.log('='.repeat(60));

  const missing = [];
  for (const [url, { localSubpath }] of imageMap) {
    const localAbs = join(IMAGES_DIR, localSubpath);
    if (!existsSync(localAbs)) {
      missing.push({ localSubpath, url });
    }
  }

  if (missing.length) {
    console.log(`WARNING: ${missing.length} mapped images not found on disk:`);
    for (const { localSubpath, url } of missing) {
      console.log(`  images/${localSubpath} <- ${url}`);
    }
  } else {
    console.log('All mapped images exist on disk.');
  }

  // Write manifest
  const manifest = {
    generated_at: new Date().toISOString(),
    total_unique_images: imageMap.size,
    downloaded: successCount,
    skipped: skipCount,
    failed: failed.length,
    images: {},
    failed_urls: failed,
  };

  for (const [url, { localSubpath, sourceType }] of [...imageMap.entries()].sort((a, b) => a[1].localSubpath.localeCompare(b[1].localSubpath))) {
    const localAbs = join(IMAGES_DIR, localSubpath);
    let size = null;
    try { size = statSync(localAbs).size; } catch {}

    const referencedIn = [];
    for (const [mdFile, refs] of fileRefs) {
      for (const ref of refs) {
        if (ref.localSubpath === localSubpath) {
          referencedIn.push(relative(DOCS_DIR, mdFile).replace(/\\/g, '/'));
          break;
        }
      }
    }

    manifest.images[localSubpath] = {
      source_url: url,
      source_type: sourceType,
      size_bytes: size,
      referenced_in: referencedIn,
    };
  }

  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`\nManifest written to tools/image_manifest.json`);

  console.log('\n' + '='.repeat(60));
  console.log(`SUMMARY: ${successCount} downloaded, ${skipCount} skipped, ${failed.length} failed, ${updatedFiles} files updated`);
  console.log('='.repeat(60));

  if (failed.length) {
    console.log('\nFailed URLs:');
    for (const u of failed) console.log(`  - ${u}`);
  }
}

// Parse args
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const force = args.includes('--force');
const skipExternal = args.includes('--skip-external');
const skipGithub = args.includes('--skip-github');

run(dryRun, force, skipExternal, skipGithub);
