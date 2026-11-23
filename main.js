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
  normalizePath,
  requestUrl,
  loadMermaid,
  loadMathJax,
  renderMath,
  finishRenderMath
} = require('obsidian');

const VIEW_TYPE_NORA_PREVIEW = 'nora-html-live-preview';

const DEFAULT_SETTINGS = {
  uiLanguage: 'fa',        // 'fa' | 'en' | 'auto'
  readerLanguage: 'auto',  // 'auto' | 'fa' | 'en'
  theme: 'light',
  palette: 'default',
  coverStyle: 'aurora',
  direction: 'auto',
  fontFamily: 'Vazirmatn',
  fontSize: 16,
  width: '850',
  readingMode: 'paginated',
  docType: '',
  exportFolder: 'Nora Exports',
  embedAttachments: true,
  openAfterExport: true,
  saveMetadataToFrontmatter: true,
  chapterHeadingLevel: '1',
  customCssPath: '',
  customCss: '',
  lastSeenVersion: '',
  guideDownloaded: false
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
    fieldFontFamily: 'فونت متن',
    fieldFontSize: 'اندازه قلم',
    fieldWidth: 'عرض صفحه',
    fieldReadingMode: 'حالت مطالعه',
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
    fontFamilies: [
      ['Vazirmatn', 'وزیرمتن (Vazirmatn — فارسی و انگلیسی)'],
      ['Inter', 'Inter'],
      ['Tahoma', 'Tahoma'],
      ['Georgia', 'Georgia'],
      ['system-ui', 'فونت سیستم (System UI)']
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
    readingModes: [
      ['paginated', 'فصل‌به‌فصل (صفحه‌بندی)'],
      ['scroll', 'تمام اسکرول (پیوسته)']
    ],
    readerLangs: [
      ['auto', 'تشخیص خودکار از متن'],
      ['fa', 'فارسی (FA)'],
      ['en', 'انگلیسی (EN)']
    ],

    toggleEmbed: 'تعبیه خودکار عکس‌ها و پیوست‌های Vault داخل HTML (کاملاً آفلاین)',
    toggleOpen: 'باز کردن در مرورگر پس از ساخت',
    toggleSaveFrontmatter: 'ذخیره مشخصات جلد در Frontmatter یادداشت',
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
    setFontFamilyName: 'فونت پیش‌فرض خوانشگر',
    setReadingModeName: 'حالت مطالعه پیش‌فرض',
    setEmbedName: 'تعبیه خودکار پیوست‌ها (Base64)',
    setEmbedDesc: 'تصاویر، صوت، ویدیو و PDFهای داخل Vault به صورت خودکار داخل فایل HTML قرار می‌گیرند تا فایل کاملاً مستقل و آفلاین باشد.',
    setOpenName: 'باز کردن خودکار در مرورگر پس از ذخیره',
    setOpenDesc: 'در نسخه دسکتاپ، بلافاصله بعد از ساخت HTML آن را در مرورگر پیش‌فرض سیستم باز می‌کند.',
    setSaveFrontmatterName: 'ذخیره خودکار مشخصات جلد در Frontmatter یادداشت',
    setSaveFrontmatterDesc: 'هنگام خروجی گرفتن، مشخصات جلد (عنوان، نویسنده، زیرعنوان، موضوع، سال، نوع اثر و توضیحات) را در Properties یادداشت ذخیره می‌کند تا در خروجی‌های بعدی خودکار پر شوند.',
    setChapterHeadingName: 'سطح هدینگ شروع فصل در خروجی یکپارچه',
    setChapterHeadingDesc: 'عنوان هر فایل به‌عنوان شروع یک فصل درج می‌شود. سطح هدینگ را برای فصل‌ها انتخاب کنید (H1 تا H6).',
    setCustomCssFileName: 'انتخاب اسنیپت CSS از Vault (اختیاری)',
    setCustomCssFileDesc: 'فقط فایل‌های CSS موجود در پوشه snippets ابسیدین (یا Vault) که نامشان با nora شروع می‌شود نمایش داده می‌شوند (مثل nora-sepia.css).',
    setCustomCssNone: 'بدون فایل CSS (غیرفعال)',
    setCustomCssRefresh: 'به‌روزرسانی لیست اسنیپت‌ها',
    setCustomCssName: 'کد CSS سفارشی (Custom CSS)',
    setCustomCssDesc: 'کدهای CSS دلخواه شما که در انتهای استایل خوانشگر HTML تزریق می‌شوند (با اولویت بالاتر از استایل پیش‌فرض و فایل CSS).',
    setCustomCssPh: '.article h1 { color: #c2513d; }\n.article p { text-align: justify; }',
    supportHeading: 'همراه ما باشید',
    supportIntro: 'آموزش‌ها، تازه‌ها و نکته‌های کاربردی ابسیدین را در کانال‌های ما دنبال کنید.',
    supportJoin: 'عضویت در کانال',
    supportDonationTitle: 'با همراهی شما، ادامه می‌دهیم',
    supportDonationDesc: 'اگر این افزونه برایتان مفید بوده، می‌توانید از ادامهٔ توسعهٔ آن حمایت کنید.',
    supportDonate: 'حمایت مالی',
    guideHeading: 'راهنمای استفاده از نورا',
    guideIntro: 'برای آشنایی با امکانات و روش کار پلاگین، راهنمای زبان دلخواهتان را باز کنید.',
    guideFa: 'راهنمای فارسی', guideEn: 'English Guide',
    guideDownloadedNotice: 'راهنمای فارسی نورا در پوشه «Nora Guides» ذخیره شد.',
    guideDownloadFailedNotice: 'دانلود خودکار راهنما انجام نشد. می‌توانید از بخش راهنما در تنظیمات دوباره آن را دریافت کنید.',
    changelogTitle: 'تغییرات نورا', changelogButton: 'تغییرات',
    changelogUpdated: 'نورا به‌روزرسانی شد؛ تغییرات این نسخه را مرور کنید.', changelogVersion: 'نسخه 1.2.0',
    changelogItems: [
      'پشتیبانی کامل از کالوت‌های ابسیدین (Callouts) شامل انواع رنگی و حالت‌های باز (+) و بسته (-).',
      'اصلاح جهت خودکار متن (Auto Direction) به‌صورت پاراگراف‌به‌پاراگراف برای متون ترکیبی فارسی و انگلیسی.',
      'نمایش متمایز نام فایل‌ها در خروجی یکپارچه پوشه به‌صورت بنر وسط‌چین بدون برهم زدن سلسله‌مراتب H1 و گروه‌بندی فهرست مطالب.',
      'رفع باگ نمایش و هایلایت صفحه فعلی در فهرست مطالب (حالت صفحه‌بندی).',
      'یکسان‌سازی فونت پیش‌فرض روی Vazirmatn (همراه با بارگذاری از Google Fonts) و افزودن امکان انتخاب فونت در تنظیمات و پنجره خروجی.',
      'رفع محدودیت ذخیره هایلایت‌ها در localStorage برای یادداشت‌های دارای تصاویر Base64 و جلوگیری از تداخل پیوست‌های همنام در خروجی پوشه.'
    ],

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
      setReadingMode: 'حالت مطالعه',
      rmPaginated: 'فصل‌به‌فصل',
      rmScroll: 'تمام اسکرول',
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
      sectionFallback: n => `بخش ${n}`,
      copyCode: 'کپی',
      copiedCode: 'کپی شد ✓'
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
    fieldFontFamily: 'Font Family',
    fieldFontSize: 'Font Size',
    fieldWidth: 'Page Width',
    fieldReadingMode: 'Reading Mode',
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
    fontFamilies: [
      ['Vazirmatn', 'Vazirmatn (Persian & English)'],
      ['Inter', 'Inter'],
      ['Tahoma', 'Tahoma'],
      ['Georgia', 'Georgia'],
      ['system-ui', 'System UI']
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
    readingModes: [
      ['paginated', 'Paginated (By Section)'],
      ['scroll', 'Full Scroll (Continuous)']
    ],
    readerLangs: [
      ['auto', 'Auto-detect from note'],
      ['en', 'English (EN)'],
      ['fa', 'Persian (FA)']
    ],

    toggleEmbed: 'Embed Vault images & attachments as Base64 (fully offline)',
    toggleOpen: 'Open in browser after export',
    toggleSaveFrontmatter: 'Save cover metadata to note frontmatter',
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
    setFontFamilyName: 'Default Reader Font',
    setReadingModeName: 'Default Reading Mode',
    setEmbedName: 'Auto-embed Vault Attachments (Base64)',
    setEmbedDesc: 'Embed images, audio, video, and PDFs directly inside the HTML file so it works completely offline.',
    setOpenName: 'Open in Browser After Saving',
    setOpenDesc: 'On desktop, automatically opens the generated HTML file in your default web browser.',
    setSaveFrontmatterName: 'Auto-save cover metadata to note frontmatter',
    setSaveFrontmatterDesc: 'When exporting, writes entered cover metadata (title, author, subtitle, category, year, docType, description) to the note YAML frontmatter so it is pre-filled next time.',
    setChapterHeadingName: 'Chapter heading level for merged export',
    setChapterHeadingDesc: 'Each file title starts a new chapter. Choose the heading level (H1–H6).',
    setCustomCssFileName: 'Select CSS Snippet from Vault (optional)',
    setCustomCssFileDesc: 'Lists only .css files in Obsidian snippets (or your Vault) whose filename starts with "nora" (e.g., nora-sepia.css).',
    setCustomCssNone: 'None (Disabled)',
    setCustomCssRefresh: 'Refresh snippets list',
    setCustomCssName: 'Custom CSS',
    setCustomCssDesc: 'Inline CSS rules injected at the end of the exported HTML reader stylesheet (overrides default styles and custom CSS file).',
    setCustomCssPh: '.article h1 { color: #c2513d; }\n.article p { text-align: justify; }',
    supportHeading: 'Stay Connected',
    supportIntro: 'Follow our channels for Obsidian tutorials, updates, and practical tips.',
    supportJoin: 'Join channel',
    supportDonationTitle: 'Your support keeps us going',
    supportDonationDesc: 'If this plugin is useful, you can support its continued development.',
    supportDonate: 'Support us',
    guideHeading: 'Nora User Guides',
    guideIntro: 'Open the guide in your preferred language to learn how to use Nora.',
    guideFa: 'راهنمای فارسی', guideEn: 'English Guide',
    guideDownloadedNotice: 'The Nora user guide was saved in the “Nora Guides” folder.',
    guideDownloadFailedNotice: 'The guide could not be downloaded automatically. You can try again from Settings.',
    changelogTitle: 'Nora Changelog', changelogButton: 'Changelog',
    changelogUpdated: 'Nora has been updated. Review what is new in this version.', changelogVersion: 'Version 1.2.0',
    changelogItems: [
      'Added full Obsidian Callout support including color variants and collapsible open (+) / closed (-) states.',
      'Fixed Auto text direction to work per-paragraph for mixed Persian/English documents.',
      'Replaced H1 file titles in merged folder exports with centered chapter banners and grouped parent/child Table of Contents.',
      'Fixed active page highlighting in the Table of Contents in paginated mode.',
      'Unified default reader font to Vazirmatn (with Google Fonts CDN support) and added font selection to Settings and Export modals.',
      'Fixed localStorage quota issues when saving highlights on notes with Base64 images, and prevented duplicate attachment filename collisions in merged folder exports.'
    ],

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
      setReadingMode: 'Reading Mode',
      rmPaginated: 'Paginated',
      rmScroll: 'Full Scroll',
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
      sectionFallback: n => `Section ${n}`,
      copyCode: 'Copy',
      copiedCode: 'Copied ✓'
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
   رندر دوگانه بلوک‌های Mermaid (روز و شب — کاملاً آفلاین)
   ========================================================= */

async function renderMermaidBlocksMap(md) {
  const map = new Map();
  const lines = stripFrontmatter(md).replace(/\r/g, '').split('\n');
  const codes = new Set();
  let i = 0;
  while (i < lines.length) {
    const t = lines[i].trim();
    if (/^```/.test(t)) {
      const langCode = t.slice(3).trim();
      const code = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i].trim())) code.push(lines[i++]);
      if (i < lines.length) i++;
      if (/^mermaid(?:\s|$|\{)/i.test(langCode)) {
        const raw = code.join('\n').trim();
        if (raw) codes.add(raw);
      }
      continue;
    }
    i++;
  }
  if (!codes.size || typeof loadMermaid !== 'function') return map;

  try {
    const mermaid = await loadMermaid();
    if (!mermaid || typeof mermaid.render !== 'function') return map;

    const renderWithTheme = async (raw, theme, id) => {
      try {
        if (typeof mermaid.initialize === 'function') {
          mermaid.initialize({ startOnLoad: false, theme, securityLevel: 'loose' });
        }
        const res = await mermaid.render(id, raw);
        return typeof res === 'string' ? res : (res && res.svg ? res.svg : '');
      } catch (err) {
        console.warn('[Nora] Mermaid render failed:', err);
        const stray = document.getElementById('d' + id) || document.getElementById(id);
        if (stray) stray.remove();
        return '';
      }
    };

    let idx = 0;
    const stamp = Date.now();
    for (const raw of codes) {
      const n = idx++;
      const light = await renderWithTheme(raw, 'default', `nora-mmd-l-${stamp}-${n}`);
      const dark = await renderWithTheme(raw, 'dark', `nora-mmd-d-${stamp}-${n}`);
      if (light || dark) {
        map.set(raw, { light: light || dark, dark: dark || light });
      }
    }

    if (typeof mermaid.initialize === 'function') {
      const obsDark = document.body && document.body.classList.contains('theme-dark');
      mermaid.initialize({ startOnLoad: false, theme: obsDark ? 'dark' : 'default' });
    }
  } catch (err) {
    console.warn('[Nora] Could not load Obsidian Mermaid:', err);
  }
  return map;
}

/* =========================================================
   رندر برداری و کاملاً آفلاین فرمول‌های LaTeX (بدون افت کیفیت)
   ========================================================= */

const INLINE_DISPLAY_MATH_RE = /(?<!\\)\$\$([^\n$]+?)(?<!\\)\$\$/g;
const INLINE_MATH_RE = /(?<!\\)\$(?!\s)((?:\\.|[^$\\\n])+?)(?<!\s)(?<!\\)\$(?!\d)/g;

function collectMathExpressions(md) {
  const lines = stripFrontmatter(md).replace(/\r/g, '').split('\n');
  const seen = new Set();
  const items = [];
  const pushItem = (tex, display) => {
    const clean = String(tex || '').trim();
    if (!clean) return;
    const key = (display ? 'D::' : 'I::') + clean;
    if (seen.has(key)) return;
    seen.add(key);
    items.push({ tex: clean, display, key });
  };

  let i = 0;
  while (i < lines.length) {
    const t = lines[i].trim();
    // Skip fenced code blocks
    if (/^```/.test(t)) {
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i].trim())) i++;
      if (i < lines.length) i++;
      continue;
    }

    // Block display math: single-line $$...$$ or multi-line $$ ... $$
    if (/^\$\$/.test(t)) {
      const single = t.match(/^\$\$(.+)\$\$$/);
      if (single) {
        pushItem(single[1], true);
        i++;
        continue;
      }
      const buf = [];
      const firstRest = t.slice(2).trim();
      if (firstRest) buf.push(firstRest);
      i++;
      while (i < lines.length) {
        const cur = lines[i].trim();
        if (cur === '$$') { i++; break; }
        if (/\$\$$/.test(cur)) {
          const before = cur.slice(0, -2).trim();
          if (before) buf.push(before);
          i++;
          break;
        }
        buf.push(lines[i]);
        i++;
      }
      pushItem(buf.join('\n'), true);
      continue;
    }

    // Strip inline code spans before scanning inline math
    const noCode = lines[i].replace(/`[^`]+`/g, ' ');
    let m;
    INLINE_DISPLAY_MATH_RE.lastIndex = 0;
    while ((m = INLINE_DISPLAY_MATH_RE.exec(noCode))) pushItem(m[1], true);

    const noDouble = noCode.replace(INLINE_DISPLAY_MATH_RE, ' ');
    INLINE_MATH_RE.lastIndex = 0;
    while ((m = INLINE_MATH_RE.exec(noDouble))) pushItem(m[1], false);

    i++;
  }
  return items;
}

async function renderMathBlocksMap(md) {
  const map = new Map();
  const items = collectMathExpressions(md);
  if (!items.length) return map;

  try {
    if (typeof loadMathJax === 'function') {
      await loadMathJax();
    }
  } catch (err) {
    console.warn('[Nora] Could not load Obsidian MathJax:', err);
  }

  const mjx = window.MathJax;
  const renderOne = async (tex, display) => {
    // 1. Prefer pure SVG if MathJax.tex2svg is available
    if (mjx && typeof mjx.tex2svg === 'function') {
      try {
        const node = mjx.tex2svg(tex, { display });
        const svg = node && node.querySelector ? node.querySelector('svg') : null;
        if (svg) return svg.outerHTML;
      } catch (e) {}
    }

    // 2. Native MathML via MathJax.tex2mml (100% vector, offline, crisp at any zoom)
    if (mjx && typeof mjx.tex2mml === 'function') {
      try {
        const mml = mjx.tex2mml(tex, { display });
        if (mml && /<math[\s>]/i.test(mml)) return mml;
      } catch (e) {}
    }

    // 3. Fallback via Obsidian's renderMath -> extract vector <svg> or <math>
    if (typeof renderMath === 'function') {
      try {
        const el = renderMath(tex, display);
        if (typeof finishRenderMath === 'function') {
          await finishRenderMath();
        }
        if (el) {
          const svg = el.querySelector('svg');
          if (svg) return svg.outerHTML;
          const mml = el.querySelector('mjx-assistive-mml math, math');
          if (mml) {
            if (display && !mml.getAttribute('display')) {
              mml.setAttribute('display', 'block');
            }
            return mml.outerHTML;
          }
        }
      } catch (e) {
        console.warn('[Nora] renderMath failed:', e);
      }
    }

    return '';
  };

  for (const item of items) {
    const rendered = await renderOne(item.tex, item.display);
    if (rendered) map.set(item.key, rendered);
  }
  return map;
}

async function listVaultCssSnippets(app) {
  const seen = new Set();
  const items = [];
  const configDir = (app.vault && app.vault.configDir) || '.obsidian';
  const snippetsDir = normalizePath(`${configDir}/snippets`);
  const isNoraCss = name => Boolean(name) && !name.startsWith('.') && /^nora/i.test(name);
  try {
    if (await app.vault.adapter.exists(snippetsDir)) {
      const listed = await app.vault.adapter.list(snippetsDir);
      const files = (listed && Array.isArray(listed.files)) ? listed.files : [];
      for (const fPath of files) {
        if (/\.css$/i.test(fPath)) {
          const norm = normalizePath(fPath);
          const name = norm.split('/').pop() || '';
          if (!isNoraCss(name)) continue;
          if (!seen.has(norm)) {
            seen.add(norm);
            items.push({ path: norm, label: `🎨 ${name}` });
          }
        }
      }
    }
  } catch (err) {
    console.warn('[Nora] Failed to list snippets folder:', err);
  }
  try {
    const vaultCss = app.vault.getFiles().filter(f => f.extension && f.extension.toLowerCase() === 'css');
    for (const f of vaultCss) {
      const norm = normalizePath(f.path);
      const name = norm.split('/').pop() || '';
      if (!isNoraCss(name)) continue;
      if (!seen.has(norm)) {
        seen.add(norm);
        items.push({ path: norm, label: `📄 ${norm}` });
      }
    }
  } catch (err) {}
  return items.sort((a, b) => a.label.localeCompare(b.label));
}

async function resolveCustomCss(app, settings) {
  const parts = [];
  let name = '';
  const rawPath = String((settings && settings.customCssPath) || '').trim();
  if (rawPath) {
    const cleanPath = normalizePath(rawPath);
    try {
      if (await app.vault.adapter.exists(cleanPath)) {
        const fileCss = await app.vault.adapter.read(cleanPath);
        if (fileCss && fileCss.trim()) {
          parts.push(fileCss.trim());
          const base = (cleanPath.split('/').pop() || '').replace(/\.css$/i, '').trim();
          if (base) name = base;
        }
      }
    } catch (err) {
      console.warn('[Nora] Failed to read custom CSS file:', cleanPath, err);
    }
  }
  const inlineCss = String((settings && settings.customCss) || '').trim();
  if (inlineCss) parts.push(inlineCss);
  if (!parts.length) return { css: '', name: '' };
  return {
    css: '\n/* ===== Custom User CSS ===== */\n' + parts.join('\n\n').replace(/<\/style/gi, '<\\/style'),
    name
  };
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
  const { forExport = false, attachmentsMap = null, lang = 'fa', fnState = null, fnDefs = null, inFootnote = false, mathMap = null } = opts;
  const slots = [];
  const stash = html => {
    const key = `\u0000SLOT${slots.length}\u0000`;
    slots.push(html);
    return key;
  };
  let out = String(s || '');

  out = out.replace(/`([^`]+)`/g, (_, c) => stash(`<code>${esc(c)}</code>`));

  out = out.replace(INLINE_DISPLAY_MATH_RE, (_, tex) => {
    const clean = tex.trim();
    const rendered = mathMap ? (mathMap.get('D::' + clean) || '') : '';
    return stash(rendered
      ? `<span class="nora-math-inline nora-math-display-inline">${rendered}</span>`
      : `<code class="nora-math-fallback">$$${esc(clean)}$$</code>`);
  });

  out = out.replace(INLINE_MATH_RE, (_, tex) => {
    const clean = tex.trim();
    const rendered = mathMap ? (mathMap.get('I::' + clean) || '') : '';
    return stash(rendered
      ? `<span class="nora-math-inline">${rendered}</span>`
      : `<code class="nora-math-fallback">$${esc(clean)}$</code>`);
  });

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

const CODE_LANG_NAMES = {
  js: 'JavaScript', javascript: 'JavaScript', mjs: 'JavaScript', cjs: 'JavaScript',
  ts: 'TypeScript', typescript: 'TypeScript',
  jsx: 'JSX', tsx: 'TSX',
  py: 'Python', python: 'Python',
  html: 'HTML', htm: 'HTML', xml: 'XML',
  css: 'CSS', scss: 'SCSS', sass: 'Sass', less: 'Less',
  json: 'JSON', yaml: 'YAML', yml: 'YAML', toml: 'TOML',
  sh: 'Bash', bash: 'Bash', zsh: 'Zsh', shell: 'Shell', powershell: 'PowerShell', ps1: 'PowerShell',
  sql: 'SQL', md: 'Markdown', markdown: 'Markdown',
  c: 'C', cpp: 'C++', 'c++': 'C++', cs: 'C#', csharp: 'C#',
  java: 'Java', kt: 'Kotlin', kotlin: 'Kotlin', swift: 'Swift',
  go: 'Go', rust: 'Rust', rs: 'Rust', php: 'PHP', rb: 'Ruby', ruby: 'Ruby',
  dart: 'Dart', r: 'R', tex: 'LaTeX', latex: 'LaTeX', diff: 'Diff', ini: 'INI', dockerfile: 'Dockerfile'
};

function formatCodeLangLabel(rawLang) {
  const token = String(rawLang || '').trim().split(/[\s{]/)[0].toLowerCase();
  if (!token) return 'CODE';
  return CODE_LANG_NAMES[token] || token.toUpperCase();
}

function sanitizeInlineSvg(raw) {
  return String(raw || '')
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|xlink:href)\s*=\s*(?:"\s*javascript:[^"]*"|'\s*javascript:[^']*')/gi, '');
}

const CALLOUT_META = {
  note:      { cls: 'note',     icon: '📝' },
  abstract:  { cls: 'abstract', icon: '📋' },
  summary:   { cls: 'abstract', icon: '📋' },
  tldr:      { cls: 'abstract', icon: '📋' },
  info:      { cls: 'info',     icon: 'ℹ️' },
  todo:      { cls: 'todo',     icon: '☑️' },
  tip:       { cls: 'tip',      icon: '🔥' },
  hint:      { cls: 'tip',      icon: '🔥' },
  important: { cls: 'tip',      icon: '🔥' },
  success:   { cls: 'success',  icon: '✅' },
  check:     { cls: 'success',  icon: '✅' },
  done:      { cls: 'success',  icon: '✅' },
  question:  { cls: 'question', icon: '❓' },
  help:      { cls: 'question', icon: '❓' },
  faq:       { cls: 'question', icon: '❓' },
  warning:   { cls: 'warning',  icon: '⚠️' },
  caution:   { cls: 'warning',  icon: '⚠️' },
  attention: { cls: 'warning',  icon: '⚠️' },
  failure:   { cls: 'danger',   icon: '❌' },
  fail:      { cls: 'danger',   icon: '❌' },
  missing:   { cls: 'danger',   icon: '❌' },
  danger:    { cls: 'danger',   icon: '⚡' },
  error:     { cls: 'danger',   icon: '⚡' },
  bug:       { cls: 'danger',   icon: '🐞' },
  example:   { cls: 'example',  icon: '🧪' },
  quote:     { cls: 'quote',    icon: '❝' },
  cite:      { cls: 'quote',    icon: '❝' }
};

function renderMarkdown(md, opts = {}) {
  const { forExport = false, attachmentsMap = null, lang = 'fa', mermaidMap = null, mathMap = null, autoDir = false, isNested = false } = opts;
  const dirAttr = autoDir ? ' dir="auto"' : '';
  const r = I18N[lang].reader;
  const bodyMd = stripFrontmatter(md);
  const { cleanLines: lines, fnDefs } = extractFootnoteDefinitions(bodyMd);
  const fnState = { list: [], byKey: new Map() };
  const inlineOpts = { forExport, attachmentsMap, lang, fnState, fnDefs, inFootnote: false, mathMap };

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
      if (/^mermaid(?:\s|$|\{)/i.test(langCode)) {
        const rawMmd = code.join('\n').trim();
        const svgs = mermaidMap ? mermaidMap.get(rawMmd) : null;
        html += `<div class="nora-mermaid-wrap">${
          svgs
            ? `<div class="nora-mermaid-svg nora-mermaid-light">${svgs.light}</div><div class="nora-mermaid-svg nora-mermaid-dark">${svgs.dark}</div>`
            : `<pre class="nora-mermaid-fallback"><code class="language-mermaid">${esc(rawMmd)}</code></pre>`
        }</div>`;
      } else if (/^svg(?:\s|$|\{)/i.test(langCode) && /<svg\b[\s\S]*<\/svg>/i.test(code.join('\n'))) {
        const rawSvg = sanitizeInlineSvg(code.join('\n').trim());
        html += `<div class="nora-svg-wrap">${rawSvg}</div>`;
      } else {
        const langLabel = formatCodeLangLabel(langCode);
        const langClass = langCode ? ` class="language-${esc(langCode.split(/[\s{]/)[0])}"` : '';
        html += `<div class="nora-code-block"><div class="nora-code-head"><span class="nora-code-lang"><span class="nora-code-dots" aria-hidden="true"><i></i><i></i><i></i></span>${esc(langLabel)}</span><button type="button" class="nora-code-copy" aria-label="${esc(r.copyCode)}">${esc(r.copyCode)}</button></div><pre><code${langClass}>${esc(code.join('\n'))}</code></pre></div>`;
      }
      continue;
    }

    if (/^\$\$/.test(t)) {
      let tex = '';
      const single = t.match(/^\$\$(.+)\$\$$/);
      if (single) {
        tex = single[1].trim();
        i++;
      } else {
        const buf = [];
        const firstRest = t.slice(2).trim();
        if (firstRest) buf.push(firstRest);
        i++;
        while (i < lines.length) {
          const cur = lines[i].trim();
          if (cur === '$$') { i++; break; }
          if (/\$\$$/.test(cur)) {
            const before = cur.slice(0, -2).trim();
            if (before) buf.push(before);
            i++;
            break;
          }
          buf.push(lines[i]);
          i++;
        }
        tex = buf.join('\n').trim();
      }
      const renderedMath = mathMap ? (mathMap.get('D::' + tex) || '') : '';
      html += `<div class="nora-math-block">${
        renderedMath
          ? `<div class="nora-math-inner">${renderedMath}</div>`
          : `<pre class="nora-math-fallback"><code>$$\n${esc(tex)}\n$$</code></pre>`
      }</div>`;
      continue;
    }

    if (/^<svg\b/i.test(t)) {
      const svgLines = [lines[i]];
      let closed = /<\/svg>/i.test(lines[i]);
      i++;
      while (!closed && i < lines.length) {
        svgLines.push(lines[i]);
        if (/<\/svg>/i.test(lines[i])) closed = true;
        i++;
      }
      const rawSvg = sanitizeInlineSvg(svgLines.join('\n').trim());
      html += `<div class="nora-svg-wrap">${rawSvg}</div>`;
      continue;
    }

    const chMatch = t.match(/^:::NORA_CHAPTER_START::(.+?):::$/);
    if (chMatch) {
      const chTitle = chMatch[1].trim();
      const id = 'chapter-' + headings.length;
      headings.push({ level: 0, text: chTitle, id, isChapter: true });
      html += `<div class="nora-chapter-banner" id="${id}" data-nora-chapter="true"${dirAttr}><span class="nora-chapter-icon" aria-hidden="true">📝</span><span class="nora-chapter-name">${esc(chTitle)}</span></div>`;
      i++;
      continue;
    }

    if (/^#{1,6}\s/.test(t)) {
      let m = t.match(/^(#{1,6})\s+(.*)$/), level = m[1].length, text = m[2].replace(/\s+#+\s*$/, '');
      const isNoraChapter = text.startsWith('NORA_CHAPTER_START::');
      if (isNoraChapter) text = text.slice('NORA_CHAPTER_START::'.length).trim();
      let id = 'section-' + headings.length;
      text = text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/__(.*?)__/g, '$1');
      headings.push({ level, text, id, isChapter: isNoraChapter });
      html += `<h${level} id="${id}"${isNoraChapter ? ' data-nora-chapter="true"' : ''}${dirAttr}>${renderInline(text, inlineOpts)}</h${level}>`;
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
      const calloutMatch = q[0] && q[0].trim().match(/^\[!([a-zA-Z0-9_-]+)\]([+-])?(?:\s+(.*))?$/);
      if (calloutMatch) {
        const rawType = calloutMatch[1].toLowerCase();
        const fold = calloutMatch[2] || '';
        const customTitle = (calloutMatch[3] || '').trim();
        const meta = CALLOUT_META[rawType] || { cls: 'note', icon: 'ℹ️' };
        const titleText = customTitle || (rawType.charAt(0).toUpperCase() + rawType.slice(1));
        const bodyRaw = q.slice(1).join('\n').trim();
        const bodyHtml = bodyRaw ? renderMarkdown(bodyRaw, { ...opts, isNested: true }).html : '';
        if (fold === '+' || fold === '-') {
          html += `<details class="nora-callout nora-callout-${meta.cls}"${fold === '+' ? ' open' : ''}${dirAttr}><summary class="nora-callout-title"><span class="nora-callout-icon" aria-hidden="true">${meta.icon}</span><span class="nora-callout-label">${renderInline(titleText, inlineOpts)}</span><span class="nora-callout-chevron" aria-hidden="true"></span></summary>${bodyHtml ? `<div class="nora-callout-body">${bodyHtml}</div>` : ''}</details>`;
        } else {
          html += `<div class="nora-callout nora-callout-${meta.cls}"${dirAttr}><div class="nora-callout-title"><span class="nora-callout-icon" aria-hidden="true">${meta.icon}</span><span class="nora-callout-label">${renderInline(titleText, inlineOpts)}</span></div>${bodyHtml ? `<div class="nora-callout-body">${bodyHtml}</div>` : ''}</div>`;
        }
      } else {
        html += `<blockquote${dirAttr}>${q.map(x => `<p${dirAttr}>${renderInline(x, inlineOpts)}</p>`).join('')}</blockquote>`;
      }
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
        html += '<table><thead><tr>' + rows[0].map(x => `<th${dirAttr}>${renderInline(x, inlineOpts)}</th>`).join('') + '</tr></thead><tbody>' +
          rows.slice(1).map(row => '<tr>' + rows[0].map((_, j) => `<td${dirAttr}>${renderInline(row[j] || '', inlineOpts)}</td>`).join('') + '</tr>').join('') +
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
        items.push(`<li${dirAttr}>${task ? `<input type="checkbox" disabled ${task[1].toLowerCase() === 'x' ? 'checked' : ''}>${renderInline(task[2], inlineOpts)}` : renderInline(item, inlineOpts)}</li>`);
      }
      html += `<${tag}${dirAttr}>${items.join('')}</${tag}>`;
      continue;
    }

    let para = [t];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^```|^\$\$|^<svg\b|^:::NORA_CHAPTER_START::|^#{1,6}\s|^>\s?|^(\s*)([-*+]|\d+\.)\s+/i.test(lines[i].trim()) &&
      !isHr(lines[i].trim()) &&
      !matchStandaloneEmbedLine(lines[i].trim()) &&
      !isTable(i)
    ) {
      para.push(lines[i].trim());
      i++;
    }
    html += `<p${dirAttr}>${para.map(line => renderInline(line, inlineOpts)).join('<br>')}</p>`;
  }

  if (!isNested && headings.length > 0) {
    const hasChapters = headings.some(h => h.isChapter);
    let toc = `<nav class="toc"><div class="toc-title">${esc(r.tocTitleInline)}</div>`;
    if (hasChapters) {
      let groupOpen = false;
      headings.forEach(h => {
        if (h.isChapter) {
          if (groupOpen) toc += '</div></div>';
          toc += `<div class="toc-group"><a class="toc-file-link" href="#${h.id}">📝 ${esc(h.text)}</a><div class="toc-group-children">`;
          groupOpen = true;
        } else if (h.level <= 3) {
          if (!groupOpen) {
            toc += '<div class="toc-group"><div class="toc-group-children">';
            groupOpen = true;
          }
          toc += `<a class="level${h.level}" href="#${h.id}">${renderInline(h.text, { ...inlineOpts, inFootnote: true })}</a>`;
        }
      });
      if (groupOpen) toc += '</div></div>';
    } else {
      headings.forEach(h => {
        if (h.level <= 3) {
          toc += `<a class="level${h.level}" href="#${h.id}">${renderInline(h.text, { ...inlineOpts, inFootnote: true })}</a>`;
        }
      });
    }
    toc += '</nav>';
    html = toc + html;
  }

  const footnotes = fnState.list.map(item => ({
    num: item.num,
    label: fmtNum(item.num, lang),
    firstRefId: 'fnref-' + (item.refIds[0] || (item.num + '-1')),
    html: item.rawContent
      .split(/\n{2,}/)
      .map(block => block.split('\n').map(ln => renderInline(ln, { forExport, attachmentsMap, lang, inFootnote: true, mathMap })).join('<br>'))
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

function buildStandaloneHtml(mdText, options, attachmentsMap, mermaidMap = null, mathMap = null) {
  const lang = resolveReaderLang(options.readerLanguage, mdText, options.uiLang || 'fa');
  const t = I18N[lang];
  const r = t.reader;
  const dark = options.theme === 'dark';
  const customCssText = options.customCss ? String(options.customCss).replace(/<\/style/gi, '<\\/style') : '';
  const hasCustomCss = Boolean(customCssText.trim());
  const customThemeLabel = String(options.customCssName || '').trim() || (lang === 'fa' ? 'استایل سفارشی' : 'Custom CSS');
  const fallbackPalette = options.palette || 'default';
  const initPalette = hasCustomCss ? 'custom' : fallbackPalette;
  const initCover = options.coverStyle || 'aurora';
  const autoDir = options.direction === 'auto';
  const dir = autoDir ? t.dir : (options.direction || t.dir);
  const initFont = options.fontFamily || 'Vazirmatn';
  const size = parseInt(options.fontSize, 10) || 16;
  const initWidth = options.width || '850';
  const initReadingMode = options.readingMode === 'scroll' ? 'scroll' : 'paginated';
  const splitMarkedChaptersOnly = options.splitMarkedChaptersOnly === true;
  const maxW = initWidth === '100%' ? '100%' : initWidth + 'px';
  const bodyMd = stripFrontmatter(mdText);
  const rendered = renderMarkdown(mdText, { forExport: options.forExport !== false, attachmentsMap, lang, mermaidMap, mathMap, autoDir });
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

  const customChipHtml = hasCustomCss
    ? `<button type="button" class="swatch-btn" data-palette-val="custom" title="${esc(customThemeLabel)}"><span class="swatch-dot" style="background:linear-gradient(135deg,#ff5c8a,#ffd166,#00b8a9)"></span><span class="swatch-label">✨ ${esc(customThemeLabel)}</span></button>`
    : '';

  const paletteChipsHtml = customChipHtml + t.palettes.map(([v, label]) => {
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
    footnoteClose: r.footnoteClose,
    copyCode: r.copyCode,
    copiedCode: r.copiedCode
  };

  const fontFamily = initFont === 'Vazirmatn'
    ? "'Vazirmatn','Inter','Segoe UI',Tahoma,system-ui,-apple-system,sans-serif"
    : `'${initFont}','Vazirmatn','Segoe UI',Tahoma,system-ui,-apple-system,sans-serif`;

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
body.scroll-mode .cover{display:flex}
body.scroll-mode .chapter-page{display:block;min-height:0;border-top:1px dashed var(--line)}
body.scroll-mode .chapter-footer{position:static;margin-top:24px}
body.scroll-mode .article{padding-bottom:18px}
body.scroll-mode .navrow{display:none}
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
.nora-code-block{
  margin:1.35em 0;border-radius:14px;overflow:hidden;direction:ltr;text-align:left;
  border:1px solid var(--line);
  background:color-mix(in srgb,var(--bg) 55%,var(--paper));
  box-shadow:0 4px 16px rgba(15,20,45,.05);
  break-inside:avoid;
}
body.night .nora-code-block{
  background:#151828;border-color:rgba(255,255,255,.09);
  box-shadow:0 8px 24px rgba(0,0,0,.28);
}
.nora-code-head{
  display:flex;align-items:center;justify-content:space-between;gap:10px;
  padding:8px 14px;
  background:color-mix(in srgb,var(--accent) 7%,var(--paper));
  border-bottom:1px solid var(--line);
}
body.night .nora-code-head{
  background:rgba(255,255,255,.04);border-bottom-color:rgba(255,255,255,.08);
}
.nora-code-lang{
  display:inline-flex;align-items:center;gap:8px;
  font-family:ui-monospace,SFMono-Regular,Consolas,monospace;
  font-size:11.5px;font-weight:800;letter-spacing:.04em;color:var(--accent);
}
.nora-code-dots{display:inline-flex;align-items:center;gap:5px}
.nora-code-dots i{width:8px;height:8px;border-radius:50%;display:block;opacity:.75}
.nora-code-dots i:nth-child(1){background:#ff5f56}
.nora-code-dots i:nth-child(2){background:#ffbd2e}
.nora-code-dots i:nth-child(3){background:#27c93f}
.nora-code-copy{
  border:1px solid var(--line);background:var(--paper);color:var(--ink);
  border-radius:8px;padding:4px 10px;font-size:11.5px;font-weight:700;
  cursor:pointer;transition:border-color .15s,color .15s,background .15s;
}
.nora-code-copy:hover{border-color:var(--accent);color:var(--accent)}
.nora-code-copy.copied{
  background:var(--stat-bg);border-color:var(--accent2);color:var(--accent2);
}
body.night .nora-code-copy{
  background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.14);color:#e2e6f5;
}
body.night .nora-code-copy:hover{border-color:var(--accent);color:var(--accent)}
.article pre{
  direction:ltr;text-align:left;margin:0;padding:16px 18px;
  background:color-mix(in srgb,var(--bg) 55%,var(--paper));
  color:var(--ink);border-radius:13px;overflow:auto;
  line-height:1.72;font-size:.9em;border:1px solid var(--line);
}
body.night .article pre{
  background:#151828;color:#e6eaf8;border-color:rgba(255,255,255,.08);
}
.nora-code-block pre{
  border:0;border-radius:0;background:transparent;
}
.article pre code{background:none;color:inherit;padding:0;font-size:1em}
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

/* ===== نمودارهای Mermaid (روز و شب — آفلاین + زوم و جابه‌جایی) ===== */
.nora-mermaid-wrap{
  margin:1.5em auto;padding:16px;border-radius:14px;
  border:1px solid var(--line);background:var(--paper);
  overflow-x:auto;text-align:center;direction:ltr;
  break-inside:avoid;position:relative;cursor:zoom-in;
  transition:border-color .16s ease,box-shadow .16s ease;
}
.nora-mermaid-wrap:hover{
  border-color:color-mix(in srgb,var(--accent) 45%,var(--line));
  box-shadow:0 6px 20px rgba(15,20,45,.07);
}
body.night .nora-mermaid-wrap{background:#1c2035}
.nora-mermaid-svg{display:block;width:100%;text-align:center}
.nora-mermaid-svg svg{width:100%;max-width:100%;height:auto;display:block;margin:0 auto}
.nora-mermaid-dark{display:none}
body.night .nora-mermaid-light{display:none}
body.night .nora-mermaid-dark{display:block}
.mmd-lightbox{
  position:fixed;inset:0;z-index:62;background:rgba(8,11,24,.88);
  display:none;flex-direction:column;backdrop-filter:blur(6px);
}
.mmd-lightbox.open{display:flex}
.mmd-lb-bar{
  position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:64;
  display:flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;
  background:rgba(18,22,38,.86);border:1px solid rgba(255,255,255,.18);
  box-shadow:0 8px 28px rgba(0,0,0,.38);direction:ltr;
}
.mmd-lb-bar button{
  border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.08);
  color:#fff;border-radius:999px;min-width:34px;height:32px;padding:0 10px;
  font-size:13px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;
  transition:background .14s;
}
.mmd-lb-bar button:hover{background:rgba(255,255,255,.22)}
.mmd-lb-pct{color:#fff;font-size:12px;font-weight:700;min-width:46px;text-align:center;font-family:ui-monospace,SFMono-Regular,Consolas,monospace}
.mmd-lb-stage{
  flex:1;width:100%;height:100%;overflow:hidden;
  display:flex;align-items:center;justify-content:center;
  cursor:grab;touch-action:none;user-select:none;
}
.mmd-lb-stage.dragging{cursor:grabbing}
.mmd-lb-canvas{
  background:var(--paper);padding:24px 28px;border-radius:16px;
  box-shadow:0 20px 60px rgba(0,0,0,.45);
  display:flex;align-items:center;justify-content:center;
  direction:ltr;color:var(--ink);
}
body.night .mmd-lb-canvas{background:#1c2035}
.mmd-lb-canvas svg{display:block;pointer-events:none}
.mmd-lb-canvas math{font-size:inherit;color:var(--ink);pointer-events:none}

/* ===== فرمول‌های ریاضی LaTeX (برداری و آفلاین) ===== */
.nora-math-block{
  margin:1.4em auto;padding:18px 20px;border-radius:14px;
  border:1px solid var(--line);background:color-mix(in srgb,var(--accent) 3%,var(--paper));
  overflow-x:auto;text-align:center;direction:ltr;unicode-bidi:isolate;
  break-inside:avoid;cursor:zoom-in;
  transition:border-color .16s ease,box-shadow .16s ease;
}
.nora-math-block:hover{
  border-color:color-mix(in srgb,var(--accent) 45%,var(--line));
  box-shadow:0 6px 20px rgba(15,20,45,.07);
}
body.night .nora-math-block{background:#1c2035}
.nora-math-inner{display:inline-block;max-width:100%;font-size:1.18em;line-height:1.8;color:var(--ink)}
.nora-math-inner svg{max-width:100%;height:auto;display:block;margin:0 auto}
.nora-math-inner math{font-family:'Cambria Math','STIX Two Math','Latin Modern Math','Times New Roman',serif}
.nora-math-inner mtable{border-spacing:0.35em 0.5em}
.nora-math-inline{
  display:inline-block;direction:ltr;unicode-bidi:isolate;
  vertical-align:middle;margin-inline:2px;color:var(--ink);
}
.nora-math-inline svg{height:1.15em;width:auto;vertical-align:-0.18em}
.nora-math-inline math{font-family:'Cambria Math','STIX Two Math','Latin Modern Math','Times New Roman',serif;font-size:1.05em}

/* ===== نمودارها و تصاویر برداری SVG (خام و کدبلاک) ===== */
.nora-svg-wrap{
  margin:1.5em auto;padding:16px;border-radius:14px;
  border:1px solid var(--line);background:var(--paper);
  overflow-x:auto;text-align:center;direction:ltr;
  break-inside:avoid;cursor:zoom-in;
  transition:border-color .16s ease,box-shadow .16s ease;
}
.nora-svg-wrap:hover{
  border-color:color-mix(in srgb,var(--accent) 45%,var(--line));
  box-shadow:0 6px 20px rgba(15,20,45,.07);
}
body.night .nora-svg-wrap{background:#1c2035}
.nora-svg-wrap svg{max-width:100%;height:auto;display:block;margin:0 auto}

/* ===== جهت خودکار پاراگراف‌ها ===== */
body.auto-dir .article p,
body.auto-dir .article li,
body.auto-dir .article h1,
body.auto-dir .article h2,
body.auto-dir .article h3,
body.auto-dir .article h4,
body.auto-dir .article blockquote,
body.auto-dir .article td,
body.auto-dir .article th{unicode-bidi:plaintext;text-align:start}

/* ===== بنر شروع فصل (فایل در خروجی پوشه) ===== */
.nora-chapter-banner{
  display:flex;align-items:center;justify-content:center;gap:10px;text-align:center;
  margin:0 auto 28px;padding:16px 22px;border-radius:16px;
  background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 10%,var(--paper)),color-mix(in srgb,var(--accent2) 10%,var(--paper)));
  border:1.5px solid color-mix(in srgb,var(--accent) 26%,var(--line));
  color:var(--accent);font-size:1.45em;font-weight:900;line-height:1.5;scroll-margin-top:90px;
}
.nora-chapter-icon{font-size:1.05em}

/* ===== سلسله‌مراتب والد و فرزندی فهرست مطالب ===== */
.toc-items a.level1{
  font-weight:800;font-size:13.2px;color:var(--ink);
  margin-top:6px;
}
.toc-items a.level2{
  margin-inline-start:10px;padding-inline-start:14px;
  border-inline-start:2px solid var(--line);
  border-start-start-radius:0;border-end-start-radius:0;
  font-size:12.5px;color:var(--muted);padding-block:6px;
}
.toc-items a.level3{
  margin-inline-start:22px;padding-inline-start:14px;
  border-inline-start:1.5px dashed var(--line);
  border-start-start-radius:0;border-end-start-radius:0;
  font-size:11.8px;color:var(--muted);padding-block:5px;
}
.toc-items a.level2:hover,.toc-items a.level2.current,
.toc-items a.level3:hover,.toc-items a.level3.current{
  border-inline-start-color:var(--accent);color:var(--accent);
}

/* ===== گروه‌بندی فهرست مطالب در خروجی پوشه ===== */
.toc-group{
  border:1px solid var(--line);border-radius:13px;padding:7px;margin:10px 0;
  background:color-mix(in srgb,var(--bg) 48%,var(--paper));
  transition:border-color .18s ease,box-shadow .18s ease;
}
.toc-group.is-active-group{
  border-color:color-mix(in srgb,var(--accent) 45%,var(--line));
  box-shadow:0 4px 14px color-mix(in srgb,var(--accent) 10%,transparent);
}
.toc-items a.toc-file-link{
  display:flex;align-items:center;gap:6px;
  font-weight:800;font-size:13.2px;color:var(--accent);
  background:color-mix(in srgb,var(--accent) 9%,var(--paper));
  border:1px solid color-mix(in srgb,var(--accent) 18%,transparent);
  border-radius:9px;padding:8px 10px;margin:0;
}
.toc-items a.toc-file-link.current{
  background:var(--accent);color:#fff;border-color:var(--accent);
}
body.night .toc-items a.toc-file-link.current{color:#121524}
.toc-group-children{
  margin-top:6px;margin-inline-start:13px;padding-inline-start:10px;
  border-inline-start:2px solid color-mix(in srgb,var(--accent) 24%,var(--line));
  display:flex;flex-direction:column;gap:2px;
}
.toc-group-children:empty{display:none}
.toc-group-children a{
  position:relative;margin:0;padding:6px 10px;
  border-inline-start:0;border-radius:8px;font-size:12.4px;color:var(--muted);
}
.toc-group-children a.level1{font-weight:700;color:var(--ink);font-size:12.8px;margin-top:2px}
.toc-group-children a.level2{padding-inline-start:18px;font-size:12.2px}
.toc-group-children a.level3{padding-inline-start:28px;font-size:11.6px;opacity:.9}
.toc-group-children a::before{
  content:"";position:absolute;inset-inline-start:-10px;top:50%;
  width:8px;height:1.5px;background:color-mix(in srgb,var(--accent) 28%,var(--line));
}
.toc-group-children a.current::before,.toc-group-children a:hover::before{
  background:var(--accent);
}

/* ===== کالوت‌های ابسیدین (Callouts) ===== */
.nora-callout{
  --co-color:var(--accent);
  margin:1.35em 0;border-radius:13px;
  border:1px solid color-mix(in srgb,var(--co-color) 28%,var(--line));
  border-inline-start:4px solid var(--co-color);
  background:color-mix(in srgb,var(--co-color) 7%,var(--paper));
  overflow:hidden;break-inside:avoid;
}
.nora-callout-info,.nora-callout-todo{--co-color:#2563eb}
.nora-callout-tip,.nora-callout-abstract{--co-color:#0d9488}
.nora-callout-success{--co-color:#16a34a}
.nora-callout-warning,.nora-callout-question{--co-color:#d97706}
.nora-callout-danger{--co-color:#dc2626}
.nora-callout-example{--co-color:#7c3aed}
.nora-callout-quote{--co-color:#64748b}
body.night .nora-callout-info,body.night .nora-callout-todo{--co-color:#60a5fa}
body.night .nora-callout-tip,body.night .nora-callout-abstract{--co-color:#2dd4bf}
body.night .nora-callout-success{--co-color:#4ade80}
body.night .nora-callout-warning,body.night .nora-callout-question{--co-color:#fbbf24}
body.night .nora-callout-danger{--co-color:#f87171}
body.night .nora-callout-example{--co-color:#c084fc}
body.night .nora-callout-quote{--co-color:#94a3b8}
.nora-callout-title{
  display:flex;align-items:center;gap:8px;padding:11px 15px;
  font-weight:800;font-size:.96em;color:var(--co-color);list-style:none;
}
details.nora-callout>summary.nora-callout-title{cursor:pointer;user-select:none}
details.nora-callout>summary.nora-callout-title::-webkit-details-marker{display:none}
.nora-callout-chevron{
  margin-inline-start:auto;width:8px;height:8px;
  border-inline-end:2px solid currentColor;border-bottom:2px solid currentColor;
  transform:rotate(45deg);transition:transform .18s ease;opacity:.75;
}
details.nora-callout[open]>summary .nora-callout-chevron{transform:rotate(225deg)}
.nora-callout-body{padding:2px 15px 12px}
.nora-callout-body>:first-child{margin-top:0}
.nora-callout-body>:last-child{margin-bottom:0}
@media print{
  .mmd-lightbox{display:none!important}
  .nora-mermaid-light{display:block!important}
  .nora-mermaid-dark{display:none!important}
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
  .readerbar,.progress,.bookmarks,.navrow,#searchStatus,.toc-drawer,.toc-shade,.settings-drawer,.settings-shade,.start-reading-btn,.lightbox,.md-pdf-details,.fn-popover,.fn-back,.nora-code-copy{display:none!important}
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
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Vazirmatn:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>${css}</style>${hasCustomCss ? `<style id="nora-custom-style">${customCssText}</style>` : ''}
</head>
<body class="${[dark ? 'night' : '', initReadingMode === 'scroll' ? 'scroll-mode' : '', autoDir ? 'auto-dir' : ''].filter(Boolean).join(' ')}" data-palette="${esc(initPalette)}">
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
      <div class="set-label"><span>${esc(r.setReadingMode)}</span></div>
      <div class="seg-control">
        <button type="button" class="seg-btn" data-rm-val="paginated">${esc(r.rmPaginated)}</button>
        <button type="button" class="seg-btn" data-rm-val="scroll">${esc(r.rmScroll)}</button>
      </div>
    </div>

    <div class="set-group">
      <div class="set-label"><span>${esc(r.setFontFamily)}</span></div>
      <select id="readerFont" class="set-select" title="${esc(r.fontTitle)}">
        <option value="default">${esc(r.fontDefault)}</option>
        <option value="Vazirmatn">Vazirmatn</option>
        <option value="Inter">Inter</option>
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

<div id="mmdLightbox" class="mmd-lightbox" aria-hidden="true">
  <div class="mmd-lb-bar">
    <button type="button" id="mmdZoomOut" title="Zoom out">−</button>
    <span class="mmd-lb-pct" id="mmdZoomPct">100%</span>
    <button type="button" id="mmdZoomIn" title="Zoom in">+</button>
    <button type="button" id="mmdZoomReset" title="Reset">100%</button>
    <button type="button" id="mmdLbClose" aria-label="${esc(r.lightboxClose)}">×</button>
  </div>
  <div id="mmdLbStage" class="mmd-lb-stage">
    <div id="mmdLbCanvas" class="mmd-lb-canvas"></div>
  </div>
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
    readingMode:${JSON.stringify(initReadingMode)},
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
    [...tocSource.children].forEach(child=>{
      if(child.classList&&child.classList.contains('toc-title')) return;
      tocItems.append(child.cloneNode(true));
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

  /* ===== لایت‌باکس زوم برداری واقعی برای Mermaid و فرمول‌های LaTeX ===== */
  const mmdLb=document.querySelector('#mmdLightbox');
  const mmdStage=document.querySelector('#mmdLbStage');
  const mmdCanvas=document.querySelector('#mmdLbCanvas');
  const mmdPct=document.querySelector('#mmdZoomPct');
  let mmdScale=1, mmdTx=0, mmdTy=0, mmdDrag=false, mmdMoved=false, mmdStartX=0, mmdStartY=0;
  let mmdMode='svg', mmdBaseW=600, mmdBaseH=400, mmdBaseFont=26;
  const applyMmdTransform=()=>{
    mmdCanvas.style.transform='translate('+Math.round(mmdTx)+'px,'+Math.round(mmdTy)+'px)';
    if(mmdMode==='svg'){
      const svg=mmdCanvas.querySelector('svg');
      if(svg){
        svg.style.width=Math.round(mmdBaseW*mmdScale)+'px';
        svg.style.height=Math.round(mmdBaseH*mmdScale)+'px';
        svg.style.maxWidth='none';
        svg.style.maxHeight='none';
      }
    }else if(mmdMode==='math'){
      mmdCanvas.style.fontSize=(mmdBaseFont*mmdScale).toFixed(1)+'px';
    }
    mmdPct.textContent=Math.round(mmdScale*100)+'%';
  };
  const resetMmdView=()=>{mmdScale=1;mmdTx=0;mmdTy=0;applyMmdTransform()};
  const closeMmdLb=()=>{
    mmdLb.classList.remove('open');
    mmdLb.setAttribute('aria-hidden','true');
    mmdCanvas.innerHTML='';
    mmdCanvas.style.fontSize='';
  };
  const setMmdScale=next=>{mmdScale=Math.max(0.4,Math.min(5,next));applyMmdTransform()};
  document.querySelector('#mmdZoomIn').onclick=()=>setMmdScale(mmdScale+0.25);
  document.querySelector('#mmdZoomOut').onclick=()=>setMmdScale(mmdScale-0.25);
  document.querySelector('#mmdZoomReset').onclick=resetMmdView;
  document.querySelector('#mmdLbClose').onclick=closeMmdLb;
  mmdStage.addEventListener('wheel',e=>{
    e.preventDefault();
    setMmdScale(mmdScale+(e.deltaY<0?0.18:-0.18));
  },{passive:false});
  mmdStage.addEventListener('pointerdown',e=>{
    if(e.button!==0) return;
    mmdDrag=true;mmdMoved=false;mmdStartX=e.clientX-mmdTx;mmdStartY=e.clientY-mmdTy;
    mmdStage.classList.add('dragging');
    try{mmdStage.setPointerCapture(e.pointerId)}catch(err){}
  });
  mmdStage.addEventListener('pointermove',e=>{
    if(!mmdDrag) return;
    const nx=e.clientX-mmdStartX, ny=e.clientY-mmdStartY;
    if(Math.abs(nx-mmdTx)>3||Math.abs(ny-mmdTy)>3) mmdMoved=true;
    mmdTx=nx;mmdTy=ny;applyMmdTransform();
  });
  const endMmdDrag=e=>{
    if(!mmdDrag) return;
    mmdDrag=false;mmdStage.classList.remove('dragging');
    try{mmdStage.releasePointerCapture(e.pointerId)}catch(err){}
  };
  mmdStage.addEventListener('pointerup',endMmdDrag);
  mmdStage.addEventListener('pointercancel',endMmdDrag);
  mmdStage.addEventListener('click',e=>{
    if(e.target===mmdStage&&!mmdMoved) closeMmdLb();
  });
  function openVectorLightbox(node){
    mmdCanvas.innerHTML='';
    mmdCanvas.style.fontSize='';
    const clone=node.cloneNode(true);
    if(clone.tagName&&clone.tagName.toLowerCase()==='svg'){
      mmdMode='svg';
      clone.removeAttribute('style');
      mmdCanvas.append(clone);
      mmdLb.classList.add('open');
      mmdLb.setAttribute('aria-hidden','false');
      const vb=(clone.getAttribute('viewBox')||'').trim().split(/[\s,]+/).map(Number);
      let natW=vb.length===4&&vb[2]>0?vb[2]:(parseFloat(clone.getAttribute('width'))||node.getBoundingClientRect().width||600);
      let natH=vb.length===4&&vb[3]>0?vb[3]:(parseFloat(clone.getAttribute('height'))||node.getBoundingClientRect().height||400);
      const maxW=window.innerWidth*0.84, maxH=window.innerHeight*0.74;
      const fit=Math.min(1, maxW/natW, maxH/natH);
      mmdBaseW=Math.max(120, natW*fit);
      mmdBaseH=Math.max(60, natH*fit);
    }else{
      mmdMode='math';
      mmdBaseFont=28;
      mmdCanvas.append(clone);
      mmdLb.classList.add('open');
      mmdLb.setAttribute('aria-hidden','false');
    }
    resetMmdView();
  }
  sourceEl.addEventListener('click',e=>{
    const copyBtn=e.target.closest('.nora-code-copy');
    if(copyBtn){
      e.preventDefault();
      const block=copyBtn.closest('.nora-code-block');
      const codeEl=block&&block.querySelector('pre code');
      const text=codeEl?codeEl.textContent:'';
      if(!text) return;
      const done=()=>{
        copyBtn.textContent=S.copiedCode;
        copyBtn.classList.add('copied');
        clearTimeout(copyBtn._t);
        copyBtn._t=setTimeout(()=>{copyBtn.textContent=S.copyCode;copyBtn.classList.remove('copied')},1800);
      };
      if(navigator.clipboard&&navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).then(done).catch(()=>{
          const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';
          document.body.appendChild(ta);ta.select();try{document.execCommand('copy');done()}catch(err){}ta.remove();
        });
      }else{
        const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';
        document.body.appendChild(ta);ta.select();try{document.execCommand('copy');done()}catch(err){}ta.remove();
      }
      return;
    }
    const svgBox=e.target.closest('.nora-svg-wrap');
    if(svgBox){
      const target=svgBox.querySelector('svg');
      if(target) openVectorLightbox(target);
      return;
    }
    const mathBox=e.target.closest('.nora-math-block');
    if(mathBox){
      const target=mathBox.querySelector('svg')||mathBox.querySelector('math');
      if(target) openVectorLightbox(target);
      return;
    }
    const wrap=e.target.closest('.nora-mermaid-wrap');
    if(!wrap) return;
    const isNight=document.body.classList.contains('night');
    const svg=wrap.querySelector(isNight?'.nora-mermaid-dark svg':'.nora-mermaid-light svg')||wrap.querySelector('svg');
    if(!svg) return;
    openVectorLightbox(svg);
  });

  const all=[...sourceEl.querySelectorAll('.chapter-page')];
  const indicator=document.querySelector('#pageIndicator');
  const progress=document.querySelector('.progress span');
  const markBtn=document.querySelector('#markBtn');
  const posKey='nora-pos-v2-'+bookId;
  const prefsKey='nora-prefs-v3-'+bookId+${JSON.stringify(hasCustomCss ? '-' + shortHash(customCssText) : '')};
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
    if(document.body.classList.contains('scroll-mode')){
      const docH=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
      progress.style.width=Math.max(0,Math.min(100,(window.scrollY/docH)*100))+'%';
      return;
    }
    if(current<0){progress.style.width='0%';return}
    const page=all[current];
    if(!page) return;
    const top=page.offsetTop,height=page.offsetHeight||1;
    const within=Math.max(0,Math.min(1,(window.scrollY+window.innerHeight-top)/(height+window.innerHeight)));
    progress.style.width=((current+within)/all.length*100)+'%';
  }
  function syncActiveToc(){
    const links=[...tocItems.querySelectorAll('a[href^="#"]')];
    let targetHref='#cover';
    if(current>=0&&all[current]){
      const anchor=all[current].querySelector('[data-nora-chapter][id], h1[id], h2[id], h3[id]');
      if(anchor) targetHref='#'+anchor.id;
    }
    links.forEach(a=>a.classList.toggle('current',a.getAttribute('href')===targetHref));
    tocItems.querySelectorAll('.toc-group').forEach(g=>{
      g.classList.toggle('is-active-group',Boolean(g.querySelector('a.current')));
    });
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
    syncActiveToc();
    try{localStorage.setItem(posKey,String(current))}catch(e){}
    if(shouldScroll){
      if(document.body.classList.contains('scroll-mode')){
        const targetEl=current===-1?coverEl:all[current];
        if(targetEl) targetEl.scrollIntoView({behavior:'smooth',block:'start'});
      }else{
        window.scrollTo({top:0,behavior:'smooth'});
      }
    }
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
      if(mmdLb.classList.contains('open')){closeMmdLb();return}
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
  const isPreview=${options.forExport === false ? 'true' : 'false'};
  let prefs={...defaultPrefs};
  if(!isPreview){
    try{const savedPrefs=JSON.parse(localStorage.getItem(prefsKey)||'null');if(savedPrefs&&typeof savedPrefs==='object') prefs={...prefs,...savedPrefs}}catch(e){}
  }

  const customStyleEl=document.querySelector('#nora-custom-style');
  const fallbackPalette=${JSON.stringify(fallbackPalette)};
  const fontSel=document.querySelector('#readerFont');
  const fontSizeVal=document.querySelector('#fontSizeVal');
  const fontSizeReadout=document.querySelector('#fontSizeReadout');
  const hlIndicator=document.querySelector('#hlIndicator');
  const themeBtn=document.querySelector('#themeBtn');

  function applyPrefs(){
    document.body.classList.toggle('night',!!prefs.night);
    const useCustom=Boolean(customStyleEl)&&(prefs.palette==='custom');
    if(customStyleEl) customStyleEl.disabled=!useCustom;
    if(!customStyleEl&&prefs.palette==='custom') prefs.palette=fallbackPalette;
    document.body.dataset.palette=useCustom?'custom':(prefs.palette||'default');
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
    const rmVal=prefs.readingMode==='scroll'?'scroll':'paginated';
    document.body.classList.toggle('scroll-mode',rmVal==='scroll');
    document.querySelectorAll('[data-rm-val]').forEach(b=>b.classList.toggle('active',b.dataset.rmVal===rmVal));
    setProgress();
    document.querySelectorAll('[data-palette-val]').forEach(b=>b.classList.toggle('active',b.dataset.paletteVal===(prefs.palette||'default')));
    document.querySelectorAll('[data-cover-val]').forEach(b=>b.classList.toggle('active',b.dataset.coverVal===(prefs.cover||'aurora')));
    document.querySelectorAll('[data-hl-val]').forEach(b=>b.classList.toggle('active',b.dataset.hlVal===(prefs.hlColor||'yellow')));

    if(!isPreview){try{localStorage.setItem(prefsKey,JSON.stringify(prefs))}catch(e){}}
  }
  applyPrefs();

  document.querySelector('#smaller').onclick=()=>{prefs.size=Math.max(12,(prefs.size||16)-1);applyPrefs()};
  document.querySelector('#bigger').onclick=()=>{prefs.size=Math.min(28,(prefs.size||16)+1);applyPrefs()};
  themeBtn.onclick=()=>{prefs.night=!prefs.night;applyPrefs()};
  fontSel.onchange=e=>{prefs.font=e.target.value;applyPrefs()};
  document.querySelectorAll('[data-theme-val]').forEach(b=>b.onclick=()=>{prefs.night=b.dataset.themeVal==='dark';applyPrefs()});
  document.querySelectorAll('[data-lh-val]').forEach(b=>b.onclick=()=>{prefs.lh=b.dataset.lhVal;applyPrefs()});
  document.querySelectorAll('[data-width-val]').forEach(b=>b.onclick=()=>{prefs.width=b.dataset.widthVal;applyPrefs()});
  document.querySelectorAll('[data-rm-val]').forEach(b=>b.onclick=()=>{prefs.readingMode=b.dataset.rmVal;applyPrefs()});
  document.querySelectorAll('[data-palette-val]').forEach(b=>b.onclick=()=>{prefs.palette=b.dataset.paletteVal;applyPrefs()});
  document.querySelectorAll('[data-cover-val]').forEach(b=>b.onclick=()=>{prefs.cover=b.dataset.coverVal;if(prefs.palette==='custom')prefs.palette=fallbackPalette;applyPrefs()});
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
  const origImgSrcs=all.map(p=>[...p.querySelectorAll('img[src^="data:"]')].map(img=>img.src));
  function saveAnnotations(){
    try{
      const payload=all.map(p=>{
        const clone=p.querySelector('.article').cloneNode(true);
        clone.querySelectorAll('img[src^="data:"]').forEach((img,idx)=>{
          img.setAttribute('data-nora-img-idx',String(idx));
          img.setAttribute('src','');
        });
        return clone.innerHTML;
      });
      localStorage.setItem(annotationKey,JSON.stringify(payload));
    }catch(e){}
  }
  try{
    const saved=JSON.parse(localStorage.getItem(annotationKey)||'null');
    if(Array.isArray(saved)) all.forEach((p,i)=>{
      if(typeof saved[i]==='string'){
        const art=p.querySelector('.article');
        art.innerHTML=saved[i];
        art.querySelectorAll('img[data-nora-img-idx]').forEach(img=>{
          const idx=+img.getAttribute('data-nora-img-idx');
          if(origImgSrcs[i]&&origImgSrcs[i][idx]) img.src=origImgSrcs[i][idx];
          img.removeAttribute('data-nora-img-idx');
        });
      }
    });
  }catch(e){}
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
      fontFamily: this.overrides.fontFamily || this.plugin.settings.fontFamily || 'Vazirmatn',
      fontSize: String(this.overrides.fontSize || this.plugin.settings.fontSize),
      width: this.overrides.width || this.plugin.settings.width,
      readingMode: this.overrides.readingMode || this.plugin.settings.readingMode || 'paginated',
      readerLanguage: this.overrides.readerLanguage || this.plugin.settings.readerLanguage,
      embedAttachments: this.plugin.settings.embedAttachments,
      openAfterExport: this.plugin.settings.openAfterExport,
      saveMetadataToFrontmatter: this.plugin.settings.saveMetadataToFrontmatter
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
    addSelect(styleGrid, t.fieldFontFamily, 'fontFamily', t.fontFamilies);
    addSelect(styleGrid, t.fieldFontSize, 'fontSize', t.fontSizes);
    addSelect(styleGrid, t.fieldWidth, 'width', t.widths);
    addSelect(styleGrid, t.fieldReadingMode, 'readingMode', t.readingModes);
    addSelect(styleGrid, t.fieldReaderLang, 'readerLanguage', t.readerLangs);

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

    const fmLabel = toggleRow.createEl('label');
    const fmCb = fmLabel.createEl('input', { type: 'checkbox' });
    fmCb.checked = state.saveMetadataToFrontmatter;
    fmCb.addEventListener('change', () => { state.saveMetadataToFrontmatter = fmCb.checked; });
    fmLabel.appendText(t.toggleSaveFrontmatter);

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
      embedAttachments: plugin.settings.embedAttachments,
      openFolderAfter: true,
      theme: plugin.settings.theme,
      palette: plugin.settings.palette,
      coverStyle: plugin.settings.coverStyle,
      direction: plugin.settings.direction,
      fontFamily: plugin.settings.fontFamily || 'Vazirmatn',
      fontSize: String(plugin.settings.fontSize),
      width: plugin.settings.width,
      readingMode: plugin.settings.readingMode || 'paginated',
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
    addSelect(styleGrid, t.fieldFontFamily, 'fontFamily', t.fontFamilies);
    addSelect(styleGrid, t.fieldFontSize, 'fontSize', t.fontSizes);
    addSelect(styleGrid, t.fieldWidth, 'width', t.widths);
    addSelect(styleGrid, t.fieldReadingMode, 'readingMode', t.readingModes);
    addSelect(styleGrid, t.fieldReaderLang, 'readerLanguage', t.readerLangs);

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
    if (prefs.readingMode) this.viewPrefs.readingMode = prefs.readingMode;
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

    const mermaidMap = await renderMermaidBlocksMap(md);
    const mathMap = await renderMathBlocksMap(md);
    const customStyle = await resolveCustomCss(this.app, this.plugin.settings);
    const html = buildStandaloneHtml(md, {
      ...meta,
      ...this.viewPrefs,
      uiLang,
      fontFamily: this.viewPrefs.fontFamily || this.plugin.settings.fontFamily || 'Vazirmatn',
      fontSize: this.plugin.settings.fontSize,
      width: this.plugin.settings.width,
      readingMode: this.viewPrefs.readingMode || this.plugin.settings.readingMode || 'paginated',
      customCss: customStyle.css,
      customCssName: customStyle.name,
      forExport: false
    }, attachmentsMap, mermaidMap, mathMap);

    this.iframe.srcdoc = html;
  }

  async onClose() {
    clearTimeout(this.debounceTimer);
  }
}

/* =========================================================
   تب تنظیمات پلاگین (Settings Tab — دوزبانه)
   ========================================================= */

class NoraChangelogModal extends Modal {
  constructor(app, language) { super(app); this.language = language === 'en' ? 'en' : 'fa'; }
  onOpen() {
    const fa = this.language === 'fa', t = I18N[this.language], { contentEl } = this;
    contentEl.empty(); contentEl.addClass('nora-changelog-modal'); contentEl.setAttribute('dir', fa ? 'rtl' : 'ltr');
    contentEl.createEl('h2', { text: t.changelogTitle });
    contentEl.createEl('p', { text: t.changelogVersion, cls: 'nora-changelog-version' });
    const list = contentEl.createEl('ul');
    for (const item of t.changelogItems) list.createEl('li', { text: item });
    const close = contentEl.createEl('button', { text: fa ? 'بستن' : 'Close', cls: 'nora-changelog-close' });
    close.addEventListener('click', () => this.close());
  }
  onClose() { this.contentEl.empty(); }
}

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
      .setName(t.setFontFamilyName)
      .addDropdown(dd => {
        t.fontFamilies.forEach(([v, label]) => dd.addOption(v, label));
        return dd.setValue(this.plugin.settings.fontFamily || 'Vazirmatn')
          .onChange(async val => {
            this.plugin.settings.fontFamily = val;
            await this.plugin.saveSettings();
            this.plugin.refreshOpenPreviews();
          });
      });

    new Setting(containerEl)
      .setName(t.setReadingModeName)
      .addDropdown(dd => {
        t.readingModes.forEach(([v, label]) => dd.addOption(v, label));
        return dd.setValue(this.plugin.settings.readingMode || 'paginated')
          .onChange(async val => {
            this.plugin.settings.readingMode = val;
            await this.plugin.saveSettings();
            this.plugin.refreshOpenPreviews();
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
      .setName(t.setSaveFrontmatterName)
      .setDesc(t.setSaveFrontmatterDesc)
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.saveMetadataToFrontmatter)
        .onChange(async val => {
          this.plugin.settings.saveMetadataToFrontmatter = val;
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

    const cssFileSetting = new Setting(containerEl)
      .setName(t.setCustomCssFileName)
      .setDesc(t.setCustomCssFileDesc);

    let cssDropdown = null;
    const populateSnippets = async () => {
      if (!cssDropdown) return;
      const selectEl = cssDropdown.selectEl;
      const currentVal = this.plugin.settings.customCssPath || '';
      const snippets = await listVaultCssSnippets(this.app);
      selectEl.empty();
      cssDropdown.addOption('', t.setCustomCssNone);
      let foundCurrent = !currentVal;
      for (const item of snippets) {
        cssDropdown.addOption(item.path, item.label);
        if (item.path === currentVal) foundCurrent = true;
      }
      if (currentVal && !foundCurrent) {
        cssDropdown.addOption(currentVal, `⚠️ ${currentVal}`);
      }
      cssDropdown.setValue(currentVal);
    };

    cssFileSetting
      .addDropdown(dd => {
        cssDropdown = dd;
        dd.addOption('', t.setCustomCssNone);
        const currentVal = this.plugin.settings.customCssPath || '';
        if (currentVal) dd.addOption(currentVal, currentVal);
        dd.setValue(currentVal);
        dd.onChange(async val => {
          this.plugin.settings.customCssPath = val;
          await this.plugin.saveSettings();
          this.plugin.refreshOpenPreviews();
        });
        return dd;
      })
      .addExtraButton(btn => btn
        .setIcon('refresh-cw')
        .setTooltip(t.setCustomCssRefresh)
        .onClick(() => { void populateSnippets(); }));

    void populateSnippets();

    new Setting(containerEl)
      .setName(t.setCustomCssName)
      .setDesc(t.setCustomCssDesc)
      .addTextArea(text => {
        text
          .setPlaceholder(t.setCustomCssPh)
          .setValue(this.plugin.settings.customCss || '')
          .onChange(async val => {
            this.plugin.settings.customCss = val;
            await this.plugin.saveSettings();
            this.plugin.refreshOpenPreviews();
          });
        text.inputEl.rows = 6;
        text.inputEl.dir = 'ltr';
        text.inputEl.style.width = '100%';
        text.inputEl.style.minWidth = '240px';
        text.inputEl.style.fontFamily = 'var(--font-monospace, ui-monospace, SFMono-Regular, Consolas, monospace)';
        text.inputEl.style.fontSize = '12px';
        return text;
      });

    this.addGuidesSection(containerEl, uiLang === 'fa');
    this.addSupportSection(containerEl, uiLang === 'fa');
  }

  addGuidesSection(container, fa) {
    const t = I18N[fa ? 'fa' : 'en'];
    const root = container.createDiv({ cls: 'nora-guides' });
    root.setAttribute('dir', fa ? 'rtl' : 'ltr');
    root.createEl('h3', { cls: 'nora-guides-heading', text: t.guideHeading });
    root.createEl('p', { cls: 'nora-guides-desc', text: t.guideIntro });
    const actions = root.createDiv({ cls: 'nora-guide-actions' });
    const guides = [
      {
        label: t.guideFa,
        url: 'https://github.com/singhaf9270/nora-html-exlplorer/blob/main/Nora-HTML-Exporter-Guide-FA.md',
        primary: fa
      },
      {
        label: t.guideEn,
        url: 'https://github.com/singhaf9270/nora-html-exlplorer/blob/main/Nora_HTML_Exporter_Complete_English_Guide.md',
        primary: !fa
      }
    ];
    for (const guide of guides) {
      const link = actions.createEl('a', {
        cls: guide.primary ? 'nora-guide-button primary' : 'nora-guide-button',
        text: guide.label,
        href: guide.url
      });
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      link.setAttribute('aria-label', guide.label);
    }
    const row = root.createDiv({ cls: 'nora-changelog-row' });
    row.createSpan({ cls: 'nora-changelog-label', text: t.changelogTitle });
    const button = row.createEl('button', { cls: 'nora-changelog-button', text: t.changelogButton });
    button.type = 'button';
    button.addEventListener('click', () => new NoraChangelogModal(this.app, this.plugin.getUiLang()).open());
  }

  addSupportSection(container, fa) {
    const t = I18N[fa ? 'fa' : 'en'];
    const root = container.createDiv({ cls: 'nora-support' });
    root.setAttribute('dir', fa ? 'rtl' : 'ltr');
    root.createEl('h3', { cls: 'nora-support-heading', text: t.supportHeading });
    root.createEl('p', { cls: 'nora-support-intro', text: t.supportIntro });

    const grid = root.createDiv({ cls: 'nora-channel-grid' });
    const channels = [
      ['bale', fa ? 'بله' : 'Bale', 'https://ble.ir/obsidiantut'],
      ['telegram', fa ? 'تلگرام' : 'Telegram', 'https://t.me/obsidiantut'],
      ['youtube', fa ? 'یوتیوب' : 'YouTube', 'https://youtube.com/@obsidiantut']
    ];
    for (const [type, name, url] of channels) {
      const card = grid.createEl('a', { cls: 'nora-channel' });
      card.href = url;
      card.setAttribute('target', '_blank');
      card.setAttribute('rel', 'noopener noreferrer');
      card.setAttribute('aria-label', (fa ? 'عضویت در کانال ' : 'Join our ') + name);
      const logoSpan = card.createSpan({ cls: 'nora-channel-logo' });
      noraSupportLogo(logoSpan, type);
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
    button.href = this.plugin.manifest.fundingUrl || 'https://reymit.ir/singhaf9270';
    button.setAttribute('target', '_blank');
    button.setAttribute('rel', 'noopener noreferrer');
  }
}

/* ===== SVG channel logos — exact artwork from HormuzHabit ===== */
const NORA_SVG_NS = 'http://www.w3.org/2000/svg';
function noraSupportLogo(parent, type) {
  const doc = parent.ownerDocument || document;
  const svg = doc.createElementNS(NORA_SVG_NS, 'svg');
  svg.setAttribute('viewBox', type === 'bale' ? '0 0 64 64' : '0 0 24 24');
  svg.setAttribute('width', '28'); svg.setAttribute('height', '28'); svg.setAttribute('aria-hidden', 'true');
  function shape(tag, attrs) {
    const node = doc.createElementNS(NORA_SVG_NS, tag);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
    svg.appendChild(node);
  }
  if (type === 'bale') {
    shape('circle', { cx: '32', cy: '32', r: '30', fill: '#22A06B' });
    shape('path', { d: 'M20 33 L28 41 L46 23', fill: 'none', stroke: '#fff', 'stroke-width': '6', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  } else if (type === 'telegram') {
    shape('path', { fill: '#229ED9', d: 'M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z' });
  } else if (type === 'youtube') {
    shape('path', { fill: '#FF0000', d: 'M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8z' });
    shape('path', { fill: '#fff', d: 'M9.6 8.4v7.2l6.2-3.6z' });
  } else if (type === 'heart') {
    shape('path', { d: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.6', 'stroke-linejoin': 'round' });
  }
  parent.appendChild(svg);
  return svg;
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
    const currentVersion = this.manifest.version;
    const previousVersion = this.settings.lastSeenVersion;
    const isUpgrade = previousVersion !== currentVersion;
    if (isUpgrade) {
      new Notice(I18N[this.getUiLang()].changelogUpdated, 7000);
      window.setTimeout(() => new NoraChangelogModal(this.app, this.getUiLang()).open(), 500);
    }
    if (previousVersion !== currentVersion) {
      this.settings.lastSeenVersion = currentVersion;
      await this.saveSettings();
    }
    const guideLang = this.getUiLang();
    const guideFileName = guideLang === 'fa' ? 'Nora-User-Guide-fa.md' : 'Nora-User-Guide-en.md';
    const guidePath = `Nora Guides/${guideFileName}`;
    if (!(await this.app.vault.adapter.exists(guidePath))) void this.downloadGuideOnFirstRun();
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

  async downloadGuideOnFirstRun() {
    const lang = this.getUiLang();
    const isFa = lang === 'fa';
    const fileName = isFa ? 'Nora-User-Guide-fa.md' : 'Nora-User-Guide-en.md';
    const path = `Nora Guides/${fileName}`;
    const url = isFa
      ? 'https://raw.githubusercontent.com/singhaf9270/nora-html-exlplorer/main/Nora-HTML-Exporter-Guide-FA.md'
      : 'https://raw.githubusercontent.com/singhaf9270/nora-html-exlplorer/main/Nora_HTML_Exporter_Complete_English_Guide.md';
    try {
      await this.ensureFolderExists('Nora Guides');
      if (!(await this.app.vault.adapter.exists(path))) {
        const response = await requestUrl({ url, method: 'GET' });
        if (response.status < 200 || response.status >= 300 || !response.text) {
          throw new Error(`Guide request failed (HTTP ${response.status})`);
        }
        await this.app.vault.create(path, response.text);
      }
      this.settings.guideDownloaded = true;
      await this.saveSettings();
      new Notice(I18N[lang].guideDownloadedNotice, 7000);
    } catch (error) {
      this.settings.guideDownloaded = false;
      await this.saveSettings();
      console.error('Nora: automatic guide download failed', error);
      new Notice(I18N[lang].guideDownloadFailedNotice, 8000);
    }
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

  async saveMetadataToNoteFrontmatter(file, options) {
    if (!file || !this.app.fileManager || typeof this.app.fileManager.processFrontMatter !== 'function') return;
    try {
      await this.app.fileManager.processFrontMatter(file, fm => {
        const setOrKeep = (key, val) => {
          const v = String(val || '').trim();
          if (v) fm[key] = v;
        };
        setOrKeep('title', options.title);
        const fName = safeFileName(options.fileName || '');
        if (fName && fName !== safeFileName(file.basename)) {
          fm.exportName = fName;
        }
        setOrKeep('docType', options.docType);
        const authors = parseMultiList(options.author);
        if (authors.length === 1) fm.author = authors[0];
        else if (authors.length > 1) fm.author = authors;
        setOrKeep('subtitle', options.subtitle);
        const categories = parseMultiList(options.category);
        if (categories.length === 1) fm.category = categories[0];
        else if (categories.length > 1) fm.category = categories;
        setOrKeep('year', options.year);
        setOrKeep('description', options.description);
      });
    } catch (err) {
      console.warn('[Nora] Failed to save metadata to frontmatter:', err);
    }
  }

  async exportNote(file, options, { mode = 'vault' } = {}) {
    const uiLang = this.getUiLang();
    const t = I18N[uiLang];
    try {
      const shouldSaveFm = options.saveMetadataToFrontmatter !== undefined
        ? options.saveMetadataToFrontmatter
        : this.settings.saveMetadataToFrontmatter;
      if (shouldSaveFm) {
        await this.saveMetadataToNoteFrontmatter(file, options);
      }
      const md = await this.app.vault.read(file);
      const embed = options.embedAttachments !== undefined ? options.embedAttachments : this.settings.embedAttachments;
      const attachmentsMap = await resolveAttachmentsMap(this.app, md, file, {
        forExport: true,
        embedAttachments: embed
      });

      const mermaidMap = await renderMermaidBlocksMap(md);
      const mathMap = await renderMathBlocksMap(md);
      const customStyle = await resolveCustomCss(this.app, this.settings);
      const html = buildStandaloneHtml(md, { ...options, uiLang, customCss: customStyle.css, customCssName: customStyle.name, forExport: true }, attachmentsMap, mermaidMap, mathMap);
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
      let cleanMarkdown = stripFrontmatter(markdown);
      const sectionTitle = file.basename || file.name;

      const noteAttachments = await resolveAttachmentsMap(this.app, markdown, file, {
        forExport: true,
        embedAttachments: state.embedAttachments
      });
      for (const [key, value] of noteAttachments.entries()) {
        const fullKey = normPath(value.relPath);
        attachmentsMap.set(fullKey, value);
        if (attachmentsMap.has(key) && attachmentsMap.get(key).relPath !== value.relPath) {
          const escKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          cleanMarkdown = cleanMarkdown.replace(new RegExp(`(!?\\[\\[)(${escKey})([|#\\]])`, 'gi'), `$1${value.relPath}$3`);
          cleanMarkdown = cleanMarkdown.replace(new RegExp(`(\\]\\()(${escKey})([)#\\s])`, 'gi'), `$1${value.relPath}$3`);
        } else {
          attachmentsMap.set(key, value);
        }
      }

      combinedParts.push(`:::NORA_CHAPTER_START::${sectionTitle}:::\n\n${cleanMarkdown}`);
    }

    const combinedMarkdown = combinedParts.join('\n\n---\n\n');
    const folderLabel = folderPath === '/' ? 'Vault' : folderPath.split('/').pop();
    const mermaidMap = await renderMermaidBlocksMap(combinedMarkdown);
    const mathMap = await renderMathBlocksMap(combinedMarkdown);
    const customStyle = await resolveCustomCss(this.app, this.settings);
    const html = buildStandaloneHtml(combinedMarkdown, {
      customCss: customStyle.css,
      customCssName: customStyle.name,
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
      fontFamily: state.fontFamily || this.settings.fontFamily || 'Vazirmatn',
      fontSize: state.fontSize,
      width: state.width,
      readingMode: state.readingMode || this.settings.readingMode || 'paginated',
      readerLanguage: state.readerLanguage,
      chapterHeadingLevel: this.settings.chapterHeadingLevel || '1',
      splitMarkedChaptersOnly: true,
      uiLang,
      forExport: true
    }, attachmentsMap, mermaidMap, mathMap);

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

/* nosourcemap */
