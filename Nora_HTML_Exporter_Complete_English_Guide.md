# Comprehensive Guide to Nora HTML Exporter

<a id="nora-section-1"></a>
## Table of Contents (click to jump to a section)

- [Installation, All Commands, Export Settings, Preview, and Reader Features](#nora-section-1)
- [1. Introducing Nora](#nora-section-2)
- [2. Installation and Activation](#nora-section-3)
- [3. Ways to Access Nora's Features](#nora-section-4)
- [4. Exporting a Note with the Settings Dialog](#nora-section-5)
- [5. All Fields in the Export Dialog](#nora-section-6)
- [6. Note Statistics Before Export](#nora-section-7)
- [7. Three Ways to Get the Output](#nora-section-8)
- [8. Quick Export](#nora-section-9)
- [9. Combining a Folder into One Book](#nora-section-10)
- [10. Live Preview](#nora-section-11)
- [11. Plugin Settings in Obsidian](#nora-section-12)
- [12. Cover Structure and Information](#nora-section-13)
- [13. Language and Text Direction](#nora-section-14)
- [14. Book Reader Toolbar Features](#nora-section-15)
- [15. Table of Contents and Moving Between Sections](#nora-section-16)
- [16. Reading Settings and Custom Themes](#nora-section-17)
- [17. Bookmarks](#nora-section-18)
- [18. Highlighting and Adding Notes to Text](#nora-section-19)
- [19. Search](#nora-section-20)
- [20. Footnotes](#nora-section-21)
- [21. Mermaid Diagrams, LaTeX Formulas, SVG Graphics, and Vector Zoom](#nora-section-22)
- [22. Code Blocks](#nora-section-23)
- [23. CSS Snippets and Custom Styling (Custom CSS)](#nora-section-24)
- [24. Images and Attachments](#nora-section-25)
- [25. Printing and Saving as PDF](#nora-section-26)
- [26. Automatic Metadata and Saving to Frontmatter](#nora-section-27)
- [27. Important Notes and Limitations of the Current Version](#nora-section-28)
- [28. Troubleshooting](#nora-section-29)
- [29. Suggested Workflows](#nora-section-30)
- [30. Final Checklist](#nora-section-31)
- [Project Resources](#nora-section-32)

---

## Installation, All Commands, Export Settings, Preview, and Reader Features

**Basis of this guide:** `main.js` and `styles.css` from version **`1.1.8`**  
**Plugin version:** `Nora HTML Exporter v1.1.8`

> This guide is based on the implementation available in the source code of version `1.1.8`. If an option exists in the user interface but its effect has not been implemented in the current code, or if it behaves in a particular way, that is explicitly explained.

---

<a id="nora-section-2"></a>
## 1. Introducing Nora

**Nora HTML Exporter** is a bilingual (Persian/English) plugin for Obsidian that converts Markdown notes into a standalone, 100% offline HTML file with a book-like appearance and an interactive reading environment. It can also combine Markdown notes from a folder into a single integrated HTML book.

The output is more than a simple web page. It includes a complete book-reader interface with a cover, publication details, chapters, a table of contents, search, reading settings, bookmarks, highlights, text notes, footnotes, Mermaid diagrams, LaTeX mathematical formulas, SVG graphics, modern code blocks with a copy button, and printing features.

### Main features in version 1.1.8

- Persian and English plugin interface.
- Export a single note using an options dialog.
- Quick export using saved settings.
- Combine a folder and its Markdown notes into one output (including support for subfolders).
- Live preview in an Obsidian pane, with snippets and settings applied immediately.
- Five cover designs and seven color palettes, each available in light and dark modes.
- Automatic text direction, RTL and LTR, and selection of the HTML interface language (Persian, English, or automatic detection).
- Choose font size, line spacing, and page width.
- Automatically embed local Vault images, audio, video, and PDFs in the HTML as Base64 (fully offline).
- **Full, 100% offline support for all Mermaid diagram types**, with dual rendering for light mode, dark mode, and printing.
- **Full, 100% offline support for LaTeX mathematical formulas** (inline and block/multiline), rendered as vector graphics.
- **Direct support for SVG graphics**, both ` ```svg ` code blocks and raw `<svg>` tags, with security sanitization.
- **True vector zoom lightbox (40% to 500%, without quality loss) and panning** for Mermaid diagrams, LaTeX formulas, and SVGs.
- **Modern code blocks** with a programming-language header, a **quick Copy button**, and light/dark mode compatibility.
- **Nora-specific CSS snippets** (with the `nora` prefix) and a Custom CSS field, available as a replaceable default theme (`✨`) in the HTML reader.
- **Automatically save cover metadata to the note's Frontmatter** when exporting (can be enabled or disabled).
- Table of contents, search, bookmarks, five highlight colors, text notes, interactive footnotes, image Lightbox, and print/save as PDF.

---

<a id="nora-section-3"></a>
## 2. Installation and Activation

### Install from Community Plugins

1. Open Obsidian.
2. Go to **Settings**.
3. Open **Community plugins**.
4. If necessary, turn off Restricted/Safe mode.
5. Search for and install `Nora HTML Exporter`.
6. Enable the plugin after installation.

For manual installation, place the released version's `main.js`, `manifest.json`, and `styles.css` files in `.obsidian/plugins/nora-html-exporter/`, then enable the plugin in Settings.

### Check that it is enabled

After activation, the Nora book icon appears in Obsidian's sidebar, and Nora commands become available in the Command Palette. On the first launch or after an update, a Changelog window is displayed and the user guide is saved in the `Nora Guides` folder.

---

<a id="nora-section-4"></a>
## 3. Ways to Access Nora's Features

Four main commands are registered in the current version:

| Command | Function |
|---|---|
| Export HTML from the current note (with settings dialog) | Opens the full note-export form |
| Quick HTML export with default settings | Exports the current note without opening the settings form |
| Open Nora Reader Live Preview | Opens the preview pane |
| Batch HTML export from a folder | Selects a folder and creates one integrated HTML file |

### Method 1: Sidebar ribbon icon

Click the Nora book icon in the Ribbon. The plugin opens the active Markdown note in the export settings dialog. If no active Markdown note is open, a message asks you to open a note.

### Method 2: Command Palette

1. Press `Ctrl + P` on Windows/Linux or `Cmd + P` on macOS.
2. Search for `Nora` or `Export`.
3. Select the desired command.

### Method 3: File context menu

Right-click a Markdown file in the File Explorer. Two options are added:

- **Export HTML with Nora:** Opens the export settings dialog for that note.
- **Live preview in Nora:** Opens a preview of that note.

### Method 4: Folder context menu

Right-click a folder and select Nora's batch folder-export option. The folder-export window opens with that folder selected initially.

---

<a id="nora-section-5"></a>
## 4. Exporting a Note with the Settings Dialog

This is the most complete way to export a note, because you can set the cover information, language, appearance, attachments, and Frontmatter saving before creating the HTML.

### Steps

1. Open the Markdown note you want to export.
2. Run the Nora book icon, the note-export command, or the context-menu option.
3. The **Nora HTML Reader Export** dialog opens.
4. Review and complete the publication-information fields.
5. Choose the appearance and language settings.
6. Set whether attachments should be embedded, whether the output should open automatically, and whether metadata should be saved to Frontmatter.
7. Choose one of the three buttons at the bottom of the dialog:
   - **Live Preview**
   - **Direct Download**
   - **Save to Vault and Create HTML**

### Convert to folder export

The note-export dialog header contains a **📁 Entire Folder** button. Selecting it opens the folder-export window for the parent folder of the current note.

---

<a id="nora-section-6"></a>
## 5. All Fields in the Export Dialog

### “Cover Details and Publication Information” section

| Field | Description |
|---|---|
| Publication title | Main title displayed on the cover |
| Output filename | HTML filename; do not include the `.html` extension |
| Work type / cover label | A label such as book, article, handout, or guide |
| Author(s) | Author names; use `؛` as the separator for multiple authors |
| Subtitle or short description | Supporting sentence displayed below the title |
| Subject(s) / topics | Subject or categories; separate multiple items with `؛` |
| Publication year / date | The year or date associated with the work |
| Short cover introduction | A multiline description of the written content |

### “Reader Appearance, Output Language, and Cover” section

| Field | Options |
|---|---|
| Color mode | Light, Dark |
| Color palette | Lilac and turquoise, Ocean, Forest and emerald, Warm sunset, Royal blue and gold, Plum, Paper/neutral |
| Cover design | Aurora, Ocean, Botanical, Classic, Minimal |
| Text direction | Automatic, Right-to-left (RTL), Left-to-right (LTR) |
| Font size | Small 15px, Normal 16px, Large 18px, Extra large 20px |
| Page width | Narrow and focused 680px, Normal 850px, Full width |
| HTML reader interface language | Detect from text, Persian, English |

### Additional options

- **Automatically embed images and Vault attachments in the HTML (fully offline):** Converts recognized local files referenced in the text into Data URLs (Base64) embedded in the HTML, making the file self-contained.
- **Open in browser after creation:** On desktop, opens the generated HTML file in the system's default browser immediately after it is created.
- **Save cover metadata to the note's Frontmatter:** Automatically saves or updates the information entered in the form in the note's YAML Frontmatter (Properties), so it can be filled in automatically during future exports.

---

<a id="nora-section-7"></a>
## 6. Note Statistics Before Export

Three statistics are displayed at the bottom of the export form:

- **Word count:** An estimate of the number of words in the text.
- **Reading time:** An approximate estimate based on a speed of 220 words per minute.
- **Local attachments:** The number of local destinations detected in the text.

---

<a id="nora-section-8"></a>
## 7. Three Ways to Get the Output

### 7.1. Live Preview

The **◉ Live Preview** button opens the Live Preview pane and transfers the selected appearance settings to it. The final output file is not saved at this stage.

### 7.2. Direct Download

The **↓ Direct Download** button downloads the HTML file through the browser's download mechanism.

### 7.3. Save to Vault

The **✦ Save to Vault and Create HTML** button creates the HTML file in the configured output folder inside the Vault (default: `Nora Exports`).

---

<a id="nora-section-9"></a>
## 8. Quick Export

The **Quick HTML export with default settings** command creates HTML for the active Markdown note without opening the full export form. It uses the note's Frontmatter metadata and the plugin's saved settings.

---

<a id="nora-section-10"></a>
## 9. Combining a Folder into One Book

This feature places all Markdown notes in the selected folder into **one single, integrated HTML file**.

### Open the folder-export dialog

- Run the batch-export command from the Command Palette; or
- Right-click a folder and choose Nora's batch folder-export option; or
- Click **📁 Entire Folder** in a note's export dialog.

### Folder options

- **Choose a folder from the Vault:** Select any folder or the Vault root (`/`).
- **Include subfolders:** Also collects Markdown notes from subfolders (Nora's own output folder is automatically ignored).
- **Preserve subfolder structure in the output:** This option appears in the interface, but it currently has no effect on the tree structure of the integrated HTML. Files are ordered by their paths.

### Chapter order and output location

Nora sorts the discovered files by their paths. To control chapter order, number the filenames:

```text
01-Introduction.md
02-Chapter-One.md
03-Chapter-Two.md
04-Conclusion.md
```

Each note is inserted as the beginning of a new chapter, using the heading level selected in **Chapter start heading level**. All newer features (Mermaid, LaTeX, SVG, code blocks, and CSS snippets) are fully supported in the integrated output as well.

The final filename is created as `<FolderName>-Complete.html` inside the `<ExportFolder>/<FolderName>/` subfolder.

---

<a id="nora-section-11"></a>
## 10. Live Preview

Live Preview is a side pane inside Obsidian that updates in real time when the active note changes or when the text is edited (after a short delay).

In the pane's top toolbar, you can change the pane interface language, light/dark mode, color palette, and cover design, or open the export dialog directly. Live Preview immediately displays all features, including **Mermaid**, **LaTeX**, **SVG**, **the new code blocks**, and **the selected CSS snippet** (in preview mode, `localStorage` is not overwritten with the newly selected snippet).

---

<a id="nora-section-12"></a>
## 11. Plugin Settings in Obsidian

Open **Settings → Nora HTML Exporter** to access the settings:

1. **Plugin interface language:** Persian, English, or Auto.
2. **Default HTML reader output language:** Detect automatically from the text, Persian, or English (the note's text is not translated).
3. **Output folder in the Vault:** Default is `Nora Exports` (if left empty, the file is saved next to the note).
4. **Default cover label (optional):** Such as book, article, or handout.
5. **Default color mode:** Light or Dark.
6. **Default color palette:** One of the seven available palettes.
7. **Default cover design:** One of the five available designs.
8. **Default text direction:** Automatic, RTL, or LTR.
9. **Automatically embed attachments (Base64):** Enable or disable offline embedding of local files.
10. **Automatically open in browser after saving:** Automatically opens the HTML file in the system browser (desktop).
11. **Automatically save cover metadata to note Frontmatter:** Enable or disable automatic saving of cover details to the note's Properties when exporting.
12. **Chapter start heading level for integrated export:** Choose from `H1` to `H6`.
13. **Select a CSS snippet from the Vault (optional):** An automatically populated dropdown that lists only `.css` files beginning with `nora` from `.obsidian/snippets` or the Vault (with a `🔄` refresh-list button).
14. **Custom CSS:** A Monospace text field for writing custom CSS.
15. **Nora user guide and changelog:** Quick access to the Persian and English guides and the version changelog.
16. **Stay connected and support the project:** Links to `@obsidiantut` on Bale, Telegram, YouTube, and the donation link.

---

<a id="nora-section-13"></a>
## 12. Cover Structure and Information

The HTML cover includes the work type, main title, subtitle, author(s), subject(s), publication year, short introduction, word count, reading time, and a **Start Reading** button.

### Five cover styles

| ID | Display name |
|---|---|
| `aurora` | Aurora Cover |
| `ocean` | Ocean Cover |
| `botanical` | Botanical Cover |
| `classic` | Classic Cover |
| `minimal` | Minimal Cover |

### Seven color palettes

| ID | Display name |
|---|---|
| `default` | Lilac and Turquoise |
| `ocean` | Ocean |
| `forest` | Forest and Emerald |
| `sunset` | Warm Sunset |
| `royal` | Royal Blue and Gold |
| `plum` | Plum |
| `mono` | Paper / Neutral |

---

<a id="nora-section-14"></a>
## 13. Language and Text Direction

- **Text direction:** `auto` (based on the reader language), `rtl` (right-to-left), and `ltr` (left-to-right).
- **Reader interface language:** Persian (`fa`), English (`en`), or automatic detection from the text content (`auto`). This option only determines the language of the reader's buttons and interface labels.

---

<a id="nora-section-15"></a>
## 14. Book Reader Toolbar Features

| Tool | Function |
|---|---|
| `☷` Contents | Opens the table-of-contents drawer |
| Nora title/branding | Quickly returns to the cover page |
| Search | Finds a phrase across all sections by pressing `Enter` |
| Highlight | Highlights the selected text using the active color |
| `💬` Note | Adds a text note to the selected passage |
| `🔖` Bookmark | Adds or removes a bookmark for the current section |
| `🌓` Light/Dark | Quickly switches between light and dark modes |
| `⚙️` Settings | Opens the slide-out reading and printing settings panel |

---

<a id="nora-section-16"></a>
## 15. Table of Contents and Moving Between Sections

- Click the **Contents (`☷`)** button to open the table-of-contents drawer. Direct links to the cover and all headings up to level 3 are available.
- At the bottom of the page are **Previous** and **Next** buttons, along with a section-number indicator. You can also use the arrow keys (`ArrowLeft` and `ArrowRight`) to move between sections.

---

<a id="nora-section-17"></a>
## 16. Reading Settings and Custom Themes

In the slide-out settings panel (`⚙️`), you can change the following options live:

- **Display mode:** Light / Dark.
- **Font size:** From `12px` to `28px`, using the `A−` and `A+` buttons.
- **Line spacing:** Compact (`1.75`), Normal (`2.05`), Comfortable (`2.35`).
- **Page width:** Narrow (`680px`), Normal (`850px`), Full width (`100%`).
- **Text font:** Default, `Tahoma`, `System UI`, `Georgia`, `Serif`.
- **Color palette:** Nora's 7 main palettes **plus a Custom Theme (`✨`)** when a snippet or Custom CSS is enabled.
- **Cover design:** Live switching among all 5 cover designs.
- **Default highlight color:** Yellow, Green, Blue, Pink, Purple.
- **Reset to defaults** and **Print / Save PDF** buttons.

### How the Custom Theme (`✨`) works with palettes and covers

When you use a snippet or Custom CSS, your styles are placed in a separate `<style id="nora-custom-style">` tag and appear at the beginning of the reader's palette list as the **default option**, named after the snippet (for example, `✨ nora-sepia`). If the user selects one of Nora's main palettes or another cover design in the HTML file, the custom style tag is automatically disabled (`disabled`) so the original palettes and covers work without interference. Clicking the `✨` option again immediately restores the custom style.

---

<a id="nora-section-18"></a>
## 17. Bookmarks

- After entering a section, click the **Bookmark (`🔖`)** button to bookmark it. Click again to remove the bookmark.
- The bookmark list is displayed at the bottom of the page. You can jump to a section, delete individual bookmarks (`×`), or delete all bookmarks.
- Bookmarks are stored in the browser's `localStorage`.

---

<a id="nora-section-19"></a>
## 18. Highlighting and Adding Notes to Text

- **Highlight:** Select a portion of text in a chapter and click **Highlight**. Click the highlighted text to remove the highlight.
- **Note:** Select the desired text, click **Note (`💬`)**, and enter your comment. Clicking the note displays its text and also allows you to delete it.
- Highlights and notes are stored in the browser's `localStorage`; they are not transferred to the original Markdown file in Obsidian.

---

<a id="nora-section-20"></a>
## 19. Search

Enter the desired phrase in the search field and press `Enter`. The reader moves to the section containing a result and displays the total number of results and the section number. Press `Enter` again to move through subsequent results.

---

<a id="nora-section-21"></a>
## 20. Footnotes

Both Obsidian footnote formats are supported:

- Reference-style footnote: `[^1]` and its definition `[^1]: Footnote text`
- Inline footnote: `^[Footnote text]`

In the HTML file, clicking a footnote number opens an **interactive popover** containing the footnote text and a button to jump to the bottom of the section. At the end of each section, a list of that section's footnotes is displayed, along with a return button (`↩`) to the reference location.

---

<a id="nora-section-22"></a>
## 21. Mermaid Diagrams, LaTeX Formulas, SVG Graphics, and Vector Zoom

### 21.1. Mermaid diagrams (100% offline)

All Mermaid diagram types (Flowchart, Sequence, Class, Gantt, Pie, State, Mindmap, Graph, and others) are rendered during export and preview using Obsidian's internal engine (`loadMermaid`) and saved as SVG inside the HTML:

- **Dual light/dark rendering:** Two versions, Light and Dark, are created for each diagram so it immediately matches the reader's theme when the theme changes.
- **Optimized printing:** The Light version is always displayed when printing or exporting to PDF.
- **Support for additional attributes:** Blocks such as ` ```mermaid {align: "center"} ` are also correctly detected and rendered.

### 21.2. LaTeX mathematical formulas (100% offline)

Mathematical formulas are rendered as vector graphics (SVG or the browser's native MathML) using Obsidian's internal `MathJax` engine:

- **Block formulas (single-line and multiline):** Use `$$ ... $$`, including environments such as `\begin{aligned}`, matrices, fractions, and integrals.
- **Inline formulas:** Use `$ ... $` within text, tables, lists, and footnotes (without interfering with code blocks or dollar amounts).

### 21.3. SVG vector graphics

SVG code is rendered directly as vector graphics in both of the following forms:

- Inside a ` ```svg ... ``` ` code block.
- As a raw `<svg ...>...</svg>` tag in the text.

Before insertion into the HTML, automatic security sanitization is performed (removing `<script>`, `on*` event handlers, and `javascript:` links).

### 21.4. True vector zoom lightbox and pan (Zoom & Pan)

Clicking any **Mermaid diagram**, **block LaTeX formula**, or **SVG graphic** in the HTML file opens a full-screen Lightbox:

- **Lossless zoom (40% to 500%):** Directly changes the dimensions of vector SVG and the font size of MathML, avoiding the blur caused by pixel-based enlargement.
- **Controls:** `+` and `−` buttons, mouse-wheel zoom, a `100%` button to reset, drag-to-pan, and close using the `×` button, the `Esc` key, or clicking the empty area around the content.

---

<a id="nora-section-23"></a>
## 22. Code Blocks

Regular code blocks (with or without a language name, such as ` ```js `, ` ```python `, ` ```json `, or ` ``` `) are displayed with a modern design:

- **Light/dark compatibility:** Soft light background in Light mode and dark navy in Dark mode.
- **Language header:** Displays a readable programming-language name above the code (for example, `JavaScript`, `Python`, `CSS`; if no language is specified, it displays `CODE`).
- **Quick Copy button:** Copies the code to the clipboard with one click and changes its label to `Copied ✓` (works with offline `file://` files and is hidden when printing/exporting to PDF).

---

<a id="nora-section-24"></a>
## 23. CSS Snippets and Custom Styling (Custom CSS)

Two tools are available together for fully customizing the HTML reader and Live Preview:

1. **Vault CSS snippet selector:** This menu automatically reads `.css` files in `.obsidian/snippets` (with a `🎨` icon) and other Vault folders (with a `📄` icon).
   - **Naming rule:** To avoid cluttering the list with other Obsidian snippets, only files whose names begin with **`nora`** are displayed, case-insensitively (for example, `nora-sepia.css` or `Nora-Joy.css`).
   - Hidden and system files (such as `._*` on macOS) are automatically filtered out.
   - Use the **`🔄`** button beside the menu to refresh the list without closing Settings.
2. **Custom CSS code field:** For quick, direct changes in Settings.

Styles are applied in this order: **Nora default styles ← selected snippet file ← CSS entered in the Custom CSS field**. Both are embedded in the HTML and work **100% offline**.

---

<a id="nora-section-25"></a>
## 24. Images and Attachments

Nora extracts the following local references from the text:

- `![[image.png]]` (including size/caption syntax such as `![[image.png|Caption|400]]`)
- `![Caption](image.png)`
- `[Download file](document.pdf)`

When embedding is enabled, images, audio files (with an internal player), videos, PDFs (with an expandable in-page preview), and other files are embedded as Base64 inside the HTML. Clicking images also opens a large view (Lightbox).

---

<a id="nora-section-26"></a>
## 25. Printing and Saving as PDF

1. Open the HTML file in a browser.
2. Click **Print / Save PDF** in the settings panel (`⚙️`).
3. In the browser's print dialog, choose `Save as PDF`.

In print mode, the toolbar, navigation buttons, code-block copy buttons, and Lightboxes are automatically hidden. The cover and chapters are paginated cleanly, and Mermaid diagrams are printed using their Light versions.

---

<a id="nora-section-27"></a>
## 26. Automatic Metadata and Saving to Frontmatter

When opening the export form or running Quick Export, Nora reads the cover details from the note's YAML Frontmatter.

### Frontmatter example

```yaml
---
title: Comprehensive Research Guide
exportName: research-guide
docType: Educational Book
author:
  - Ali Rezaei
  - Sara Ahmadi
subtitle: From Notes to Publication
category:
  - Education
  - Research
year: 1405
description: A practical guide to organizing and publishing research content
---
```

### Recognized keys

| Key | Purpose |
|---|---|
| `title` or `عنوان` | Publication title |
| `exportName` | Output filename |
| `docType` or `type` or `نوع` | Work type |
| `author` or `authors` or `نویسنده` or `نویسندگان` | Authors |
| `subtitle` or `زیرعنوان` | Subtitle |
| `category` or `categories` or `tags` or `موضوع` or `موضوعات` | Topics |
| `year` or `date` or `سال` or `تاریخ` | Year/date |
| `description` or `summary` or `توضیحات` or `معرفی` | Work description |

### Automatically save to Frontmatter during export

If **Save cover details to note Frontmatter** is enabled (controlled in the plugin settings and in the export dialog), Nora registers or updates the details entered in the form (`title`, `docType`, `author`, `subtitle`, `category`, `year`, `description`, and, if different from the filename, `exportName`) in the note's YAML Frontmatter through Obsidian's official API (`processFrontMatter`), without damaging other existing Properties. Multiple authors or topics are saved as standard YAML lists.

---

<a id="nora-section-28"></a>
## 27. Important Notes and Limitations of the Current Version

1. **Preserve Subfolder Tree:** This option exists in the folder-export form, but it currently has no effect on the integrated HTML output. Notes are ordered by their paths.
2. **Folder export is integrated:** All Markdown notes in the folder are merged into one HTML file named `<FolderName>-Complete.html`.
3. **`nora` prefix for snippets:** The snippet selector in Settings only displays `.css` files whose names begin with `nora`.
4. **Bookmark and annotation persistence:** These data are stored in the browser's `localStorage`, not in the original Markdown file.
5. **Automatic custom-theme update on re-export:** The reader settings storage key (`prefsKey`) is tied to the snippet code's hash. Therefore, when exporting again with a new snippet, the new theme immediately appears as the default.
6. **Opening folder output:** When the integrated export finishes, the path of the generated HTML file is sent to the system to open it in the browser.

---

<a id="nora-section-29"></a>
## 28. Troubleshooting

### My CSS snippet does not appear in the settings menu

- Make sure the `.css` filename begins with **`nora`** (for example, `nora-joy.css`).
- Save the file in `.obsidian/snippets/` or somewhere inside the Vault, then click the **`🔄`** button beside the menu.

### Changes to the snippet do not appear in the preview or output

- In custom snippets, use the selectors `body[data-palette]` and `body.night[data-palette]` to override the default palette variables.
- After replacing the plugin with a new version, turn it off and on once in Obsidian.

### I want to use Nora's original palettes or cover designs while a snippet is active

- In the HTML file, open the settings panel (`⚙️`) and select one of the original palettes or cover designs. The snippet style is automatically disabled. You can restore it whenever you want by selecting `✨`.

### Images or attachments do not appear in the output

- Make sure the file exists in the Vault and that **Automatically embed attachments** is enabled.

### Chapters are not in the desired order in folder export

- Number the beginning of the filenames (`01-`, `02-`, etc.). The order is determined by file paths.

### The PDF prints without background colors

- Enable **Background graphics** in the browser's print dialog.

---

<a id="nora-section-30"></a>
## 29. Suggested Workflows

### Technical / scientific note (with Mermaid, LaTeX, SVG, and code)

1. Add Mermaid diagrams, LaTeX formulas (`$...$` and `$$...$$`), SVG code, and code blocks with language names to your note.
2. Open Live Preview to check the rendering and CSS snippet.
3. In the export dialog, complete the cover details and keep the Frontmatter-saving option enabled.
4. Create the HTML output and check vector zoom for diagrams and formulas, as well as the code-copy buttons.

### A multi-chapter book from a folder

1. Create a Markdown file for each chapter and add a numeric prefix to its filename.
2. Set the chapter heading level in Settings (for example, `H1`).
3. Run the batch folder-export command to generate the integrated `-Complete.html` file.

---

<a id="nora-section-31"></a>
## 30. Final Checklist

### Before exporting

- [ ] Notes, headings, and chapter filenames are organized.
- [ ] Frontmatter or cover details have been reviewed.
- [ ] The desired CSS snippet (with the `nora` prefix) or color palette has been selected.
- [ ] Text direction, reader language, and attachment embedding have been configured.

### After exporting

- [ ] The HTML file opens in a browser and works offline.
- [ ] The cover, publication details, and table of contents are correct.
- [ ] Mermaid diagrams, LaTeX formulas, and SVGs render correctly, and their vector zoom works without blur.
- [ ] Code blocks have the correct language labels and working copy buttons.
- [ ] Switching between the custom theme (`✨`) and the default palettes/covers works without conflicts.
- [ ] Images, attachments, footnotes, search, and printing/PDF have been checked.

---

<a id="nora-section-32"></a>
## Project Resources

- GitHub repository: https://github.com/singhaf9270/nora-html-exlplorer
- README: https://github.com/singhaf9270/nora-html-exlplorer/blob/main/README.md
- Plugin source: https://github.com/singhaf9270/nora-html-exlplorer/blob/main/main.js
- Plugin styles: https://github.com/singhaf9270/nora-html-exlplorer/blob/main/styles.css

**End of guide**
