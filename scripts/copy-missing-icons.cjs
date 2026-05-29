const fs = require('fs');
const path = require('path');

const microsoftIconsDir = path.join(__dirname, '..', 'microsoft-fluent-icons');
const userIconsBaseDir = path.join(__dirname, '..', 'public', 'icons');

const targets = {
  filled: path.join(userIconsBaseDir, 'icon_filled'),
  regular: path.join(userIconsBaseDir, 'icon_regular')
};

function copyIcons() {
  const reportPath = path.join(__dirname, '..', 'missing-icons-report.json');
  
  if (!fs.existsSync(reportPath)) {
    console.error('Error: missing-icons-report.json not found! Please run the check script first:');
    console.error('node scripts/check-missing-icons.cjs');
    process.exit(1);
  }

  const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
  const missing = report.missing;

  let copiedFilledCount = 0;
  let copiedRegularCount = 0;

  console.log('Copying missing Filled icons...');
  if (missing.filled && missing.filled.length > 0) {
    // Ensure destination directory exists
    if (!fs.existsSync(targets.filled)) {
      fs.mkdirSync(targets.filled, { recursive: true });
    }
    
    for (const icon of missing.filled) {
      const srcPath = path.join(microsoftIconsDir, icon.msPath);
      const destPath = path.join(targets.filled, icon.filename);
      
      try {
        if (fs.existsSync(srcPath)) {
          fs.copyFileSync(srcPath, destPath);
          copiedFilledCount++;
        } else {
          console.warn(`Warning: Source file not found: ${srcPath}`);
        }
      } catch (err) {
        console.error(`Failed to copy ${icon.filename}:`, err);
      }
    }
  }

  console.log('\nCopying missing Regular icons...');
  if (missing.regular && missing.regular.length > 0) {
    // Ensure destination directory exists
    if (!fs.existsSync(targets.regular)) {
      fs.mkdirSync(targets.regular, { recursive: true });
    }
    
    for (const icon of missing.regular) {
      const srcPath = path.join(microsoftIconsDir, icon.msPath);
      const destPath = path.join(targets.regular, icon.filename);
      
      try {
        if (fs.existsSync(srcPath)) {
          fs.copyFileSync(srcPath, destPath);
          copiedRegularCount++;
        } else {
          console.warn(`Warning: Source file not found: ${srcPath}`);
        }
      } catch (err) {
        console.error(`Failed to copy ${icon.filename}:`, err);
      }
    }
  }

  console.log(`\nCopying complete!`);
  console.log(`Successfully copied:`);
  console.log(`  - Filled icons: ${copiedFilledCount} files`);
  console.log(`  - Regular icons: ${copiedRegularCount} files`);
  console.log(`  - Total: ${copiedFilledCount + copiedRegularCount} files`);
}

copyIcons();
