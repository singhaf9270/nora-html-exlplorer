'use strict';

const {
  Plugin,
  PluginSettingTab,
  Modal,
  ItemView,
  Setting,
  Notice,
  TFile,
  TFolder,
  normalizePath
} = require('obsidian');

const VIEW_TYPE_NORA_PREVIEW = 'nora-html-live-preview';

const DEFAULT_SETTINGS = {
  uiLanguage: 'fa',        // 'fa' | 'en' | 'auto'
  readerLanguage: 'auto',  // 'auto' | 'fa' | 'en'
  theme: 'light',
  palette: 'default',
  coverStyle: 'aurora',
  direction: 'auto',
  fontSize: 16,
  width: '850',
  docType: '',
  exportFolder: 'Nora Exports',
  embedAttachments: true,
  openAfterExport: true,
  chapterHeadingLevel: '1'
};

/* =========================================================
   فرهنگ لغت دوزبانه (فارسی / انگلیسی)
   ========================================================= */

const I18N = {
  fa: {
    dir: 'rtl',
    logoChar: 'ن',
    langSwitchLabel: '🌐 EN',
    langSwitchTitle: 'Switch to English',
    ribbonTooltip: 'خروجی HTML با نورا',
    cmdExportModal: 'خروجی HTML از یادداشت فعلی (با پنجره تنظیمات)',
    cmdQuickExport: 'خروجی سریع HTML با تنظیمات پیش‌فرض',
    cmdLivePreview: 'باز کردن پیش‌نمایش زنده خوانشگر نورا',
    cmdFolderExport: 'خروجی دسته‌جمعی HTML از یک پوشه',
    menuExport: 'خروجی HTML با نورا',
    menuPreview: 'پیش‌نمایش زنده در نورا',
    menuFolderExport: 'خروجی دسته‌جمعی HTML از این پوشه (نورا)',
    btnBatchHeader: '📁 کل پوشه',
    btnBatchHeaderTitle: 'خروجی دسته‌جمعی کل پوشه',
    folderModalTitle: 'خروجی دسته‌جمعی پوشه با نورا',
    folderModalDesc: 'همه یادداشت‌های Markdown پوشه انتخاب‌شده در یک فایل HTML واحد و یکپارچه قرار می‌گیرند.',
    fieldSelectFolder: 'انتخاب پوشه از Vault',
    vaultRootLabel: 'ریشه Vault (/)',
    toggleSubfolders: 'شامل زیرپوشه‌ها هم باشد',
    togglePreserveTree: 'حفظ ساختار زیرپوشه‌ها در خروجی',
    toggleOpenFolder: 'باز کردن پوشه خروجی پس از اتمام',
    statFolderNotes: n => `📚 ${n} یادداشت Markdown پیدا شد`,
    statExportDest: p => `📁 مسیر ذخیره: ${p}`,
    btnStartBatch: '📖 ساخت یک فایل HTML یکپارچه از کل پوشه',
    mergedExportDone: (name, count, path) => `فایل HTML یکپارچه شامل ${count} یادداشت ساخته شد: ${path}`,
    batchProgress: (cur, tot, name) => `در حال تبدیل ${cur} از ${tot}: ${name}`,
    batchDone: (ok, tot, dir) => `خروجی دسته‌جمعی کامل شد: ${ok} از ${tot} فایل در «${dir}» ذخیره شد.`,
    batchNoNotes: 'هیچ یادداشت Markdown در پوشه انتخاب‌شده پیدا نشد.',
    noticeOpenMdFirst: 'ابتدا یک یادداشت Markdown را باز کنید.',
    noticeDownloaded: name => `فایل «${name}» دانلود شد.`,
    noticeSaved: path => `فایل HTML با موفقیت ساخته شد:\n${path}`,
    noticeError: err => `خطا در ساخت فایل HTML: ${err}`,

    // Modal
    modalTitle: 'خروجی خوانشگر HTML نورا',
    modalNoteLabel: path => `یادداشت انتخاب‌شده: ${path}`,
    sectionCover: '✦ مشخصات جلد و معرفی اثر',
    sectionStyle: '🎨 ظاهر خوانشگر، زبان خروجی و جلد',
    fieldTitle: 'عنوان اثر',
    phTitle: 'عنوان روی جلد',
    fieldFileName: 'نام فایل خروجی (بدون .html)',
    phFileName: 'نام فایل هنگام ذخیره',
    fieldDocType: 'نوع اثر / برچسب جلد',
    phDocType: 'پیش‌فرض: معرفی اثر (مقاله، کتاب، جزوه...)',
    fieldAuthor: 'نویسنده / نویسندگان (جداسازی با ؛)',
    phAuthor: 'مثلاً سعید قبادی',
    fieldSubtitle: 'زیرعنوان یا توضیح کوتاه',
    phSubtitle: 'زیرعنوان اختیاری',
    fieldCategory: 'موضوع / موضوعات (جداسازی با ؛)',
    phCategory: 'مثلاً تاریخ؛ آموزش',
    fieldYear: 'سال انتشار / تاریخ',
    phYear: 'مثلاً ۱۴۰۵',
    fieldDescription: 'معرفی کوتاه روی جلد (اختیاری)',
    phDescription: 'چند خط دربارهٔ محتوای این نوشته...',

    fieldTheme: 'حالت رنگ',
    fieldPalette: 'پالت رنگی',
    fieldCoverStyle: 'طرح جلد',
    fieldDirection: 'جهت متن',
    fieldFontSize: 'اندازه قلم',
    fieldWidth: 'عرض صفحه',
    fieldReaderLang: 'زبان رابط خوانشگر HTML',

    optLight: '☀️ روز',
    optDark: '🌙 شب',
    palettes: [
      ['default', 'یاسی و فیروزه‌ای'],
      ['ocean', 'اقیانوسی'],
      ['forest', 'جنگلی و زمردی'],
      ['sunset', 'غروب گرم'],
      ['royal', 'لاجوردی و طلایی'],
      ['plum', 'آلویی'],
      ['mono', 'کاغذی / خنثی']
    ],
    covers: [
      ['aurora', 'جلد شفق'],
      ['ocean', 'جلد اقیانوس'],
      ['botanical', 'جلد گیاهی'],
      ['classic', 'جلد کلاسیک'],
      ['minimal', 'جلد مینیمال']
    ],
    directions: [
      ['auto', 'خودکار'],
      ['rtl', 'راست‌چین (RTL)'],
      ['ltr', 'چپ‌چین (LTR)']
    ],
    fontSizes: [
      ['15', 'کوچک (15px)'],
      ['16', 'معمولی (16px)'],
      ['18', 'بزرگ (18px)'],
      ['20', 'خیلی بزرگ (20px)']
    ],
    widths: [
      ['850', 'معمولی (850px)'],
      ['100%', 'تمام عرض'],
      ['680', 'باریک و متمرکز']
    ],
    readerLangs: [
      ['auto', 'تشخیص خودکار از متن'],
      ['fa', 'فارسی (FA)'],
      ['en', 'انگلیسی (EN)']
    ],

    toggleEmbed: 'تعبیه خودکار عکس‌ها و پیوست‌های Vault داخل HTML (کاملاً آفلاین)',
    toggleOpen: 'باز کردن در مرورگر پس از ساخت',
    statWords: n => `📄 ${n} واژه`,
    statMinutes: n => `⏱ حدود ${n} دقیقه مطالعه`,
    statAttach: n => `📎 ${n} پیوست محلی شناسایی شد`,
    btnPreview: '◉ پیش‌نمایش زنده',
    btnDownload: '↓ دانلود مستقیم',
    btnSaveVault: '✦ ذخیره در Vault و ساخت HTML',

    // Preview View
    viewDisplayText: 'پیش‌نمایش نورا',
    viewBrandDefault: 'پیش‌نمایش خوانشگر نورا',
    viewBrandNote: name => `نورا: ${name}`,
    viewExportBtn: '↓ خروجی HTML',
    viewEmptyText: 'یک یادداشت Markdown باز کنید تا پیش‌نمایش خوانشگر نورا اینجا نمایش داده شود.',

    // Settings
    settingsHeading: 'تنظیمات پلاگین نورا (Nora HTML Exporter)',
    setUiLangName: 'زبان رابط کاربری پلاگین',
    setUiLangDesc: 'زبان منوها، پنجره خروجی و تنظیمات پلاگین در ابسیدین.',
    setUiLangAuto: 'خودکار (بر اساس زبان ابسیدین)',
    setReaderLangName: 'زبان پیش‌فرض خوانشگر خروجی HTML',
    setReaderLangDesc: 'در حالت «تشخیص خودکار»، زبان دکمه‌ها و برچسب‌های فایل HTML بر اساس زبان متن یادداشت انتخاب می‌شود.',
    setFolderName: 'پوشه ذخیره خروجی در Vault',
    setFolderDesc: 'نام پوشه‌ای که فایل‌های HTML در آن ذخیره می‌شوند. اگر خالی بماند، کنار همان یادداشت ذخیره می‌شود.',
    setFolderPh: 'مثلاً Nora Exports',
    setDocTypeName: 'برچسب پیش‌فرض روی جلد (اختیاری)',
    setDocTypeDesc: 'اگر خالی بماند، بر اساس زبان خروجی «معرفی اثر» یا «Overview» قرار می‌گیرد.',
    setThemeName: 'حالت رنگ پیش‌فرض',
    setPaletteName: 'پالت رنگی پیش‌فرض',
    setCoverName: 'طرح جلد پیش‌فرض',
    setDirName: 'جهت متن پیش‌فرض',
    setEmbedName: 'تعبیه خودکار پیوست‌ها (Base64)',
    setEmbedDesc: 'تصاویر، صوت، ویدیو و PDFهای داخل Vault به صورت خودکار داخل فایل HTML قرار می‌گیرند تا فایل کاملاً مستقل و آفلاین باشد.',
    setOpenName: 'باز کردن خودکار در مرورگر پس از ذخیره',
    setOpenDesc: 'در نسخه دسکتاپ، بلافاصله بعد از ساخت HTML آن را در مرورگر پیش‌فرض سیستم باز می‌کند.',
    setChapterHeadingName: 'سطح هدینگ شروع فصل در خروجی یکپارچه',
    setChapterHeadingDesc: 'عنوان هر فایل به‌عنوان شروع یک فصل درج می‌شود. سطح هدینگ را برای فصل‌ها انتخاب کنید (H1 تا H6).',
    supportHeading: 'همراه ما باشید',
    supportIntro: 'آموزش‌ها، تازه‌ها و نکته‌های کاربردی ابسیدین را در کانال‌های ما دنبال کنید.',
    supportJoin: 'عضویت در کانال',
    supportDonationTitle: 'با همراهی شما، ادامه می‌دهیم',
    supportDonationDesc: 'اگر این افزونه برایتان مفید بوده، می‌توانید از ادامهٔ توسعهٔ آن حمایت کنید.',
    supportDonate: 'حمایت مالی',

    // Exported Reader UI
    reader: {
      defaultDocType: 'معرفی اثر',
      defaultTitle: 'مطالعه',
      brand: '📖 نورا | خوانشگر',
      coverJumpTitle: 'بازگشت به جلد و معرفی',
      searchPlaceholder: 'جست‌وجو در متن… (Enter)',
      smallerTitle: 'کوچک‌تر',
      biggerTitle: 'بزرگ‌تر',
      paletteAria: 'قالب رنگی',
      fontTitle: 'فونت متن',
      fontDefault: 'فونت پیش‌فرض',
      coverTitle: 'طرح جلد',
      themeTitle: 'تغییر روز/شب',
      tocBtn: '☷ فهرست',
      tocHeading: 'فهرست مطالب',
      tocCloseAria: 'بستن فهرست',
      tocTitleInline: 'در این نوشته می‌خوانید',
      tocCoverSuffix: '(جلد)',
      hlColorTitle: 'رنگ هایلایت',
      hlColors: [['yellow', 'زرد'], ['green', 'سبز'], ['blue', 'آبی'], ['pink', 'صورتی'], ['purple', 'بنفش']],
      hlBtn: '🖍 هایلایت',
      commentBtn: '💬 یادداشت',
      markBtn: '🔖 نشانک',
      markRemoveBtn: '🔖 حذف نشانک',
      printBtn: 'چاپ / PDF',
      lightboxOpen: 'باز کردن تصویر اصلی ↗',
      lightboxClose: 'بستن',
      startReading: 'شروع مطالعه',
      noBookmarks: '🔖 هنوز نشانکی ثبت نشده است',
      bookmarksLabel: '🔖 نشانک‌ها:',
      clearAllMarks: 'حذف همه',
      clearAllConfirm: 'همهٔ نشانک‌ها حذف شوند؟',
      delMarkTitle: 'حذف این نشانک',
      prev: 'قبلی',
      next: 'بعدی',
      coverPage: 'صفحهٔ معرفی',
      prevSection: 'بخش قبلی',
      nextSection: 'بخش بعدی',
      sectionOf: (a, b) => `بخش ${a} از ${b}`,
      footerBrand: 'نورا · نسخه مطالعه',
      authorSingle: 'نویسنده:',
      authorMulti: 'نویسندگان:',
      categorySingle: 'موضوع:',
      categoryMulti: 'موضوعات:',
      yearLabel: 'انتشار:',
      minRead: n => `⏱ حدود ${n} دقیقه مطالعه`,
      wordCount: n => `📄 ${n} واژه`,
      zeroWords: '📄 ۰ واژه',
      bytes: n => `${n} بایت`,
      kb: n => `${n} کیلوبایت`,
      mb: n => `${n} مگابایت`,
      emptyText: 'هنوز متنی برای نمایش وجود ندارد.',
      fallbackAttachment: 'فایل پیوست',
      imgUnavailable: name => `🖼 تصویر <code>${name}</code> در دسترس نیست`,
      imgRemoteFail: '🖼 بارگذاری تصویر اینترنتی ناموفق بود — ',
      imgRemoteOpen: 'باز کردن لینک تصویر ↗',
      imgLocalFail: name => `🖼 تصویر «${name}» در دسترس نیست.`,
      btnDownload: '↓ دانلود',
      btnOpenDownload: '↓ دریافت / باز کردن',
      btnGetFile: '↓ دریافت فایل',
      pdfPreviewSummary: '👁 مشاهدهٔ پیش‌نمایش PDF در صفحه',
      pdfNotFound: ' · (فایل در Vault پیدا نشد)',
      alertBookmarkSection: 'برای ثبت نشانک، ابتدا وارد یکی از بخش‌ها شوید.',
      alertAnnotateSection: 'برای هایلایت یا یادداشت، وارد یکی از بخش‌ها شوید.',
      alertSelectText: 'ابتدا بخشی از متن را انتخاب کن.',
      alertSameSection: 'متن انتخاب‌شده باید از همین بخش باشد.',
      alertInvalidSelection: 'این بخش قبلاً هایلایت شده یا متن معتبری انتخاب نشده است.',
      promptNote: 'یادداشتت را درباره این بخش بنویس:',
      titleNoteMark: 'برای دیدن یا حذف یادداشت کلیک کن',
      titleHlMark: 'برای حذف هایلایت کلیک کن',
      alertNotePrefix: 'یادداشت: ',
      confirmDeleteNote: 'این یادداشت حذف شود؟',
      confirmDeleteHl: 'این هایلایت حذف شود؟',
      searchFound: (cur, tot, sec) => `نتیجه ${cur} از ${tot} — در بخش ${sec} پیدا شد`,
      searchNotFound: 'موردی پیدا نشد',
      settingsBtn: 'تنظیمات',
      settingsTitle: 'تنظیمات نمایش و مطالعه',
      settingsClose: 'بستن تنظیمات',
      setAppearance: 'حالت نمایش',
      setDay: '☀️ روز',
      setNight: '🌙 شب',
      setFontSize: 'اندازه قلم',
      setLineHeight: 'فاصله خطوط',
      lhCompact: 'فشرده',
      lhNormal: 'معمولی',
      lhRelaxed: 'راحت',
      setWidth: 'عرض صفحه',
      wNarrow: 'باریک',
      wNormal: 'معمولی',
      wWide: 'تمام عرض',
      setFontFamily: 'قلم متن',
      setPalette: 'پالت رنگی',
      setCoverStyle: 'طرح جلد',
      setHlColor: 'رنگ هایلایت پیش‌فرض',
      resetSettings: 'بازنشانی پیش‌فرض',
      printBtnFull: '🖨 چاپ / ذخیره PDF',
      footnotesHeading: 'پاورقی‌های این بخش',
      footnoteLabel: 'پاورقی',
      footnoteGoTo: 'رفتن به پاورقی ↓',
      footnoteBack: 'بازگشت به متن',
      footnoteClose: 'بستن پاورقی',
      sectionFallback: n => `بخش ${n}`
    }
  },

  en: {
    dir: 'ltr',
    logoChar: 'N',
    langSwitchLabel: '🌐 فارسی',
    langSwitchTitle: 'تغییر زبان به فارسی',
    ribbonTooltip: 'Export HTML with Nora',
    cmdExportModal: 'Export current note to HTML (with options)',
    cmdQuickExport: 'Quick export current note to HTML',
    cmdLivePreview: 'Open Nora live HTML preview',
    cmdFolderExport: 'Batch export a folder to HTML',
    menuExport: 'Export to HTML (Nora)',
    menuPreview: 'Live preview in Nora',
    menuFolderExport: 'Batch export folder to HTML (Nora)',
    btnBatchHeader: '📁 Folder',
    btnBatchHeaderTitle: 'Batch export entire folder',
    folderModalTitle: 'Nora Batch Folder Exporter',
    folderModalDesc: 'Combine all Markdown notes in the selected folder into one Nora HTML Reader file.',
    fieldSelectFolder: 'Select Vault Folder',
    vaultRootLabel: 'Vault Root (/)',
    toggleSubfolders: 'Include subfolders',
    togglePreserveTree: 'Preserve subfolder structure in output',
    toggleOpenFolder: 'Open output folder when finished',
    statFolderNotes: n => `📚 ${n} Markdown note(s) found`,
    statExportDest: p => `📁 Output path: ${p}`,
    btnStartBatch: '📖 Export Entire Folder as One HTML',
    mergedExportDone: (name, count, path) => `Merged HTML with ${count} notes created: ${path}`,
    batchProgress: (cur, tot, name) => `Exporting ${cur} of ${tot}: ${name}`,
    batchDone: (ok, tot, dir) => `Batch export finished: ${ok} of ${tot} file(s) saved to "${dir}".`,
    batchNoNotes: 'No Markdown notes found in the selected folder.',
    noticeOpenMdFirst: 'Please open a Markdown note first.',
    noticeDownloaded: name => `Downloaded "${name}".`,
    noticeSaved: path => `HTML exported successfully:\n${path}`,
    noticeError: err => `Error exporting HTML: ${err}`,

    // Modal
    modalTitle: 'Nora HTML Reader Exporter',
    modalNoteLabel: path => `Selected note: ${path}`,
    sectionCover: '✦ Cover & Metadata',
    sectionStyle: '🎨 Reader Appearance, Language & Cover',
    fieldTitle: 'Title',
    phTitle: 'Cover title',
    fieldFileName: 'Output filename (without .html)',
    phFileName: 'Filename when saved',
    fieldDocType: 'Document type / Cover badge',
    phDocType: 'Default: Overview (Article, Book, Guide...)',
    fieldAuthor: 'Author(s) (separate with ; or ,)',
    phAuthor: 'e.g. Jane Doe; John Smith',
    fieldSubtitle: 'Subtitle or tagline',
    phSubtitle: 'Optional subtitle',
    fieldCategory: 'Category / Tags (separate with ; or ,)',
    phCategory: 'e.g. History; Research',
    fieldYear: 'Year / Date',
    phYear: 'e.g. 2026',
    fieldDescription: 'Short description on cover (optional)',
    phDescription: 'A brief introduction to this document...',

    fieldTheme: 'Color Mode',
    fieldPalette: 'Color Palette',
    fieldCoverStyle: 'Cover Style',
    fieldDirection: 'Text Direction',
    fieldFontSize: 'Font Size',
    fieldWidth: 'Page Width',
    fieldReaderLang: 'Exported HTML UI Language',

    optLight: '☀️ Light',
    optDark: '🌙 Dark',
    palettes: [
      ['default', 'Lilac & Teal'],
      ['ocean', 'Ocean'],
      ['forest', 'Forest Emerald'],
      ['sunset', 'Warm Sunset'],
      ['royal', 'Royal Indigo & Gold'],
      ['plum', 'Plum'],
      ['mono', 'Paper / Neutral']
    ],
    covers: [
      ['aurora', 'Aurora Cover'],
      ['ocean', 'Ocean Cover'],
      ['botanical', 'Botanical Cover'],
      ['classic', 'Classic Cover'],
      ['minimal', 'Minimal Cover']
    ],
    directions: [
      ['auto', 'Auto'],
      ['ltr', 'Left-to-Right (LTR)'],
      ['rtl', 'Right-to-Left (RTL)']
    ],
    fontSizes: [
      ['15', 'Small (15px)'],
      ['16', 'Normal (16px)'],
      ['18', 'Large (18px)'],
      ['20', 'Extra Large (20px)']
    ],
    widths: [
      ['850', 'Normal (850px)'],
      ['100%', 'Full Width'],
      ['680', 'Narrow & Focused']
    ],
    readerLangs: [
      ['auto', 'Auto-detect from note'],
      ['en', 'English (EN)'],
      ['fa', 'Persian (FA)']
    ],

    toggleEmbed: 'Embed Vault images & attachments as Base64 (fully offline)',
    toggleOpen: 'Open in browser after export',
    statWords: n => `📄 ${n} words`,
    statMinutes: n => `⏱ ~${n} min read`,
    statAttach: n => `📎 ${n} local attachment(s) found`,
    btnPreview: '◉ Live Preview',
    btnDownload: '↓ Direct Download',
    btnSaveVault: '✦ Save to Vault & Export HTML',

    // Preview View
    viewDisplayText: 'Nora Preview',
    viewBrandDefault: 'Nora Reader Preview',
    viewBrandNote: name => `Nora: ${name}`,
    viewExportBtn: '↓ Export HTML',
    viewEmptyText: 'Open a Markdown note to see the live Nora Reader preview here.',

    // Settings
    settingsHeading: 'Nora HTML Exporter Settings',
    setUiLangName: 'Plugin Interface Language',
    setUiLangDesc: 'Language for plugin dialogs, preview toolbar, and settings inside Obsidian.',
    setUiLangAuto: 'Auto (follow Obsidian language)',
    setReaderLangName: 'Default Exported HTML UI Language',
    setReaderLangDesc: 'When set to Auto, the exported HTML reader controls and cover labels automatically match the note content language (Persian or English).',
    setFolderName: 'Export Folder in Vault',
    setFolderDesc: 'Folder where exported HTML files will be saved. Leave blank to save next to the source note.',
    setFolderPh: 'e.g. Nora Exports',
    setDocTypeName: 'Default Cover Badge (optional)',
    setDocTypeDesc: 'Leave empty to automatically use "Overview" (EN) or "معرفی اثر" (FA).',
    setThemeName: 'Default Color Mode',
    setPaletteName: 'Default Color Palette',
    setCoverName: 'Default Cover Style',
    setDirName: 'Default Text Direction',
    setEmbedName: 'Auto-embed Vault Attachments (Base64)',
    setEmbedDesc: 'Embed images, audio, video, and PDFs directly inside the HTML file so it works completely offline.',
    setOpenName: 'Open in Browser After Saving',
    setOpenDesc: 'On desktop, automatically opens the generated HTML file in your default web browser.',
    setChapterHeadingName: 'Chapter heading level for merged export',
    setChapterHeadingDesc: 'Each file title starts a new chapter. Choose the heading level (H1–H6).',
    supportHeading: 'Stay Connected',
    supportIntro: 'Follow our channels for Obsidian tutorials, updates, and practical tips.',
    supportJoin: 'Join channel',
    supportDonationTitle: 'Your support keeps us going',
    supportDonationDesc: 'If this plugin is useful, you can support its continued development.',
    supportDonate: 'Support us',

    // Exported Reader UI
    reader: {
      defaultDocType: 'Overview',
      defaultTitle: 'Reading',
      brand: '📖 Nora | Reader',
      coverJumpTitle: 'Back to cover',
      searchPlaceholder: 'Search in text… (Enter)',
      smallerTitle: 'Decrease font size',
      biggerTitle: 'Increase font size',
      paletteAria: 'Color palette',
      fontTitle: 'Font family',
      fontDefault: 'Default Font',
      coverTitle: 'Cover style',
      themeTitle: 'Toggle light/dark mode',
      tocBtn: '☷ Contents',
      tocHeading: 'Table of Contents',
      tocCloseAria: 'Close contents',
      tocTitleInline: 'In this document',
      tocCoverSuffix: '(Cover)',
      hlColorTitle: 'Highlight color',
      hlColors: [['yellow', 'Yellow'], ['green', 'Green'], ['blue', 'Blue'], ['pink', 'Pink'], ['purple', 'Purple']],
      hlBtn: '🖍 Highlight',
      commentBtn: '💬 Note',
      markBtn: '🔖 Bookmark',
      markRemoveBtn: '🔖 Remove Bookmark',
      printBtn: 'Print / PDF',
      lightboxOpen: 'Open original image ↗',
      lightboxClose: 'Close',
      startReading: 'Start Reading',
      noBookmarks: '🔖 No bookmarks yet',
      bookmarksLabel: '🔖 Bookmarks:',
      clearAllMarks: 'Clear all',
      clearAllConfirm: 'Remove all bookmarks?',
      delMarkTitle: 'Remove bookmark',
      prev: 'Previous',
      next: 'Next',
      coverPage: 'Cover Page',
      prevSection: 'Previous Section',
      nextSection: 'Next Section',
      sectionOf: (a, b) => `Section ${a} of ${b}`,
      footerBrand: 'Nora · Reader Edition',
      authorSingle: 'Author:',
      authorMulti: 'Authors:',
      categorySingle: 'Topic:',
      categoryMulti: 'Topics:',
      yearLabel: 'Published:',
      minRead: n => `⏱ ~${n} min read`,
      wordCount: n => `📄 ${n} words`,
      zeroWords: '📄 0 words',
      bytes: n => `${n} B`,
      kb: n => `${n} KB`,
      mb: n => `${n} MB`,
      emptyText: 'No content to display yet.',
      fallbackAttachment: 'Attachment',
      imgUnavailable: name => `🖼 Image <code>${name}</code> is unavailable`,
      imgRemoteFail: '🖼 Failed to load remote image — ',
      imgRemoteOpen: 'Open image link ↗',
      imgLocalFail: name => `🖼 Image "${name}" is unavailable.`,
      btnDownload: '↓ Download',
      btnOpenDownload: '↓ Open / Download',
      btnGetFile: '↓ Download File',
      pdfPreviewSummary: '👁 Preview PDF inline',
      pdfNotFound: ' · (File not found in Vault)',
      alertBookmarkSection: 'Please navigate into a section first to add a bookmark.',
      alertAnnotateSection: 'Please navigate into a section first to highlight or add a note.',
      alertSelectText: 'Please select some text first.',
      alertSameSection: 'Selected text must be within the current section.',
      alertInvalidSelection: 'This selection is already highlighted or invalid.',
      promptNote: 'Write your note for this selection:',
      titleNoteMark: 'Click to view or remove note',
      titleHlMark: 'Click to remove highlight',
      alertNotePrefix: 'Note: ',
      confirmDeleteNote: 'Remove this note?',
      confirmDeleteHl: 'Remove this highlight?',
      searchFound: (cur, tot, sec) => `Match ${cur} of ${tot} — found in section ${sec}`,
      searchNotFound: 'No matches found',
      settingsBtn: 'Settings',
      settingsTitle: 'Reading & Display Settings',
      settingsClose: 'Close settings',
      setAppearance: 'Appearance',
      setDay: '☀️ Light',
      setNight: '🌙 Dark',
      setFontSize: 'Font Size',
      setLineHeight: 'Line Spacing',
      lhCompact: 'Compact',
      lhNormal: 'Normal',
      lhRelaxed: 'Relaxed',
      setWidth: 'Page Width',
      wNarrow: 'Narrow',
      wNormal: 'Normal',
      wWide: 'Full',
      setFontFamily: 'Font Family',
      setPalette: 'Color Palette',
      setCoverStyle: 'Cover Style',
      setHlColor: 'Default Highlight Color',
      resetSettings: 'Reset Defaults',
      printBtnFull: '🖨 Print / Save PDF',
      footnotesHeading: 'Footnotes',
      footnoteLabel: 'Footnote',
      footnoteGoTo: 'Jump to footnote ↓',
      footnoteBack: 'Back to text',
      footnoteClose: 'Close footnote',
      sectionFallback: n => `Section ${n}`
    }
  }
};

function resolveUiLang(settingVal) {
  if (settingVal === 'fa' || settingVal === 'en') return settingVal;
  try {
    const obsLang = (window.localStorage && window.localStorage.getItem('language')) || '';
    if (/^fa/i.test(obsLang)) return 'fa';
    if (obsLang) return 'en';
  } catch (e) {}
  return 'fa';
}

function detectContentLanguage(md) {
  const plain = stripFrontmatter(md)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/https?:\/\/\S+/gi, ' ');
  const faMatches = plain.match(/[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]/g) || [];
  const enMatches = plain.match(/[A-Za-z]/g) || [];
  if (faMatches.length === 0 && enMatches.length === 0) return 'fa';
  return faMatches.length >= enMatches.length * 0.35 ? 'fa' : 'en';
}

function resolveReaderLang(settingVal, md, fallbackUiLang = 'fa') {
  if (settingVal === 'fa' || settingVal === 'en') return settingVal;
  return detectContentLanguage(md) || fallbackUiLang;
}

function fmtNum(n, lang) {
  return Number(n || 0).toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US');
}

function formatBytes(bytes, lang) {
  const b = Number(bytes || 0);
  const r = I18N[lang].reader;
  if (!b) return '';
  if (b < 1024) return r.bytes(fmtNum(b, lang));
  if (b < 1024 * 1024) {
    const val = (b / 1024).toFixed(1);
    return r.kb(lang === 'fa' ? val.replace('.', '٫') : val);
  }
  const val = (b / (1024 * 1024)).toFixed(1);
  return r.mb(lang === 'fa' ? val.replace('.', '٫') : val);
}

const MIME_MAP = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  bmp: 'image/bmp',
  avif: 'image/avif',
  ico: 'image/x-icon',
  tif: 'image/tiff',
  tiff: 'image/tiff',
  heic: 'image/heic',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  m4a: 'audio/mp4',
  aac: 'audio/aac',
  flac: 'audio/flac',
  opus: 'audio/opus',
  weba: 'audio/webm',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  ogv: 'video/ogg',
  m4v: 'video/x-m4v',
  mkv: 'video/x-matroska',
  pdf: 'application/pdf',
  txt: 'text/plain',
  md: 'text/markdown',
  json: 'application/json',
  zip: 'application/zip',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
};

const IMG_EXTS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'avif', 'ico', 'tif', 'tiff', 'heic']);
const AUDIO_EXTS = new Set(['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac', 'opus', 'weba']);
const VIDEO_EXTS = new Set(['mp4', 'webm', 'mov', 'ogv', 'm4v', 'mkv']);

/* =========================================================
   توابع کمکی عمومی و پردازش متن نورا
   ========================================================= */

const cleanTitle = s => String(s || '').replace(/\.(md|markdown|txt|html?)$/i, '').replace(/[\r\n]+/g, ' ').trim();
const safeFileName = s => cleanTitle(s).replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ').trim() || 'Nora-Document';
const esc = s => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function parseMultiList(raw) {
  const seen = new Set();
  const out = [];
  String(raw || '')
    .split(/[;؛،,|]+/)
    .map(x => x.trim())
    .filter(Boolean)
    .forEach(item => {
      if (!seen.has(item)) {
        seen.add(item);
        out.push(item);
      }
    });
  return out;
}

function stripFrontmatter(md) {
  const str = String(md || '').replace(/^\uFEFF/, '');
  return str.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, '');
}

function safeUrl(url) {
  const u = String(url || '').trim().replace(/^<|>$/g, '').trim();
  if (!u) return '';
  if (/^(javascript|vbscript|file):/i.test(u)) return '';
  if (/^data:/i.test(u)) {
    if (/^data:(image|audio|video|application\/pdf|application\/octet-stream|text\/plain)/i.test(u)) return u;
    return '';
  }
  if (/^(https?:\/\/|app:\/\/|capacitor:\/\/|mailto:|#|\/|\.\.?\/)/i.test(u)) return u;
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(u)) return u;
  return '';
}

function normPath(p) {
  let s = String(p || '').trim().replace(/^<|>$/g, '').trim();
  s = s.split('#')[0].split('?')[0];
  try { s = decodeURIComponent(s); } catch (e) {}
  return s.replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+/, '').trim().toLowerCase();
}

function decodeSafeName(rawTarget, fallback = 'Attachment') {
  const clean = String(rawTarget || '').trim().replace(/^<|>$/g, '').split('#')[0].split('?')[0];
  let dec = clean;
  try { dec = decodeURIComponent(clean); } catch (e) {}
  const segs = dec.replace(/\\/g, '/').split('/');
  return segs[segs.length - 1] || dec || fallback;
}

function decodeURIComponentSafe(s) {
  try { return decodeURIComponent(s); } catch (e) { return s; }
}

function getFileExt(target, mime = '') {
  const raw = String(target || '').trim().replace(/^<|>$/g, '').trim();
  const clean = normPath(raw);
  const m = clean.match(/\.([a-z0-9]{1,8})$/i);
  if (m) return m[1].toLowerCase();
  const qm = raw.match(/[?&](?:format|fm|ext|type)=([a-z0-9]{2,6})(?:&|#|$)/i);
  if (qm) return qm[1].toLowerCase();
  if (mime) {
    if (mime.startsWith('image/')) return mime.split('/')[1].split('+')[0].toLowerCase();
    if (mime.startsWith('audio/')) return 'mp3';
    if (mime.startsWith('video/')) return 'mp4';
    if (mime === 'application/pdf') return 'pdf';
  }
  return '';
}

function detectMediaKind(target, isStandardMdImg, attached) {
  const ext = getFileExt(target, attached ? attached.type : '');
  if (attached && attached.type) {
    if (attached.type.startsWith('image/')) return 'image';
    if (attached.type.startsWith('audio/')) return 'audio';
    if (attached.type.startsWith('video/')) return 'video';
    if (attached.type === 'application/pdf') return 'pdf';
  }
  if (/^data:image\//i.test(target)) return 'image';
  if (/^data:audio\//i.test(target)) return 'audio';
  if (/^data:video\//i.test(target)) return 'video';
  if (/^data:application\/pdf/i.test(target)) return 'pdf';
  if (IMG_EXTS.has(ext)) return 'image';
  if (AUDIO_EXTS.has(ext)) return 'audio';
  if (VIDEO_EXTS.has(ext)) return 'video';
  if (ext === 'pdf') return 'pdf';
  if (/^https?:\/\//i.test(target) && (/substackcdn\.com\/image\//i.test(target) || /images\.unsplash\.com\//i.test(target) || /lh3\.googleusercontent\.com\//i.test(target))) {
    return 'image';
  }
  if (ext) return 'file';
  if (isStandardMdImg && /^https?:\/\//i.test(target)) return 'image';
  return 'file';
}

function parseSizeHint(str) {
  const s = String(str || '').trim();
  const m = s.match(/^(\d{2,4})(?:x(\d{2,4}))?$/i);
  if (!m) return null;
  return { w: parseInt(m[1], 10), h: m[2] ? parseInt(m[2], 10) : null };
}

function parseEmbedParts(rawCaption, rawTarget, lang) {
  const parts = String(rawCaption || '').split('|').map(x => x.trim()).filter(Boolean);
  let size = null;
  if (parts.length) {
    const lastSize = parseSizeHint(parts[parts.length - 1]);
    if (lastSize) {
      size = lastSize;
      parts.pop();
    }
  }
  const caption = parts.join(' — ');
  const fallbackName = decodeSafeName(rawTarget, I18N[lang].reader.fallbackAttachment);
  return { caption, size, fallbackName };
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const sub = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, sub);
  }
  return btoa(binary);
}

function shortHash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h) ^ str.charCodeAt(i);
  return (h >>> 0).toString(36);
}

function calcStats(md) {
  const plain = String(md || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/\[\s*!\[[^\]]*\]\([^\r\n]+?\)\s*\]\([^\r\n]+?\)/g, ' ')
    .replace(/!\[\[[^\]]*\]\]/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/https?:\/\/\S+/gi, ' ')
    .replace(/[#>*_`|[\]()!-]+/g, ' ')
    .trim();
  const words = plain ? (plain.match(/\S+/g) || []).length : 0;
  const minutes = words ? Math.max(1, Math.ceil(words / 220)) : 0;
  return { words, minutes };
}

function buildMetaChipsHtml(meta, stats, lang) {
  const r = I18N[lang].reader;
  const chips = [];
  const authors = parseMultiList(meta.author);
  const categories = parseMultiList(meta.category);

  if (authors.length === 1) {
    chips.push(`<span class="meta-chip"><b>${esc(r.authorSingle)}</b> ${esc(authors[0])}</span>`);
  } else if (authors.length > 1) {
    chips.push(`<span class="meta-chip meta-group"><b>${esc(r.authorMulti)}</b> ${authors.map(a => `<span class="meta-tag">${esc(a)}</span>`).join('')}</span>`);
  }

  if (categories.length === 1) {
    chips.push(`<span class="meta-chip"><b>${esc(r.categorySingle)}</b> ${esc(categories[0])}</span>`);
  } else if (categories.length > 1) {
    chips.push(`<span class="meta-chip meta-group"><b>${esc(r.categoryMulti)}</b> ${categories.map(c => `<span class="meta-tag">${esc(c)}</span>`).join('')}</span>`);
  }

  if (meta.year) {
    chips.push(`<span class="meta-chip"><b>${esc(r.yearLabel)}</b> ${esc(meta.year)}</span>`);
  }

  if (stats.words > 0) {
    chips.push(`<span class="meta-chip stat">${esc(r.minRead(fmtNum(stats.minutes, lang)))}</span>`);
    chips.push(`<span class="meta-chip stat">${esc(r.wordCount(fmtNum(stats.words, lang)))}</span>`);
  } else {
    chips.push(`<span class="meta-chip stat">${esc(r.zeroWords)}</span>`);
  }
  return chips.join('');
}

/* =========================================================
   استخراج خودکار پیوست‌ها از Vault ابسیدین
   ========================================================= */

function collectLocalTargets(md) {
  const targets = new Set();
  const cleanMd = String(md || '').replace(/```[\s\S]*?```/g, '');
  const add = raw => {
    const t = String(raw || '').trim().replace(/^<|>$/g, '').trim();
    if (!t || /^(https?:\/\/|data:|mailto:|#)/i.test(t)) return;
    targets.add(t);
  };
  let m;
  const wikiRe = /!\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g;
  while ((m = wikiRe.exec(cleanMd))) add(m[1]);

  const mdImgRe = /!\[[^\]]*\]\((?:<([^>]+)>|([^)\r\n]+?)(?:\s+"[^"]*")?)\)/g;
  while ((m = mdImgRe.exec(cleanMd))) add(m[1] || m[2]);

  const mdLinkRe = /(?<!!)\[[^\]]+\]\((?:<([^>]+)>|([^)\r\n]+?)(?:\s+"[^"]*")?)\)/g;
  while ((m = mdLinkRe.exec(cleanMd))) add(m[1] || m[2]);

  return [...targets];
}

function resolveVaultFile(app, rawTarget, sourcePath) {
  const cleanTarget = decodeURIComponentSafe(String(rawTarget || '').trim().replace(/^<|>$/g, '').split('#')[0].split('?')[0]);
  if (!cleanTarget) return null;

  let tfile = app.metadataCache.getFirstLinkpathDest(cleanTarget, sourcePath || '');
  if (tfile instanceof TFile) return tfile;

  const direct = app.vault.getAbstractFileByPath(normalizePath(cleanTarget));
  if (direct instanceof TFile) return direct;

  const lowerClean = normPath(cleanTarget);
  const baseName = lowerClean.split('/').pop();
  const allFiles = app.vault.getFiles();
  return allFiles.find(f => normPath(f.path) === lowerClean)
    || allFiles.find(f => normPath(f.path).endsWith('/' + lowerClean))
    || allFiles.find(f => f.name.toLowerCase() === baseName)
    || null;
}

async function resolveAttachmentsMap(app, md, sourceFile, { forExport = true, embedAttachments = true } = {}) {
  const map = new Map();
  const targets = collectLocalTargets(md);
  const sourcePath = sourceFile ? sourceFile.path : '';

  for (const rawTarget of targets) {
    const tfile = resolveVaultFile(app, rawTarget, sourcePath);
    if (!tfile) continue;
    const ext = (tfile.extension || '').toLowerCase();
    const mime = MIME_MAP[ext] || 'application/octet-stream';
    const entry = {
      name: tfile.name,
      relPath: tfile.path,
      size: tfile.stat ? tfile.stat.size : 0,
      type: mime,
      resourceUrl: app.vault.getResourcePath(tfile),
      dataUrl: ''
    };
    if (forExport && embedAttachments) {
      try {
        const bin = await app.vault.readBinary(tfile);
        const b64 = arrayBufferToBase64(bin);
        entry.dataUrl = `data:${mime};base64,${b64}`;
      } catch (err) {
        console.warn('[Nora] Failed to embed attachment:', tfile.path, err);
      }
    }
    map.set(normPath(rawTarget), entry);
  }
  return map;
}

/* =========================================================
   موتور رندر Markdown نورا
   ========================================================= */

const URL_BODY = '(?:<([^>]+)>|((?:[^()\\r\\n]|\\([^()\\r\\n]*\\))+?)(?:\\s+"([^"]*)")?)';
const LINKED_IMG_STANDALONE_RE = new RegExp('^\\[\\s*!\\[([^\\]]*)\\]\\(' + URL_BODY + '\\)\\s*\\]\\(' + URL_BODY + '\\)$');
const LINKED_WIKI_STANDALONE_RE = new RegExp('^\\[\\s*!\\[\\[([^\\]|]+)(?:\\|([^\\]]*))?\\]\\]\\s*\\]\\(' + URL_BODY + '\\)$');
const MD_IMG_STANDALONE_RE = new RegExp('^!\\[([^\\]]*)\\]\\(' + URL_BODY + '\\)$');
const LINKED_IMG_INLINE_RE = new RegExp('\\[\\s*!\\[([^\\]]*)\\]\\(' + URL_BODY + '\\)\\s*\\]\\(' + URL_BODY + '\\)', 'g');
const LINKED_WIKI_INLINE_RE = new RegExp('\\[\\s*!\\[\\[([^\\]|]+)(?:\\|([^\\]]*))?\\]\\]\\s*\\]\\(' + URL_BODY + '\\)', 'g');
const MD_IMG_INLINE_RE = new RegExp('!\\[([^\\]]*)\\]\\(' + URL_BODY + '\\)', 'g');
const MD_LINK_INLINE_RE = new RegExp('\\[([^\\]]+)\\]\\(' + URL_BODY + '\\)', 'g');

function buildUrlForOutput(rawTarget, attached, forExport) {
  const hashPart = String(rawTarget || '').includes('#') ? '#' + String(rawTarget).split('#').slice(1).join('#') : '';
  if (attached) {
    const baseSrc = forExport ? (attached.dataUrl || '') : (attached.resourceUrl || '');
    if (baseSrc) {
      return baseSrc + (baseSrc.startsWith('data:') ? '' : hashPart);
    }
  }
  const safe = safeUrl(rawTarget);
  if (!safe) return '';
  if (/^(https?:\/\/|app:\/\/|capacitor:\/\/|data:|mailto:|#)/i.test(safe)) return safe;
  const [pathOnly, ...rest] = safe.split('#');
  const encodedPath = pathOnly.split('/').map(seg => encodeURIComponent(decodeURIComponentSafe(seg))).join('/');
  return encodedPath + (rest.length ? '#' + rest.join('#') : '');
}

function renderEmbedHtml(rawTarget, rawCaption, opts = {}) {
  const { block = false, isStandardMdImg = false, forExport = false, linkUrl = '', attachmentsMap = null, lang = 'fa' } = opts;
  const r = I18N[lang].reader;
  const attached = attachmentsMap ? (attachmentsMap.get(normPath(rawTarget)) || null) : null;
  const url = buildUrlForOutput(rawTarget, attached, forExport);
  const kind = detectMediaKind(rawTarget, isStandardMdImg, attached);
  const { caption, size, fallbackName } = parseEmbedParts(rawCaption, rawTarget, lang);
  const label = caption || fallbackName;
  const ext = (getFileExt(rawTarget, attached ? attached.type : '') || 'FILE').toUpperCase();
  const isRemote = /^https?:\/\//i.test(rawTarget);
  const isEmbeddedData = Boolean(attached && (forExport ? attached.dataUrl : attached.resourceUrl));
  const sizeText = attached && attached.size ? formatBytes(attached.size, lang) : '';
  const dimStyle = size
    ? ` style="width:${size.w}px;max-width:100%;${size.h ? `height:${size.h}px;object-fit:contain;` : ''}"`
    : '';
  const refAttr = isRemote ? ' referrerpolicy="no-referrer"' : '';
  const downloadAttr = isEmbeddedData
    ? ` download="${esc(attached.name)}"`
    : (isRemote ? ' target="_blank" rel="noopener noreferrer"' : ' download');

  if (kind === 'image') {
    if (!url) {
      return `<span class="md-img-missing">${r.imgUnavailable(esc(fallbackName))}</span>`;
    }
    const cleanLink = linkUrl ? safeUrl(linkUrl) : '';
    const linkIsImage = cleanLink && detectMediaKind(cleanLink, false, null) === 'image';
    const fullSrcAttr = linkIsImage ? ` data-full-src="${esc(cleanLink)}"` : '';
    const zoomClass = (!cleanLink || linkIsImage) ? ' class="md-zoomable"' : '';
    const imgTag = `<img${zoomClass} src="${esc(url)}" alt="${esc(label)}" loading="lazy"${refAttr}${dimStyle}${fullSrcAttr} data-fallback-name="${esc(fallbackName)}"${isRemote ? ` data-remote-url="${esc(url)}"` : ''}>`;
    const wrapped = (cleanLink && !linkIsImage)
      ? `<a class="md-img-link" href="${esc(cleanLink)}" target="_blank" rel="noopener noreferrer">${imgTag}</a>`
      : imgTag;
    if (block) {
      return `<figure class="md-figure">${wrapped}${caption ? `<figcaption>${esc(caption)}</figcaption>` : ''}</figure>`;
    }
    return wrapped;
  }

  if (!block) {
    if (kind === 'audio' && url) {
      return `<span class="md-inline-file">🎵 ${esc(label)} <audio controls preload="metadata" src="${esc(url)}" style="height:28px;max-width:200px;vertical-align:middle"></audio></span>`;
    }
    const hrefAttr = url ? ` href="${esc(url)}"${downloadAttr}` : '';
    const icon = kind === 'pdf' ? '📕' : kind === 'video' ? '🎬' : kind === 'audio' ? '🎵' : '📎';
    return `<a class="md-inline-file"${hrefAttr}>${icon} ${esc(label)} <small>${esc(ext)}</small></a>`;
  }

  if (kind === 'audio') {
    return `<div class="md-embed-card">
      <div class="md-embed-row">
        <div class="md-file-icon">${esc(ext)}</div>
        <div class="md-file-info">
          <span class="md-file-name">🎵 ${esc(label)}</span>
          <span class="md-file-sub">${esc(fallbackName)}${sizeText ? ' · ' + esc(sizeText) : ''}</span>
        </div>
        <div class="md-file-actions">
          ${url ? `<a class="md-file-btn" href="${esc(url)}"${downloadAttr}>${esc(r.btnDownload)}</a>` : ''}
        </div>
      </div>
      ${url ? `<div class="md-audio-wrap"><audio controls preload="metadata" src="${esc(url)}"></audio></div>` : ''}
    </div>`;
  }

  if (kind === 'video') {
    return `<div class="md-embed-card">
      <div class="md-embed-row">
        <div class="md-file-icon">${esc(ext)}</div>
        <div class="md-file-info">
          <span class="md-file-name">🎬 ${esc(label)}</span>
          <span class="md-file-sub">${esc(fallbackName)}${sizeText ? ' · ' + esc(sizeText) : ''}</span>
        </div>
        <div class="md-file-actions">
          ${url ? `<a class="md-file-btn" href="${esc(url)}"${downloadAttr}>${esc(r.btnDownload)}</a>` : ''}
        </div>
      </div>
      ${url ? `<div class="md-video-wrap"><video controls playsinline preload="metadata" src="${esc(url)}"${dimStyle}></video></div>` : ''}
    </div>`;
  }

  if (kind === 'pdf') {
    return `<div class="md-embed-card">
      <div class="md-embed-row">
        <div class="md-file-icon">PDF</div>
        <div class="md-file-info">
          <span class="md-file-name">📕 ${esc(label)}</span>
          <span class="md-file-sub">${esc(fallbackName)}${sizeText ? ' · ' + esc(sizeText) : ''}${!isRemote && !isEmbeddedData ? esc(r.pdfNotFound) : ''}</span>
        </div>
        <div class="md-file-actions">
          ${url ? `<a class="md-file-btn" href="${esc(url)}"${downloadAttr}>${esc(r.btnOpenDownload)}</a>` : ''}
        </div>
      </div>
      ${url ? `<details class="md-pdf-details"><summary>${esc(r.pdfPreviewSummary)}</summary><iframe class="md-pdf-frame" ${forExport ? `data-pdf-src="${esc(url)}"` : `src="${esc(url)}"`} title="${esc(label)}"></iframe></details>` : ''}
    </div>`;
  }

  return `<div class="md-embed-card">
    <div class="md-embed-row">
      <div class="md-file-icon">${esc(ext.slice(0, 5))}</div>
      <div class="md-file-info">
        <span class="md-file-name">📎 ${esc(label)}</span>
        <span class="md-file-sub">${esc(fallbackName)}${sizeText ? ' · ' + esc(sizeText) : ''}</span>
      </div>
      <div class="md-file-actions">
        ${url ? `<a class="md-file-btn" href="${esc(url)}"${downloadAttr}>${esc(r.btnGetFile)}</a>` : ''}
      </div>
    </div>
  </div>`;
}

function matchStandaloneEmbedLine(trimmedLine) {
  let m = trimmedLine.match(LINKED_IMG_STANDALONE_RE);
  if (m) {
    return { target: (m[2] || m[3] || '').trim(), caption: (m[1] || m[4] || '').trim(), linkUrl: (m[5] || m[6] || '').trim(), isStandardMdImg: true };
  }
  m = trimmedLine.match(LINKED_WIKI_STANDALONE_RE);
  if (m) {
    return { target: m[1].trim(), caption: (m[2] || '').trim(), linkUrl: (m[3] || m[4] || '').trim(), isStandardMdImg: false };
  }
  m = trimmedLine.match(/^!\[\[([^\]|]+)(?:\|([^\]]*))?\]\]$/);
  if (m) return { target: m[1].trim(), caption: (m[2] || '').trim(), linkUrl: '', isStandardMdImg: false };

  m = trimmedLine.match(MD_IMG_STANDALONE_RE);
  if (m) {
    return { target: (m[2] || m[3] || '').trim(), caption: (m[1] || m[4] || '').trim(), linkUrl: '', isStandardMdImg: true };
  }
  m = trimmedLine.match(/^<?(https?:\/\/[^\s<>]+)>?$/i);
  if (m) {
    const url = m[1].trim();
    const kind = detectMediaKind(url, false, null);
    if (kind === 'image' || kind === 'audio' || kind === 'video' || kind === 'pdf') {
      return { target: url, caption: '', linkUrl: '', isStandardMdImg: false };
    }
  }
  return null;
}

function trimBareUrlTrailing(rawUrl) {
  let u = rawUrl, trail = '';
  while (u.length) {
    const last = u[u.length - 1];
    if (/[.,،؛;!?»"'›]/.test(last)) {
      trail = last + trail; u = u.slice(0, -1); continue;
    }
    if (last === ')') {
      const opens = (u.match(/\(/g) || []).length, closes = (u.match(/\)/g) || []).length;
      if (closes > opens) { trail = last + trail; u = u.slice(0, -1); continue; }
    }
    if (last === ']') {
      const opens = (u.match(/\[/g) || []).length, closes = (u.match(/\]/g) || []).length;
      if (closes > opens) { trail = last + trail; u = u.slice(0, -1); continue; }
    }
    break;
  }
  return { url: u, trail };
}

function extractFootnoteDefinitions(bodyMd) {
  const lines = String(bodyMd || '').replace(/\r/g, '').split('\n');
  const defs = new Map();
  const kept = [];
  let inCode = false;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    if (/^```/.test(trimmed)) {
      inCode = !inCode;
      kept.push(line);
      i++;
      continue;
    }
    if (!inCode) {
      const m = line.match(/^\[\^([^\]]+)\]:\s*(.*)$/);
      if (m) {
        const key = m[1].trim();
        const buf = [m[2].trim()];
        i++;
        while (i < lines.length) {
          const next = lines[i];
          if (/^(?: {2,}|\t)/.test(next)) {
            buf.push(next.replace(/^(?: {2,4}|\t)/, ''));
            i++;
          } else if (!next.trim() && i + 1 < lines.length && /^(?: {2,}|\t)/.test(lines[i + 1])) {
            buf.push('');
            i++;
          } else {
            break;
          }
        }
        defs.set(key, buf.join('\n').trim());
        continue;
      }
    }
    kept.push(line);
    i++;
  }

  return { cleanLines: kept, fnDefs: defs };
}

function registerFootnote(fnState, key, rawContent, lang) {
  let item = null;
  if (key && fnState.byKey.has(key)) {
    item = fnState.byKey.get(key);
  } else {
    const num = fnState.list.length + 1;
    item = { num, key: key || null, rawContent: String(rawContent || '').trim(), refIds: [], html: '' };
    fnState.list.push(item);
    if (key) fnState.byKey.set(key, item);
  }
  const refUid = `${item.num}-${item.refIds.length + 1}`;
  item.refIds.push(refUid);
  const label = fmtNum(item.num, lang);
  const aria = `${I18N[lang].reader.footnoteLabel} ${label}`;
  return `<sup class="fn-ref" id="fnref-${refUid}"><a href="#fn-${item.num}" class="fn-link" data-fn-num="${item.num}" data-fn-ref="fnref-${refUid}" role="button" aria-label="${esc(aria)}">${esc(label)}</a></sup>`;
}

function renderInline(s, opts = {}) {
  const { forExport = false, attachmentsMap = null, lang = 'fa', fnState = null, fnDefs = null, inFootnote = false } = opts;
  const slots = [];
  const stash = html => {
    const key = `\u0000SLOT${slots.length}\u0000`;
    slots.push(html);
    return key;
  };
  let out = String(s || '');

  out = out.replace(/`([^`]+)`/g, (_, c) => stash(`<code>${esc(c)}</code>`));

  out = out.replace(LINKED_IMG_INLINE_RE, (_, alt, i1, i2, iTitle, l1, l2) => {
    const target = (i1 || i2 || '').trim();
    const cap = (alt || iTitle || '').trim();
    const linkUrl = (l1 || l2 || '').trim();
    return stash(renderEmbedHtml(target, cap, { block: false, isStandardMdImg: true, forExport, linkUrl, attachmentsMap, lang }));
  });

  out = out.replace(LINKED_WIKI_INLINE_RE, (_, target, cap, l1, l2) => {
    const linkUrl = (l1 || l2 || '').trim();
    return stash(renderEmbedHtml(target.trim(), (cap || '').trim(), { block: false, isStandardMdImg: false, forExport, linkUrl, attachmentsMap, lang }));
  });

  out = out.replace(/!\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g, (_, target, cap) => {
    return stash(renderEmbedHtml(target.trim(), (cap || '').trim(), { block: false, isStandardMdImg: false, forExport, attachmentsMap, lang }));
  });

  // پاورقی‌های درون‌خطی ابسیدین: ^[متن پاورقی]
  if (fnState && !inFootnote) {
    out = out.replace(/\^\[((?:[^\[\]]|\[[^\]]*\])+)\]/g, (_, content) => {
      return stash(registerFootnote(fnState, null, content, lang));
    });
  }

  // پاورقی‌های مرجعی ابسیدین/مارک‌داون: [^1] یا [^note]
  if (fnState && fnDefs && !inFootnote) {
    out = out.replace(/\[\^([^\]]+)\]/g, (full, rawKey) => {
      const key = rawKey.trim();
      if (!fnDefs.has(key)) return full;
      return stash(registerFootnote(fnState, key, fnDefs.get(key), lang));
    });
  }

  out = out.replace(/(?<!!)\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, target, alias) => {
    const display = (alias || target.split('#')[0] || target).trim();
    return stash(`<span class="md-wikilink">${esc(display)}</span>`);
  });

  out = out.replace(MD_IMG_INLINE_RE, (_, alt, u1, u2, title) => {
    const target = (u1 || u2 || '').trim();
    const cap = (alt || title || '').trim();
    return stash(renderEmbedHtml(target, cap, { block: false, isStandardMdImg: true, forExport, attachmentsMap, lang }));
  });

  out = out.replace(MD_LINK_INLINE_RE, (_, label, u1, u2) => {
    const rawTarget = (u1 || u2 || '').trim();
    const attached = attachmentsMap ? (attachmentsMap.get(normPath(rawTarget)) || null) : null;
    const clean = buildUrlForOutput(rawTarget, attached, forExport);
    if (!clean) return esc(label);
    const isExt = /^https?:\/\//i.test(clean);
    const attrs = attached
      ? ` download="${esc(attached.name)}"`
      : (isExt ? ' target="_blank" rel="noopener noreferrer"' : '');
    return stash(`<a href="${esc(clean)}"${attrs}>${esc(label)}</a>`);
  });

  out = out.replace(/<(https?:\/\/[^\s<>]+)>/gi, (_, rawUrl) => {
    const kind = detectMediaKind(rawUrl, false, null);
    if (kind === 'image' || kind === 'audio' || kind === 'video' || kind === 'pdf') {
      return stash(renderEmbedHtml(rawUrl, '', { block: false, isStandardMdImg: false, forExport, attachmentsMap, lang }));
    }
    return stash(`<a href="${esc(rawUrl)}" target="_blank" rel="noopener noreferrer">${esc(rawUrl)}</a>`);
  });

  out = out.replace(/https?:\/\/[^\s<>\u0000]+/gi, match => {
    const { url, trail } = trimBareUrlTrailing(match);
    const clean = safeUrl(url);
    if (!clean) return match;
    const kind = detectMediaKind(clean, false, null);
    if (kind === 'image' || kind === 'audio' || kind === 'video' || kind === 'pdf') {
      return stash(renderEmbedHtml(clean, '', { block: false, isStandardMdImg: false, forExport, attachmentsMap, lang })) + trail;
    }
    return stash(`<a href="${esc(clean)}" target="_blank" rel="noopener noreferrer">${esc(clean)}</a>`) + trail;
  });

  out = esc(out);

  out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/__(.+?)__/g, '<strong>$1</strong>');
  out = out.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
  out = out.replace(/~~(.+?)~~/g, '<del>$1</del>');
  out = out.replace(/==(.+?)==/g, '<mark class="hl-yellow">$1</mark>');

  let guard = 0;
  while (/\u0000SLOT\d+\u0000/.test(out) && guard++ < 10) {
    out = out.replace(/\u0000SLOT(\d+)\u0000/g, (_, idx) => slots[+idx]);
  }
  return out;
}

function renderMarkdown(md, opts = {}) {
  const { forExport = false, attachmentsMap = null, lang = 'fa' } = opts;
  const r = I18N[lang].reader;
  const bodyMd = stripFrontmatter(md);
  const { cleanLines: lines, fnDefs } = extractFootnoteDefinitions(bodyMd);
  const fnState = { list: [], byKey: new Map() };
  const inlineOpts = { forExport, attachmentsMap, lang, fnState, fnDefs, inFootnote: false };

  let html = '', i = 0, headings = [];
  const isHr = s => /^(---+|\*\*\*+|___+)$/.test(s);
  const isTable = n => n + 1 < lines.length && lines[n].includes('|') && /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[n + 1]) && lines[n + 1].includes('-');

  while (i < lines.length) {
    let l = lines[i], t = l.trim();
    if (!t) { i++; continue; }

    if (/^```/.test(t)) {
      let langCode = t.slice(3).trim(), code = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i].trim())) code.push(lines[i++]);
      if (i < lines.length) i++;
      html += `<pre><code class="language-${esc(langCode)}">${esc(code.join('\n'))}</code></pre>`;
      continue;
    }

    if (/^#{1,6}\s/.test(t)) {
      let m = t.match(/^(#{1,6})\s+(.*)$/), level = m[1].length, text = m[2].replace(/\s+#+\s*$/, '');
      const isNoraChapter = text.startsWith('NORA_CHAPTER_START::');
      if (isNoraChapter) text = text.slice('NORA_CHAPTER_START::'.length).trim();
      let id = 'section-' + headings.length;
      text = text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/__(.*?)__/g, '$1');
      headings.push({ level, text, id });
      html += `<h${level} id="${id}"${isNoraChapter ? ' data-nora-chapter="true"' : ''}>${renderInline(text, inlineOpts)}</h${level}>`;
      i++;
      continue;
    }

    if (isHr(t)) { html += '<hr>'; i++; continue; }

    const standalone = matchStandaloneEmbedLine(t);
    if (standalone) {
      html += renderEmbedHtml(standalone.target, standalone.caption, {
        block: true,
        isStandardMdImg: standalone.isStandardMdImg,
        linkUrl: standalone.linkUrl || '',
        forExport,
        attachmentsMap,
        lang
      });
      i++;
      continue;
    }

    if (/^>\s?/.test(t)) {
      let q = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) q.push(lines[i++].replace(/^\s*>\s?/, ''));
      html += `<blockquote>${q.map(x => `<p>${renderInline(x, inlineOpts)}</p>`).join('')}</blockquote>`;
      continue;
    }

    if (isTable(i)) {
      let rows = [];
      while (i < lines.length && lines[i].includes('|')) {
        let rawLine = lines[i].trim();
        let cells = rawLine.replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map(x => x.replace(/\\\|/g, '|').trim());
        if (!/^\|?[\s:|-]+\|?$/.test(rawLine)) rows.push(cells);
        i++;
      }
      if (rows.length) {
        html += '<table><thead><tr>' + rows[0].map(x => `<th>${renderInline(x, inlineOpts)}</th>`).join('') + '</tr></thead><tbody>' +
          rows.slice(1).map(row => '<tr>' + rows[0].map((_, j) => `<td>${renderInline(row[j] || '', inlineOpts)}</td>`).join('') + '</tr>').join('') +
          '</tbody></table>';
      }
      continue;
    }

    if (/^(\s*)([-*+]|\d+\.)\s+/.test(l)) {
      let ordered = /^\s*\d+\./.test(l), tag = ordered ? 'ol' : 'ul', items = [];
      const matchSame = line => ordered ? /^\s*\d+\.\s+/.test(line) : /^\s*[-*+]\s+/.test(line);
      while (i < lines.length && matchSame(lines[i])) {
        let item = lines[i++].replace(/^(\s*)([-*+]|\d+\.)\s+/, '');
        let task = item.match(/^\[([ xX])\]\s*(.*)$/);
        items.push(`<li>${task ? `<input type="checkbox" disabled ${task[1].toLowerCase() === 'x' ? 'checked' : ''}>${renderInline(task[2], inlineOpts)}` : renderInline(item, inlineOpts)}</li>`);
      }
      html += `<${tag}>${items.join('')}</${tag}>`;
      continue;
    }

    let para = [t];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^```|^#{1,6}\s|^>\s?|^(\s*)([-*+]|\d+\.)\s+/.test(lines[i].trim()) &&
      !isHr(lines[i].trim()) &&
      !matchStandaloneEmbedLine(lines[i].trim()) &&
      !isTable(i)
    ) {
      para.push(lines[i].trim());
      i++;
    }
    html += `<p>${para.map(line => renderInline(line, inlineOpts)).join('<br>')}</p>`;
  }

  if (headings.length > 1) {
    let toc = `<nav class="toc"><div class="toc-title">${esc(r.tocTitleInline)}</div>`;
    headings.forEach((h, index) => {
      if (h.level <= 3 && !(index === 0 && h.level === 1)) {
        toc += `<a class="${h.level === 3 ? 'level3' : ''}" href="#${h.id}">${renderInline(h.text, { ...inlineOpts, inFootnote: true })}</a>`;
      }
    });
    toc += '</nav>';
    html = toc + html;
  }

  const footnotes = fnState.list.map(item => ({
    num: item.num,
    label: fmtNum(item.num, lang),
    firstRefId: 'fnref-' + (item.refIds[0] || (item.num + '-1')),
    html: item.rawContent
      .split(/\n{2,}/)
      .map(block => block.split('\n').map(ln => renderInline(ln, { forExport, attachmentsMap, lang, inFootnote: true })).join('<br>'))
      .join('<br>')
  }));

  return {
    html: html || `<div class="empty"><div class="big">📖</div>${esc(r.emptyText)}</div>`,
    footnotes
  };
}

/* =========================================================
   تولید سند کامل و مستقل HTML (خوانشگر نورا — دوزبانه)
   ========================================================= */

function buildStandaloneHtml(mdText, options, attachmentsMap) {
  const lang = resolveReaderLang(options.readerLanguage, mdText, options.uiLang || 'fa');
  const t = I18N[lang];
  const r = t.reader;
  const dark = options.theme === 'dark';
  const initPalette = options.palette || 'default';
  const initCover = options.coverStyle || 'aurora';
  const dir = options.direction === 'auto' ? t.dir : (options.direction || t.dir);
  const size = parseInt(options.fontSize, 10) || 16;
  const initWidth = options.width || '850';
  const splitMarkedChaptersOnly = options.splitMarkedChaptersOnly === true;
  const maxW = initWidth === '100%' ? '100%' : initWidth + 'px';
  const bodyMd = stripFrontmatter(mdText);
  const rendered = renderMarkdown(mdText, { forExport: options.forExport !== false, attachmentsMap, lang });
  const content = rendered.html;
  const footnotes = rendered.footnotes;
  const title = cleanTitle(options.title) || (bodyMd.match(/^#\s+(.+)$/m) || [])[1] || r.defaultTitle;
  const meta = {
    docType: (options.docType || '').trim() || r.defaultDocType,
    author: (options.author || '').trim(),
    subtitle: (options.subtitle || '').trim(),
    category: (options.category || '').trim(),
    year: (options.year || '').trim(),
    description: (options.description || '').trim()
  };
  const stats = calcStats(bodyMd);
  const safeTitle = esc(title);
  const safeDocType = esc(meta.docType);
  const metaHtml = buildMetaChipsHtml(meta, stats, lang);
  const bookUid = shortHash(title + '::' + bodyMd.slice(0, 500));

  const paletteSwatches = {
    default: ['#5849c7', '#15948f'],
    ocean: ['#156fa3', '#129a95'],
    forest: ['#227a56', '#a47f2f'],
    sunset: ['#c2513d', '#c78328'],
    royal: ['#393c97', '#be8534'],
    plum: ['#8a3fa8', '#c9507f'],
    mono: ['#454f5e', '#8a7248']
  };

  const paletteChipsHtml = t.palettes.map(([v, label]) => {
    const [c1, c2] = paletteSwatches[v] || ['#5849c7', '#15948f'];
    return `<button type="button" class="swatch-btn" data-palette-val="${esc(v)}" title="${esc(label)}"><span class="swatch-dot" style="background:linear-gradient(135deg,${c1},${c2})"></span><span class="swatch-label">${esc(label)}</span></button>`;
  }).join('');

  const coverChipsHtml = t.covers.map(([v, label]) =>
    `<button type="button" class="pill-btn" data-cover-val="${esc(v)}">${esc(label)}</button>`
  ).join('');

  const hlSwatches = {
    yellow: '#ffe066',
    green: '#8ce99a',
    blue: '#74c0fc',
    pink: '#faa2c1',
    purple: '#d0bfff'
  };
  const hlDotsHtml = r.hlColors.map(([v, label]) =>
    `<button type="button" class="hl-dot" data-hl-val="${esc(v)}" title="${esc(label)}" aria-label="${esc(label)}" style="--dot:${hlSwatches[v] || '#ffe066'}"></button>`
  ).join('');

  const readerStrings = {
    locale: lang === 'fa' ? 'fa-IR' : 'en-US',
    startReading: r.startReading,
    tocCoverSuffix: r.tocCoverSuffix,
    footerBrand: r.footerBrand,
    sectionWord: lang === 'fa' ? 'بخش' : 'Section',
    ofWord: lang === 'fa' ? 'از' : 'of',
    imgRemoteFail: r.imgRemoteFail,
    imgRemoteOpen: r.imgRemoteOpen,
    imgLocalFailPre: lang === 'fa' ? '🖼 تصویر «' : '🖼 Image "',
    imgLocalFailPost: lang === 'fa' ? '» در دسترس نیست.' : '" is unavailable.',
    markBtn: r.markBtn,
    markRemoveBtn: r.markRemoveBtn,
    coverPage: r.coverPage,
    prevSection: r.prevSection,
    nextSection: r.nextSection,
    noBookmarks: r.noBookmarks,
    bookmarksLabel: r.bookmarksLabel,
    clearAllMarks: r.clearAllMarks,
    clearAllConfirm: r.clearAllConfirm,
    delMarkTitle: r.delMarkTitle,
    alertBookmarkSection: r.alertBookmarkSection,
    alertAnnotateSection: r.alertAnnotateSection,
    alertSelectText: r.alertSelectText,
    alertSameSection: r.alertSameSection,
    alertInvalidSelection: r.alertInvalidSelection,
    promptNote: r.promptNote,
    titleNoteMark: r.titleNoteMark,
    titleHlMark: r.titleHlMark,
    alertNotePrefix: r.alertNotePrefix,
    confirmDeleteNote: r.confirmDeleteNote,
    confirmDeleteHl: r.confirmDeleteHl,
    searchNotFound: r.searchNotFound,
    searchMatchWord: lang === 'fa' ? 'نتیجه' : 'Match',
    searchFoundIn: lang === 'fa' ? '— در بخش' : '— found in section',
    searchFoundEnd: lang === 'fa' ? 'پیدا شد' : '',
    footnotesHeading: r.footnotesHeading,
    footnoteLabel: r.footnoteLabel,
    footnoteGoTo: r.footnoteGoTo,
    footnoteBack: r.footnoteBack,
    footnoteClose: r.footnoteClose
  };

  const fontFamily = lang === 'fa'
    ? "'Vazirmatn','IRANSans','Segoe UI',Tahoma,system-ui,-apple-system,sans-serif"
    : "'Inter','Segoe UI',system-ui,-apple-system,'Vazirmatn',sans-serif";

  const drawerOffTransform = dir === 'ltr' ? '-105%' : '105%';
  const settingsOffTransform = dir === 'ltr' ? '105%' : '-105%';

  const css = `
:root{
  --reader-font:${size}px;
  --reader-lh:2.05;
  --reader-maxw:${maxW};
  --reader-family:${fontFamily};
}
body,
body[data-palette="default"]{
  --bg:#f3f5fb;--paper:#ffffff;--ink:#22253a;--muted:#636b84;--line:#e6e8f2;
  --accent:#5849c7;--accent2:#15948f;
  --chip-bg:rgba(255,255,255,.88);--chip-border:rgba(88,73,199,.22);
  --stat-bg:rgba(21,148,143,.09);--stat-border:rgba(21,148,143,.25);--stat-ink:#126e6a;
  --quote-bg:#f4f2ff;--code-bg:#f1effa;--code-ink:#9a4383;
}
body[data-palette="ocean"]{
  --bg:#eef5fa;--paper:#ffffff;--ink:#182a3a;--muted:#566e84;--line:#dae7f2;
  --accent:#156fa3;--accent2:#129a95;
  --chip-border:rgba(21,111,163,.24);
  --stat-bg:rgba(18,154,149,.1);--stat-border:rgba(18,154,149,.26);--stat-ink:#0f6f6b;
  --quote-bg:#eef7fd;--code-bg:#ebf4fb;--code-ink:#0e5f8c;
}
body[data-palette="forest"]{
  --bg:#f1f7f2;--paper:#ffffff;--ink:#1c2d23;--muted:#5a6f62;--line:#dbe9df;
  --accent:#227a56;--accent2:#a47f2f;
  --chip-border:rgba(34,122,86,.24);
  --stat-bg:rgba(34,122,86,.09);--stat-border:rgba(34,122,86,.26);--stat-ink:#1b6346;
  --quote-bg:#eff8f3;--code-bg:#ecf5ef;--code-ink:#1e6a4a;
}
body[data-palette="sunset"]{
  --bg:#fbf4ef;--paper:#fffdfb;--ink:#30221d;--muted:#7b6359;--line:#efe0d6;
  --accent:#c2513d;--accent2:#c78328;
  --chip-border:rgba(194,81,61,.24);
  --stat-bg:rgba(199,131,40,.1);--stat-border:rgba(199,131,40,.28);--stat-ink:#915b14;
  --quote-bg:#fdf2ec;--code-bg:#faeee8;--code-ink:#a8412f;
}
body[data-palette="royal"]{
  --bg:#f2f4fa;--paper:#ffffff;--ink:#1e2340;--muted:#5d6585;--line:#dfe4f2;
  --accent:#393c97;--accent2:#be8534;
  --chip-border:rgba(57,60,151,.24);
  --stat-bg:rgba(190,133,52,.1);--stat-border:rgba(190,133,52,.28);--stat-ink:#8a5d1c;
  --quote-bg:#f2f3fc;--code-bg:#eff0fa;--code-ink:#323587;
}
body[data-palette="plum"]{
  --bg:#f9f3fa;--paper:#ffffff;--ink:#2d1f33;--muted:#735e7c;--line:#ece0f0;
  --accent:#8a3fa8;--accent2:#c9507f;
  --chip-border:rgba(138,63,168,.24);
  --stat-bg:rgba(201,80,127,.09);--stat-border:rgba(201,80,127,.26);--stat-ink:#9b355d;
  --quote-bg:#f8f0fb;--code-bg:#f5ebf9;--code-ink:#7a3496;
}
body[data-palette="mono"]{
  --bg:#f5f3ee;--paper:#fcfbf8;--ink:#262522;--muted:#6d6a62;--line:#e6e2d8;
  --accent:#454f5e;--accent2:#8a7248;
  --chip-border:rgba(69,79,94,.22);
  --stat-bg:rgba(138,114,72,.1);--stat-border:rgba(138,114,72,.26);--stat-ink:#695532;
  --quote-bg:#f5f2eb;--code-bg:#f1eee6;--code-ink:#4e4a41;
}
body.night,
body.night[data-palette="default"]{
  --bg:#0f1220;--paper:#181c2e;--ink:#eaecf8;--muted:#a6aec8;--line:#2c324d;
  --accent:#b5abff;--accent2:#5ed9cf;
  --chip-bg:rgba(255,255,255,.07);--chip-border:rgba(181,171,255,.26);
  --stat-bg:rgba(94,217,207,.13);--stat-border:rgba(94,217,207,.30);--stat-ink:#8eeae2;
  --quote-bg:#21253d;--code-bg:#252942;--code-ink:#f2b6e1;
}
body.night[data-palette="ocean"]{
  --bg:#0b1520;--paper:#122030;--ink:#e6f1fb;--muted:#96b0c8;--line:#233a52;
  --accent:#6ec6ff;--accent2:#52dfd4;
  --chip-border:rgba(110,198,255,.28);
  --stat-bg:rgba(82,223,212,.13);--stat-border:rgba(82,223,212,.30);--stat-ink:#89ece4;
  --quote-bg:#182b40;--code-bg:#1b3047;--code-ink:#9cd8ff;
}
body.night[data-palette="forest"]{
  --bg:#0d1712;--paper:#15221b;--ink:#e8f3ec;--muted:#9cb6a6;--line:#273e32;
  --accent:#6ce0a8;--accent2:#e6c26e;
  --chip-border:rgba(108,224,168,.28);
  --stat-bg:rgba(108,224,168,.13);--stat-border:rgba(108,224,168,.30);--stat-ink:#93ecc0;
  --quote-bg:#1b2e24;--code-bg:#1f3328;--code-ink:#9be8c2;
}
body.night[data-palette="sunset"]{
  --bg:#19110f;--paper:#241916;--ink:#f7ece7;--muted:#c6aaa0;--line:#402e29;
  --accent:#ff9b87;--accent2:#f5c16c;
  --chip-border:rgba(255,155,135,.28);
  --stat-bg:rgba(245,193,108,.13);--stat-border:rgba(245,193,108,.30);--stat-ink:#fad391;
  --quote-bg:#2f211d;--code-bg:#352520;--code-ink:#ffb8a8;
}
body.night[data-palette="royal"]{
  --bg:#0e1022;--paper:#161932;--ink:#edeffb;--muted:#a5acce;--line:#2c3159;
  --accent:#98a8ff;--accent2:#e8be74;
  --chip-border:rgba(152,168,255,.28);
  --stat-bg:rgba(232,190,116,.13);--stat-border:rgba(232,190,116,.30);--stat-ink:#f2d193;
  --quote-bg:#1e2242;--code-bg:#23284c;--code-ink:#b9c4ff;
}
body.night[data-palette="plum"]{
  --bg:#16101c;--paper:#221829;--ink:#f4eaf9;--muted:#bca5c9;--line:#3d2d4a;
  --accent:#da9eff;--accent2:#f68fb7;
  --chip-border:rgba(218,158,255,.28);
  --stat-bg:rgba(246,143,183,.13);--stat-border:rgba(246,143,183,.30);--stat-ink:#fab3ce;
  --quote-bg:#2d2037;--code-bg:#33243f;--code-ink:#e8bfff;
}
body.night[data-palette="mono"]{
  --bg:#121315;--paper:#1b1c20;--ink:#eaebef;--muted:#a0a4b0;--line:#30333c;
  --accent:#cfd5e2;--accent2:#dcbf89;
  --chip-border:rgba(207,213,226,.24);
  --stat-bg:rgba(220,191,137,.13);--stat-border:rgba(220,191,137,.30);--stat-ink:#ead3a6;
  --quote-bg:#23252b;--code-bg:#282a31;--code-ink:#dce0ea;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;padding:16px;background:var(--bg);color:var(--ink);font-family:var(--reader-family);transition:background .22s ease,color .22s ease}
button,input,select{font-family:inherit}
.progress{height:3px;position:fixed;z-index:35;top:0;left:0;width:100%;background:transparent}
.progress span{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--accent),var(--accent2));transition:width .15s}

/* ===== نوار بالای مینیمال و شیشه‌ای ===== */
.readerbar{
  position:sticky;top:10px;z-index:25;max-width:var(--reader-maxw);margin:0 auto 14px;padding:8px 12px;
  background:var(--paper);background:color-mix(in srgb,var(--paper) 88%,transparent);
  backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
  border:1px solid var(--line);border-radius:16px;
  display:flex;gap:8px;align-items:center;justify-content:space-between;
  box-shadow:0 8px 26px rgba(15,20,45,.07);
  transition:max-width .22s ease;
}
body.night .readerbar{box-shadow:0 10px 30px rgba(0,0,0,.35)}
.bar-start,.bar-end{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.bar-center{flex:1;display:flex;justify-content:center;min-width:120px;max-width:260px}
.brand{
  font-weight:900;color:var(--accent);font-size:13.5px;cursor:pointer;
  background:none;border:0;padding:5px 6px;border-radius:9px;white-space:nowrap;
  transition:background .15s;
}
.brand:hover{background:var(--quote-bg)}
.search-wrap{position:relative;width:100%}
.search-wrap input{
  width:100%;font-size:12px;border:1px solid var(--line);
  background:color-mix(in srgb,var(--bg) 72%,var(--paper));color:var(--ink);
  border-radius:999px;padding:6.5px 12px;outline:none;transition:border-color .15s,background .15s;
}
.search-wrap input:focus{border-color:var(--accent);background:var(--paper)}
.bar-btn{
  display:inline-flex;align-items:center;gap:5px;
  font-size:12px;font-weight:600;border:1px solid var(--line);
  background:var(--paper);color:var(--ink);border-radius:10px;padding:6.5px 10px;
  cursor:pointer;white-space:nowrap;transition:border-color .15s,background .15s,color .15s;
}
.bar-btn:hover{border-color:var(--accent);color:var(--accent)}
.bar-btn.is-active{background:var(--stat-bg);border-color:var(--accent2);color:var(--accent2);font-weight:700}
.bar-btn.icon-only{padding:6.5px 9px}
.bar-btn.settings-trigger{
  background:color-mix(in srgb,var(--accent) 10%,var(--paper));
  border-color:color-mix(in srgb,var(--accent) 26%,var(--line));
  color:var(--accent);font-weight:700;
}
.bar-btn.settings-trigger:hover{background:color-mix(in srgb,var(--accent) 16%,var(--paper))}
.hl-indicator{width:9px;height:9px;border-radius:50%;display:inline-block;border:1px solid rgba(0,0,0,.18)}

.search-status{display:block;max-width:var(--reader-maxw);margin:0 auto 10px;font-size:12px;color:var(--muted);padding:0 6px}
.search-status:empty{display:none}

/* ===== پنل کشویی تنظیمات (Settings Drawer) ===== */
.settings-shade{position:fixed;inset:0;background:rgba(10,14,30,.46);z-index:44;opacity:0;visibility:hidden;transition:.2s;backdrop-filter:blur(3px)}
.settings-shade.open{opacity:1;visibility:visible}
.settings-drawer{
  position:fixed;z-index:45;top:0;inset-inline-end:0;height:100dvh;width:min(360px,92vw);
  background:var(--paper);color:var(--ink);border-inline-start:1px solid var(--line);
  box-shadow:0 0 40px rgba(10,14,30,.24);
  transform:translateX(${settingsOffTransform});transition:transform .26s cubic-bezier(.22,1,.36,1);
  display:flex;flex-direction:column;
}
.settings-drawer.open{transform:translateX(0)}
.settings-head{
  display:flex;justify-content:space-between;align-items:center;
  padding:16px 18px;border-bottom:1px solid var(--line);
}
.settings-head strong{font-size:14.5px;font-weight:800;color:var(--ink);display:flex;align-items:center;gap:7px}
.settings-close{
  border:1px solid var(--line);background:var(--bg);color:var(--ink);
  border-radius:9px;font-size:20px;width:32px;height:32px;display:grid;place-items:center;cursor:pointer;line-height:1;
}
.settings-close:hover{border-color:var(--accent);color:var(--accent)}
.settings-body{flex:1;overflow:auto;padding:16px 18px;display:flex;flex-direction:column;gap:16px}
.set-group{display:flex;flex-direction:column;gap:8px}
.set-label{font-size:12px;font-weight:700;color:var(--muted);display:flex;justify-content:space-between;align-items:center}
.set-val{font-size:11.5px;font-weight:700;color:var(--accent);font-family:ui-monospace,SFMono-Regular,Consolas,monospace}

.seg-control{
  display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:4px;
  padding:4px;border-radius:11px;background:var(--bg);border:1px solid var(--line);
}
.seg-btn{
  border:0;background:transparent;color:var(--muted);font-size:12px;font-weight:700;
  padding:7px 8px;border-radius:8px;cursor:pointer;transition:background .15s,color .15s,box-shadow .15s;
}
.seg-btn:hover{color:var(--ink)}
.seg-btn.active{background:var(--paper);color:var(--accent);box-shadow:0 2px 8px rgba(15,20,45,.08)}
body.night .seg-btn.active{box-shadow:0 2px 8px rgba(0,0,0,.32)}

.font-stepper{
  display:flex;align-items:center;gap:8px;padding:4px;border-radius:11px;
  background:var(--bg);border:1px solid var(--line);
}
.font-stepper button{
  flex:1;border:0;background:var(--paper);color:var(--ink);font-size:13px;font-weight:800;
  padding:7px 10px;border-radius:8px;cursor:pointer;transition:color .15s,background .15s;
}
.font-stepper button:hover{color:var(--accent)}
.font-stepper span{min-width:52px;text-align:center;font-size:12.5px;font-weight:800;color:var(--accent)}

.set-select{
  width:100%;padding:8px 11px;border-radius:10px;border:1px solid var(--line);
  background:var(--bg);color:var(--ink);font-size:12.5px;font-weight:600;outline:none;cursor:pointer;
}
.set-select:focus{border-color:var(--accent)}

.swatch-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
.swatch-btn{
  display:flex;align-items:center;gap:8px;padding:7px 9px;border-radius:10px;
  border:1px solid var(--line);background:var(--bg);color:var(--ink);
  font-size:11.5px;font-weight:600;cursor:pointer;text-align:start;transition:border-color .15s,background .15s;
}
.swatch-btn:hover{border-color:var(--accent)}
.swatch-btn.active{border-color:var(--accent);background:var(--quote-bg);color:var(--accent);font-weight:700}
.swatch-dot{width:18px;height:18px;border-radius:50%;flex:0 0 18px;box-shadow:0 2px 6px rgba(0,0,0,.15)}
.swatch-label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

.pill-grid{display:flex;flex-wrap:wrap;gap:6px}
.pill-btn{
  padding:6px 11px;border-radius:999px;border:1px solid var(--line);
  background:var(--bg);color:var(--ink);font-size:11.5px;font-weight:600;cursor:pointer;
  transition:border-color .15s,background .15s,color .15s;
}
.pill-btn:hover{border-color:var(--accent)}
.pill-btn.active{background:var(--accent);border-color:var(--accent);color:#fff;font-weight:700}
body.night .pill-btn.active{color:#121524}

.hl-dots{display:flex;align-items:center;gap:10px;padding:4px 2px}
.hl-dot{
  width:28px;height:28px;border-radius:50%;border:2px solid transparent;
  background:var(--dot);cursor:pointer;transition:transform .15s,box-shadow .15s;
  box-shadow:inset 0 0 0 1px rgba(0,0,0,.12);
}
.hl-dot:hover{transform:scale(1.1)}
.hl-dot.active{border-color:var(--ink);transform:scale(1.12);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 25%,transparent)}

.settings-foot{
  padding:14px 18px;border-top:1px solid var(--line);
  display:flex;gap:8px;flex-wrap:wrap;
}
.settings-foot button{
  flex:1;padding:9px 12px;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;
  border:1px solid var(--line);background:var(--bg);color:var(--ink);transition:border-color .15s,color .15s;
}
.settings-foot button:hover{border-color:var(--accent);color:var(--accent)}
.settings-foot button.primary-action{
  background:linear-gradient(135deg,var(--accent),var(--accent2));border:0;color:#fff;
}
body.night .settings-foot button.primary-action{color:#121524}

/* ===== کتاب و صفحات ===== */
.book{
  max-width:var(--reader-maxw);margin:0 auto;background:var(--paper);
  border:1px solid var(--line);border-radius:20px;box-shadow:0 14px 45px rgba(25,35,75,.10);
  overflow:hidden;min-height:74vh;transition:max-width .22s ease;
}
body.night .book{box-shadow:0 18px 50px rgba(0,0,0,.42)}
.cover{
  display:none;min-height:min(82svh,720px);padding:clamp(36px,8vw,92px) clamp(22px,6vw,70px);
  justify-content:center;align-items:center;text-align:center;position:relative;isolation:isolate;overflow:hidden;
  background:radial-gradient(circle at 16% 18%,rgba(37,182,174,.22),transparent 38%),radial-gradient(circle at 84% 82%,rgba(103,89,214,.22),transparent 42%),linear-gradient(145deg,var(--paper),var(--bg));
  break-after:page;
}
.cover.active{display:flex}
.cover:before,.cover:after{content:"";position:absolute;z-index:-1;pointer-events:none;border:1.5px solid color-mix(in srgb,var(--accent) 26%,transparent);border-radius:50%;width:clamp(200px,38vw,460px);height:clamp(200px,38vw,460px)}
.cover:before{top:-20%;right:-13%}
.cover:after{bottom:-28%;left:-15%;width:clamp(240px,45vw,540px);height:clamp(240px,45vw,540px);border-color:color-mix(in srgb,var(--accent2) 28%,transparent)}
body.night .cover[data-cover="aurora"]{background:radial-gradient(circle at 18% 20%,rgba(55,190,193,.26),transparent 40%),radial-gradient(circle at 82% 78%,rgba(128,112,240,.30),transparent 44%),linear-gradient(150deg,#181c30,#232042 55%,#152936)}
.cover[data-cover="ocean"]{background:radial-gradient(ellipse at 85% 15%,rgba(14,165,233,.28),transparent 46%),radial-gradient(ellipse at 12% 88%,rgba(20,184,166,.26),transparent 48%),linear-gradient(160deg,#f0f9ff 0%,#dff2fb 52%,#e4f7f5 100%)}
.cover[data-cover="ocean"]:before{border-color:rgba(14,165,233,.34)}
.cover[data-cover="ocean"]:after{border-color:rgba(20,184,166,.34)}
body.night .cover[data-cover="ocean"]{background:radial-gradient(ellipse at 85% 15%,rgba(56,189,248,.28),transparent 46%),radial-gradient(ellipse at 12% 88%,rgba(45,212,191,.24),transparent 48%),linear-gradient(160deg,#0c1e30 0%,#12314a 55%,#0e333a 100%)}
.cover[data-cover="botanical"]{background:radial-gradient(circle at 88% 16%,rgba(130,195,65,.28),transparent 42%),radial-gradient(circle at 14% 84%,rgba(34,139,94,.24),transparent 46%),linear-gradient(150deg,#f4fbf4 0%,#e5f4ea 52%,#eef6e6 100%)}
.cover[data-cover="botanical"]:before{border-radius:64% 36% 70% 30% / 45% 60% 40% 55%;border-color:rgba(46,139,87,.32)}
.cover[data-cover="botanical"]:after{border-radius:38% 62% 42% 58% / 58% 42% 58% 42%;border-color:rgba(130,195,65,.36)}
body.night .cover[data-cover="botanical"]{background:radial-gradient(circle at 88% 16%,rgba(130,195,65,.22),transparent 42%),radial-gradient(circle at 14% 84%,rgba(52,211,153,.20),transparent 46%),linear-gradient(150deg,#112018 0%,#183226 55%,#1c2e21 100%)}
.cover[data-cover="classic"]{background:radial-gradient(circle at 50% 0%,rgba(224,173,112,.22),transparent 52%),linear-gradient(180deg,#fdfaf3,#f6efe2);box-shadow:inset 0 0 0 12px rgba(255,255,255,.55),inset 0 0 0 14px rgba(186,142,82,.32)}
.cover[data-cover="classic"]:before,.cover[data-cover="classic"]:after{display:none}
body.night .cover[data-cover="classic"]{background:radial-gradient(circle at 50% 0%,rgba(224,173,112,.16),transparent 55%),linear-gradient(180deg,#1f1b17,#171412);box-shadow:inset 0 0 0 12px rgba(255,255,255,.03),inset 0 0 0 14px rgba(224,173,112,.28)}
.cover[data-cover="minimal"]{background:var(--paper);border-top:7px solid var(--accent)}
.cover[data-cover="minimal"]:before,.cover[data-cover="minimal"]:after{display:none}
body.night .cover[data-cover="minimal"]{background:var(--paper);border-top:7px solid var(--accent)}
.cover-inner{max-width:780px;width:100%;text-align:center;display:flex;flex-direction:column;align-items:center}
.cover-kicker{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--accent2);font-weight:800;padding:6px 16px;border-radius:999px;background:var(--stat-bg);border:1px solid var(--stat-border);margin-bottom:22px}
.cover h1{font-size:clamp(30px,5.6vw,58px);line-height:1.45;color:var(--accent);font-weight:900;letter-spacing:-.02em;margin:0;max-width:100%;overflow-wrap:anywhere}
.cover-subtitle{font-size:clamp(15px,2vw,21px);line-height:1.85;color:var(--muted);margin-top:16px;max-width:640px;font-weight:500}
.cover-divider{width:76px;height:3px;border-radius:999px;margin:24px auto 0;background:linear-gradient(90deg,var(--accent),var(--accent2));opacity:.75}
.cover-meta{display:flex;justify-content:center;align-items:center;gap:10px 12px;flex-wrap:wrap;margin-top:24px;max-width:720px}
.cover-meta .meta-chip{display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:center;padding:8px 15px;border-radius:999px;font-size:13px;line-height:1.5;color:var(--ink);background:var(--chip-bg);border:1px solid var(--chip-border);box-shadow:0 2px 10px rgba(25,35,75,.05)}
.cover-meta .meta-chip.meta-group{border-radius:16px;padding:7px 13px;gap:6px}
.cover-meta .meta-chip b{font-weight:700;color:var(--accent)}
.cover-meta .meta-tag{display:inline-flex;align-items:center;padding:2px 10px;border-radius:999px;font-size:12.5px;line-height:1.55;background:color-mix(in srgb,var(--accent) 11%,transparent);border:1px solid color-mix(in srgb,var(--accent) 24%,transparent);color:var(--ink)}
.cover-meta .meta-chip.stat{background:var(--stat-bg);border-color:var(--stat-border);color:var(--stat-ink)}
.cover-description{max-width:620px;margin:26px auto 0;padding-top:20px;border-top:1px dashed var(--line);line-height:2.1;color:var(--muted);font-size:14.5px;white-space:pre-line}
.start-reading-btn{margin-top:32px;border:0;border-radius:999px;padding:12px 28px;font:inherit;font-size:14px;font-weight:800;color:#fff;cursor:pointer;background:linear-gradient(135deg,var(--accent),var(--accent2));box-shadow:0 8px 22px color-mix(in srgb,var(--accent) 34%,transparent);transition:transform .16s ease,box-shadow .16s ease}
body.night .start-reading-btn{color:#121524}
.start-reading-btn:hover{transform:translateY(-2px)}
.chapter-page{display:none;min-height:68vh;padding:clamp(22px,5vw,60px);position:relative}
.chapter-page.active{display:block}
.article{font-size:var(--reader-font);line-height:var(--reader-lh);overflow-wrap:anywhere;padding:0 0 56px}
.article h1,.article h2,.article h3,.article h4{line-height:1.55;scroll-margin-top:90px}
.article h1{font-size:2em;color:var(--accent);border-bottom:3px solid var(--line);padding-bottom:16px}
.article h2{font-size:1.5em;color:var(--accent2);margin:2em 0 .7em;padding-inline-start:13px;border-inline-start:5px solid var(--accent2)}
.article h3{font-size:1.22em;color:#c06b35;margin:1.6em 0 .55em}
body.night .article h3{color:#f2b688}
.article h4{font-size:1.08em;color:var(--accent)}
.article p{margin:.85em 0}
.article strong{color:var(--accent);font-weight:800}
.article h1 strong,.article h2 strong,.article h3 strong,.article h4 strong{color:inherit;font-weight:inherit}
.article em{color:#b36b35}
body.night .article em{color:#ebb485}
.article a{color:var(--accent2);text-decoration:none;border-bottom:1px dashed currentColor}
.md-wikilink{color:var(--accent);font-weight:600;border-bottom:1px dotted color-mix(in srgb,var(--accent) 45%,transparent)}
.article blockquote{margin:1.4em 0;padding:14px 18px;background:var(--quote-bg);border-inline-start:4px solid var(--accent);border-radius:12px}
.article ul,.article ol{padding-inline-start:1.6em}
.article li{padding:.18em 0}
.article li::marker{color:var(--accent)}
.article hr{border:0;height:1px;background:linear-gradient(90deg,transparent,var(--accent),transparent);margin:2.3em 0}
.article code{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;background:var(--code-bg);color:var(--code-ink);padding:.15em .45em;border-radius:6px;font-size:.88em;direction:ltr;unicode-bidi:plaintext}
.article pre{direction:ltr;text-align:left;background:#141724;color:#eaecf7;padding:18px;border-radius:13px;overflow:auto;line-height:1.7;border:1px solid rgba(255,255,255,.08)}
.article pre code{background:none;color:inherit;padding:0}
.article table{border-collapse:separate;border-spacing:0;width:100%;margin:1.3em 0;border:1px solid var(--line);border-radius:12px;overflow:hidden;font-size:.9em}
.article th{background:var(--quote-bg);color:var(--accent)}
.article td,.article th{padding:10px 12px;border-bottom:1px solid var(--line);text-align:start}
.article tr:last-child td{border-bottom:0}
.article tr:nth-child(even) td{background:color-mix(in srgb,var(--accent) 4%,var(--paper))}
.article img{max-width:100%;height:auto;border-radius:12px;display:inline-block;vertical-align:middle}
.article img.md-zoomable{cursor:zoom-in;transition:transform .16s ease}
.article img.md-zoomable:hover{transform:scale(1.008)}
.article input{accent-color:var(--accent)}
.md-figure{margin:1.45em auto;text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px}
.md-figure img,.md-figure video{max-width:100%;height:auto;border-radius:14px;border:1px solid var(--line);box-shadow:0 8px 24px rgba(15,20,45,.10)}
.md-figure figcaption{font-size:.84em;color:var(--muted);line-height:1.6;max-width:90%}
.md-img-missing{display:inline-flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:center;padding:11px 16px;border-radius:12px;background:var(--quote-bg);border:1.5px dashed var(--line);color:var(--muted);font-size:.85em}
.md-embed-card{margin:1.3em 0;border:1px solid var(--line);border-radius:14px;background:var(--quote-bg);overflow:hidden}
.md-embed-row{display:flex;align-items:center;gap:12px;padding:12px 15px;flex-wrap:wrap}
.md-file-icon{width:42px;height:42px;flex:0 0 42px;border-radius:11px;display:grid;place-items:center;font-weight:800;font-size:11px;letter-spacing:.03em;background:var(--paper);color:var(--accent);border:1px solid var(--chip-border);font-family:ui-monospace,SFMono-Regular,Consolas,monospace}
.md-file-info{display:flex;flex-direction:column;min-width:0;flex:1;gap:2px}
.md-file-name{font-weight:700;font-size:.92em;color:var(--ink);overflow-wrap:anywhere;line-height:1.5}
.md-file-sub{font-size:.76em;color:var(--muted);line-height:1.4;direction:ltr;text-align:start}
.md-file-actions{display:flex;gap:7px;flex-wrap:wrap;align-items:center}
.md-file-btn{display:inline-flex;align-items:center;gap:5px;padding:6px 12px;border-radius:9px;font-size:.8em;font-weight:700;background:var(--paper);color:var(--accent)!important;border:1px solid var(--chip-border)!important;text-decoration:none;cursor:pointer;line-height:1.5}
.md-file-btn:hover{border-color:var(--accent)!important}
.md-audio-wrap{padding:0 15px 13px}
.md-audio-wrap audio{width:100%;height:40px;display:block}
.md-video-wrap{padding:0 15px 14px;text-align:center}
.md-video-wrap video{max-width:100%;border-radius:10px;background:#000}
.md-pdf-details{border-top:1px solid var(--line)}
.md-pdf-details summary{padding:9px 15px;font-size:.82em;font-weight:700;color:var(--accent2);cursor:pointer;user-select:none;list-style:none;display:flex;align-items:center;gap:6px}
.md-pdf-details summary::-webkit-details-marker{display:none}
.md-pdf-frame{width:100%;height:540px;border:0;display:block;background:#fff}
.md-inline-file{display:inline-flex;align-items:center;gap:6px;vertical-align:middle;padding:2px 10px;margin:0 2px;border-radius:999px;font-size:.84em;font-weight:700;background:var(--quote-bg);border:1px solid var(--chip-border)!important;color:var(--accent)!important;text-decoration:none}
.md-inline-file small{font-weight:600;opacity:.75;font-family:monospace;font-size:.85em}
.lightbox{position:fixed;inset:0;z-index:60;background:rgba(8,11,24,.86);display:none;align-items:center;justify-content:center;padding:24px;backdrop-filter:blur(6px);cursor:zoom-out}
.lightbox.open{display:flex}
.lightbox img{max-width:94vw;max-height:88vh;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.5)}
.lightbox-close{position:fixed;top:16px;left:16px;width:40px;height:40px;border-radius:50%;border:1px solid rgba(255,255,255,.25);background:rgba(0,0,0,.45);color:#fff;font-size:24px;line-height:1;cursor:pointer;display:grid;place-items:center}
.lightbox-open{position:fixed;top:18px;right:18px;padding:7px 13px;border-radius:999px;border:1px solid rgba(255,255,255,.28);background:rgba(0,0,0,.5);color:#fff;font-size:12px;font-weight:700;text-decoration:none}
.lightbox-open:hover{background:rgba(255,255,255,.16)}
.md-img-link{display:inline-block;border:0!important;line-height:0}
.toc{display:none}
.toc-shade{position:fixed;inset:0;background:rgba(10,14,30,.5);z-index:39;opacity:0;visibility:hidden;transition:.2s;backdrop-filter:blur(3px)}
.toc-drawer{position:fixed;z-index:40;top:0;inset-inline-start:0;height:100dvh;width:min(340px,88vw);background:var(--paper);color:var(--ink);border-inline-end:1px solid var(--line);box-shadow:0 0 35px rgba(10,14,30,.22);transform:translateX(${drawerOffTransform});transition:transform .25s ease;padding:18px;overflow:auto}
.toc-drawer.open{transform:translateX(0)}
.toc-shade.open{opacity:1;visibility:visible}
.toc-head{display:flex;justify-content:space-between;align-items:center;padding-bottom:14px;border-bottom:1px solid var(--line);margin-bottom:12px}
.toc-head button{border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:8px;font-size:20px;width:34px;height:34px;cursor:pointer}
.toc-items a{display:block;padding:9px 11px;margin:3px 0;border-radius:9px;color:var(--ink);text-decoration:none;font-size:13px;line-height:1.7}
.toc-items a:hover,.toc-items a.current{background:var(--quote-bg);color:var(--accent);font-weight:700}
.toc-items a.toc-cover-link{border-bottom:1px dashed var(--line);margin-bottom:8px;padding-bottom:10px;color:var(--accent2);font-weight:700}
.toc-items a.level3{padding-inline-start:24px;font-size:12px}
.article mark{display:inline;line-height:inherit;vertical-align:baseline;border-radius:4px;padding:.05em .18em;cursor:pointer;-webkit-box-decoration-break:clone;box-decoration-break:clone}
.article mark.hl-yellow{background:#ffec99;color:#3d3418}
.article mark.hl-green{background:#c5f0c4;color:#1e4720}
.article mark.hl-blue{background:#c7e6ff;color:#143a5c}
.article mark.hl-pink{background:#ffd2e5;color:#632543}
.article mark.hl-purple{background:#e3d4ff;color:#41266b}
.article mark.note{background:#c5efe7;color:#124542;border-bottom:2px solid #168d89}
body.night .article mark.hl-yellow{background:rgba(250,214,72,.28);color:#fff6cc}
body.night .article mark.hl-green{background:rgba(92,214,141,.26);color:#d7ffea}
body.night .article mark.hl-blue{background:rgba(96,178,245,.28);color:#daf0ff}
body.night .article mark.hl-pink{background:rgba(244,128,176,.28);color:#ffe0ee}
body.night .article mark.hl-purple{background:rgba(181,142,248,.28);color:#efe4ff}
body.night .article mark.note{background:rgba(56,192,182,.26);color:#d8fffb;border-bottom:2px solid #5ed9cf}
.chapter-footer{position:absolute;bottom:18px;inset-inline:clamp(22px,5vw,60px);display:flex;justify-content:space-between;align-items:center;color:var(--muted);font-size:11.5px;border-top:1px solid var(--line);padding-top:10px}
.bookmarks{max-width:var(--reader-maxw);margin:12px auto;padding:10px 14px;background:var(--paper);border:1px solid var(--line);border-radius:13px;font-size:12.5px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;color:var(--muted);transition:max-width .22s ease}
.bm-chip{display:inline-flex;align-items:center;gap:6px;padding:4px 10px 4px 6px;border-radius:999px;background:var(--stat-bg);border:1px solid var(--stat-border)}
.bm-chip a{color:var(--stat-ink);text-decoration:none;font-weight:600}
.bm-chip a:hover{text-decoration:underline}
.bm-del{display:inline-grid;place-items:center;width:20px;height:20px;border-radius:50%;border:0;background:transparent;color:var(--muted);font-size:14px;line-height:1;cursor:pointer;padding:0;transition:background .15s,color .15s}
.bm-del:hover{background:rgba(220,60,60,.16);color:#d93838}
body.night .bm-del:hover{background:rgba(255,107,107,.22);color:#ff8f8f}
.bm-clear{margin-inline-start:auto;border:1px solid var(--line);background:transparent;color:var(--muted);border-radius:8px;padding:4px 9px;font:inherit;font-size:11.5px;cursor:pointer}
.bm-clear:hover{border-color:#d93838;color:#d93838}
.navrow{max-width:var(--reader-maxw);margin:12px auto 24px;display:flex;justify-content:space-between;align-items:center;gap:10px;transition:max-width .22s ease}
.navrow button{border:1px solid var(--line);background:var(--paper);color:var(--ink);border-radius:11px;padding:10px 16px;cursor:pointer;font-weight:700;font-size:13px;transition:border-color .15s,color .15s}
.navrow button:hover:not(:disabled){border-color:var(--accent);color:var(--accent)}
.navrow button:disabled{opacity:.38;cursor:not-allowed}
.page-indicator{font-size:12.5px;color:var(--muted);font-weight:700}

/* ===== پاورقی‌ها (Obsidian Footnotes + Popover تعاملی) ===== */
.fn-ref{font-size:.72em;line-height:0;vertical-align:super;margin-inline:2px}
.fn-link{
  display:inline-flex;align-items:center;justify-content:center;
  min-width:19px;height:19px;padding:0 5px;border-radius:999px;
  background:color-mix(in srgb,var(--accent) 13%,var(--paper));
  border:1px solid color-mix(in srgb,var(--accent) 30%,transparent)!important;
  color:var(--accent)!important;font-weight:800;font-size:.95em;
  text-decoration:none;cursor:pointer;transition:transform .14s,background .14s,color .14s;
}
.fn-link:hover,.fn-link.is-open{background:var(--accent);color:#fff!important;transform:translateY(-1px)}
body.night .fn-link:hover,body.night .fn-link.is-open{color:#121524!important}

.chapter-footnotes{
  margin-top:2.4em;padding-top:18px;border-top:1.5px dashed var(--line);
  font-size:.86em;line-height:1.85;color:var(--muted);
}
.chapter-footnotes-title{
  font-size:.92em;font-weight:800;color:var(--accent);margin-bottom:10px;
  display:flex;align-items:center;gap:6px;
}
.chapter-footnotes ol{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}
.chapter-footnotes li{
  display:flex;align-items:flex-start;gap:9px;padding:8px 12px;border-radius:11px;
  background:color-mix(in srgb,var(--accent) 4%,var(--paper));
  border:1px solid color-mix(in srgb,var(--line) 85%,transparent);
  scroll-margin-top:95px;transition:border-color .2s,background .2s;
}
.chapter-footnotes li.fn-flash{
  border-color:var(--accent);
  background:var(--quote-bg);
}
.fn-num{
  flex:0 0 auto;min-width:22px;height:22px;padding:0 6px;border-radius:999px;
  display:inline-flex;align-items:center;justify-content:center;
  background:var(--quote-bg);color:var(--accent);font-weight:800;font-size:.85em;
  margin-top:2px;
}
.fn-body{flex:1;min-width:0;color:var(--ink)}
.fn-back{
  margin-inline-start:6px;font-size:.88em;font-weight:700;
  color:var(--accent2)!important;border:0!important;text-decoration:none;opacity:.85;
}
.fn-back:hover{opacity:1}

.fn-popover{
  position:fixed;z-index:55;width:min(360px,calc(100vw - 24px));
  background:var(--paper);color:var(--ink);
  border:1px solid var(--chip-border);border-radius:15px;
  box-shadow:0 16px 46px rgba(10,16,40,.22);
  padding:13px 15px;display:none;flex-direction:column;gap:8px;
  backdrop-filter:blur(16px);
}
body.night .fn-popover{box-shadow:0 18px 50px rgba(0,0,0,.5)}
.fn-popover.open{display:flex;animation:fnPopIn .16s ease}
@keyframes fnPopIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.fn-pop-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding-bottom:7px;border-bottom:1px solid var(--line)}
.fn-pop-badge{font-size:12px;font-weight:800;color:var(--accent);display:inline-flex;align-items:center;gap:5px}
.fn-pop-close{
  border:1px solid var(--line);background:var(--bg);color:var(--ink);
  width:26px;height:26px;border-radius:8px;font-size:16px;line-height:1;
  display:grid;place-items:center;cursor:pointer;
}
.fn-pop-close:hover{border-color:var(--accent);color:var(--accent)}
.fn-pop-body{font-size:13.5px;line-height:1.9;color:var(--ink);max-height:42vh;overflow:auto;overflow-wrap:anywhere}
.fn-pop-body a{color:var(--accent2);text-decoration:none;border-bottom:1px dashed currentColor}
.fn-pop-foot{display:flex;justify-content:flex-end;padding-top:4px}
.fn-pop-jump{
  border:0;background:transparent;color:var(--accent2);font-size:11.5px;font-weight:700;
  cursor:pointer;padding:2px 4px;
}
.fn-pop-jump:hover{text-decoration:underline}
@media(max-width:600px){
  .fn-popover{left:12px!important;right:12px!important;top:auto!important;bottom:14px!important;width:auto}
}

@media(max-width:720px){
  .readerbar{flex-wrap:wrap;gap:8px;padding:9px 10px}
  .bar-start{order:1;flex:1 1 100%;min-width:0}
  .bar-end{order:2;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:7px;flex:1 1 100%;width:100%;min-width:0}
  .bar-center{order:3;flex:1 1 100%;width:100%;max-width:none;min-width:0}
  .bar-end .bar-btn{width:100%;min-width:0;min-height:42px;justify-content:center;padding:7px 4px;gap:3px}
  .bar-end .bar-btn.icon-only{padding:7px 4px}
  .btn-label-hide{display:none}
}
@media(max-width:600px){
  body{padding:8px}
  .readerbar{top:4px;border-radius:13px}
  .book{border-radius:14px}
  .chapter-page{padding:22px 17px;min-height:70vh}
  .article h1{font-size:1.65em}
  .article h2{font-size:1.35em}
  .cover{min-height:80svh;padding:30px 18px}
  .cover h1{font-size:clamp(28px,8.5vw,42px)}
  .navrow button{padding:9px 12px;font-size:12px}
}
@media print{
  body{padding:0;background:#fff;color:#111}
  .readerbar,.progress,.bookmarks,.navrow,#searchStatus,.toc-drawer,.toc-shade,.settings-drawer,.settings-shade,.start-reading-btn,.lightbox,.md-pdf-details,.fn-popover,.fn-back{display:none!important}
  .book{box-shadow:none;border:0;max-width:none;border-radius:0}
  .cover,.cover.active{display:flex!important;min-height:94vh;break-after:page}
  .chapter-page,.chapter-page.active{display:block!important;min-height:0;break-after:page;padding:15mm}
  .chapter-footer{position:static;margin-top:28px}
  .article{padding:0}
  .article a{color:#111}
}
`;

  const scriptClose = '</' + 'script>';
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="${dark ? '#0f1220' : '#f3f5fb'}">
<title>${safeTitle}</title>
<style>${css}</style>
</head>
<body class="${dark ? 'night' : ''}" data-palette="${esc(initPalette)}">
<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100"><span></span></div>

<nav class="readerbar">
  <div class="bar-start">
    <button type="button" class="bar-btn icon-only" id="tocBtn" title="${esc(r.tocHeading)}">☷</button>
    <button type="button" class="brand" id="coverJumpBtn" title="${esc(r.coverJumpTitle)}">${esc(r.brand)}</button>
  </div>
  <div class="bar-center">
    <div class="search-wrap">
      <input id="find" type="search" placeholder="${esc(r.searchPlaceholder)}">
    </div>
  </div>
  <div class="bar-end">
    <button type="button" class="bar-btn" id="highlightBtn" title="${esc(r.hlBtn)}"><span class="hl-indicator" id="hlIndicator"></span><span class="btn-label-hide">${esc(r.hlBtn.replace(/^🖍\s*/, ''))}</span></button>
    <button type="button" class="bar-btn" id="commentBtn" title="${esc(r.commentBtn)}">💬<span class="btn-label-hide"> ${esc(r.commentBtn.replace(/^💬\s*/, ''))}</span></button>
    <button type="button" class="bar-btn" id="markBtn" title="${esc(r.markBtn)}"><span aria-hidden="true">🔖</span><span class="btn-label-hide" id="markBtnLabel">${esc(r.markBtn.replace(/^🔖\s*/, ''))}</span></button>
    <button type="button" class="bar-btn icon-only" id="themeBtn" title="${esc(r.themeTitle)}">🌓</button>
    <button type="button" class="bar-btn settings-trigger" id="settingsBtn" title="${esc(r.settingsTitle)}">⚙️ <span class="btn-label-hide">${esc(r.settingsBtn)}</span></button>
  </div>
</nav>

<div id="tocShade" class="toc-shade"></div>
<aside id="tocDrawer" class="toc-drawer" aria-label="${esc(r.tocHeading)}">
  <div class="toc-head"><strong>${esc(r.tocHeading)}</strong><button id="tocClose" aria-label="${esc(r.tocCloseAria)}">×</button></div>
  <div id="tocItems" class="toc-items"></div>
</aside>

<div id="settingsShade" class="settings-shade"></div>
<aside id="settingsDrawer" class="settings-drawer" lang="${lang}" dir="${dir}" aria-label="${esc(r.settingsTitle)}">
  <div class="settings-head">
    <strong>⚙️ ${esc(r.settingsTitle)}</strong>
    <button type="button" class="settings-close" id="settingsClose" aria-label="${esc(r.settingsClose)}">×</button>
  </div>
  <div class="settings-body" lang="${lang}" dir="${dir}">
    <div class="set-group">
      <div class="set-label"><span>${esc(r.setAppearance)}</span></div>
      <div class="seg-control">
        <button type="button" class="seg-btn" data-theme-val="light">${esc(r.setDay)}</button>
        <button type="button" class="seg-btn" data-theme-val="dark">${esc(r.setNight)}</button>
      </div>
    </div>

    <div class="set-group">
      <div class="set-label"><span>${esc(r.setFontSize)}</span><span class="set-val" id="fontSizeVal">${size}px</span></div>
      <div class="font-stepper">
        <button type="button" id="smaller" title="${esc(r.smallerTitle)}">A−</button>
        <span id="fontSizeReadout">${size}px</span>
        <button type="button" id="bigger" title="${esc(r.biggerTitle)}">A+</button>
      </div>
    </div>

    <div class="set-group">
      <div class="set-label"><span>${esc(r.setLineHeight)}</span></div>
      <div class="seg-control">
        <button type="button" class="seg-btn" data-lh-val="1.75">${esc(r.lhCompact)}</button>
        <button type="button" class="seg-btn" data-lh-val="2.05">${esc(r.lhNormal)}</button>
        <button type="button" class="seg-btn" data-lh-val="2.35">${esc(r.lhRelaxed)}</button>
      </div>
    </div>

    <div class="set-group">
      <div class="set-label"><span>${esc(r.setWidth)}</span></div>
      <div class="seg-control">
        <button type="button" class="seg-btn" data-width-val="680">${esc(r.wNarrow)}</button>
        <button type="button" class="seg-btn" data-width-val="850">${esc(r.wNormal)}</button>
        <button type="button" class="seg-btn" data-width-val="100%">${esc(r.wWide)}</button>
      </div>
    </div>

    <div class="set-group">
      <div class="set-label"><span>${esc(r.setFontFamily)}</span></div>
      <select id="readerFont" class="set-select" title="${esc(r.fontTitle)}">
        <option value="default">${esc(r.fontDefault)}</option>
        <option value="Tahoma">Tahoma</option>
        <option value="system-ui">System UI</option>
        <option value="Georgia">Georgia</option>
        <option value="serif">Serif</option>
      </select>
    </div>

    <div class="set-group">
      <div class="set-label"><span>${esc(r.setPalette)}</span></div>
      <div class="swatch-grid" id="paletteGrid">${paletteChipsHtml}</div>
    </div>

    <div class="set-group">
      <div class="set-label"><span>${esc(r.setCoverStyle)}</span></div>
      <div class="pill-grid" id="coverGrid">${coverChipsHtml}</div>
    </div>

    <div class="set-group">
      <div class="set-label"><span>${esc(r.setHlColor)}</span></div>
      <div class="hl-dots" id="hlDots">${hlDotsHtml}</div>
    </div>
  </div>
  <div class="settings-foot">
    <button type="button" id="resetSettingsBtn">↺ ${esc(r.resetSettings)}</button>
    <button type="button" class="primary-action" id="printBtn">${esc(r.printBtnFull)}</button>
  </div>
</aside>

<div id="fnPopover" class="fn-popover" role="dialog" aria-hidden="true">
  <div class="fn-pop-head">
    <span class="fn-pop-badge" id="fnPopBadge"></span>
    <button type="button" class="fn-pop-close" id="fnPopClose" aria-label="${esc(r.footnoteClose)}">×</button>
  </div>
  <div class="fn-pop-body" id="fnPopBody"></div>
  <div class="fn-pop-foot">
    <button type="button" class="fn-pop-jump" id="fnPopJump">${esc(r.footnoteGoTo)}</button>
  </div>
</div>

<div id="lightbox" class="lightbox" aria-hidden="true">
  <button type="button" class="lightbox-close" id="lightboxClose" aria-label="${esc(r.lightboxClose)}">×</button>
  <a id="lightboxOpen" class="lightbox-open" href="#" target="_blank" rel="noopener noreferrer" style="display:none">${esc(r.lightboxOpen)}</a>
  <img id="lightboxImg" alt="" referrerpolicy="no-referrer">
</div>

<span id="searchStatus" aria-live="polite" class="search-status"></span>

<div class="book">
  <section class="cover active" id="coverSection" data-cover="${esc(initCover)}" aria-label="${safeDocType}">
    <div class="cover-inner">
      <div class="cover-kicker">${safeDocType}</div>
      <h1>${safeTitle}</h1>
      ${meta.subtitle ? `<div class="cover-subtitle">${esc(meta.subtitle)}</div>` : ''}
      <div class="cover-divider"></div>
      <div class="cover-meta">${metaHtml}</div>
      ${meta.description ? `<p class="cover-description">${esc(meta.description)}</p>` : ''}
      <button type="button" class="start-reading-btn" id="startReadingBtn">${esc(r.startReading)}</button>
    </div>
  </section>
  <div id="chapters"></div>
</div>
<div class="bookmarks" id="marks">${esc(r.noBookmarks)}</div>
<div class="navrow">
  <button id="prev">${esc(r.prev)}</button>
  <span class="page-indicator" id="pageIndicator">${safeDocType}</span>
  <button id="next">${esc(r.next)}</button>
</div>
<script>
(()=>{
  const S=${JSON.stringify(readerStrings)};
  const FN_LIST=${JSON.stringify(footnotes)};
  const FN_MAP=new Map(FN_LIST.map(f=>[String(f.num),f]));
  const HL_HEX={yellow:'#ffe066',green:'#8ce99a',blue:'#74c0fc',pink:'#faa2c1',purple:'#d0bfff'};
  const bookId=${JSON.stringify(bookUid)};
  const docLabel=${JSON.stringify(meta.docType)};
  const defaultPrefs={
    night:${dark ? 'true' : 'false'},
    palette:${JSON.stringify(initPalette)},
    cover:${JSON.stringify(initCover)},
    font:'default',
    size:${size},
    lh:'2.05',
    width:${JSON.stringify(initWidth)},
    hlColor:'yellow'
  };
  const sourceEl=document.querySelector('#chapters');
  const coverEl=document.querySelector('#coverSection');
  const raw=${JSON.stringify(content)};
  const splitMarkedChaptersOnly=${JSON.stringify(splitMarkedChaptersOnly)};
  const nf=n=>Number(n||0).toLocaleString(S.locale);
  const isRtl=getComputedStyle(document.documentElement).direction!=='ltr';
  const prev=document.querySelector('#prev'), next=document.querySelector('#next');
  const startBtn=document.querySelector('#startReadingBtn');
  startBtn.textContent=isRtl?(S.startReading+' ←'):(S.startReading+' →');

  const temp=document.createElement('div');
  temp.innerHTML=raw;
  const tocSource=temp.querySelector('.toc');
  const tocItems=document.querySelector('#tocItems');
  const coverTocLink=document.createElement('a');
  coverTocLink.href='#cover';
  coverTocLink.className='toc-cover-link';
  coverTocLink.textContent='📖 '+docLabel+' '+S.tocCoverSuffix;
  tocItems.append(coverTocLink);
  if(tocSource){
    [...tocSource.querySelectorAll('a')].forEach(a=>{
      const link=document.createElement('a');
      link.href=a.getAttribute('href');
      link.textContent=a.textContent;
      link.className=a.className;
      tocItems.append(link);
    });
    tocSource.remove();
  }
  let pages=[],chunk=null;
  for(const node of [...temp.childNodes]){
    if(node.nodeType===1&&(splitMarkedChaptersOnly ? node.hasAttribute('data-nora-chapter') : /^H[12]$/.test(node.tagName))){
      if(chunk&&chunk.childNodes.length) pages.push(chunk);
      chunk=document.createElement('div');
      chunk.className='article';
    }
    if(!chunk){chunk=document.createElement('div');chunk.className='article'}
    chunk.append(node);
  }
  if(chunk&&chunk.childNodes.length) pages.push(chunk);
  if(!pages.length){const d=document.createElement('div');d.className='article';d.innerHTML=raw;pages=[d]}
  pages.forEach((p,i)=>{
    const fnNums=[];
    const fnSeen=new Set();
    p.querySelectorAll('a.fn-link[data-fn-num]').forEach(a=>{
      const n=String(a.dataset.fnNum);
      if(!fnSeen.has(n)&&FN_MAP.has(n)){fnSeen.add(n);fnNums.push(n)}
    });
    if(fnNums.length){
      const fnAside=document.createElement('aside');
      fnAside.className='chapter-footnotes';
      fnAside.innerHTML='<div class="chapter-footnotes-title">✦ '+S.footnotesHeading+'</div><ol>'+
        fnNums.map(n=>{
          const item=FN_MAP.get(n);
          return '<li id="fn-'+item.num+'"><span class="fn-num">'+item.label+'</span><div class="fn-body">'+item.html+' <a class="fn-back" href="#'+item.firstRefId+'" title="'+S.footnoteBack+'">↩</a></div></li>';
        }).join('')+
      '</ol>';
      p.append(fnAside);
    }
    const section=document.createElement('section');
    section.className='chapter-page';
    section.dataset.index=i;
    section.append(p);
    const foot=document.createElement('div');
    foot.className='chapter-footer';
    foot.innerHTML='<span>'+S.footerBrand+'</span><span>'+S.sectionWord+' '+nf(i+1)+' '+S.ofWord+' '+nf(pages.length)+'</span>';
    section.append(foot);
    sourceEl.append(section);
  });

  /* ===== پاپ‌آور تعاملی پاورقی‌ها ===== */
  const fnPop=document.querySelector('#fnPopover');
  const fnPopBadge=document.querySelector('#fnPopBadge');
  const fnPopBody=document.querySelector('#fnPopBody');
  const fnPopJump=document.querySelector('#fnPopJump');
  let activeFnLink=null, activeFnNum=null;
  const closeFnPop=()=>{
    fnPop.classList.remove('open');
    fnPop.setAttribute('aria-hidden','true');
    if(activeFnLink){activeFnLink.classList.remove('is-open');activeFnLink=null}
    activeFnNum=null;
  };
  document.querySelector('#fnPopClose').onclick=closeFnPop;
  fnPopJump.onclick=()=>{
    const num=activeFnNum;
    closeFnPop();
    if(!num) return;
    const el=all[current]&&all[current].querySelector('#fn-'+CSS.escape(String(num)));
    if(el){
      el.scrollIntoView({behavior:'smooth',block:'center'});
      el.classList.add('fn-flash');
      setTimeout(()=>el.classList.remove('fn-flash'),1600);
    }
  };
  sourceEl.addEventListener('click',e=>{
    const back=e.target.closest('a.fn-back');
    if(back){
      e.preventDefault();
      const targetId=(back.getAttribute('href')||'').slice(1);
      const refEl=targetId&&all[current]&&all[current].querySelector('#'+CSS.escape(targetId));
      if(refEl) refEl.scrollIntoView({behavior:'smooth',block:'center'});
      return;
    }
    const link=e.target.closest('a.fn-link[data-fn-num]');
    if(!link) return;
    e.preventDefault();
    e.stopPropagation();
    const num=String(link.dataset.fnNum);
    if(activeFnLink===link&&fnPop.classList.contains('open')){closeFnPop();return}
    const item=FN_MAP.get(num);
    if(!item) return;
    if(activeFnLink) activeFnLink.classList.remove('is-open');
    activeFnLink=link;activeFnNum=num;
    link.classList.add('is-open');
    fnPopBadge.textContent='✦ '+S.footnoteLabel+' '+item.label;
    fnPopBody.innerHTML=item.html;
    fnPop.classList.add('open');
    fnPop.setAttribute('aria-hidden','false');
    if(window.innerWidth>600){
      const rect=link.getBoundingClientRect();
      const pw=fnPop.offsetWidth||340, ph=fnPop.offsetHeight||150;
      let left=rect.left+(rect.width/2)-(pw/2);
      left=Math.max(12,Math.min(window.innerWidth-pw-12,left));
      let top=rect.bottom+10;
      if(top+ph>window.innerHeight-12) top=Math.max(12,rect.top-ph-10);
      fnPop.style.left=left+'px';
      fnPop.style.top=top+'px';
    }
  });
  document.addEventListener('click',e=>{
    if(fnPop.classList.contains('open')&&!fnPop.contains(e.target)&&!e.target.closest('a.fn-link')) closeFnPop();
  });

  sourceEl.querySelectorAll('img[data-fallback-name]').forEach(img=>{
    img.onerror=function(){
      const span=document.createElement('span');
      span.className='md-img-missing';
      const remote=this.dataset.remoteUrl||'';
      if(remote){
        span.textContent=S.imgRemoteFail;
        const a=document.createElement('a');
        a.href=remote;a.target='_blank';a.rel='noopener noreferrer';
        a.textContent=S.imgRemoteOpen;
        span.append(a);
      }else{
        span.textContent=S.imgLocalFailPre+(this.dataset.fallbackName||'')+S.imgLocalFailPost;
      }
      this.replaceWith(span);
    };
  });

  function dataUrlToBlobUrl(dataUrl){
    try{
      const parts=dataUrl.split(','), mime=(parts[0].match(/:(.*?);/)||[])[1]||'application/pdf';
      const bin=atob(parts[1]), bytes=new Uint8Array(bin.length);
      for(let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
      return URL.createObjectURL(new Blob([bytes],{type:mime}));
    }catch(e){return dataUrl}
  }
  sourceEl.querySelectorAll('details.md-pdf-details').forEach(det=>{
    det.addEventListener('toggle',()=>{
      if(!det.open) return;
      const frame=det.querySelector('iframe[data-pdf-src]');
      if(frame&&!frame.src){
        const rawSrc=frame.dataset.pdfSrc||'';
        frame.src=rawSrc.startsWith('data:')?dataUrlToBlobUrl(rawSrc):rawSrc;
      }
    });
  });

  const lightbox=document.querySelector('#lightbox'), lbImg=document.querySelector('#lightboxImg'), lbOpen=document.querySelector('#lightboxOpen');
  const closeLb=()=>{lightbox.classList.remove('open');lightbox.setAttribute('aria-hidden','true')};
  lightbox.onclick=e=>{if(e.target===lbOpen)return;closeLb()};
  document.querySelector('#lightboxClose').onclick=closeLb;
  sourceEl.addEventListener('click',e=>{
    const img=e.target.closest('img.md-zoomable');
    if(!img) return;
    const full=img.dataset.fullSrc||img.src;
    lbImg.src=full;lbImg.alt=img.alt||'';
    if(full.startsWith('http://')||full.startsWith('https://')){lbOpen.href=full;lbOpen.style.display='inline-block'}
    else{lbOpen.style.display='none'}
    lightbox.classList.add('open');lightbox.setAttribute('aria-hidden','false');
  });

  const all=[...sourceEl.querySelectorAll('.chapter-page')];
  const indicator=document.querySelector('#pageIndicator');
  const progress=document.querySelector('.progress span');
  const markBtn=document.querySelector('#markBtn');
  const posKey='nora-pos-v2-'+bookId;
  const prefsKey='nora-prefs-v3-'+bookId;
  let current=-1;
  const marksKey='nora-marks-'+bookId;
  let marks=[];
  try{marks=JSON.parse(localStorage.getItem(marksKey)||'[]')}catch(e){}

  function updateMarkBtn(){
    const isBookmarked=current>=0&&marks.some(m=>m.page===current);
    markBtn.classList.toggle('is-active',isBookmarked);
    const label=isBookmarked?S.markRemoveBtn:S.markBtn;
    const labelEl=document.querySelector('#markBtnLabel');
    if(labelEl) labelEl.textContent=label.replace(/^🔖\s*/, '');
    markBtn.title=label;
    markBtn.setAttribute('aria-label',label);
  }
  function setProgress(){
    if(current<0){progress.style.width='0%';return}
    const page=all[current];
    if(!page) return;
    const top=page.offsetTop,height=page.offsetHeight||1;
    const within=Math.max(0,Math.min(1,(window.scrollY+window.innerHeight-top)/(height+window.innerHeight)));
    progress.style.width=((current+within)/all.length*100)+'%';
  }
  function show(n, shouldScroll=true){
    closeFnPop();
    current=Math.max(-1,Math.min(all.length-1,n));
    coverEl.classList.toggle('active',current===-1);
    all.forEach((p,i)=>p.classList.toggle('active',i===current));
    if(current===-1){
      indicator.textContent=docLabel+' '+S.tocCoverSuffix;
      prev.disabled=true;prev.textContent=isRtl?('→ '+S.coverPage):('← '+S.coverPage);
      next.disabled=all.length===0;next.textContent=isRtl?(S.startReading+' ←'):(S.startReading+' →');
    }else{
      indicator.textContent=S.sectionWord+' '+nf(current+1)+' '+S.ofWord+' '+nf(all.length);
      prev.disabled=false;
      prev.textContent=current===0?(isRtl?('→ '+S.coverPage):('← '+S.coverPage)):(isRtl?('→ '+S.prevSection):('← '+S.prevSection));
      next.disabled=current===all.length-1;
      next.textContent=isRtl?(S.nextSection+' ←'):(S.nextSection+' →');
    }
    updateMarkBtn();
    try{localStorage.setItem(posKey,String(current))}catch(e){}
    if(shouldScroll) window.scrollTo({top:0,behavior:'smooth'});
    setProgress();
  }
  window.addEventListener('scroll',setProgress,{passive:true});
  let savedPos=-1;
  try{const rawPos=localStorage.getItem(posKey);if(rawPos!==null){const parsed=parseInt(rawPos,10);if(!Number.isNaN(parsed)) savedPos=parsed}}catch(e){}
  show(savedPos,false);
  startBtn.onclick=()=>show(0,true);
  document.querySelector('#coverJumpBtn').onclick=()=>show(-1,true);
  prev.onclick=()=>show(current-1,true);
  next.onclick=()=>show(current+1,true);

  /* ===== کشوی فهرست و کشوی تنظیمات ===== */
  const tocDrawer=document.querySelector('#tocDrawer'), tocShade=document.querySelector('#tocShade');
  const setDrawer=document.querySelector('#settingsDrawer'), setShade=document.querySelector('#settingsShade');
  const toggleToc=open=>{
    if(open) toggleSettings(false);
    tocDrawer.classList.toggle('open',open);
    tocShade.classList.toggle('open',open);
  };
  const toggleSettings=open=>{
    if(open) toggleToc(false);
    setDrawer.classList.toggle('open',open);
    setShade.classList.toggle('open',open);
  };
  document.querySelector('#tocBtn').onclick=()=>toggleToc(!tocDrawer.classList.contains('open'));
  document.querySelector('#tocClose').onclick=()=>toggleToc(false);
  tocShade.onclick=()=>toggleToc(false);
  document.querySelector('#settingsBtn').onclick=()=>toggleSettings(!setDrawer.classList.contains('open'));
  document.querySelector('#settingsClose').onclick=()=>toggleSettings(false);
  setShade.onclick=()=>toggleSettings(false);

  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){
      if(lightbox.classList.contains('open')){closeLb();return}
      if(fnPop.classList.contains('open')){closeFnPop();return}
      if(setDrawer.classList.contains('open')){toggleSettings(false);return}
      if(tocDrawer.classList.contains('open')){toggleToc(false);return}
    }
    if(e.target.matches('input,textarea,select')) return;
    if(e.key==='ArrowLeft') show(isRtl?current+1:current-1,true);
    if(e.key==='ArrowRight') show(isRtl?current-1:current+1,true);
  });

  /* ===== مدیریت تنظیمات مدرن خوانشگر ===== */
  let prefs={...defaultPrefs};
  try{const savedPrefs=JSON.parse(localStorage.getItem(prefsKey)||'null');if(savedPrefs&&typeof savedPrefs==='object') prefs={...prefs,...savedPrefs}}catch(e){}

  const fontSel=document.querySelector('#readerFont');
  const fontSizeVal=document.querySelector('#fontSizeVal');
  const fontSizeReadout=document.querySelector('#fontSizeReadout');
  const hlIndicator=document.querySelector('#hlIndicator');
  const themeBtn=document.querySelector('#themeBtn');

  function applyPrefs(){
    document.body.classList.toggle('night',!!prefs.night);
    document.body.dataset.palette=prefs.palette||'default';
    coverEl.dataset.cover=prefs.cover||'aurora';
    const fz=prefs.size||16;
    document.documentElement.style.setProperty('--reader-font',fz+'px');
    document.documentElement.style.setProperty('--reader-lh',prefs.lh||'2.05');
    const wVal=prefs.width||'850';
    document.documentElement.style.setProperty('--reader-maxw',wVal==='100%'?'100%':wVal+'px');
    if(!prefs.font||prefs.font==='default') document.documentElement.style.removeProperty('--reader-family');
    else document.documentElement.style.setProperty('--reader-family',prefs.font+',Tahoma,sans-serif');

    fontSel.value=prefs.font||'default';
    fontSizeVal.textContent=fz+'px';
    fontSizeReadout.textContent=fz+'px';
    themeBtn.textContent=prefs.night?'☀️':'🌙';
    hlIndicator.style.background=HL_HEX[prefs.hlColor||'yellow']||'#ffe066';

    document.querySelectorAll('[data-theme-val]').forEach(b=>b.classList.toggle('active',(b.dataset.themeVal==='dark')===!!prefs.night));
    document.querySelectorAll('[data-lh-val]').forEach(b=>b.classList.toggle('active',b.dataset.lhVal===String(prefs.lh||'2.05')));
    document.querySelectorAll('[data-width-val]').forEach(b=>b.classList.toggle('active',b.dataset.widthVal===String(wVal)));
    document.querySelectorAll('[data-palette-val]').forEach(b=>b.classList.toggle('active',b.dataset.paletteVal===(prefs.palette||'default')));
    document.querySelectorAll('[data-cover-val]').forEach(b=>b.classList.toggle('active',b.dataset.coverVal===(prefs.cover||'aurora')));
    document.querySelectorAll('[data-hl-val]').forEach(b=>b.classList.toggle('active',b.dataset.hlVal===(prefs.hlColor||'yellow')));

    try{localStorage.setItem(prefsKey,JSON.stringify(prefs))}catch(e){}
  }
  applyPrefs();

  document.querySelector('#smaller').onclick=()=>{prefs.size=Math.max(12,(prefs.size||16)-1);applyPrefs()};
  document.querySelector('#bigger').onclick=()=>{prefs.size=Math.min(28,(prefs.size||16)+1);applyPrefs()};
  themeBtn.onclick=()=>{prefs.night=!prefs.night;applyPrefs()};
  fontSel.onchange=e=>{prefs.font=e.target.value;applyPrefs()};
  document.querySelectorAll('[data-theme-val]').forEach(b=>b.onclick=()=>{prefs.night=b.dataset.themeVal==='dark';applyPrefs()});
  document.querySelectorAll('[data-lh-val]').forEach(b=>b.onclick=()=>{prefs.lh=b.dataset.lhVal;applyPrefs()});
  document.querySelectorAll('[data-width-val]').forEach(b=>b.onclick=()=>{prefs.width=b.dataset.widthVal;applyPrefs()});
  document.querySelectorAll('[data-palette-val]').forEach(b=>b.onclick=()=>{prefs.palette=b.dataset.paletteVal;applyPrefs()});
  document.querySelectorAll('[data-cover-val]').forEach(b=>b.onclick=()=>{prefs.cover=b.dataset.coverVal;applyPrefs()});
  document.querySelectorAll('[data-hl-val]').forEach(b=>b.onclick=()=>{prefs.hlColor=b.dataset.hlVal;applyPrefs()});
  document.querySelector('#resetSettingsBtn').onclick=()=>{prefs={...defaultPrefs};applyPrefs()};
  document.querySelector('#printBtn').onclick=()=>{toggleSettings(false);setTimeout(()=>window.print(),180)};

  tocItems.onclick=e=>{
    const a=e.target.closest('a[href^="#"]');
    if(!a) return;
    e.preventDefault();
    const href=a.getAttribute('href');
    tocItems.querySelectorAll('a').forEach(x=>x.classList.toggle('current',x===a));
    if(href==='#cover'){show(-1,true);toggleToc(false);return}
    const id=href.slice(1);
    const target=all.map((p,i)=>({p,i,el:p.querySelector('#'+CSS.escape(id))})).find(x=>x.el);
    if(target){show(target.i,false);setTimeout(()=>target.el.scrollIntoView({behavior:'smooth',block:'start'}),60);toggleToc(false)}
  };

  const marksBox=document.querySelector('#marks');
  function saveMarks(){try{localStorage.setItem(marksKey,JSON.stringify(marks))}catch(e){}}
  function renderMarks(){
    marksBox.textContent='';
    if(!marks.length){marksBox.textContent=S.noBookmarks;updateMarkBtn();return}
    const titleSpan=document.createElement('span');titleSpan.textContent=S.bookmarksLabel;marksBox.append(titleSpan);
    marks.forEach((m,i)=>{
      const chip=document.createElement('span');chip.className='bm-chip';
      const a=document.createElement('a');a.href='#';a.dataset.page=String(m.page);a.textContent=nf(i+1)+'. '+m.label;
      const del=document.createElement('button');del.type='button';del.className='bm-del';del.dataset.delIndex=String(i);del.title=S.delMarkTitle;del.textContent='×';
      chip.append(a,del);marksBox.append(chip);
    });
    if(marks.length>1){const clearBtn=document.createElement('button');clearBtn.type='button';clearBtn.className='bm-clear';clearBtn.id='clearAllMarks';clearBtn.textContent=S.clearAllMarks;marksBox.append(clearBtn)}
    updateMarkBtn();
  }
  renderMarks();
  marksBox.onclick=e=>{
    const del=e.target.closest('button[data-del-index]');
    if(del){e.preventDefault();e.stopPropagation();const idx=+del.dataset.delIndex;if(idx>=0&&idx<marks.length){marks.splice(idx,1);saveMarks();renderMarks()}return}
    if(e.target.id==='clearAllMarks'){if(confirm(S.clearAllConfirm)){marks=[];saveMarks();renderMarks()}return}
    const a=e.target.closest('a[data-page]');
    if(a){e.preventDefault();show(+a.dataset.page,true)}
  };
  markBtn.onclick=()=>{
    if(current<0){alert(S.alertBookmarkSection);return}
    const existingIdx=marks.findIndex(m=>m.page===current);
    if(existingIdx>=0){marks.splice(existingIdx,1);saveMarks();renderMarks();return}
    const h=all[current].querySelector('h1,h2,h3')||all[current].querySelector('p');
    const label=(h?h.textContent:(S.sectionWord+' '+nf(current+1))).trim().slice(0,40);
    marks.push({page:current,label});saveMarks();renderMarks();
  };

  const annotationKey='nora-annotations-'+bookId;
  function saveAnnotations(){try{localStorage.setItem(annotationKey,JSON.stringify(all.map(p=>p.querySelector('.article').innerHTML)))}catch(e){}}
  try{const saved=JSON.parse(localStorage.getItem(annotationKey)||'null');if(Array.isArray(saved)) all.forEach((p,i)=>{if(typeof saved[i]==='string') p.querySelector('.article').innerHTML=saved[i]})}catch(e){}
  function getSelectedTextSlices(root, range){
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{
      acceptNode(node){
        if(!node.nodeValue||!node.nodeValue.length) return NodeFilter.FILTER_REJECT;
        if(node.parentElement&&node.parentElement.closest('mark')) return NodeFilter.FILTER_REJECT;
        if(!range.intersectsNode(node)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const slices=[];let n;
    while((n=walker.nextNode())){
      const start=(n===range.startContainer)?range.startOffset:0;
      const end=(n===range.endContainer)?range.endOffset:n.nodeValue.length;
      if(end<=start) continue;
      if(!n.nodeValue.slice(start,end).trim()) continue;
      slices.push({node:n,start,end});
    }
    return slices;
  }
  function annotate(withNote){
    if(current<0){alert(S.alertAnnotateSection);return}
    const sel=window.getSelection();
    if(!sel||sel.isCollapsed){alert(S.alertSelectText);return}
    const range=sel.getRangeAt(0);
    const article=all[current].querySelector('.article');
    if(!article.contains(range.commonAncestorContainer)){alert(S.alertSameSection);return}
    const slices=getSelectedTextSlices(article,range);
    if(!slices.length){alert(S.alertInvalidSelection);return}
    let note='';
    if(withNote){note=prompt(S.promptNote,'');if(note===null) return}
    const hid='h-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6);
    const color=prefs.hlColor||'yellow';
    for(const {node,start,end} of slices){
      if(end<node.nodeValue.length) node.splitText(end);
      const target=start>0?node.splitText(start):node;
      const mark=document.createElement('mark');
      mark.dataset.hid=hid;
      if(withNote){mark.className='note';mark.dataset.comment=note;mark.title=S.titleNoteMark}
      else{mark.className='hl-'+color;mark.dataset.highlight=color;mark.title=S.titleHlMark}
      target.parentNode.insertBefore(mark,target);mark.appendChild(target);
    }
    sel.removeAllRanges();saveAnnotations();
  }
  function removeAnnotation(mark){
    const article=mark.closest('.article')||sourceEl;
    const hid=mark.dataset.hid;
    const targets=hid?[...article.querySelectorAll('mark[data-hid="'+CSS.escape(hid)+'"]')]:[mark];
    const parents=new Set();
    targets.forEach(m=>{const parent=m.parentNode;if(!parent) return;parents.add(parent);while(m.firstChild) parent.insertBefore(m.firstChild,m);parent.removeChild(m)});
    parents.forEach(p=>p.normalize());saveAnnotations();
  }
  document.querySelector('#highlightBtn').onclick=()=>annotate(false);
  document.querySelector('#commentBtn').onclick=()=>annotate(true);
  sourceEl.addEventListener('click',e=>{
    const m=e.target.closest('mark');
    if(!m||!e.currentTarget.contains(m)) return;
    if(m.classList.contains('note')){alert(S.alertNotePrefix+(m.dataset.comment||''));if(confirm(S.confirmDeleteNote)) removeAnnotation(m)}
    else if(m.dataset.highlight||m.className.startsWith('hl-')){if(confirm(S.confirmDeleteHl)) removeAnnotation(m)}
  });
  const search=document.querySelector('#find'),status=document.querySelector('#searchStatus');
  let lastQuery='',matchPages=[],matchCursor=-1;
  search.onkeydown=e=>{
    if(e.key!=='Enter') return;
    const q=search.value.trim().toLocaleLowerCase();
    if(!q){status.textContent='';return}
    if(q!==lastQuery){lastQuery=q;matchPages=all.map((p,i)=>p.textContent.toLocaleLowerCase().includes(q)?i:-1).filter(i=>i>=0);matchCursor=-1}
    if(matchPages.length){matchCursor=(matchCursor+1)%matchPages.length;const targetPage=matchPages[matchCursor];show(targetPage,true);status.textContent=(S.searchMatchWord+' '+nf(matchCursor+1)+' '+S.ofWord+' '+nf(matchPages.length)+' '+S.searchFoundIn+' '+nf(targetPage+1)+' '+S.searchFoundEnd).trim()}
    else{status.textContent=S.searchNotFound}
  };
})();
${scriptClose}
</body>
</html>`;
}

/* =========================================================
   استخراج متادیتا از Frontmatter یادداشت
   ========================================================= */

function formatFrontmatterValue(val, sep = '؛ ') {
  if (val === undefined || val === null) return '';
  if (Array.isArray(val)) {
    return val.map(v => String(v || '').replace(/^#/, '').trim()).filter(Boolean).join(sep);
  }
  return String(val).replace(/^#/, '').trim();
}

function extractNoteMetadata(app, file, settings, lang = 'fa') {
  const cache = app.metadataCache.getFileCache(file);
  const fm = (cache && cache.frontmatter) || {};
  const sep = lang === 'fa' ? '؛ ' : '; ';
  return {
    title: formatFrontmatterValue(fm.title || fm['عنوان'], sep) || file.basename,
    fileName: safeFileName(formatFrontmatterValue(fm.exportName, sep) || file.basename),
    docType: formatFrontmatterValue(fm.docType || fm.type || fm['نوع'], sep) || settings.docType || '',
    author: formatFrontmatterValue(fm.author || fm.authors || fm['نویسنده'] || fm['نویسندگان'], sep),
    subtitle: formatFrontmatterValue(fm.subtitle || fm['زیرعنوان'], sep),
    category: formatFrontmatterValue(fm.category || fm.categories || fm.tags || fm['موضوع'] || fm['موضوعات'], sep),
    year: formatFrontmatterValue(fm.year || fm.date || fm['سال'] || fm['تاریخ'], sep),
    description: formatFrontmatterValue(fm.description || fm.summary || fm['توضیحات'] || fm['معرفی'], sep)
  };
}

/* =========================================================
   پنجره تنظیمات و خروجی (Export Modal — دوزبانه)
   ========================================================= */

class NoraExportModal extends Modal {
  constructor(app, plugin, file, overrides = {}) {
    super(app);
    this.plugin = plugin;
    this.file = file;
    this.overrides = overrides;
    this.state = null;
    this.cachedMd = '';
  }

  async onOpen() {
    this.cachedMd = await this.app.vault.read(this.file);
    const uiLang = this.plugin.getUiLang();
    const meta = extractNoteMetadata(this.app, this.file, this.plugin.settings, uiLang);

    this.state = {
      ...meta,
      theme: this.overrides.theme || this.plugin.settings.theme,
      palette: this.overrides.palette || this.plugin.settings.palette,
      coverStyle: this.overrides.coverStyle || this.plugin.settings.coverStyle,
      direction: this.overrides.direction || this.plugin.settings.direction,
      fontSize: String(this.overrides.fontSize || this.plugin.settings.fontSize),
      width: this.overrides.width || this.plugin.settings.width,
      readerLanguage: this.overrides.readerLanguage || this.plugin.settings.readerLanguage,
      embedAttachments: this.plugin.settings.embedAttachments,
      openAfterExport: this.plugin.settings.openAfterExport
    };

    this.renderForm();
  }

  renderForm() {
    const { contentEl } = this;
    const uiLang = this.plugin.getUiLang();
    const t = I18N[uiLang];
    const state = this.state;

    contentEl.empty();
    this.modalEl.addClass('nora-modal');
    this.modalEl.toggleClass('nora-rtl', t.dir === 'rtl');
    this.modalEl.toggleClass('nora-ltr', t.dir === 'ltr');

    const bodyMd = stripFrontmatter(this.cachedMd);
    const stats = calcStats(bodyMd);
    const localTargets = collectLocalTargets(this.cachedMd);

    // Header + Quick Language Toggle
    const header = contentEl.createDiv({ cls: 'nora-modal-header' });
    header.createDiv({ cls: 'nora-modal-logo', text: t.logoChar });
    const titleWrap = header.createDiv({ cls: 'nora-modal-title-wrap' });
    titleWrap.createEl('h2', { text: t.modalTitle });
    titleWrap.createEl('p', { text: t.modalNoteLabel(this.file.path) });

    const headerActions = header.createDiv({ cls: 'nora-header-actions' });
    const batchBtn = headerActions.createEl('button', {
      cls: 'nora-lang-switch',
      text: t.btnBatchHeader,
      attr: { title: t.btnBatchHeaderTitle, type: 'button' }
    });
    batchBtn.addEventListener('click', () => {
      const parentFolder = this.file ? this.file.parent : this.app.vault.getRoot();
      this.close();
      new NoraFolderExportModal(this.app, this.plugin, parentFolder).open();
    });

    const langBtn = headerActions.createEl('button', {
      cls: 'nora-lang-switch',
      text: t.langSwitchLabel,
      attr: { title: t.langSwitchTitle, type: 'button' }
    });
    langBtn.addEventListener('click', async () => {
      await this.plugin.toggleUiLanguage();
      this.renderForm();
    });

    // Section 1: Cover & Metadata
    contentEl.createDiv({ cls: 'nora-section-title', text: t.sectionCover });
    const metaGrid = contentEl.createDiv({ cls: 'nora-grid' });

    const addInput = (parent, label, key, placeholder = '', wide = false, multiline = false) => {
      const wrap = parent.createDiv({ cls: 'nora-field' + (wide ? ' wide' : '') });
      wrap.createEl('label', { text: label });
      const el = multiline
        ? wrap.createEl('textarea', { attr: { placeholder, rows: '3' } })
        : wrap.createEl('input', { type: 'text', attr: { placeholder } });
      el.value = state[key] || '';
      el.addEventListener('input', () => { state[key] = el.value; });
      return el;
    };

    const addSelect = (parent, label, key, options, wide = false) => {
      const wrap = parent.createDiv({ cls: 'nora-field' + (wide ? ' wide' : '') });
      wrap.createEl('label', { text: label });
      const sel = wrap.createEl('select');
      options.forEach(([val, text]) => {
        const opt = sel.createEl('option', { value: val, text });
        if (val === state[key]) opt.selected = true;
      });
      sel.addEventListener('change', () => { state[key] = sel.value; });
      return sel;
    };

    addInput(metaGrid, t.fieldTitle, 'title', t.phTitle);
    addInput(metaGrid, t.fieldFileName, 'fileName', t.phFileName);
    addInput(metaGrid, t.fieldDocType, 'docType', t.phDocType);
    addInput(metaGrid, t.fieldAuthor, 'author', t.phAuthor);
    addInput(metaGrid, t.fieldSubtitle, 'subtitle', t.phSubtitle);
    addInput(metaGrid, t.fieldCategory, 'category', t.phCategory);
    addInput(metaGrid, t.fieldYear, 'year', t.phYear);
    addInput(metaGrid, t.fieldDescription, 'description', t.phDescription, true, true);

    // Section 2: Appearance & Language
    contentEl.createDiv({ cls: 'nora-section-title', text: t.sectionStyle });
    const styleGrid = contentEl.createDiv({ cls: 'nora-grid-3' });

    addSelect(styleGrid, t.fieldTheme, 'theme', [['light', t.optLight], ['dark', t.optDark]]);
    addSelect(styleGrid, t.fieldPalette, 'palette', t.palettes);
    addSelect(styleGrid, t.fieldCoverStyle, 'coverStyle', t.covers);
    addSelect(styleGrid, t.fieldDirection, 'direction', t.directions);
    addSelect(styleGrid, t.fieldFontSize, 'fontSize', t.fontSizes);
    addSelect(styleGrid, t.fieldWidth, 'width', t.widths);
    addSelect(styleGrid, t.fieldReaderLang, 'readerLanguage', t.readerLangs, true);

    // Toggles
    const toggleRow = contentEl.createDiv({ cls: 'nora-toggle-row' });
    const embedLabel = toggleRow.createEl('label');
    const embedCb = embedLabel.createEl('input', { type: 'checkbox' });
    embedCb.checked = state.embedAttachments;
    embedCb.addEventListener('change', () => { state.embedAttachments = embedCb.checked; });
    embedLabel.appendText(t.toggleEmbed);

    const openLabel = toggleRow.createEl('label');
    const openCb = openLabel.createEl('input', { type: 'checkbox' });
    openCb.checked = state.openAfterExport;
    openCb.addEventListener('change', () => { state.openAfterExport = openCb.checked; });
    openLabel.appendText(t.toggleOpen);

    // Stats bar
    const statsBar = contentEl.createDiv({ cls: 'nora-stats-bar' });
    statsBar.createSpan({ cls: 'nora-stat-pill', text: t.statWords(fmtNum(stats.words, uiLang)) });
    statsBar.createSpan({ cls: 'nora-stat-pill', text: t.statMinutes(fmtNum(stats.minutes, uiLang)) });
    statsBar.createSpan({ cls: 'nora-stat-pill', text: t.statAttach(fmtNum(localTargets.length, uiLang)) });

    // Action buttons
    const actions = contentEl.createDiv({ cls: 'nora-actions' });
    const leftGroup = actions.createDiv({ cls: 'nora-actions-group' });
    const rightGroup = actions.createDiv({ cls: 'nora-actions-group' });

    const previewBtn = leftGroup.createEl('button', { cls: 'nora-btn', text: t.btnPreview });
    previewBtn.addEventListener('click', async () => {
      await this.plugin.activatePreviewView(this.file, state);
      this.close();
    });

    const downloadBtn = rightGroup.createEl('button', { cls: 'nora-btn', text: t.btnDownload });
    downloadBtn.addEventListener('click', async () => {
      downloadBtn.disabled = true;
      try {
        await this.plugin.exportNote(this.file, state, { mode: 'download' });
        this.close();
      } finally {
        downloadBtn.disabled = false;
      }
    });

    const saveVaultBtn = rightGroup.createEl('button', { cls: 'nora-btn primary', text: t.btnSaveVault });
    saveVaultBtn.addEventListener('click', async () => {
      saveVaultBtn.disabled = true;
      try {
        await this.plugin.exportNote(this.file, state, { mode: 'vault' });
        this.close();
      } finally {
        saveVaultBtn.disabled = false;
      }
    });
  }

  onClose() {
    this.contentEl.empty();
  }
}

/* =========================================================
   پنجره خروجی دسته‌جمعی پوشه (Batch Folder Export Modal)
   ========================================================= */

class NoraFolderExportModal extends Modal {
  constructor(app, plugin, initialFolder = null) {
    super(app);
    this.plugin = plugin;
    this.initialFolder = initialFolder;
    this.state = {
      folderPath: initialFolder ? initialFolder.path : '/',
      includeSubfolders: true,
      preserveStructure: true,
      embedAttachments: plugin.settings.embedAttachments,
      openFolderAfter: true,
      theme: plugin.settings.theme,
      palette: plugin.settings.palette,
      coverStyle: plugin.settings.coverStyle,
      direction: plugin.settings.direction,
      fontSize: String(plugin.settings.fontSize),
      width: plugin.settings.width,
      readerLanguage: plugin.settings.readerLanguage
    };
  }

  getAllFolders() {
    const folders = this.app.vault.getAllLoadedFiles()
      .filter(f => f instanceof TFolder)
      .sort((a, b) => a.path.localeCompare(b.path));
    return folders;
  }

  getMarkdownFilesInFolder(folderPath, includeSubfolders) {
    const folder = folderPath === '/' || !folderPath
      ? this.app.vault.getRoot()
      : this.app.vault.getAbstractFileByPath(folderPath);
    if (!(folder instanceof TFolder)) return [];

    const out = [];
    const walk = dir => {
      for (const child of dir.children || []) {
        if (child instanceof TFile && child.extension === 'md') {
          out.push(child);
        } else if (includeSubfolders && child instanceof TFolder) {
          // از پردازش خود پوشه خروجی جلوگیری کن
          const expFolder = normalizePath((this.plugin.settings.exportFolder || '').trim());
          if (expFolder && normalizePath(child.path) === expFolder) continue;
          walk(child);
        }
      }
    };
    walk(folder);
    return out.sort((a, b) => a.path.localeCompare(b.path));
  }

  onOpen() {
    this.renderForm();
  }

  renderForm() {
    const { contentEl } = this;
    const uiLang = this.plugin.getUiLang();
    const t = I18N[uiLang];
    const state = this.state;

    contentEl.empty();
    this.modalEl.addClass('nora-modal');
    this.modalEl.toggleClass('nora-rtl', t.dir === 'rtl');
    this.modalEl.toggleClass('nora-ltr', t.dir === 'ltr');

    const header = contentEl.createDiv({ cls: 'nora-modal-header' });
    header.createDiv({ cls: 'nora-modal-logo', text: t.logoChar });
    const titleWrap = header.createDiv({ cls: 'nora-modal-title-wrap' });
    titleWrap.createEl('h2', { text: t.folderModalTitle });
    titleWrap.createEl('p', { text: t.folderModalDesc });

    const langBtn = header.createEl('button', {
      cls: 'nora-lang-switch',
      text: t.langSwitchLabel,
      attr: { title: t.langSwitchTitle, type: 'button' }
    });
    langBtn.addEventListener('click', async () => {
      await this.plugin.toggleUiLanguage();
      this.renderForm();
    });

    // انتخاب پوشه
    const folders = this.getAllFolders();
    const folderWrap = contentEl.createDiv({ cls: 'nora-field wide' });
    folderWrap.createEl('label', { text: t.fieldSelectFolder });
    const folderSel = folderWrap.createEl('select');
    folders.forEach(f => {
      const label = f.path === '/' ? t.vaultRootLabel : f.path;
      const opt = folderSel.createEl('option', { value: f.path, text: label });
      if (f.path === state.folderPath) opt.selected = true;
    });

    // گزینه‌های پوشه
    const folderOptsRow = contentEl.createDiv({ cls: 'nora-toggle-row' });

    const subLabel = folderOptsRow.createEl('label');
    const subCb = subLabel.createEl('input', { type: 'checkbox' });
    subCb.checked = state.includeSubfolders;
    subLabel.appendText(t.toggleSubfolders);

    const treeLabel = folderOptsRow.createEl('label');
    const treeCb = treeLabel.createEl('input', { type: 'checkbox' });
    treeCb.checked = state.preserveStructure;
    treeCb.addEventListener('change', () => { state.preserveStructure = treeCb.checked; });
    treeLabel.appendText(t.togglePreserveTree);

    // آمار زنده فایل‌ها و مسیر خروجی
    const statsBar = contentEl.createDiv({ cls: 'nora-stats-bar' });
    const countPill = statsBar.createSpan({ cls: 'nora-stat-pill' });
    const destPill = statsBar.createSpan({ cls: 'nora-stat-pill' });

    // تنظیمات ظاهر
    contentEl.createDiv({ cls: 'nora-section-title', text: t.sectionStyle });
    const styleGrid = contentEl.createDiv({ cls: 'nora-grid-3' });

    const addSelect = (parent, label, key, options, wide = false) => {
      const wrap = parent.createDiv({ cls: 'nora-field' + (wide ? ' wide' : '') });
      wrap.createEl('label', { text: label });
      const sel = wrap.createEl('select');
      options.forEach(([val, text]) => {
        const opt = sel.createEl('option', { value: val, text });
        if (val === state[key]) opt.selected = true;
      });
      sel.addEventListener('change', () => { state[key] = sel.value; });
      return sel;
    };

    addSelect(styleGrid, t.fieldTheme, 'theme', [['light', t.optLight], ['dark', t.optDark]]);
    addSelect(styleGrid, t.fieldPalette, 'palette', t.palettes);
    addSelect(styleGrid, t.fieldCoverStyle, 'coverStyle', t.covers);
    addSelect(styleGrid, t.fieldDirection, 'direction', t.directions);
    addSelect(styleGrid, t.fieldFontSize, 'fontSize', t.fontSizes);
    addSelect(styleGrid, t.fieldWidth, 'width', t.widths);
    addSelect(styleGrid, t.fieldReaderLang, 'readerLanguage', t.readerLangs, true);

    const extraRow = contentEl.createDiv({ cls: 'nora-toggle-row' });
    const embedLabel = extraRow.createEl('label');
    const embedCb = embedLabel.createEl('input', { type: 'checkbox' });
    embedCb.checked = state.embedAttachments;
    embedCb.addEventListener('change', () => { state.embedAttachments = embedCb.checked; });
    embedLabel.appendText(t.toggleEmbed);

    const openDirLabel = extraRow.createEl('label');
    const openDirCb = openDirLabel.createEl('input', { type: 'checkbox' });
    openDirCb.checked = state.openFolderAfter;
    openDirCb.addEventListener('change', () => { state.openFolderAfter = openDirCb.checked; });
    openDirLabel.appendText(t.toggleOpenFolder);

    // نوار پیشرفت
    const progressBox = contentEl.createDiv({ cls: 'nora-progress-box' });
    const progressText = progressBox.createDiv({ cls: 'nora-progress-text' });
    const progressTrack = progressBox.createDiv({ cls: 'nora-progress-track' });
    const progressFill = progressTrack.createDiv({ cls: 'nora-progress-fill' });

    // دکمه‌ها
    const actions = contentEl.createDiv({ cls: 'nora-actions' });
    actions.createDiv({ cls: 'nora-actions-group' });
    const rightGroup = actions.createDiv({ cls: 'nora-actions-group' });
    const startBtn = rightGroup.createEl('button', { cls: 'nora-btn primary', text: t.btnStartBatch });

    const getDestBase = () => {
      const baseExport = (this.plugin.settings.exportFolder || 'Nora Exports').trim() || 'Nora Exports';
      const folderName = state.folderPath === '/' ? 'Vault-Root' : safeFileName(state.folderPath.split('/').pop());
      return normalizePath(`${baseExport}/${folderName}`);
    };

    const refreshCount = () => {
      const files = this.getMarkdownFilesInFolder(state.folderPath, state.includeSubfolders);
      countPill.textContent = t.statFolderNotes(fmtNum(files.length, uiLang));
      destPill.textContent = t.statExportDest(getDestBase());
      startBtn.disabled = files.length === 0;
    };

    folderSel.addEventListener('change', () => {
      state.folderPath = folderSel.value;
      refreshCount();
    });
    subCb.addEventListener('change', () => {
      state.includeSubfolders = subCb.checked;
      refreshCount();
    });

    refreshCount();

    startBtn.addEventListener('click', async () => {
      const files = this.getMarkdownFilesInFolder(state.folderPath, state.includeSubfolders);
      if (!files.length) {
        new Notice(t.batchNoNotes);
        return;
      }

      startBtn.disabled = true;
      folderSel.disabled = true;
      progressBox.addClass('active');

      try {
        await this.plugin.exportMergedFolder(files, state, {
          folderPath: state.folderPath,
          onProgress: (index, total, file) => {
            progressText.textContent = t.batchProgress(fmtNum(index, uiLang), fmtNum(total, uiLang), file.basename);
            progressFill.style.width = `${Math.round((index / total) * 100)}%`;
          }
        });
        this.close();
      } catch (err) {
        console.error('[Nora HTML Exporter] Merged folder export error:', err);
        new Notice(t.noticeError(err.message || err));
        startBtn.disabled = false;
        folderSel.disabled = false;
      }
    });
  }

  onClose() {
    this.contentEl.empty();
  }
}

/* =========================================================
   پنل پیش‌نمایش زنده (Live Preview Side View — دوزبانه)
   ========================================================= */

class NoraPreviewView extends ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.currentFile = null;
    this.viewPrefs = {
      theme: plugin.settings.theme,
      palette: plugin.settings.palette,
      coverStyle: plugin.settings.coverStyle,
      direction: plugin.settings.direction,
      readerLanguage: plugin.settings.readerLanguage
    };
    this.debounceTimer = null;
  }

  getViewType() { return VIEW_TYPE_NORA_PREVIEW; }
  getDisplayText() { return I18N[this.plugin.getUiLang()].viewDisplayText; }
  getIcon() { return 'book-open'; }

  async onOpen() {
    this.buildUi();

    this.registerEvent(this.app.workspace.on('active-leaf-change', () => {
      const active = this.app.workspace.getActiveFile();
      if (active && active.extension === 'md') {
        this.currentFile = active;
        this.scheduleRefresh();
      }
    }));

    this.registerEvent(this.app.vault.on('modify', file => {
      if (this.currentFile && file.path === this.currentFile.path) {
        this.scheduleRefresh();
      }
    }));

    const initial = this.currentFile || this.app.workspace.getActiveFile();
    if (initial && initial.extension === 'md') {
      this.currentFile = initial;
    }
    await this.refresh();
  }

  buildUi() {
    const uiLang = this.plugin.getUiLang();
    const t = I18N[uiLang];
    const container = this.containerEl.children[1];
    container.empty();
    container.addClass('nora-preview-root');
    container.toggleClass('nora-rtl', t.dir === 'rtl');
    container.toggleClass('nora-ltr', t.dir === 'ltr');

    const toolbar = container.createDiv({ cls: 'nora-preview-toolbar' });
    const brand = toolbar.createDiv({ cls: 'nora-preview-brand' });
    brand.createDiv({ cls: 'nora-preview-dot', text: t.logoChar });
    this.titleSpan = brand.createSpan({ text: t.viewBrandDefault });

    const controls = toolbar.createDiv({ cls: 'nora-preview-controls' });

    const langBtn = controls.createEl('button', {
      text: t.langSwitchLabel,
      attr: { title: t.langSwitchTitle, type: 'button' }
    });
    langBtn.onclick = async () => {
      await this.plugin.toggleUiLanguage();
    };

    this.themeSel = controls.createEl('select', { attr: { title: t.fieldTheme } });
    [['light', t.optLight], ['dark', t.optDark]].forEach(([v, label]) => {
      const o = this.themeSel.createEl('option', { value: v, text: label });
      if (v === this.viewPrefs.theme) o.selected = true;
    });
    this.themeSel.onchange = () => { this.viewPrefs.theme = this.themeSel.value; this.refresh(); };

    this.paletteSel = controls.createEl('select', { attr: { title: t.fieldPalette } });
    t.palettes.forEach(([v, label]) => {
      const o = this.paletteSel.createEl('option', { value: v, text: label });
      if (v === this.viewPrefs.palette) o.selected = true;
    });
    this.paletteSel.onchange = () => { this.viewPrefs.palette = this.paletteSel.value; this.refresh(); };

    this.coverSel = controls.createEl('select', { attr: { title: t.fieldCoverStyle } });
    t.covers.forEach(([v, label]) => {
      const o = this.coverSel.createEl('option', { value: v, text: label });
      if (v === this.viewPrefs.coverStyle) o.selected = true;
    });
    this.coverSel.onchange = () => { this.viewPrefs.coverStyle = this.coverSel.value; this.refresh(); };

    const exportBtn = controls.createEl('button', { cls: 'nora-export-mini', text: t.viewExportBtn });
    exportBtn.onclick = () => {
      const targetFile = this.currentFile || this.app.workspace.getActiveFile();
      if (!targetFile) {
        new Notice(I18N[this.plugin.getUiLang()].noticeOpenMdFirst);
        return;
      }
      new NoraExportModal(this.app, this.plugin, targetFile, this.viewPrefs).open();
    };

    this.iframe = container.createEl('iframe', { cls: 'nora-preview-iframe' });
    this.emptyState = container.createDiv({ cls: 'nora-preview-empty' });
    this.emptyState.createDiv({ cls: 'big', text: '📖' });
    this.emptyState.createDiv({ text: t.viewEmptyText });
  }

  setFileAndPrefs(file, prefs = {}) {
    if (file) this.currentFile = file;
    if (prefs.theme) { this.viewPrefs.theme = prefs.theme; if (this.themeSel) this.themeSel.value = prefs.theme; }
    if (prefs.palette) { this.viewPrefs.palette = prefs.palette; if (this.paletteSel) this.paletteSel.value = prefs.palette; }
    if (prefs.coverStyle) { this.viewPrefs.coverStyle = prefs.coverStyle; if (this.coverSel) this.coverSel.value = prefs.coverStyle; }
    if (prefs.direction) this.viewPrefs.direction = prefs.direction;
    if (prefs.readerLanguage) this.viewPrefs.readerLanguage = prefs.readerLanguage;
    this.scheduleRefresh();
  }

  scheduleRefresh() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.refresh(), 300);
  }

  async refresh() {
    if (!this.iframe) return;
    const uiLang = this.plugin.getUiLang();
    const t = I18N[uiLang];

    if (!this.currentFile || this.currentFile.extension !== 'md') {
      this.iframe.style.display = 'none';
      this.emptyState.style.display = 'flex';
      return;
    }
    this.iframe.style.display = 'block';
    this.emptyState.style.display = 'none';
    this.titleSpan.textContent = t.viewBrandNote(this.currentFile.basename);

    const md = await this.app.vault.read(this.currentFile);
    const effectiveReaderLang = resolveReaderLang(this.viewPrefs.readerLanguage, md, uiLang);
    const meta = extractNoteMetadata(this.app, this.currentFile, this.plugin.settings, effectiveReaderLang);
    const attachmentsMap = await resolveAttachmentsMap(this.app, md, this.currentFile, {
      forExport: false,
      embedAttachments: false
    });

    const html = buildStandaloneHtml(md, {
      ...meta,
      ...this.viewPrefs,
      uiLang,
      fontSize: this.plugin.settings.fontSize,
      width: this.plugin.settings.width,
      forExport: false
    }, attachmentsMap);

    this.iframe.srcdoc = html;
  }

  async onClose() {
    clearTimeout(this.debounceTimer);
  }
}

/* =========================================================
   تب تنظیمات پلاگین (Settings Tab — دوزبانه)
   ========================================================= */

class NoraSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    const uiLang = this.plugin.getUiLang();
    const t = I18N[uiLang];

    containerEl.empty();
    containerEl.addClass('nora-settings');
    containerEl.toggleClass('nora-rtl', t.dir === 'rtl');
    containerEl.toggleClass('nora-ltr', t.dir === 'ltr');

    containerEl.createEl('h2', { text: t.settingsHeading });

    new Setting(containerEl)
      .setName(t.setUiLangName)
      .setDesc(t.setUiLangDesc)
      .addDropdown(dd => dd
        .addOption('fa', 'فارسی (Persian)')
        .addOption('en', 'English')
        .addOption('auto', t.setUiLangAuto)
        .setValue(this.plugin.settings.uiLanguage)
        .onChange(async val => {
          this.plugin.settings.uiLanguage = val;
          await this.plugin.saveSettings();
          this.plugin.refreshOpenPreviews();
          this.display();
        }));

    new Setting(containerEl)
      .setName(t.setReaderLangName)
      .setDesc(t.setReaderLangDesc)
      .addDropdown(dd => {
        t.readerLangs.forEach(([v, label]) => dd.addOption(v, label));
        return dd.setValue(this.plugin.settings.readerLanguage)
          .onChange(async val => {
            this.plugin.settings.readerLanguage = val;
            await this.plugin.saveSettings();
            this.plugin.refreshOpenPreviews();
          });
      });

    new Setting(containerEl)
      .setName(t.setFolderName)
      .setDesc(t.setFolderDesc)
      .addText(text => text
        .setPlaceholder(t.setFolderPh)
        .setValue(this.plugin.settings.exportFolder)
        .onChange(async val => {
          this.plugin.settings.exportFolder = val.trim();
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(t.setDocTypeName)
      .setDesc(t.setDocTypeDesc)
      .addText(text => text
        .setPlaceholder(t.phDocType)
        .setValue(this.plugin.settings.docType)
        .onChange(async val => {
          this.plugin.settings.docType = val.trim();
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(t.setThemeName)
      .addDropdown(dd => dd
        .addOption('light', t.optLight)
        .addOption('dark', t.optDark)
        .setValue(this.plugin.settings.theme)
        .onChange(async val => {
          this.plugin.settings.theme = val;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(t.setPaletteName)
      .addDropdown(dd => {
        t.palettes.forEach(([v, label]) => dd.addOption(v, label));
        return dd.setValue(this.plugin.settings.palette)
          .onChange(async val => {
            this.plugin.settings.palette = val;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName(t.setCoverName)
      .addDropdown(dd => {
        t.covers.forEach(([v, label]) => dd.addOption(v, label));
        return dd.setValue(this.plugin.settings.coverStyle)
          .onChange(async val => {
            this.plugin.settings.coverStyle = val;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName(t.setDirName)
      .addDropdown(dd => {
        t.directions.forEach(([v, label]) => dd.addOption(v, label));
        return dd.setValue(this.plugin.settings.direction)
          .onChange(async val => {
            this.plugin.settings.direction = val;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName(t.setEmbedName)
      .setDesc(t.setEmbedDesc)
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.embedAttachments)
        .onChange(async val => {
          this.plugin.settings.embedAttachments = val;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(t.setOpenName)
      .setDesc(t.setOpenDesc)
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.openAfterExport)
        .onChange(async val => {
          this.plugin.settings.openAfterExport = val;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(t.setChapterHeadingName)
      .setDesc(t.setChapterHeadingDesc)
      .addDropdown(dd => {
        for (let level = 1; level <= 6; level++) {
          dd.addOption(String(level), `H${level}`);
        }
        return dd.setValue(String(this.plugin.settings.chapterHeadingLevel || '1'))
          .onChange(async val => {
            this.plugin.settings.chapterHeadingLevel = val;
            await this.plugin.saveSettings();
          });
      });

    this.addSupportSection(containerEl, uiLang === 'fa');
  }

  addSupportSection(container, fa) {
    const t = I18N[fa ? 'fa' : 'en'];
    const root = container.createDiv({ cls: 'nora-support' });
    root.setAttribute('dir', fa ? 'rtl' : 'ltr');
    root.createEl('h3', { cls: 'nora-support-heading', text: t.supportHeading });
    root.createEl('p', { cls: 'nora-support-intro', text: t.supportIntro });

    const grid = root.createDiv({ cls: 'nora-channel-grid' });
    const channels = [
      [fa ? 'بله' : 'Bale', 'https://ble.ir/obsidiantut'],
      [fa ? 'تلگرام' : 'Telegram', 'https://t.me/obsidiantut'],
      [fa ? 'یوتیوب' : 'YouTube', 'https://youtube.com/@obsidiantut']
    ];
    for (const [name, url] of channels) {
      const card = grid.createEl('a', { cls: 'nora-channel' });
      card.href = url;
      card.setAttribute('target', '_blank');
      card.setAttribute('rel', 'noopener noreferrer');
      card.setAttribute('aria-label', (fa ? 'عضویت در کانال ' : 'Join our ') + name);
      const logoSpan = card.createSpan({ cls: 'nora-channel-logo' });
      noraSupportLogo(logoSpan, name === 'Bale' || name === 'بله' ? 'bale' : name === 'Telegram' || name === 'تلگرام' ? 'telegram' : 'youtube');
      card.createSpan({ cls: 'nora-channel-name', text: name });
      card.createSpan({ cls: 'nora-channel-handle', text: '@obsidiantut' });
      card.createSpan({ cls: 'nora-channel-join', text: t.supportJoin });
    }

    const donation = root.createDiv({ cls: 'nora-donation' });
    const donationIcon = donation.createDiv({ cls: 'nora-donation-icon' });
    noraSupportLogo(donationIcon, 'heart');
    const copy = donation.createDiv({ cls: 'nora-donation-copy' });
    copy.createEl('h4', { cls: 'nora-donation-title', text: t.supportDonationTitle });
    copy.createEl('p', { cls: 'nora-donation-desc', text: t.supportDonationDesc });
    const button = donation.createEl('a', { cls: 'nora-donation-button', text: t.supportDonate });
    button.href = 'https://reymit.ir/singhaf9270';
    button.setAttribute('target', '_blank');
    button.setAttribute('rel', 'noopener noreferrer');
  }
}

/* ===== SVG logos for community links (matching Puyan) ===== */
const NORA_SVG_NS = 'http://www.w3.org/2000/svg';
function noraMakeSvg(parent, viewBox, children) {
  const svg = document.createElementNS(NORA_SVG_NS, 'svg');
  svg.setAttribute('viewBox', viewBox);
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.8');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  for (const [tag, attrs] of children) {
    const node = document.createElementNS(NORA_SVG_NS, tag);
    for (const key in attrs) node.setAttribute(key, attrs[key]);
    svg.appendChild(node);
  }
  parent.appendChild(svg);
  return svg;
}
function noraSupportLogo(parent, type) {
  if (type === 'bale') return noraMakeSvg(parent, '0 0 24 24', [
    ['path', { d: 'M4 5h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H8l-4 4V7a2 2 0 0 1 2-2z' }],
    ['path', { d: 'M8 10h8M8 14h5' }]
  ]);
  if (type === 'telegram') return noraMakeSvg(parent, '0 0 24 24', [
    ['path', { d: 'M22 3 11 14' }],
    ['path', { d: 'M22 3 15 21l-4-7-7-4 18-7z' }]
  ]);
  if (type === 'youtube') return noraMakeSvg(parent, '0 0 24 24', [
    ['rect', { x: '2', y: '5', width: '20', height: '14', rx: '3.5' }],
    ['path', { d: 'm10 9 5 3-5 3V9z', fill: 'currentColor', stroke: 'none' }]
  ]);
  if (type === 'heart') return noraMakeSvg(parent, '0 0 24 24', [
    ['path', { d: 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z' }]
  ]);
  return null;
}

/* =========================================================
   کلاس اصلی پلاگین
   ========================================================= */

class NoraHtmlExporterPlugin extends Plugin {
  getUiLang() {
    return resolveUiLang(this.settings ? this.settings.uiLanguage : 'fa');
  }

  async toggleUiLanguage() {
    const current = this.getUiLang();
    this.settings.uiLanguage = current === 'fa' ? 'en' : 'fa';
    await this.saveSettings();
    this.refreshOpenPreviews();
  }

  refreshOpenPreviews() {
    this.app.workspace.getLeavesOfType(VIEW_TYPE_NORA_PREVIEW).forEach(leaf => {
      if (leaf.view instanceof NoraPreviewView) {
        leaf.view.buildUi();
        leaf.view.refresh();
      }
    });
  }

  async onload() {
    await this.loadSettings();
    const t = I18N[this.getUiLang()];

    this.registerView(
      VIEW_TYPE_NORA_PREVIEW,
      leaf => new NoraPreviewView(leaf, this)
    );

    this.addRibbonIcon('book-open', t.ribbonTooltip, () => {
      const file = this.app.workspace.getActiveFile();
      if (!file || file.extension !== 'md') {
        new Notice(I18N[this.getUiLang()].noticeOpenMdFirst);
        return;
      }
      new NoraExportModal(this.app, this, file).open();
    });

    this.addCommand({
      id: 'nora-export-modal',
      name: `${I18N.en.cmdExportModal} | ${I18N.fa.cmdExportModal}`,
      checkCallback: checking => {
        const file = this.app.workspace.getActiveFile();
        if (file && file.extension === 'md') {
          if (!checking) new NoraExportModal(this.app, this, file).open();
          return true;
        }
        return false;
      }
    });

    this.addCommand({
      id: 'nora-quick-export',
      name: `${I18N.en.cmdQuickExport} | ${I18N.fa.cmdQuickExport}`,
      checkCallback: checking => {
        const file = this.app.workspace.getActiveFile();
        if (file && file.extension === 'md') {
          if (!checking) {
            const uiLang = this.getUiLang();
            const meta = extractNoteMetadata(this.app, file, this.settings, uiLang);
            this.exportNote(file, { ...meta, ...this.settings }, { mode: 'vault' });
          }
          return true;
        }
        return false;
      }
    });

    this.addCommand({
      id: 'nora-open-live-preview',
      name: `${I18N.en.cmdLivePreview} | ${I18N.fa.cmdLivePreview}`,
      callback: () => {
        const file = this.app.workspace.getActiveFile();
        this.activatePreviewView(file && file.extension === 'md' ? file : null);
      }
    });

    this.addCommand({
      id: 'nora-batch-folder-export',
      name: `${I18N.en.cmdFolderExport} | ${I18N.fa.cmdFolderExport}`,
      callback: () => {
        const active = this.app.workspace.getActiveFile();
        const initialFolder = active && active.parent ? active.parent : this.app.vault.getRoot();
        new NoraFolderExportModal(this.app, this, initialFolder).open();
      }
    });

    this.registerEvent(
      this.app.workspace.on('file-menu', (menu, file) => {
        const curT = I18N[this.getUiLang()];
        if (file instanceof TFile && file.extension === 'md') {
          menu.addItem(item => {
            item
              .setTitle(curT.menuExport)
              .setIcon('book-open')
              .onClick(() => new NoraExportModal(this.app, this, file).open());
          });
          menu.addItem(item => {
            item
              .setTitle(curT.menuPreview)
              .setIcon('eye')
              .onClick(() => this.activatePreviewView(file));
          });
        } else if (file instanceof TFolder) {
          menu.addItem(item => {
            item
              .setTitle(curT.menuFolderExport)
              .setIcon('folder-output')
              .onClick(() => new NoraFolderExportModal(this.app, this, file).open());
          });
        }
      })
    );

    this.addSettingTab(new NoraSettingTab(this.app, this));
  }

  onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_NORA_PREVIEW);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async activatePreviewView(file = null, prefs = {}) {
    const { workspace } = this.app;
    let leaf = workspace.getLeavesOfType(VIEW_TYPE_NORA_PREVIEW)[0];
    if (!leaf) {
      leaf = workspace.getRightLeaf(false) || workspace.getLeaf('split');
      await leaf.setViewState({ type: VIEW_TYPE_NORA_PREVIEW, active: true });
    }
    workspace.revealLeaf(leaf);
    if (leaf.view instanceof NoraPreviewView) {
      leaf.view.setFileAndPrefs(file, prefs);
    }
  }

  async ensureFolderExists(folderPath) {
    const clean = normalizePath(String(folderPath || '').trim());
    if (!clean || clean === '/') return;
    const segments = clean.split('/').filter(Boolean);
    let current = '';
    for (const seg of segments) {
      current = current ? `${current}/${seg}` : seg;
      const exists = await this.app.vault.adapter.exists(current);
      if (!exists) {
        try {
          await this.app.vault.createFolder(current);
        } catch (e) {
          // اگر هم‌زمان ایجاد شده باشد بی‌صدا ادامه بده
        }
      }
    }
  }

  async exportNote(file, options, { mode = 'vault' } = {}) {
    const uiLang = this.getUiLang();
    const t = I18N[uiLang];
    try {
      const md = await this.app.vault.read(file);
      const embed = options.embedAttachments !== undefined ? options.embedAttachments : this.settings.embedAttachments;
      const attachmentsMap = await resolveAttachmentsMap(this.app, md, file, {
        forExport: true,
        embedAttachments: embed
      });

      const html = buildStandaloneHtml(md, { ...options, uiLang, forExport: true }, attachmentsMap);
      const outName = safeFileName(options.fileName || options.title || file.basename) + '.html';

      if (mode === 'download') {
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = outName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
        new Notice(t.noticeDownloaded(outName));
        return;
      }

      const folder = (this.settings.exportFolder || '').trim();
      let targetDir = folder ? normalizePath(folder) : (file.parent ? file.parent.path : '');
      if (targetDir && targetDir !== '/') {
        await this.ensureFolderExists(targetDir);
      }
      const targetPath = normalizePath(targetDir && targetDir !== '/' ? `${targetDir}/${outName}` : outName);
      await this.app.vault.adapter.write(targetPath, html);
      new Notice(t.noticeSaved(targetPath));

      const shouldOpen = options.openAfterExport !== undefined ? options.openAfterExport : this.settings.openAfterExport;
      if (shouldOpen) {
        this.openFileInSystemBrowser(targetPath);
      }
    } catch (err) {
      console.error('[Nora HTML Exporter] Export error:', err);
      new Notice(t.noticeError(err.message || err));
    }
  }

  async exportMergedFolder(files, state, { folderPath = '/', onProgress = null } = {}) {
    if (!Array.isArray(files) || files.length === 0) {
      throw new Error('No Markdown files were selected.');
    }

    const uiLang = this.getUiLang();
    const t = I18N[uiLang];
    const combinedParts = [];
    const attachmentsMap = new Map();

    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      if (typeof onProgress === 'function') onProgress(index + 1, files.length, file);

      const markdown = await this.app.vault.read(file);
      const cleanMarkdown = stripFrontmatter(markdown);
      const sectionTitle = file.basename || file.name;

      // Each source note starts a new chapter using the configured heading level.
      const chapterLevel = Math.min(6, Math.max(1, parseInt(this.settings.chapterHeadingLevel, 10) || 1));
      const chapterHeading = '#'.repeat(chapterLevel);
      combinedParts.push(`${chapterHeading} NORA_CHAPTER_START::${sectionTitle}\n\n${cleanMarkdown}`);

      const noteAttachments = await resolveAttachmentsMap(this.app, markdown, file, {
        forExport: true,
        embedAttachments: state.embedAttachments
      });
      for (const [key, value] of noteAttachments.entries()) {
        attachmentsMap.set(key, value);
      }
    }

    const combinedMarkdown = combinedParts.join('\n\n---\n\n');
    const folderLabel = folderPath === '/' ? 'Vault' : folderPath.split('/').pop();
    const html = buildStandaloneHtml(combinedMarkdown, {
      title: folderLabel || 'Nora Collection',
      fileName: safeFileName(folderLabel || 'Nora-Collection'),
      docType: uiLang === 'fa' ? 'مجموعه یادداشت‌ها' : 'Note Collection',
      description: uiLang === 'fa'
        ? `مجموعه‌ای شامل ${files.length} یادداشت از پوشه ${folderPath}`
        : `A collection of ${files.length} notes from ${folderPath}`,
      theme: state.theme,
      palette: state.palette,
      coverStyle: state.coverStyle,
      direction: state.direction,
      fontSize: state.fontSize,
      width: state.width,
      readerLanguage: state.readerLanguage,
      chapterHeadingLevel: this.settings.chapterHeadingLevel || '1',
      splitMarkedChaptersOnly: true,
      uiLang,
      forExport: true
    }, attachmentsMap);

    const baseExport = (this.settings.exportFolder || 'Nora Exports').trim() || 'Nora Exports';
    const folderName = folderPath === '/' ? 'Vault-Root' : safeFileName(folderLabel);
    const targetDir = normalizePath(`${baseExport}/${folderName}`);
    await this.ensureFolderExists(targetDir);

    const outName = safeFileName(folderLabel || 'Nora-Collection') + '-Complete.html';
    const targetPath = normalizePath(`${targetDir}/${outName}`);
    await this.app.vault.adapter.write(targetPath, html);

    new Notice(t.mergedExportDone(outName, fmtNum(files.length, uiLang), targetPath), 7000);
    if (state.openFolderAfter) this.openFileInSystemBrowser(targetPath);
    return targetPath;
  }

  openFileInSystemBrowser(vaultRelativePath) {
    try {
      const adapter = this.app.vault.adapter;
      if (typeof adapter.getBasePath === 'function') {
        const pathMod = window.require('path');
        const electron = window.require('electron');
        const fullPath = pathMod.join(adapter.getBasePath(), vaultRelativePath);
        if (electron && electron.shell && typeof electron.shell.openPath === 'function') {
          electron.shell.openPath(fullPath);
        }
      }
    } catch (e) {
      // Silently ignore on mobile or non-Electron environments
    }
  }
}

module.exports = NoraHtmlExporterPlugin;
