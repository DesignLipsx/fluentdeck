// ---------------------------------------------------------
// Imports
// ---------------------------------------------------------
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');


// ---------------------------------------------------------
// Constants
// ---------------------------------------------------------
const OUTPUT_PATH = path.resolve('./public/hooks/apps-data.json');
const LOGO_DIR = path.resolve('./public/assets/apps');
const SOURCE_URL = 'https://raw.githubusercontent.com/DesignLipsx/WinUI-3-Apps-List/refs/heads/main/README.md';


// ---------------------------------------------------------
// Utilities
// ---------------------------------------------------------
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function runWithConcurrencyLimit(tasks, limit = 5) {
  const results = [];
  const queue = [...tasks];

  const workers = Array.from({ length: limit }, async () => {
    while (queue.length) {
      const task = queue.shift();
      try {
        results.push(await task());
      } catch (err) {
        console.warn('! Task failed:', err.message);
      }
    }
  });

  await Promise.all(workers);
  return results;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function downloadAndConvertLogo(url, filename) {
  const outputPath = path.join(LOGO_DIR, `${filename}.webp`);

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const buffer = Buffer.from(await res.arrayBuffer());

    try {
      await sharp(buffer)
        .resize(64, 64, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .webp({ quality: 80 })
        .toFile(outputPath);

      return `/assets/apps/${filename}.webp`;
    } catch (err) {
      if (url.endsWith('.ico')) {
        console.warn(`! Skipping ICO file (${filename})`);
        return null;
      }
      throw err;
    }
  } catch (err) {
    console.warn(`x Failed ${filename}: ${err.message}`);
    return null;
  }
}


// ---------------------------------------------------------
// Markdown Parser
// ---------------------------------------------------------
function parseAppsMarkdown(markdown) {
  const lines = markdown.split('\n');
  const startIndex = lines.findIndex((l) => l.trim().startsWith('## 📑 Apps List'));

  if (startIndex === -1) {
    console.error('x Could not find "## Apps List" in README');
    return [];
  }

  const groups = [];
  let currentGroup = null;
  let currentSub = null;

  const filteredLines = lines.slice(startIndex + 1);

  for (const line of filteredLines) {
    // Main category
    if (line.startsWith('### ')) {
      if (currentGroup) groups.push(currentGroup);
      currentGroup = { heading: line.replace(/^###\s+/, '').trim(), subgroups: [] };
      currentSub = null;
      continue;
    }

    // Subcategory
    if (line.startsWith('#### ')) {
      if (!currentGroup) currentGroup = { heading: '', subgroups: [] };

      const imgMatch = line.match(/<img[^>]+src="([^"]+)"/);
      const iconUrl = imgMatch ? imgMatch[1] : null;

      const cleanHeading = line
        .replace(/^####\s+/, '')
        .replace(/<img[^>]+>/, '')
        .trim();

      currentSub = {
        subheading: cleanHeading,
        icon_url: iconUrl,
        apps: [],
      };

      currentGroup.subgroups.push(currentSub);
      continue;
    }

    // App entries
    if (line.startsWith('- ')) {
      const nameMatch = line.match(/\[(.*?)\]\((.*?)\)/);
      if (!nameMatch) continue;

      const [, name, link] = nameMatch;

      const tagMatch = line.match(/`([^`]+)`/);
      const tag = tagMatch ? tagMatch[1] : 'N/A';

      let price = 'Free';
      if (line.includes('💰')) price = 'Paid';
      else if (/`FOSS`/i.test(line)) price = 'FOSS';

      const logoRegex = new RegExp('<!--\\s*logo:\\s*(https?:\\/\\/[^\\s>]+)\\s*-->', 'i');
      const logoMatch = line.match(logoRegex);
      const logo_url = logoMatch ? logoMatch[1] : null;

      if (!currentSub) {
        currentSub = { subheading: '', apps: [] };
        if (!currentGroup) currentGroup = { heading: '', subgroups: [] };
        currentGroup.subgroups.push(currentSub);
      }

      currentSub.apps.push({ name, link, tag, price, logo_url });
    }
  }

  if (currentGroup) groups.push(currentGroup);

  return groups
    .map((g) => ({
      ...g,
      subgroups: g.subgroups.filter((sg) => sg.apps.length > 0),
    }))
    .filter((g) => g.subgroups.length > 0);
}


// ---------------------------------------------------------
// Main
// ---------------------------------------------------------
async function generateApps() {
  ensureDir(LOGO_DIR);

  // Load old data
  const oldData = fs.existsSync(OUTPUT_PATH)
    ? JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8'))
    : [];

  const oldAppMap = new Map();
  const oldCategoryMap = new Map();

  // Map old data
  if (Array.isArray(oldData) && oldData.length && Array.isArray(oldData[0].subgroups)) {
    // grouped format
    for (const g of oldData) {
      for (const sg of g.subgroups || []) {
        oldCategoryMap.set((sg.subheading || '').toLowerCase(), sg);

        for (const app of sg.apps || []) {
          oldAppMap.set(app.name.toLowerCase(), app);
        }
      }
    }
  } else {
    // legacy flat format
    for (const app of oldData) {
      if (app?.name) oldAppMap.set(app.name.toLowerCase(), app);
    }
  }

  console.log('↻ Fetching latest apps data from source...');
  const res = await fetch(SOURCE_URL);
  if (!res.ok) throw new Error(`Failed to fetch source: ${res.status}`);

  const markdown = await res.text();
  const parsed = parseAppsMarkdown(markdown);

  const downloadTasks = [];

  // Process groups
  for (const group of parsed) {
    for (const sub of group.subgroups) {
      // Category icon
      if (sub.icon_url) {
        const catFilename = `cat-${slugify(sub.subheading)}`;
        const existingCat = oldCategoryMap.get(sub.subheading.toLowerCase());
        const oldCatUrl = existingCat?.original_icon_url || existingCat?.icon_url;

        if (!existingCat || sub.icon_url !== oldCatUrl) {
          downloadTasks.push(async () => {
            const local = await downloadAndConvertLogo(sub.icon_url, catFilename);
            if (local) sub.icon_url = local;
          });
          sub.original_icon_url = sub.icon_url;
        } else {
          sub.icon_url = existingCat.icon_url;
          sub.original_icon_url = oldCatUrl;
        }
      }

      // App logos
      for (const app of sub.apps) {
        const filename = slugify(app.name);
        const existing = oldAppMap.get(app.name.toLowerCase());

        if (!existing) {
          if (app.logo_url) {
            downloadTasks.push(async () => {
              const local = await downloadAndConvertLogo(app.logo_url, filename);
              if (local) app.logo_url = local;
            });
            app.original_logo_url = app.logo_url;
          }
          continue;
        }

        const oldLogoURL = existing.original_logo_url || existing.logo_url;

        if (app.logo_url && app.logo_url !== oldLogoURL) {
          console.log(`~ Updating logo for ${app.name}`);
          downloadTasks.push(async () => {
            const local = await downloadAndConvertLogo(app.logo_url, filename);
            if (local) app.logo_url = local;
          });
          app.original_logo_url = app.logo_url;
        } else {
          app.logo_url = existing.logo_url;
          app.original_logo_url = oldLogoURL;
        }
      }
    }
  }

  console.log(`↓ Downloading ${downloadTasks.length} logos (limit: 5)...`);
  await runWithConcurrencyLimit(downloadTasks, 5);

  // Save file
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(parsed, null, 2));

  console.log(`✓ Saved updated apps data → ${OUTPUT_PATH}`);
}

generateApps().catch((err) => console.error('✖ Failed:', err));
