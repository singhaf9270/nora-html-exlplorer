---
title: "The Complete Guide to Nora HTML Exporter"
exportName: "Nora-HTML-Exporter-Complete-Guide"
docType: "Comprehensive Software Guide"
author:
  - "Nora Documentation Team"
subtitle: "A Complete Guide to Using, Configuring, and Exporting Obsidian Notes as Interactive HTML Publications"
category:
  - "Obsidian"
  - "Nora HTML Exporter"
  - "HTML Export"
  - "Software Documentation"
  - "Digital Publishing"
year: "2026"
description: "A comprehensive guide to installing, configuring, and using Nora HTML Exporter. Learn how to transform Obsidian Markdown notes into standalone HTML publications with an interactive reading experience, featuring a table of contents, full-text search, bookmarks, text highlighting, annotations, image and attachment support, and print or PDF export."
---
# Complete Guide to Nora HTML Exporter
## Installation, All Commands, Export Settings, Preview, and Reader Features

**Basis of this guide:** The `main.js` and `styles.css` files uploaded for this conversation.  
**Version stated in the source header:** `Nora HTML Exporter v1.3.0`

> This guide is based on the implementation in the source code, not merely on general descriptions. Whenever an option exists in the user interface but its effect has not been implemented in the current code, or its label differs from its actual behavior, this is explicitly explained.

---

## 1. Introducing Nora

**Nora HTML Exporter** is an Obsidian plugin that converts a Markdown note into a standalone HTML file with a book-like appearance and reading environment. It can also collect the notes in a folder into one unified HTML book.

The output is not just a simple web page. It includes a book-reader interface with a cover, publication information, chapters, a table of contents, search, reading settings, bookmarks, highlights, text notes, footnotes, and printing features.

### Main features implemented in the source code

- Plugin interface in Persian and English
- Exporting a single note through an export settings dialog
- Quick export using saved settings
- Unified export of a folder and its Markdown notes
- Option to include subfolders in folder exports
- Live preview in an Obsidian pane
- Five cover designs
- Seven color palettes
- Light and dark modes
- Automatic text direction, RTL, and LTR
- HTML reader interface language: Persian, English, or automatic detection
- Font size and page-width selection
- Embedding local images and attachments in the HTML file
- Table of contents and section navigation
- Full-text search
- Section bookmarking
- Text highlighting in five colors
- Adding a note to a selected passage
- Footnotes and a footnote display pop-up
- Enlarged image viewing (Lightbox)
- Printing and saving as PDF from the browser
- Saving reading preferences, bookmarks, and annotations in the browser's local storage

---

## 2. Installation and Activation

### Installation from Community Plugins

1. Open Obsidian.
2. Go to **Settings**.
3. Open **Community plugins**.
4. If necessary, turn off Safe mode.
5. Search for and install Nora HTML Exporter.
6. Once installed, enable the plugin.

If the version you need has not been published in Obsidian's plugin list, follow the installation instructions for the release available in the project's repository. The required files and manual installation procedure must match the release package for that version.

### Verifying that the plugin is enabled

After activation, you should see the Nora book icon in Obsidian's ribbon, and you should be able to find Nora commands in the Command Palette.

---

## 3. Ways to Access the Features

The current source registers four main commands.

| Command | Function |
|---|---|
| Export current note to HTML (with settings dialog) | Opens the complete note export form |
| Quick HTML export with default settings | Exports the current note without opening the settings form |
| Open Nora Reader Live Preview | Opens the preview pane |
| Batch HTML export from a folder | Selects a folder and creates one unified HTML file |

### Method 1: Ribbon icon

Click the Nora book icon in the Ribbon. The plugin opens the active Markdown note in the export settings dialog. If no Markdown note is active, a message asks you to open a note.

### Method 2: Command Palette

1. Press `Ctrl + P` on Windows/Linux or `Cmd + P` on macOS.
2. Search for `Nora` or `Export`.
3. Select the command you want.

### Method 3: File right-click menu

Right-click a Markdown file in the File Explorer. Two options are added:

- **Export HTML with Nora:** Opens the export settings dialog for that note.
- **Live Preview in Nora:** Opens the live preview for that note.

### Method 4: Folder right-click menu

Right-click a folder and select the Nora batch folder export option. The folder export dialog opens with that folder preselected.

---

## 4. Exporting a Single Note with the Settings Dialog

This is the most complete way to export a note because you can specify the cover information, language, appearance, and attachments before creating the HTML file.

### Steps

1. Open the Markdown note you want to export.
2. Run the Nora book icon, the note export command, or the right-click menu option.
3. The **Nora HTML Reader Export** dialog opens.
4. Review and complete the publication information fields.
5. Choose the appearance and language settings.
6. Set whether attachments should be embedded and whether the output should open automatically.
7. Choose one of the three buttons at the bottom of the dialog:
   - Preview
   - Direct Download
   - Save to Vault

### The “Entire Folder” button

The header of the note export dialog also contains an **Entire Folder** button. Selecting it opens the folder export dialog for the parent folder of the current note.

---

## 5. All Fields in the Export Dialog

### “Cover Details and Publication Information” section

| Field | Description |
|---|---|
| Publication Title | The main title displayed on the cover |
| Output File Name | The HTML file name; do not include the `.html` extension |
| Publication Type / Cover Label | A label such as Book, Article, Handout, or Guide |
| Author(s) | Author names; separate multiple names with `؛` |
| Subtitle or Short Description | A supplementary line displayed below the title |
| Subject(s) | The publication's subject or categories; separate multiple items with `؛` |
| Publication Year / Date | The year or date associated with the publication |
| Short Cover Introduction | A multiline description of the content |

### “Reader Appearance, Output Language, and Cover” section

| Field | Options |
|---|---|
| Color Mode | Light, Dark |
| Color Palette | Lavender and Turquoise, Oceanic, Forest and Emerald, Warm Sunset, Lapis Lazuli and Gold, Plum, Paper / Neutral |
| Cover Design | Aurora, Ocean, Botanical, Classic, Minimal |
| Text Direction | Automatic, Right-to-left (RTL), Left-to-right (LTR) |
| Font Size | Small 15px, Regular 16px, Large 18px, Extra Large 20px |
| Page Width | Narrow and Focused 680px, Regular 850px, Full Width |
| HTML Reader Interface Language | Detect automatically from text, Persian, English |

### Additional options

**Automatically embed Vault images and attachments in the HTML (fully offline)**

When enabled, Nora attempts to read local files identified in the text and place their data inside the HTML as Data URLs. As a result, the exported file does not depend on the original Vault paths to display those attachments.

**Open in browser after creation**

When enabled, Nora opens the HTML file with the system's default browser/application after creating the export.

---

## 6. Note Statistics Before Export

Three statistics are displayed at the bottom of the export form:

- **Word Count:** An estimate of the number of words in the text.
- **Reading Time:** An approximate estimate based on a speed of 220 words per minute.
- **Local Attachments:** The number of local destinations identified in the text.

These statistics are useful for quickly understanding the size of a note. Reading time is an estimate and should not be treated as an exact reading duration.

---

## 7. Three Ways to Get the Export

### 7.1. Preview

The **Preview** button opens the Live Preview pane and passes the selected appearance settings to it. At this stage, the final output file has not yet been saved.

### 7.2. Direct Download

The **Direct Download** button downloads the HTML file through the browser's download mechanism. Use this option when you want the file to be placed directly in your system's Downloads location.

### 7.3. Save to Vault

The **Save to Vault** button creates the HTML file in the output folder configured inside the Vault. The default output folder in the plugin settings is `Nora Exports`.

---

## 8. Quick Export

The **Quick HTML export with default settings** command creates an HTML file from the active Markdown note without opening the full export form.

This command uses metadata extracted from the note and the plugin's saved settings. Therefore, it is a good idea to review the general settings once before using quick export regularly.

### When is it useful?

- When your export settings have already been configured.
- When you want to export several notes one after another quickly.
- When you do not need to change the title, cover, or color scheme for every export.

---

## 9. Unified Folder Export

This feature converts multiple Markdown notes into **one single HTML file**. It does not necessarily create a separate HTML file for every note.

### Opening the dialog

- Run the batch export command from the Command Palette; or
- Right-click a folder and select Nora Folder Export; or
- Click **Entire Folder** in a note's export dialog.

### Selecting a folder

In the **Select Folder from Vault** list, choose the folder you want. The Vault root is also available as an option.

### Include subfolders

When this option is enabled, Nora also searches for Markdown files inside the subfolders of the selected folder. When disabled, only Markdown files located directly inside the selected folder are collected.

### Preserve subfolder tree in output

This option is present in the user interface. However, in the current code, its value is recorded in the form state but is not used by the unified HTML generation logic. Therefore, in the source version reviewed, you should not expect enabling or disabling it to change the folder tree structure in the output. The actual file order is sorted by file path, and each note becomes a separate section/chapter.

### Statistics and destination path

The dialog displays the following information live:

- How many Markdown notes have been found.
- The base output path.

If no Markdown notes are found, the build/export button is disabled.

### Appearance settings for folder exports

In the Folder Export dialog, you can set:

- Light or dark mode
- Color palette
- Cover design
- Text direction
- Font size
- Page width
- Reader interface language
- Attachment embedding
- Whether to open the output when finished

### Progress bar

While the export is being generated, a progress bar is displayed, along with the name of the note currently being processed.

### Chapter order

Nora sorts the discovered files by their paths. To control the order, prefix file names with numbers:

```text
01-Introduction.md
02-Chapter-One.md
03-Chapter-Two.md
04-Conclusion.md
```

Each source note becomes an independent chapter/section in the unified HTML file. The heading level at the beginning of each chapter is taken from the **Chapter Heading Level** setting.

### Folder export save location

The output is saved in a subfolder named after the selected folder, inside the main output path. The final file name is generally:

```text
<FolderName>-Complete.html
```

For the Vault root, the destination folder name is set to `Vault-Root`.

---

## 10. Live Preview

Live Preview is a View-type pane inside Obsidian.

### Opening it

Run the **Open Nora Reader Live Preview** command, or select the Live Preview option from a note's right-click menu.

### Preview pane features

The top bar of the pane contains:

- Switching the pane interface language between Persian and English
- Selecting light or dark mode
- Selecting a color palette
- Selecting a cover design
- An Export button that opens the full Export form

### Automatic updates

The preview responds when the active note changes. It is also updated after a short delay when the note file is edited in the Vault.

### Note

Preview is suitable for quick inspection. However, also open the final export in a browser, especially if attachment embedding or PDF printing is important to you.

---

## 11. Plugin Settings in Obsidian

Open the plugin settings through **Settings → Nora HTML Exporter**.

### 11.1. Plugin Interface Language

Interface options:

- Persian
- English
- Auto

This option controls the language of the plugin's own dialogs and settings. The export dialog and preview pane also have a quick language-switch button.

### 11.2. Default HTML Reader Language

Options:

- Automatic detection
- Persian
- English

This option determines the language of buttons, labels, and the book-reader interface inside the HTML file. Auto detects the language based on the note text and interface settings. This option does not translate the note's content.

### 11.3. Export Destination Folder

Enter the name or path of the folder in which HTML files should be saved inside the Vault. The default value is:

```text
Nora Exports
```

### 11.4. Default Publication Type

Sets a general label for the publication type, for example:

- Book
- Article
- Handout
- Guide
- Report

If the publication type is specified in the note's metadata, that value can be used for that particular note.

### 11.5. Default Color Mode

- Light
- Dark

### 11.6. Default Color Palette

Choose one of the seven available palettes.

### 11.7. Default Cover Design

Choose one of the five cover designs.

### 11.8. Default Text Direction

- Automatic
- Right-to-left (RTL)
- Left-to-right (LTR)

### 11.9. Embed Attachments

When this option is enabled, the export form selects embedding local attachments by default. This option can also be changed in the export form.

### 11.10. Open After Export

When enabled, the HTML file opens after a note export has been created.

### 11.11. Chapter Heading Level

Options `H1` through `H6` are available. In folder exports, this value is used to determine the heading level at the beginning of each chapter/note.

### 11.12. Support and Contact

The bottom of the settings page contains these links in the source code:

- Bale: `https://ble.ir/obsidiantut`
- Telegram: `https://t.me/obsidiantut`
- YouTube: `https://youtube.com/@obsidiantut`
- Financial support: `https://reymit.ir/singhaf9270`

---

## 12. Cover Structure and Publication Information

The HTML cover is generated from the information entered in the form.

### Displayable elements

- Publication type or label
- Main title
- Subtitle
- Author or authors
- Subject or subjects
- Year/date
- Short description
- Word count
- Estimated reading time
- Start Reading button

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
| `default` | Lavender and Turquoise |
| `ocean` | Oceanic |
| `forest` | Forest and Emerald |
| `sunset` | Warm Sunset |
| `royal` | Lapis Lazuli and Gold |
| `plum` | Plum |
| `mono` | Paper / Neutral |

---

## 13. Language and Text Direction

### Text direction

- `auto`: Direction is determined by the reader/interface language.
- `rtl`: Right-to-left.
- `ltr`: Left-to-right.

For Persian content, RTL is a suitable choice. For bilingual content, inspect the output to ensure headings, lists, code, and links are displayed correctly.

### Reader interface language

- Persian (FA)
- English (EN)
- Automatic detection from text (Auto)

This selection controls the reader interface language. The original note content remains untranslated.

---

## 14. Book Reader Toolbar Features

After opening the HTML file, the reader toolbar is available. Its main features are:

| Tool | Function |
|---|---|
| Contents | Opens the table of contents |
| Search | Finds a phrase in the text |
| Highlight | Colors the selected text |
| Note | Adds a note to the selected text |
| Bookmark | Adds or removes a bookmark for the current section |
| Light/Dark | Changes the display mode |
| Settings | Opens the reading settings panel |
| Print/PDF | Prints the book or saves it as a PDF |

At some screen sizes, the text labels on the buttons are collapsed and only their icons are displayed.

---

## 15. Table of Contents and Navigation Between Sections

### Table of contents

Click the **Contents** button to open the table-of-contents sidebar. Selecting a section title takes the reader to that section.

The table of contents is generated from the headings in the HTML content. In folder exports, source notes are included as separate chapters.

### Cover

The cover is a separate page at the beginning of the book. The **Start Reading** button takes the reader from the cover to the book content.

### Previous and next sections

At the bottom of the reader, **Previous** and **Next** buttons let you move between sections. A page/section indicator also shows your current position.

---

## 16. Reading Settings

Click the gear icon to open the reading settings panel.

### Display mode

- Light
- Dark

### Font size

Use the `A−` and `A+` buttons to change the font size. The size is limited in the code to a range of 12 to 28 pixels.

### Line spacing

Three options are available:

- Compact: `1.75`
- Normal: `2.05`
- Comfortable: `2.35`

### Page width

- Narrow: `680px`
- Normal: `850px`
- Full width: `100%`

### Text font

Available options:

- Default font
- Tahoma
- System UI
- Georgia
- Serif

For Persian, the default font uses the font families defined in the reader's stylesheet, including Vazirmatn and IRANSans when installed/available.

### Color palette

You can change the palette without generating the HTML file again.

### Cover design

You can change the cover design from inside the reader.

### Default highlight color

Five highlight colors are available:

- Yellow
- Green
- Blue
- Pink
- Purple

### Reset to defaults

The **Reset to Defaults** button restores reading preferences to the initial values for that file.

### Print / Save PDF

A Print/PDF button is also available at the bottom of the settings panel.

---

## 17. Bookmarks

Bookmarks are used to save the position of a book section and return to it quickly.

### Adding a bookmark

1. First, navigate to one of the book's sections. A section bookmark cannot be added on the cover.
2. Click the **Bookmark** button.
3. The current section is added to the bookmark list using its title.

### Removing a bookmark from the current section

If you click the Bookmark button again while in the same section, that section's bookmark is removed.

### Going to a bookmark

Click its name in the bookmark list to navigate to the corresponding section.

### Removing one bookmark

Use the × button next to the bookmark.

### Removing all bookmarks

If there is more than one bookmark, a **Remove All** option is displayed and asks for confirmation before clearing them.

### Bookmark persistence

Bookmarks are saved in the browser's `localStorage` and keyed by the book content's identifier. Therefore:

- They can be restored in the same browser and browser profile.
- They are not necessarily available in another browser or on another device.
- Clearing website/browser data may delete them.
- Changing the title or the book's initial content may change the book identifier.

---

## 18. Highlighting and Adding Notes to Text

Nora provides two separate annotation tools.

### 18.1. Highlighting

1. Navigate to one of the book's sections.
2. Select a passage in that section with the mouse.
3. Click the **Highlight** button.
4. The selected text is marked with the default highlight color.

You can change the color in the reading settings panel. The selected color is used for subsequent highlights.

### 18.2. Adding a note

1. Select a passage of text.
2. Click the **Note** button.
3. Enter your note in the input dialog.
4. Confirm to attach the note to the selected text.

### Viewing or deleting a note

Click the text associated with a note. The note's content is displayed, and you are also given the option to delete it.

### Removing a highlight

Click the highlighted text and confirm its removal.

### Text-selection limitations

- You must first enter a section.
- The selected text must belong to the currently active section.
- An invalid selection, or one that overlaps with an existing highlight, may be rejected.

### Annotation persistence

Highlights and notes are saved in the browser's `localStorage` and keyed by the book identifier. This information is not written into the original Obsidian Markdown file. To transfer it to another device, take the limitations of browser-local storage into account.

---

## 19. Search

The search box is used to find a word or phrase in the book.

### How to use it

1. Find the search box.
2. Enter the word or phrase you want.
3. Press `Enter`.
4. The result and the section in which it was found are displayed.
5. Continue searching to move between results.

If no result is found, the message “No results found” is displayed.

**Persian-language note:** Differences between the characters “ی/ي” and “ک/ك”, as well as the use of the zero-width non-joiner (half-space), can affect matching. If a phrase is not found, try a simpler form of it.

---

## 20. Footnotes

The Nora reader has a dedicated display pop-up for footnotes.

When the Markdown content contains footnotes:

- The footnote number or marker is displayed in the text.
- Selecting it opens the footnote pop-up.
- The **Go to Footnote** button lets you navigate to the footnote's location in the text.
- The **Return to Text** button takes you back to the reference location in the main text.
- The Close button closes the footnote pop-up.

Final support depends on the way the footnote is written in Markdown and how it is converted by the plugin version.

---

## 21. Images and Attachments

Nora extracts local references from the note text and prepares them for export.

### References recognized in the source code

- Images using Obsidian Wiki Embed syntax, such as `![[image.png]]`
- Markdown images, such as `![description](image.png)`
- Markdown links to local files, such as `[Download file](document.pdf)`

### Embedding attachments

If attachment embedding is enabled, discovered local files are read and converted to Data URLs so they can be included in the HTML.

### Benefits

- A portable HTML file with its resources embedded
- Less dependence on Vault file paths
- Better suited to sharing the file with others or keeping an offline archive

### Notes

- Embedding large files can significantly increase the HTML file size.
- Only files that Nora can locate from references in the text can be processed.
- Internet file links are not considered local files and are not embedded like Vault attachments.
- After exporting, test important images and links in the browser.

### Image Lightbox

When an image is clicked, if the element supports it, the image opens in an enlarged on-page view. This view includes:

- An × button to close the image.
- An **Open Original Image** link, if the original image address is available.

---

## 22. Printing and Saving as PDF

To print the book or convert it to PDF:

1. Open the HTML file in a browser.
2. Click **Print / PDF** in the toolbar or settings panel.
3. The browser's print dialog opens.
4. Select **Save as PDF** or the printer you want.
5. Check the paper size and page orientation.
6. Review the page previews and save the file.

### Recommendations

- For Persian content, check the page direction and text layout.
- If the background color does not appear in the PDF, enable the browser's **Background graphics** printing option.
- Check tables and large images in the print preview.
- If necessary, disable the browser's default headers and footers.

---

## 23. Automatic Metadata from Frontmatter

Nora can extract some cover information from the YAML Frontmatter at the beginning of a note. If a field is not present in Frontmatter, the file name or plugin settings are used as a fallback value.

### Persian/English Frontmatter example

```yaml
---
title: Comprehensive Research Guide
exportName: research-guide
docType: Educational Book
author:
  - Ali Rezaei
  - Sara Ahmadi
subtitle: From Note-Taking to Publishing
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
| `exportName` | Output file name |
| `docType`, `type`, or `نوع` | Publication type |
| `author`, `authors`, `نویسنده`, or `نویسندگان` | Author(s) |
| `subtitle` or `زیرعنوان` | Subtitle |
| `category`, `categories`, `tags`, `موضوع`, or `موضوعات` | Subjects/categories |
| `year`, `date`, `سال`, or `تاریخ` | Year/date |
| `description`, `summary`, `توضیحات`, or `معرفی` | Publication description |

### Editing priority

Information extracted from Frontmatter can be reviewed and changed in the export form. Changing a value in the export form does not automatically edit the original note's Frontmatter.

### Multiple authors or subjects

For multiple authors or subjects, you can use a YAML array or separate items in the form with the `؛` delimiter.

---

## 24. Important Notes and Limitations of the Current Version

This section is based on the uploaded source code and is important for avoiding incorrect assumptions.

1. **Preserve Subfolder Tree:** This option exists in the folder export form, but it is not used by the current HTML generation logic. Therefore, no practical effect from this option is observed in the reviewed version.
2. **Folder export is unified:** Markdown notes in a folder are merged into one HTML file with a name similar to `FolderName-Complete.html`.
3. **Note order:** Files are sorted by their paths. Use numbered file names to control the order.
4. **Bookmark and note persistence:** This data is saved in the browser's local storage, not in the Vault.
5. **Output language does not translate content:** Choosing Persian or English determines the book-reader interface language; it does not translate the note text.
6. **Preview differs from final export:** In the preview, attachments are displayed as Vault resources. In the final export, they can be embedded in the HTML.
7. **Opening a folder export:** The form option is labeled as opening the output folder; however, in the current implementation, the path of the generated HTML file is sent to the system to be opened.
8. **Local attachments:** Only references extracted from the text and found in the Vault can be embedded.
9. **Browser-local storage:** Clearing browser data or using another profile/device can make saved bookmarks and annotations unavailable.

---

## 25. Troubleshooting

### I cannot see the Nora icon

- Check that the plugin is enabled under Community Plugins.
- Make sure all files for the installed version are present.
- Restart Obsidian.

### Commands do not appear in the Command Palette

- Search for `Nora`.
- Check that the plugin is enabled.
- For the note export command, open and activate a Markdown file.

### I see the message “Please open a Markdown note first”

The note export command is only available when there is an active Markdown file. Open a `.md` note and run the command again.

### The HTML file is not saved or I cannot find it

- Check the output folder value in Settings.
- Check the output file name in the form.
- Make sure the operation completed without an error.
- Check the `Nora Exports` folder or your custom path in the Vault.

### Images do not appear in the export

- Check the image path in the note.
- Make sure the file exists in the Vault.
- Enable the attachment embedding option.
- Generate a new export and reopen the HTML file.

### Chapters are not in the desired order

- Number the file names.
- Use an orderly path structure.
- Remember that ordering is based on file paths.

### Persian text has the wrong direction

- Set Direction to RTL in the export form.
- Choose Persian or Auto as the reader language.
- Test the updated output in a browser.

### Highlights or bookmarks did not remain after transferring the file

This data depends on the browser's `localStorage` and is not transferred to another device with the HTML file. Check the file in the same browser and browser profile.

### PDF printing looks incorrect

- Check the print preview.
- Adjust the paper size and orientation.
- Enable background printing in the browser settings.
- Change the reader's page width before printing.

---

## 26. Suggested Workflows

### Short article

1. Open the note.
2. Open the export dialog.
3. Review the title and author.
4. Choose a suitable cover design and palette.
5. Set the text direction and font size.
6. Preview the result.
7. Download the file or save it in the Vault.

### Multi-chapter book

1. Create a separate Markdown file for each chapter.
2. Place the files in one folder.
3. Begin file names with chapter numbers.
4. Enable Include Subfolders if needed.
5. Set Chapter Heading Level to match the chapter structure.
6. Run Folder Export.
7. Check the number of notes found.
8. Generate the unified export.
9. Review the table of contents and chapter order.

### Publishing Persian content

1. Complete the Frontmatter.
2. Set the text direction to RTL.
3. Set the reader language to Persian.
4. Try a font size of 16 or 18 pixels.
5. Choose a page width of 680 or 850 pixels depending on the type of text.
6. Embed attachments if needed.
7. Review the output in a browser.
8. Generate a PDF if necessary.

---

## 27. Final Checklist

### Before exporting

- [ ] Notes and headings are organized.
- [ ] Frontmatter and publication information have been reviewed.
- [ ] The output file name is appropriate.
- [ ] The language and text direction are correct.
- [ ] The theme, palette, and cover have been selected.
- [ ] The attachment embedding setting has been decided.

### After exporting

- [ ] The HTML file opens.
- [ ] The cover and publication details are correct.
- [ ] The table of contents and chapter navigation work.
- [ ] Images and attachments are displayed.
- [ ] Search works.
- [ ] Bookmarks, highlights, and notes have been tested.
- [ ] Footnotes are displayed correctly.
- [ ] Printing or saving as PDF has been checked.

---

## Project Resources

- GitHub repository: <https://github.com/singhaf9270/nora-html-exlplorer>
- README: <https://github.com/singhaf9270/nora-html-exlplorer/blob/main/README.md>
- Plugin source: <https://github.com/singhaf9270/nora-html-exlplorer/blob/main/main.js>
- Plugin stylesheet: <https://github.com/singhaf9270/nora-html-exlplorer/blob/main/styles.css>

---

**End of Guide**

This guide was prepared based on the uploaded source code. If the behavior of your installed version differs from the descriptions in this document, use the plugin files and source code for that same version as the basis for review.
