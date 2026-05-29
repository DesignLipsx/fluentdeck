const fs = require('fs');
const path = require('path');

// Target directories
const microsoftIconsDir = path.join(__dirname, '..', 'microsoft-fluent-icons');
const userIconsBaseDir = path.join(__dirname, '..', 'public', 'icons');

const userDirs = {
  filled: path.join(userIconsBaseDir, 'icon_filled'),
  regular: path.join(userIconsBaseDir, 'icon_regular'),
  color: path.join(userIconsBaseDir, 'icon_color')
};

// Helper: recursively find all SVG files
function findSvgFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      results = results.concat(findSvgFiles(filePath));
    } else if (file.endsWith('.svg')) {
      results.push({
        path: filePath,
        filename: file
      });
    }
  }
  return results;
}

// Helper: parse style from filename
function getStyleFromFilename(filename) {
  if (filename.endsWith('_filled.svg')) return 'filled';
  if (filename.endsWith('_regular.svg')) return 'regular';
  if (filename.endsWith('_color.svg')) return 'color';
  return 'other';
}

function main() {
  console.log('Scanning user folders...');
  // Load all user icons into Sets for fast O(1) lookup
  const userIcons = {
    filled: new Set(),
    regular: new Set(),
    color: new Set(),
    other: new Set()
  };

  for (const [style, dir] of Object.entries(userDirs)) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        if (file.endsWith('.svg')) {
          userIcons[style].add(file);
        }
      }
    }
  }

  console.log('Scanning Microsoft Fluent Icons repository...');
  const msSvgs = findSvgFiles(microsoftIconsDir);
  console.log(`Found ${msSvgs.length} total SVGs in Microsoft repo.`);

  const missing = {
    filled: [],
    regular: [],
    color: [],
    other: []
  };

  let totalMissing = 0;

  for (const svg of msSvgs) {
    const filename = svg.filename;
    const style = getStyleFromFilename(filename);

    if (style === 'other') {
      // If we don't recognize the style, let's check all folders just in case
      const foundInFilled = userIcons.filled.has(filename);
      const foundInRegular = userIcons.regular.has(filename);
      const foundInColor = userIcons.color.has(filename);
      if (!foundInFilled && !foundInRegular && !foundInColor) {
        missing.other.push({
          filename,
          msPath: path.relative(microsoftIconsDir, svg.path)
        });
        totalMissing++;
      }
    } else {
      if (!userIcons[style].has(filename)) {
        missing[style].push({
          filename,
          msPath: path.relative(microsoftIconsDir, svg.path)
        });
        totalMissing++;
      }
    }
  }

  const result = {
    summary: {
      totalMicrosoftIcons: msSvgs.length,
      totalMissing,
      missingByStyle: {
        filled: missing.filled.length,
        regular: missing.regular.length,
        color: missing.color.length,
        other: missing.other.length
      }
    },
    missing
  };

  const outputPath = path.join(__dirname, '..', 'missing-icons-report.json');
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
  console.log(`\nScan complete!`);
  console.log(`Total missing icons: ${totalMissing}`);
  console.log(`  - Filled: ${missing.filled.length}`);
  console.log(`  - Regular: ${missing.regular.length}`);
  console.log(`  - Color: ${missing.color.length}`);
  console.log(`  - Other: ${missing.other.length}`);
  console.log(`\nDetailed report written to: ${outputPath}`);
}

main();
