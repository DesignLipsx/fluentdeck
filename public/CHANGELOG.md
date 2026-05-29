# Changelog

## Version 2.4.0 (29-05-2026)

### ✨ Features & UI Updates
- **Dynamic Export Segmented Control**: Replaced the format selection dropdown in the Emoji detail panel with a segmented control.
- **Homepage New Icons Section**: Added an interactive display section directly on the homepage to showcase all newly added Microsoft Fluent system icons.

### 🚀 Package & Developer Tools
- **Vite 8 Upgrade**: Upgraded the bundler and development server to the latest **Vite 8** (`^8.0.14`) alongside `@vitejs/plugin-react` (`^6.0.2`) and `esbuild` (`^0.28.0`) for faster and cleaner builds.
- **Automation Scripts**: Added scripts to check (`check-missing-icons.cjs`), copy (`copy-missing-icons.cjs`), and generate metadata/IDs (`generate-icon-metadata.cjs` and `generate-icon-url.cjs`) to simplify synchronizations with upstream icon repositories.

### 📦 Icon Library Update
Synchronized with the latest Microsoft Fluent System Icons release:
- Added **728 new icon files** to local assets (**363 Filled** and **365 Regular** icons).
- Added **53 entirely new icons** (e.g., `agents_sync`, `calendar_todo`, `document_markdown`, `midi_off`, `usb`, `weather_humidity`).
- Fully cataloged and synchronized the local `icon_metadata.json` and `icon_url.json` files, now managing **2,918 unique concept icons**.

### 🐛 Bug Fixes
- Fixed an issue where the "Copy URL" section did not dynamically update its description or copied output when WebP was selected.

## Version 2.3.0 (06-01-2026)

### 🚀 Improvements
- Improved project structure and code quality.

## Version 2.2.0 (15-12-2025)

### ✨ Features
- Added new Fluent icon assets with multiple size variations.  
  Previously, only 24px icons were available; the library now includes additional sizes for better scalability and export flexibility.
- Added real query-based search URLs (`?q=`) for Apps, Emojis, and Icons pages.  
  Searches are now shareable, reload-safe, and SEO-friendly.

### 🚀 Improvements
- Improved SEO across all pages with page-specific metadata, canonical URLs, and enhanced Open Graph / Twitter previews.
- Enhanced search behavior to sync UI state with URL parameters without breaking existing filtering or keyboard shortcuts.

## Version 2.1.0 (12-12-2025)

### ✨ Features
- Added sharing functionality for emojis and icons.  
  You can now share a direct link to any emoji or icon from its detail view.

### 🚀 Improvements
- Improved Apps page layout and category structure for better navigation.
- Enhanced page titles and unified padding across pages for consistent UI spacing.

## Version 2.0.0 (10-12-2025)

Completely redesigned and rewrote the entire site code for improved performance.

### ✨ Features
- Added Custom Collections for emojis, apps, and icons.
- Added Style Switcher inside detail views for instant style switching.
- Added functionality to change the export format. You can switch between original PNG/SVG and optimised WebP.
- Added copy functionality on card hover for icon and emoji.
- Added Multi-search functionality (use commas to search multiple names).
- Added Gradient color palettes for icons.
- Added Context Menu on cards (Select for bulk actions, Add to Collection for single items).
- Added Keyboard Shortcuts (Ctrl+K for Search, Esc for closing, Ctrl+A for Select All).
- Added a dedicated Changelog page.

### Icon Library Update
| Style | Previous | New |
| :--- | :--- | :--- |
| **Filled** | 1,496 | **2,840** |
| **Regular** | 1,496 | **2,801** |
| **Color** | 100 | **199** |

### Improvements and Fixes
- Synced with the latest Microsoft Fluent System Icons.
- Improved mobile responsiveness and animations.
- Added all missing sizes (24px / color / filled / regular).

## Version 1.9.0 (25-11-2025)
- Added PWA (Progressive Web App) support.

## Version 1.8.0 (12-11-2025)
- Fixed scroll position and smooth scrolling issues during navigation.

## Version 1.7.0 (20-10-2025)
- Fixed home page parallax effect

## Version 1.6.0 (11-10-2025)
- Fixed mobile responsiveness issues.

## Version 1.5.0 (10-10-2025)
- Fixed mobile responsiveness and scroll synchronization.

## Version 1.4.0 (08-10-2025)
- Improved animated emoji loading performance.

## Version 1.3.0 (07-10-2025)
- Added WebP support for animated emojis.

## Version 1.2.0 (07-10-2025)
- Removed LazyLoadImage component and logic.

## Version 1.1.0 (06-10-2025)
- Added tooltip component for UI elements.

## Version 1.0.0 (03-10-2025)
- Initial release.