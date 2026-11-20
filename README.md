# Nora HTML Exporter

Create beautiful, standalone HTML reading experiences from your Obsidian notes. Nora supports Persian and English interfaces, right-to-left and left-to-right layouts, interactive reading tools, and offline-friendly attachment embedding.

## Features

- **Single-note export:** Export the current Markdown note with a customizable cover and reader appearance.
- **Quick export:** Generate HTML using your saved defaults.
- **Folder export:** Combine every Markdown note in a selected folder into **one complete HTML document**. Each note starts a new chapter in the shared reader. Choose the chapter heading level from H1 to H6. Folder export creates one HTML file, not one file per note.
- **Nested folders:** Include subfolders when exporting a folder.
- **Attachment embedding:** Embed local Vault images and supported attachments as Base64 data so exported documents can work offline.
- **Live preview:** Preview a note in an Obsidian side panel.
- **Bilingual interface:** Persian and English plugin UI and exported reader.
- **Reader customization:** Light/dark mode, color palettes, cover styles, text direction, font size, and page width.
- **Interactive reader:** Table of contents, text search, bookmarks, highlights, annotations, footnotes, and print/PDF support.
- **Frontmatter metadata:** Use note metadata for the exported cover and document details.

## Installation

### Community plugins
Once published, install **Nora HTML Exporter** from Obsidian's Community plugins browser.

### Manual installation
1. Download `main.js`, `manifest.json`, and `styles.css` from the latest GitHub release.
2. Create a folder named `nora-html-exporter` inside your Vault's `.obsidian/plugins/` directory.
3. Place the three files in that folder.
4. Reload Obsidian and enable **Nora HTML Exporter** in Community plugins.

## Usage

### Export one note
Open a Markdown note and use the Nora ribbon button, the command palette, or the note context menu. Choose the full export dialog to customize the cover and reader, or use **Quick export** to apply your defaults.

### Export a folder as one HTML file
1. Run **Batch export a folder to HTML** from the command palette, or right-click a folder.
2. Select the source folder.
3. Enable **Include subfolders** if nested notes should also be included.
4. Click **Export Entire Folder as One HTML**.
5. Nora combines all selected Markdown notes into one standalone HTML reader. Each file starts a new chapter, and you can choose the heading level (H1–H6) in plugin settings. The generated chapter titles are used to split the reader into sections.

The result is exactly one `.html` file for the selected folder, regardless of how many Markdown notes it contains. It is saved under the configured export directory, inside a folder named after the source folder.

## Settings

Open **Settings → Nora HTML Exporter** to configure:

- Plugin interface language (Persian, English, or automatic)
- Default exported reader language
- Export destination folder
- Default document type, theme, palette, and cover style
- Default text direction
- Automatic attachment embedding
- Opening exported HTML after creation
- Chapter heading level for merged folder exports (H1–H6)

## Community and support

The plugin settings include quick links to the ObsidianTut channels on Bale, Telegram, and YouTube, plus an optional link to support development.

## Offline attachments

When **Embed Vault images & attachments** is enabled, Nora attempts to embed referenced local Vault files into the HTML document. This makes the output portable and suitable for offline reading. Large media files can significantly increase the resulting HTML file size. Remote web links still require an internet connection.

## Compatibility

- Obsidian desktop and mobile (the plugin manifest does not restrict the platform).
- Minimum Obsidian version: **1.4.0**.

Some operating-system browser-opening behavior is desktop-only; exported files can still be opened manually on mobile.

## Development

The plugin is implemented in JavaScript and uses the Obsidian plugin API. The repository includes:

- `main.js` — plugin logic and standalone HTML reader generator
- `styles.css` — plugin modal, settings, and preview styles
- `manifest.json` — Obsidian plugin metadata

## License

Nora HTML Exporter is released under the **MIT License**. You may use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software in accordance with the terms of the [MIT License](LICENSE).

Copyright (c) 2026 Saeed Ghobadi.
