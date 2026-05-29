const fs = require('fs');
const path = require('path');

const metadataPath = path.join(__dirname, '..', 'public', 'data', 'icon_metadata.json');
const iconUrlPath = path.join(__dirname, '..', 'public', 'data', 'icon_url.json');

function updateIconUrls() {
  console.log('Updating icon_url.json mapping...');

  if (!fs.existsSync(metadataPath)) {
    console.error('Error: icon_metadata.json not found! Please run generate-icon-metadata.cjs first.');
    process.exit(1);
  }

  // 1. Load active icon names from metadata
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
  const activeNames = new Set(metadata.icons.map(icon => icon.name));

  // 2. Load existing URLs to preserve IDs
  const existingMap = new Map();
  if (fs.existsSync(iconUrlPath)) {
    try {
      const existingData = JSON.parse(fs.readFileSync(iconUrlPath, 'utf-8'));
      if (Array.isArray(existingData)) {
        for (const entry of existingData) {
          if (entry.name && entry.id) {
            existingMap.set(entry.name, entry.id);
          }
        }
      }
    } catch (err) {
      console.warn('Warning: Could not parse existing icon_url.json, will regenerate IDs.', err);
    }
  }

  // 3. Generate updated URL list
  const updatedList = [];
  const activeNamesArray = Array.from(activeNames).sort((a, b) => a.localeCompare(b));

  for (const name of activeNamesArray) {
    let id;
    if (existingMap.has(name)) {
      id = existingMap.get(name);
    } else {
      // Generate a new unique ID
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      id = `${slug}-${randomNum}`;
    }
    
    updatedList.push({ name, id });
  }

  // 4. Save to icon_url.json
  fs.writeFileSync(iconUrlPath, JSON.stringify(updatedList, null, 4), 'utf-8');
  console.log(`\nURL mapping updated successfully!`);
  console.log(`Total URLs in map: ${updatedList.length} (Added ${updatedList.length - existingMap.size} new entries)`);
  console.log(`Saved to: ${iconUrlPath}`);
}

updateIconUrls();
