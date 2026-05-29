const fs = require('fs');
const path = require('path');

const userIconsBaseDir = path.join(__dirname, '..', 'public', 'icons');
const metadataPath = path.join(__dirname, '..', 'public', 'data', 'icon_metadata.json');

const dirs = {
  regular: path.join(userIconsBaseDir, 'icon_regular'),
  filled: path.join(userIconsBaseDir, 'icon_filled'),
  color: path.join(userIconsBaseDir, 'icon_color')
};

// Words to fully capitalize
const acronyms = {
  '3g': '3G',
  '4g': '4G',
  '5g': '5G',
  '1x': '1X',
  '1 2x': '1.2X',
  '1 5x': '1.5X',
  '1 8x': '1.8X',
  '2x': '2X',
  '5x': '5X',
  '3d': '3D',
  'ltr': 'LTR',
  'rtl': 'RTL',
  'usb': 'USB',
  'vip': 'VIP',
  'midi': 'MIDI',
  'cs': 'CS',
  'fs': 'FS',
  'js': 'JS',
  'py': 'PY',
  'rb': 'RB',
  'ts': 'TS',
  'vb': 'VB',
  'yml': 'YML',
  'sass': 'SASS',
  'pdf': 'PDF',
  'csv': 'CSV',
  'https': 'HTTPS',
  'iq': 'IQ',
  'eq': 'EQ',
  'vr': 'VR',
  'eq': 'EQ'
};

function formatName(baseName) {
  // Convert underscores to spaces, capitalize first letter of each word
  let formatted = baseName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Post-process acronyms/special cases
  for (const [lower, upper] of Object.entries(acronyms)) {
    const regex = new RegExp(`\\b${lower}\\b`, 'gi');
    formatted = formatted.replace(regex, upper);
  }

  return formatted;
}

function generateMetadata() {
  console.log('Generating icon metadata from local files...');
  
  const iconMap = new Map();

  for (const [style, dir] of Object.entries(dirs)) {
    if (!fs.existsSync(dir)) {
      console.warn(`Directory not found: ${dir}`);
      continue;
    }

    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (!file.endsWith('.svg')) continue;

      // Extract filename without extension
      const filenameWithoutExt = file.replace(/\.svg$/, '');

      // Parse pattern: ic_fluent_<base>_<size>_<style>
      // e.g. ic_fluent_access_time_20_regular
      const match = filenameWithoutExt.match(/^ic_fluent_(.+)_(\d+)_(regular|filled|color)$/);
      
      if (!match) {
        // Fallback or custom files
        continue;
      }

      const base = match[1];
      const size = match[2];

      if (!iconMap.has(base)) {
        iconMap.set(base, {
          name: formatName(base),
          regular: {},
          filled: {},
          color: {}
        });
      }

      const iconData = iconMap.get(base);
      iconData[style][size] = filenameWithoutExt;
    }
  }

  // Convert map to sorted array
  const sortedIcons = Array.from(iconMap.values()).sort((a, b) => {
    return a.name.localeCompare(b.name);
  });

  const output = {
    icons: sortedIcons
  };

  fs.writeFileSync(metadataPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\nMetadata generation complete!`);
  console.log(`Total unique concept icons: ${sortedIcons.length}`);
  console.log(`Saved to: ${metadataPath}`);
}

generateMetadata();
