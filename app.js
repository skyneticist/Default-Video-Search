const DEFAULT_TEMPLATES = window.DEFAULT_SEARCH_TEMPLATES || [
  `"{{filename}}"`,
  `"{{filenameWithExtension}}"`,
  `intitle:"{{filename}}"`,
  `intitle:"{{prefix}}"`,
  `site:youtube.com/watch "{{filename}}"`,
  `site:youtube.com/watch "{{filenameWithExtension}}"`,
  `site:youtube.com/watch intitle:"{{prefix}}"`,
];

const sourcePatterns = Array.isArray(window.filenamePatterns) ? window.filenamePatterns : [];
const recycleBinMapPatterns = [
  {
    id: "map-win-ymd",
    label: "WIN YYYYMMDD",
    devices: ["Windows webcam", "Recycle Bin Map"],
    prefix: "WIN_",
    formatType: "date",
    dateFormat: "YYYYMMDD",
    extensions: [".MP4", ".AVI", ".WMV"],
    examples: ["WIN_20230102", "WIN_20090521"],
    searchTemplates: [`"{{filename}}"`, `intitle:"{{filename}}"`, `{{filename}}`],
    weight: 4,
    youtubeUsefulness: "medium",
    notes:
      "Webcam-style Windows capture name with the source token before an exact YYYYMMDD date. Useful for older low-edit uploads where the capture filename became the title.",
  },
  {
    id: "map-capture-ymd",
    label: "Capture YYYYMMDD",
    devices: ["Webcam", "Desktop capture", "Recycle Bin Map"],
    prefix: "Capture ",
    formatType: "date",
    dateFormat: "YYYYMMDD",
    extensions: [".MP4", ".AVI", ".WMV"],
    examples: ["Capture 20230102", "Capture 20090521"],
    searchTemplates: [`"{{filename}}"`, `intitle:"{{filename}}"`, `{{filename}}`],
    weight: 4,
    youtubeUsefulness: "medium",
    notes:
      "Plain capture-title pattern with an exact date. It is broad, but useful for finding webcam or desktop recordings that were uploaded without being renamed.",
  },
  {
    id: "map-desktop-date",
    label: "Desktop YYYY MM DD",
    devices: ["Desktop capture", "Screen recording", "Recycle Bin Map"],
    prefix: "Desktop ",
    formatType: "date",
    dateFormat: "YYYY MM DD",
    extensions: [".MP4", ".AVI", ".WMV"],
    examples: ["Desktop 2023 01 02"],
    searchTemplates: [`"{{filename}}"`, `intitle:"{{filename}}"`, `{{filename}}`],
    weight: 2,
    youtubeUsefulness: "low",
    notes: "Additional date template from public recycle-bin generators.",
  },
  {
    id: "map-inshot-ymd",
    label: "InShot YYYYMMDD",
    devices: ["InShot", "Smartphone editor", "Recycle Bin Map"],
    prefix: "InShot_",
    formatType: "date",
    dateFormat: "YYYYMMDD",
    extensions: [".MP4", ".MOV"],
    examples: ["InShot_20230102", "InShot_20240526"],
    searchTemplates: [`"{{filename}}"`, `intitle:"{{filename}}"`, `{{filename}}`],
    weight: 4,
    youtubeUsefulness: "medium",
    notes: "Editor export pattern called out on the map for post-2016 uploads.",
  },
  {
    id: "map-whatsapp-video-year",
    label: "WhatsApp Video YYYY",
    devices: ["WhatsApp", "Smartphone", "Recycle Bin Map"],
    prefix: "WhatsApp Video ",
    formatType: "date",
    dateFormat: "YYYY",
    extensions: [".MP4"],
    examples: ["WhatsApp Video 2023", "WhatsApp Video 2024"],
    searchTemplates: [`"{{filename}}"`, `intitle:"{{filename}}"`, `{{filename}}`],
    weight: 3,
    youtubeUsefulness: "medium",
    notes:
      "Default WhatsApp export title using only the year. It has a wide search surface, so it works best when paired with YouTube/title filters.",
  },
  {
    id: "map-whatsapp-video-date",
    label: "WhatsApp Video YYYY MM DD",
    devices: ["WhatsApp", "Smartphone", "Recycle Bin Map"],
    prefix: "WhatsApp Video ",
    formatType: "date",
    dateFormat: "YYYY MM DD",
    extensions: [".MP4"],
    examples: ["WhatsApp Video 2023 01 02"],
    searchTemplates: [`"{{filename}}"`, `intitle:"{{filename}}"`, `{{filename}}`],
    weight: 2,
    youtubeUsefulness: "medium",
    notes: "Additional WhatsApp date template from public recycle-bin generators.",
  },
  {
    id: "map-my-edited-video",
    label: "My Edited Video",
    devices: ["Video editor", "Recycle Bin Map"],
    prefix: "My Edited Video",
    formatType: "literal",
    extensions: [".MP4", ".MOV"],
    examples: ["My Edited Video"],
    searchTemplates: [`"My Edited Video"`, `intitle:"My Edited Video"`],
    weight: 3,
    youtubeUsefulness: "medium",
    notes:
      "Generic video-editor export title. Useful for default-title hunting because many casual edits are uploaded before the project name is changed.",
  },
  {
    id: "map-storage-emulated",
    label: "/Storage/Emulated/",
    devices: ["Android", "Video editor", "Photo albums", "Recycle Bin Map"],
    prefix: "/Storage/Emulated/",
    formatType: "literal",
    extensions: [],
    examples: ["/Storage/Emulated/"],
    searchTemplates: [`"/Storage/Emulated/"`, `intitle:"/Storage/Emulated/"`],
    weight: 2,
    youtubeUsefulness: "medium",
    notes:
      "Android storage-path leak that can appear when an editor or uploader exposes the local media path. Unusual wording makes it a surprisingly distinctive search signal.",
  },
  {
    id: "map-fullsizerender",
    label: "FullSizeRender",
    devices: ["Smartphone", "iOS export", "Recycle Bin Map"],
    prefix: "FullSizeRender",
    formatType: "literal",
    extensions: [".MOV", ".MP4"],
    examples: ["FullSizeRender"],
    searchTemplates: [`"FullSizeRender"`, `intitle:"FullSizeRender"`],
    weight: 3,
    youtubeUsefulness: "medium",
    notes:
      "Common smartphone export title, especially around iOS-style rendered media. Good for finding clips passed through mobile share/export flows.",
  },
  {
    id: "map-rpreplay",
    label: "RPReplay",
    devices: ["Screen recording", "Replay app", "Recycle Bin Map"],
    prefix: "RPReplay",
    formatType: "literal",
    extensions: [".MP4"],
    examples: ["RPReplay"],
    searchTemplates: [`"RPReplay"`, `intitle:"RPReplay"`],
    weight: 2,
    youtubeUsefulness: "medium",
    notes:
      "Replay/screen-recording prefix. Useful for gaming, app demos, and mobile recordings where the recorder name survived into the upload title.",
  },
  {
    id: "map-vlc-record",
    label: "VLC Record",
    devices: ["VLC", "Screen capture", "Recycle Bin Map"],
    prefix: "VLC Record",
    formatType: "literal",
    extensions: [".MP4", ".AVI", ".FLV"],
    examples: ["VLC Record"],
    searchTemplates: [`"VLC Record"`, `intitle:"VLC Record"`],
    weight: 2,
    youtubeUsefulness: "medium",
    notes:
      "VLC recording default title. Best used for screen captures, converted clips, or recordings made through desktop playback workflows.",
  },
  {
    id: "map-robloxapp",
    label: "Robloxapp",
    devices: ["Game capture", "Recycle Bin Map"],
    prefix: "Robloxapp",
    formatType: "literal",
    extensions: [".MP4", ".AVI"],
    examples: ["Robloxapp"],
    searchTemplates: [`"Robloxapp"`, `intitle:"Robloxapp"`],
    weight: 2,
    youtubeUsefulness: "medium",
    notes:
      "Game-capture title associated with Roblox recordings. Narrow enough to be useful when looking for unedited gameplay uploads.",
  },
  {
    id: "map-untitled-video",
    label: "Untitled video",
    devices: ["Video editor", "Recycle Bin Map"],
    prefix: "Untitled video",
    formatType: "literal",
    extensions: [".MP4", ".MOV"],
    examples: ["Untitled video", "Untitled Video"],
    searchTemplates: [`"Untitled video"`, `intitle:"Untitled video"`],
    weight: 2,
    youtubeUsefulness: "medium",
    notes: "Default editor/upload title included in public recycle-bin generators.",
  },
  {
    id: "map-hni-0xxx",
    label: "HNI 0XXX",
    devices: ["Nintendo DS", "Recycle Bin Map"],
    prefix: "HNI 0",
    formatType: "numeric",
    digitCount: 3,
    minNumber: 0,
    maxNumber: 100,
    extensions: [".AVI", ".MP4"],
    examples: ["HNI 0001", "HNI 0100"],
    searchTemplates: [`"{{filename}}"`, `intitle:"{{filename}}"`, `{{filename}}`],
    weight: 2,
    youtubeUsefulness: "low",
    notes:
      "Nintendo DS camera/video-style numeric pattern. Lower volume, but distinctive enough to keep for older handheld-media searches.",
  },
  {
    id: "map-wa0xxx",
    label: "WA0XXX",
    devices: ["Misc", "Recycle Bin Map"],
    prefix: "WA0",
    formatType: "numeric",
    digitCount: 3,
    minNumber: 0,
    maxNumber: 999,
    extensions: [".MP4", ".3GP"],
    examples: ["WA0001", "WA0999"],
    searchTemplates: [`"{{filename}}"`, `intitle:"{{filename}}"`, `{{filename}}`],
    weight: 2,
    youtubeUsefulness: "low",
    notes:
      "Short WA0-prefixed numeric pattern from older/default media sets. It is noisy, so extension or site filters help keep results useful.",
  },
  {
    id: "map-mol0xx",
    label: "MOL0XX",
    devices: ["Camera", "Recycle Bin Map"],
    prefix: "MOL0",
    formatType: "numeric",
    digitCount: 2,
    minNumber: 0,
    maxNumber: 99,
    extensions: [".MOD", ".MOV", ".MP4"],
    examples: ["MOL001", "MOL099"],
    searchTemplates: [`"{{filename}}"`, `intitle:"{{filename}}"`, `{{filename}}`],
    weight: 2,
    youtubeUsefulness: "low",
    notes:
      "Camera-style MOL0 pattern with a compact two-digit suffix. Best treated as a legacy/low-volume signal rather than a primary generator target.",
  },
  {
    id: "map-molo-hex",
    label: "MOLOXX",
    devices: ["Camera", "Recycle Bin Map"],
    prefix: "MOLO",
    formatType: "numeric",
    digitCount: 2,
    minNumber: 0,
    maxNumber: 99,
    extensions: [".MOD", ".MOV", ".MP4"],
    examples: ["MOLO0A", "MOLO9F"],
    searchTemplates: [`"{{filename}}"`, `intitle:"{{filename}}"`, `{{filename}}`],
    weight: 2,
    youtubeUsefulness: "low",
    notes:
      "Hex-like MOLO variant using A-F and numeric characters. Useful for covering older camera exports that do not fit plain decimal counters.",
  },
  {
    id: "map-time-hms",
    label: "HHMMSS",
    devices: ["Time of day", "Misc", "Recycle Bin Map"],
    prefix: "",
    formatType: "date",
    dateFormat: "HHMMSS",
    extensions: [".MP4", ".AVI", ".MOV"],
    examples: ["000000", "235959"],
    searchTemplates: [`"{{filename}}"`, `intitle:"{{filename}}"`, `{{filename}}`],
    weight: 1,
    youtubeUsefulness: "low",
    notes:
      "Time-of-day only pattern. Very broad by itself, but can surface forgotten clips when combined with extensions or strict title matching.",
  },
  {
    id: "map-vts-triplet",
    label: "VTS XX X",
    devices: ["DVD", "Recycle Bin Map"],
    prefix: "VTS ",
    formatType: "vtsTriplet",
    extensions: [".VOB", ".MPG", ".AVI"],
    examples: ["VTS 09 1", "VTS 01 0"],
    searchTemplates: [`"{{filename}}"`, `intitle:"{{filename}}"`, `{{filename}}`],
    weight: 2,
    youtubeUsefulness: "medium",
    notes:
      "DVD/VTS-style filename fragment. Useful for raw DVD rips, old conversion uploads, and videos where disc structure leaked into the title.",
  },
  {
    id: "map-vts-three-one",
    label: "VTS XXX 1",
    devices: ["DVD", "Recycle Bin Map"],
    prefix: "VTS ",
    formatType: "vtsThreeOne",
    extensions: [".VOB", ".MPG", ".AVI"],
    examples: ["VTS 009 1", "VTS 999 1"],
    searchTemplates: [`"{{filename}}"`, `intitle:"{{filename}}"`, `{{filename}}`],
    weight: 2,
    youtubeUsefulness: "medium",
    notes:
      "Three-digit VTS variant with a fixed trailing part. Helps cover DVD-rip naming that differs from the simpler VTS XX X pattern.",
  },
  {
    id: "map-vts-one-three",
    label: "VTS 01 XXX",
    devices: ["DVD", "Recycle Bin Map"],
    prefix: "VTS 01 ",
    formatType: "vtsOneThree",
    extensions: [".VOB", ".MPG", ".AVI"],
    examples: ["VTS 01 001", "VTS 01 999"],
    searchTemplates: [`"{{filename}}"`, `intitle:"{{filename}}"`, `{{filename}}`],
    weight: 2,
    youtubeUsefulness: "medium",
    notes:
      "VTS 01 variant from DVD file structures. Useful for older rip/conversion uploads where original disc filenames were preserved.",
  },
  {
    id: "map-slideshow",
    label: "My Slideshow",
    devices: ["Video editor", "Recycle Bin Map"],
    prefix: "My Slideshow",
    formatType: "literal",
    extensions: [".MP4", ".WMV"],
    examples: ["My Slideshow", "My Slideshow 01"],
    searchTemplates: [`"My Slideshow"`, `intitle:"My Slideshow"`],
    weight: 3,
    youtubeUsefulness: "medium",
    notes:
      "Default slideshow editor title. Good for casual photo-montage uploads, school projects, and older template-based video exports.",
  },
  {
    id: "map-stupeflix",
    label: "My Stupeflix Video",
    devices: ["Stupeflix", "Video editor", "Recycle Bin Map"],
    prefix: "My Stupeflix Video ",
    formatType: "numeric",
    digitCount: 4,
    minNumber: 0,
    maxNumber: 1050,
    extensions: [".MP4"],
    examples: ["My Stupeflix Video 0000", "My Stupeflix Video 1050"],
    searchTemplates: [`"{{filename}}"`, `intitle:"{{filename}}"`, `{{filename}}`],
    weight: 2,
    youtubeUsefulness: "medium",
    notes:
      "Stupeflix default export title with a numeric suffix. Narrow and dated, which makes it useful for finding older unrenamed editor uploads.",
  },
  {
    id: "map-quality-240-400",
    label: "240P 400K",
    devices: ["YouTube quality indicator", "Recycle Bin Map"],
    prefix: "240P 400K",
    formatType: "literal",
    extensions: [],
    examples: ["240P 400K"],
    searchTemplates: [`"240P 400K"`, `intitle:"240P 400K"`],
    weight: 2,
    youtubeUsefulness: "medium",
    notes:
      "Resolution/bitrate-style quality marker. Not a filename, but useful for finding old transcode/export titles or playlist-like default labels.",
  },
  {
    id: "map-quality-480-600",
    label: "480P 600K",
    devices: ["YouTube quality indicator", "Recycle Bin Map"],
    prefix: "480P 600K",
    formatType: "literal",
    extensions: [],
    examples: ["480P 600K"],
    searchTemplates: [`"480P 600K"`, `intitle:"480P 600K"`],
    weight: 2,
    youtubeUsefulness: "medium",
    notes:
      "Mid-resolution quality marker. Use as a secondary signal for old exported videos where bitrate labels were left in the title.",
  },
  {
    id: "map-quality-720-1500",
    label: "720P 1500K",
    devices: ["YouTube quality indicator", "Recycle Bin Map"],
    prefix: "720P 1500K",
    formatType: "literal",
    extensions: [],
    examples: ["720P 1500K"],
    searchTemplates: [`"720P 1500K"`, `intitle:"720P 1500K"`],
    weight: 2,
    youtubeUsefulness: "medium",
    notes:
      "720p bitrate marker from older export/download labels. More useful as a title fragment than as a standalone filename search.",
  },
  {
    id: "map-ext-video",
    label: ".MP4 / .3GP / .MOV / .AVI / .WMV",
    devices: ["Filename extension", "Recycle Bin Map"],
    prefix: ".MP4",
    formatType: "literal",
    extensions: [],
    examples: [".MP4", ".3GP", ".MOV", ".AVI", ".WMV"],
    searchTemplates: [`"{{filename}}"`, `intitle:"{{filename}}"`, `{{filename}}`],
    weight: 2,
    youtubeUsefulness: "low",
    notes:
      "Broad video-extension sweep. Low precision, but useful for probing uploads that kept a bare file extension in the title.",
  },
  {
    id: "map-ext-container",
    label: ".MKV / .MPEG / .FLV",
    devices: ["Filename extension", "Recycle Bin Map"],
    prefix: ".MKV",
    formatType: "literal",
    extensions: [],
    examples: [".MKV", ".MPEG", ".FLV"],
    searchTemplates: [`"{{filename}}"`, `intitle:"{{filename}}"`, `{{filename}}`],
    weight: 1,
    youtubeUsefulness: "low",
    notes:
      "Container-format sweep for MKV/MPEG/FLV. Best used as a fallback signal for older uploads, conversions, and raw file-title leaks.",
  },
  {
    id: "map-ext-audio",
    label: ".FLAC / .WAV",
    devices: ["Filename extension", "Recycle Bin Map"],
    prefix: ".FLAC",
    formatType: "literal",
    extensions: [],
    examples: [".FLAC", ".WAV"],
    searchTemplates: [`"{{filename}}"`, `intitle:"{{filename}}"`, `{{filename}}`],
    weight: 1,
    youtubeUsefulness: "low",
    notes:
      "Audio-extension sweep. Low confidence for video discovery, but useful when searching music, voice recordings, or user-created audio uploads.",
  },
];

const familyDefinitions = [
  {
    id: "apple",
    name: "Apple / iOS",
    cue: "IMG_, edited exports, screen recordings",
    color: "#e84b36",
    matches: (pattern) => startsWithAny(pattern.id, ["apple", "ios-screen"]),
  },
  {
    id: "android",
    name: "Android / Pixel",
    cue: "VID_, PXL_, Android recorder names",
    color: "#f3c33c",
    matches: (pattern) =>
      startsWithAny(pattern.id, [
        "android",
        "google-pixel",
        "map-inshot",
        "map-whatsapp",
      ]),
  },
  {
    id: "camera",
    name: "Camera Brands",
    cue: "Canon, Sony, Nikon, Fuji, Lumix",
    color: "#21a6a1",
    matches: (pattern) =>
      startsWithAny(pattern.id, [
        "canon",
        "nikon",
        "sony",
        "fuji",
        "panasonic",
        "olympus",
        "kodak",
        "ricoh",
        "pentax",
        "casio",
        "sanyo",
        "hp",
      ]),
  },
  {
    id: "action",
    name: "Action / Drone",
    cue: "GoPro, DJI, dashcam, action cams",
    color: "#83c65c",
    matches: (pattern) => startsWithAny(pattern.id, ["gopro", "dji", "dashcam", "xiaomi"]),
  },
  {
    id: "messaging",
    name: "Messaging",
    cue: "WhatsApp, Telegram, Messenger exports",
    color: "#4a7fe6",
    matches: (pattern) => startsWithAny(pattern.id, ["whatsapp", "telegram", "messenger"]),
  },
  {
    id: "capture",
    name: "Screen / Capture",
    cue: "OBS, Zoom, screen recorder defaults",
    color: "#8c62d9",
    matches: (pattern) =>
      startsWithAny(pattern.id, [
        "windows-screen",
        "android-screen",
        "obs",
        "zoom",
        "map-win",
        "map-capture",
        "map-desktop",
        "map-rpreplay",
        "map-vlc",
        "map-robloxapp",
      ]),
  },
  {
    id: "audio",
    name: "Audio / Recorder",
    cue: "AUD_, voice notes, recordings",
    color: "#ef7d2d",
    matches: (pattern) => startsWithAny(pattern.id, ["generic-aud", "generic-recording"]),
  },
  {
    id: "generic",
    name: "Generic / Legacy",
    cue: "MOV_, VIDEO, AVCHD, older phones",
    color: "#d94f80",
    matches: (pattern) =>
      startsWithAny(pattern.id, [
        "generic",
        "avchd",
        "imovie",
        "nokia",
        "older-phone",
        "map-my-edited",
        "map-storage",
        "map-fullsizerender",
        "map-untitled",
        "map-hni",
        "map-wa0",
        "map-mol",
        "map-time",
        "map-vts",
        "map-slideshow",
        "map-stupeflix",
      ]),
  },
  {
    id: "signals",
    name: "Extensions / Quality",
    cue: "file extensions and resolution strings",
    color: "#b7a572",
    matches: (pattern) => startsWithAny(pattern.id, ["map-ext", "map-quality"]),
  },
];

const fallbackFamily = {
  id: "other",
  name: "Other Patterns",
  cue: "lower-volume filename defaults",
  color: "#b7a572",
};

const familyOrder = new Map(familyDefinitions.map((family, index) => [family.id, index]));
const wheelLabels = {
  apple: "Apple",
  android: "Android",
  camera: "Cameras",
  action: "Action",
  messaging: "Messaging",
  capture: "Capture",
  audio: "Audio",
  generic: "Generic",
  signals: "Signals",
  other: "Other",
};

const patterns = sourcePatterns.concat(recycleBinMapPatterns).map((pattern) => {
  const explicitFamily = familyDefinitions.find((family) => family.id === pattern.familyId);
  const family = explicitFamily || getFamilyDefinition(pattern);
  return {
    ...pattern,
    familyId: family.id,
    familyName: family.name,
    familyColor: family.color,
  };
});

const els = {
  appShell: document.querySelector("#appShell"),
  wheel: document.querySelector("#wheel"),
  wheelFamilyLabel: document.querySelector("#wheelFamilyLabel"),
  wheelFamilyCue: document.querySelector("#wheelFamilyCue"),
  wheelLegend: document.querySelector("#wheelLegend"),
  settingsToggle: document.querySelector("#settingsToggle"),
  spinButton: document.querySelector("#spinButton"),
  copyButton: document.querySelector("#copyButton"),
  copyUrlButton: document.querySelector("#copyUrlButton"),
  searchCard: document.querySelector(".search-card"),
  patternInput: document.querySelector("#patternInput"),
  fromYear: document.querySelector("#fromYear"),
  toYear: document.querySelector("#toYear"),
  minNumber: document.querySelector("#minNumber"),
  maxNumber: document.querySelector("#maxNumber"),
  includeSite: document.querySelector("#includeSite"),
  includeExtension: document.querySelector("#includeExtension"),
  leadList: document.querySelector("#leadList"),
  leadPrefixLabel: document.querySelector("#leadPrefixLabel"),
  title: document.querySelector("#wheelTitle"),
  tokenRow: document.querySelector("#tokenRow"),
  buildVisual: document.querySelector("#buildVisual"),
  wheelStepText: document.querySelector("#wheelStepText"),
  generateStepText: document.querySelector("#generateStepText"),
  combineStepText: document.querySelector("#combineStepText"),
  patternReel: document.querySelector("#patternReel"),
  dateReel: document.querySelector("#dateReel"),
  numberReel: document.querySelector("#numberReel"),
  extensionReel: document.querySelector("#extensionReel"),
  patternMeta: document.querySelector("#patternMeta"),
  queryOutput: document.querySelector("#queryOutput"),
  urlOutput: document.querySelector("#urlOutput"),
  entropyChip: document.querySelector("#entropyChip"),
  leadButtonTemplate: document.querySelector("#leadButtonTemplate"),
};

const state = {
  selectedFamilyId: null,
  rotation: 0,
  isSpinning: false,
  spinComplete: true,
  roll: null,
  selectedPatternId: null,
  settingsCollapsed: false,
};

let filterTimer = null;
let outputHideTimer = null;
const wheelSpinDuration = 2300;
const reelStepDuration = 380;
const combineStepDuration = 680;
const reelOrder = ["pattern", "date", "number", "extension"];
const settingsStorageKey = "ytNecromancer.settingsCollapsed";

function startsWithAny(value, prefixes) {
  return prefixes.some((prefix) => value.startsWith(prefix));
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function setSettingsCollapsed(isCollapsed, shouldStore = true) {
  state.settingsCollapsed = isCollapsed;
  els.appShell.classList.toggle("settings-collapsed", isCollapsed);
  els.settingsToggle.setAttribute("aria-expanded", String(!isCollapsed));
  els.settingsToggle.title = isCollapsed ? "Show settings" : "Hide settings";
  els.settingsToggle.setAttribute("aria-label", isCollapsed ? "Show settings" : "Hide settings");
  if (shouldStore) {
    window.localStorage.setItem(settingsStorageKey, isCollapsed ? "true" : "false");
  }
}

function getFamilyDefinition(pattern) {
  return familyDefinitions.find((family) => family.matches(pattern)) || fallbackFamily;
}

function clampNumber(value, min, max, fallback) {
  const number = Number.parseInt(value, 10);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(Math.max(number, min), max);
}

function getSettings() {
  const currentYear = new Date().getFullYear();
  const fromYear = clampNumber(els.fromYear.value, 2005, currentYear, 2012);
  const toYear = clampNumber(els.toYear.value, fromYear, currentYear, currentYear);
  const sequenceMin = clampNumber(els.minNumber.value, 0, Number.MAX_SAFE_INTEGER, 1);
  const sequenceMax = clampNumber(
    els.maxNumber.value,
    sequenceMin,
    Number.MAX_SAFE_INTEGER,
    9999,
  );

  els.fromYear.max = String(currentYear);
  els.toYear.max = String(currentYear);
  els.fromYear.value = String(fromYear);
  els.toYear.value = String(toYear);
  els.minNumber.value = String(sequenceMin);
  els.maxNumber.value = String(sequenceMax);

  return {
    focus: (els.patternInput.value || "").trim(),
    fromYear,
    toYear,
    sequenceMin,
    sequenceMax,
    includeSite: els.includeSite.checked,
    includeExtension: els.includeExtension.checked,
  };
}

function wordsFromHex(hex) {
  const words = [];
  for (let index = 0; index < hex.length; index += 8) {
    words.push(Number.parseInt(hex.slice(index, index + 8).padEnd(8, "0"), 16) >>> 0);
  }
  return words;
}

function cryptoWords(size = 16) {
  const api = globalThis.crypto;
  if (api?.getRandomValues) {
    const words = new Uint32Array(size);
    api.getRandomValues(words);
    return Array.from(words);
  }
  return Array.from({ length: size }, () => Math.floor(Math.random() * 4294967296));
}

async function hashWords(input) {
  const api = globalThis.crypto;
  if (!api?.subtle) return cryptoWords(16);
  const bytes = new TextEncoder().encode(input);
  const digest = await api.subtle.digest("SHA-512", bytes);
  return Array.from(new Uint32Array(digest));
}

async function entropyWords() {
  const salt = cryptoWords(4).join(".");
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 1800);

  try {
    const response = await fetch("https://api.drand.sh/public/latest", {
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`drand ${response.status}`);
    const pulse = await response.json();
    const randomness = String(pulse.randomness || "");
    if (!randomness) throw new Error("empty beacon");
    return {
      source: `drand round ${pulse.round}`,
      words: await hashWords(`${pulse.round}:${randomness}:${salt}:${Date.now()}`),
    };
  } catch (error) {
    return {
      source: "browser crypto",
      words: cryptoWords(16),
    };
  } finally {
    window.clearTimeout(timeout);
  }
}

function makeRoller(words) {
  let cursor = 0;
  return {
    int(min, max) {
      const lower = Math.ceil(min);
      const upper = Math.floor(max);
      if (upper <= lower) return lower;
      const span = upper - lower + 1;
      const word = words[cursor % words.length] >>> 0;
      cursor += 1;
      return lower + Math.floor((word / 4294967296) * span);
    },
  };
}

function patternText(pattern) {
  return [
    pattern.id,
    pattern.label,
    pattern.prefix,
    pattern.formatType,
    pattern.youtubeUsefulness,
    ...(pattern.devices || []),
    ...(pattern.examples || []),
    ...(pattern.extensions || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getFilteredPatterns(settings = getSettings()) {
  const terms = settings.focus
    .toLowerCase()
    .split(/[,\s]+/)
    .filter(Boolean);

  if (!terms.length) return patterns;

  const matches = patterns.filter((pattern) => {
    const haystack = patternText(pattern);
    return terms.every((term) => haystack.includes(term));
  });

  return matches.length ? matches : patterns;
}

function getActiveFamilies(settings = getSettings()) {
  const filteredPatterns = getFilteredPatterns(settings);
  const byFamily = new Map();

  filteredPatterns.forEach((pattern) => {
    if (!byFamily.has(pattern.familyId)) {
      const definition =
        familyDefinitions.find((family) => family.id === pattern.familyId) || fallbackFamily;
      byFamily.set(pattern.familyId, {
        ...definition,
        count: 0,
        weight: 0,
      });
    }
    const family = byFamily.get(pattern.familyId);
    family.count += 1;
    family.weight += Math.max(1, pattern.weight || 1);
  });

  return Array.from(byFamily.values()).sort((a, b) => {
    const left = familyOrder.has(a.id) ? familyOrder.get(a.id) : 99;
    const right = familyOrder.has(b.id) ? familyOrder.get(b.id) : 99;
    return left - right;
  });
}

function ensureSelectedFamily(settings = getSettings()) {
  const activeFamilies = getActiveFamilies(settings);
  if (!activeFamilies.length) return null;

  const stillActive = activeFamilies.some((family) => family.id === state.selectedFamilyId);
  if (!stillActive) state.selectedFamilyId = activeFamilies[0].id;
  return activeFamilies.find((family) => family.id === state.selectedFamilyId) || activeFamilies[0];
}

function getFamilyPatterns(familyId, settings = getSettings()) {
  const filtered = getFilteredPatterns(settings).filter((pattern) => pattern.familyId === familyId);
  if (filtered.length) return filtered;
  return patterns.filter((pattern) => pattern.familyId === familyId);
}

function weightedChoice(items, roller, weightFor = (item) => item.weight || 1) {
  const totalWeight = items.reduce((sum, item) => sum + Math.max(1, weightFor(item)), 0);
  let pick = roller.int(1, totalWeight);

  for (const item of items) {
    pick -= Math.max(1, weightFor(item));
    if (pick <= 0) return item;
  }

  return items[items.length - 1];
}

function padNumber(number, digitCount = 4) {
  return String(number).padStart(digitCount, "0");
}

function randomHexString(roller, length = 4) {
  const alphabet = "0123456789abcdef";
  let value = "";
  for (let index = 0; index < length; index += 1) {
    value += alphabet[roller.int(0, alphabet.length - 1)];
  }
  return value;
}

function getNumberBounds(pattern, settings) {
  const digitMax = pattern.digitCount ? 10 ** pattern.digitCount - 1 : 9999;
  const sourceMin = Number.isFinite(pattern.minNumber) ? pattern.minNumber : 0;
  const sourceMax = Number.isFinite(pattern.maxNumber) ? pattern.maxNumber : digitMax;
  let min = Math.max(sourceMin, settings.sequenceMin);
  let max = Math.min(sourceMax, settings.sequenceMax);

  if (min > max) {
    min = sourceMin;
    max = sourceMax;
  }

  return { min, max };
}

function randomDateTime(roller, settings) {
  const now = new Date();
  const start = new Date(settings.fromYear, 0, 1, 0, 0, 0, 0);
  const requestedEnd = new Date(settings.toYear, 11, 31, 23, 59, 59, 0);
  const end = requestedEnd > now ? now : requestedEnd;
  const floor = end < start ? new Date(end.getFullYear(), 0, 1, 0, 0, 0, 0) : start;
  const spanMinutes = Math.max(0, Math.floor((end - floor) / 60000));
  return new Date(floor.getTime() + roller.int(0, spanMinutes) * 60000);
}

function dateParts(date) {
  return {
    year: String(date.getFullYear()),
    month: String(date.getMonth() + 1).padStart(2, "0"),
    day: String(date.getDate()).padStart(2, "0"),
    hour: String(date.getHours()).padStart(2, "0"),
    minute: String(date.getMinutes()).padStart(2, "0"),
    second: String(date.getSeconds()).padStart(2, "0"),
  };
}

function formatDateToken(date, token = "YYYYMMDD") {
  const part = dateParts(date);
  const compactDate = `${part.year}${part.month}${part.day}`;
  const dashDate = `${part.year}-${part.month}-${part.day}`;
  const underscoreDate = `${part.year}_${part.month}_${part.day}`;
  const compactTime = `${part.hour}${part.minute}${part.second}`;
  const dottedTime = `${part.hour}.${part.minute}.${part.second}`;
  const dashedTime = `${part.hour}-${part.minute}-${part.second}`;

  switch (token) {
    case "YYYY-MM-DD":
      return dashDate;
    case "YYYY_MM_DD":
      return underscoreDate;
    case "YYYY":
      return part.year;
    case "YYYY MM DD":
      return `${part.year} ${part.month} ${part.day}`;
    case "HHMMSS":
      return compactTime;
    case "YYYYMMDD_HHMMSS":
      return `${compactDate}_${compactTime}`;
    case "YYYY-MM-DD HH.mm.ss":
      return `${dashDate} ${dottedTime}`;
    case "YYYY-MM-DD HH-mm-ss":
      return `${dashDate} ${dashedTime}`;
    case "YYYY-MM-DD at HH.mm.ss":
      return `${dashDate} at ${dottedTime}`;
    case "YYYYMMDDHHMMSS":
      return `${compactDate}${compactTime}`;
    case "YYYYMMDD":
    default:
      return compactDate;
  }
}

function randomExtension(pattern, roller, settings) {
  if (!settings.includeExtension || !pattern.extensions?.length) return "";
  return pattern.extensions[roller.int(0, pattern.extensions.length - 1)];
}

function buildFilename(pattern, roller, settings) {
  const date = randomDateTime(roller, settings);
  const extension = randomExtension(pattern, roller, settings);
  const numberBounds = getNumberBounds(pattern, settings);
  const number = roller.int(numberBounds.min, numberBounds.max);
  let filename = "";
  let sequence = "";
  let chapter = "";

  switch (pattern.formatType) {
    case "vtsTriplet":
      sequence = `${padNumber(roller.int(0, 99), 2)} ${roller.int(0, 9)}`;
      filename = `${pattern.prefix}${sequence}`;
      break;
    case "vtsThreeOne":
      sequence = `${padNumber(roller.int(0, 999), 3)} 1`;
      filename = `${pattern.prefix}${sequence}`;
      break;
    case "vtsOneThree":
      sequence = padNumber(roller.int(0, 999), 3);
      filename = `${pattern.prefix}${sequence}`;
      break;
    case "datetime":
    case "date":
      filename = `${pattern.prefix}${formatDateToken(date, pattern.dateFormat)}`;
      break;
    case "dateSequence": {
      sequence = padNumber(number, pattern.sequenceDigitCount || pattern.digitCount || 4);
      const separator = pattern.separator ?? "";
      filename = `${pattern.prefix}${formatDateToken(date, pattern.dateFormat)}${separator}${pattern.sequencePrefix || ""}${sequence}`;
      break;
    }
    case "chapteredNumeric": {
      const chapterMin = Number.isFinite(pattern.chapterMin) ? pattern.chapterMin : 1;
      const chapterMax = Number.isFinite(pattern.chapterMax) ? pattern.chapterMax : 99;
      chapter = padNumber(roller.int(chapterMin, chapterMax), pattern.chapterDigitCount || 2);
      sequence = padNumber(number, pattern.fileDigitCount || pattern.digitCount || 4);
      filename = `${pattern.prefix}${chapter}${sequence}`;
      break;
    }
    case "timestampSequence": {
      sequence = padNumber(number, pattern.sequenceDigitCount || 4);
      const separator = pattern.separator ?? "";
      const suffix = pattern.id === "dji-timestamp-sequence-d" ? `${separator}D` : "";
      filename = `${pattern.prefix}${formatDateToken(date, pattern.dateFormat)}${separator}${sequence}${suffix}`;
      break;
    }
    case "literal": {
      const examples = pattern.examples?.length ? pattern.examples : [pattern.prefix];
      filename = examples[roller.int(0, examples.length - 1)];
      break;
    }
    case "mixed": {
      sequence = padNumber(number, pattern.sequenceDigitCount || 1);
      filename = `${pattern.prefix}${formatDateToken(date, pattern.dateFormat)}_${sequence}`;
      break;
    }
    case "numeric":
    default:
      sequence =
        pattern.id === "apple-fullsizeoutput" || pattern.id === "map-molo-hex"
          ? randomHexString(roller, pattern.digitCount || 4)
          : padNumber(number, pattern.digitCount || 4);
      filename = `${pattern.prefix}${sequence}`;
      break;
  }

  const filenameWithExtension =
    extension && !filename.toLowerCase().endsWith(extension.toLowerCase())
      ? `${filename}${extension}`
      : filename;

  return {
    filename,
    filenameWithExtension,
    prefix: pattern.prefix?.trim() || filename,
    extension,
    date: formatDateToken(date, pattern.dateFormat || "YYYY-MM-DD"),
    number: sequence || String(number),
    chapter,
  };
}

function chooseTemplate(pattern, roller, settings) {
  let templates = pattern.searchTemplates?.length ? pattern.searchTemplates : DEFAULT_TEMPLATES;
  const siteFiltered = templates.filter((template) => template.includes("site:youtube.com/watch"));
  const youtubeNative = templates.filter((template) => !template.includes("site:youtube.com/watch"));
  if (settings.includeSite && youtubeNative.length) templates = youtubeNative;
  if (!settings.includeSite && siteFiltered.length) templates = siteFiltered;

  if (!pattern.prefix) {
    const noPrefixTemplates = templates.filter((template) => !template.includes("{{prefix}}"));
    if (noPrefixTemplates.length) templates = noPrefixTemplates;
  }

  const extensionFiltered = templates.filter((template) =>
    settings.includeExtension
      ? template.includes("{{filenameWithExtension}}")
      : !template.includes("{{filenameWithExtension}}"),
  );
  if (extensionFiltered.length) templates = extensionFiltered;

  return templates[roller.int(0, templates.length - 1)];
}

function applySearchTemplate(template, values) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] ?? "");
}

function cleanQuery(query) {
  return query
    .replace(/intitle:""/g, "")
    .replace(/""/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function youtubeSearchUrl(query) {
  if (!query) return "";
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

function buildRoll(roller, settings, family, preferredPatternId = "") {
  const familyPatterns = getFamilyPatterns(family.id, settings);
  const preferredPattern =
    preferredPatternId && familyPatterns.find((pattern) => pattern.id === preferredPatternId);
  const pattern = preferredPattern || weightedChoice(familyPatterns, roller, (item) => item.weight || 1);
  const values = buildFilename(pattern, roller, settings);
  const template = chooseTemplate(pattern, roller, settings);
  const query = cleanQuery(applySearchTemplate(template, values));

  return {
    family,
    pattern,
    values,
    template,
    query,
  };
}

function patternUsesDate(pattern) {
  return ["datetime", "date", "dateSequence", "timestampSequence", "mixed"].includes(
    pattern.formatType,
  );
}

function patternUsesSequence(pattern) {
  return [
    "numeric",
    "dateSequence",
    "chapteredNumeric",
    "timestampSequence",
    "mixed",
    "vtsTriplet",
    "vtsThreeOne",
    "vtsOneThree",
  ].includes(pattern.formatType);
}

function renderReelCharacters(reel, value, status, reelName) {
  const shouldSplit =
    status === "active" &&
    ["date", "number"].includes(reelName) &&
    value &&
    !["rolling", "unused", "literal"].includes(value);

  reel.classList.toggle("char-reel", shouldSplit);
  if (!shouldSplit) {
    reel.textContent = value;
    return;
  }

  const fragment = document.createDocumentFragment();
  Array.from(value).forEach((character, index) => {
    const span = document.createElement("span");
    span.className = "char-tick";
    span.style.setProperty("--char-delay", `${index * 18}ms`);
    span.textContent = character;
    fragment.append(span);
  });
  reel.replaceChildren(fragment);
}

function setReelValue(reel, value, options = {}) {
  const { isUsed = true, status = "done", reelName = "" } = options;
  const item = reel.closest(".value-reel");
  item.classList.toggle("is-muted", !isUsed);
  item.classList.toggle("is-pending", status === "pending");
  item.classList.toggle("is-active", status === "active");
  item.classList.toggle("is-done", status === "done");
  renderReelCharacters(reel, value, status, reelName);
}

function reelStatus(reelName, activeReel, stage) {
  if (stage === "spin" || stage === "idle") return "pending";
  if (stage === "combine" || stage === "done") return "done";

  const activeIndex = reelOrder.indexOf(activeReel);
  const reelIndex = reelOrder.indexOf(reelName);
  if (activeIndex < 0 || reelIndex > activeIndex) return "pending";
  return reelIndex === activeIndex ? "active" : "done";
}

function reelDisplay(value, status) {
  if (status === "pending") return "rolling";
  return value;
}

function renderGenerationVisual(roll, stage = "idle", revealQuery = false, activeReel = "") {
  els.buildVisual.dataset.stage = stage;
  els.buildVisual.dataset.activeReel = activeReel || "";

  if (!roll) {
    els.wheelStepText.textContent = "family";
    els.generateStepText.textContent = "date + sequence";
    els.combineStepText.textContent = "query";
    setReelValue(els.patternReel, "pending", { status: "pending", reelName: "pattern" });
    setReelValue(els.dateReel, "pending", { status: "pending", reelName: "date" });
    setReelValue(els.numberReel, "pending", { status: "pending", reelName: "number" });
    setReelValue(els.extensionReel, "pending", { status: "pending", reelName: "extension" });
    return;
  }

  const usesDate = patternUsesDate(roll.pattern);
  const usesSequence = patternUsesSequence(roll.pattern);
  const extension = roll.values.extension || "none";
  const patternValue = roll.pattern.prefix?.trim() || roll.pattern.label;
  const dateStatus = reelStatus("date", activeReel, stage);
  const extensionStatus = reelStatus("extension", activeReel, stage);
  const numberStatus = reelStatus("number", activeReel, stage);
  const patternStatus = reelStatus("pattern", activeReel, stage);

  els.wheelStepText.textContent = state.spinComplete ? roll.family.name : "spinning";
  els.generateStepText.textContent = roll.values.filename;
  els.combineStepText.textContent = revealQuery ? "ready" : "assembling";
  setReelValue(els.patternReel, reelDisplay(patternValue, patternStatus), {
    reelName: "pattern",
    status: patternStatus,
  });
  setReelValue(els.dateReel, reelDisplay(usesDate ? roll.values.date : "unused", dateStatus), {
    isUsed: usesDate,
    reelName: "date",
    status: dateStatus,
  });
  setReelValue(
    els.numberReel,
    reelDisplay(usesSequence ? roll.values.number : "literal", numberStatus),
    {
      isUsed: usesSequence,
      reelName: "number",
      status: numberStatus,
    },
  );
  setReelValue(els.extensionReel, reelDisplay(extension, extensionStatus), {
    isUsed: Boolean(roll.values.extension),
    reelName: "extension",
    status: extensionStatus,
  });
}

function prepareBuildView(family) {
  els.leadPrefixLabel.textContent = `${family.name} · selecting`;
  els.title.textContent = family.name;
  updateWheelStatus(family);
  els.tokenRow.innerHTML = "";
  renderGenerationVisual(null, "spin", false);
  els.wheelStepText.textContent = state.spinComplete ? family.name : "spinning";
  updateLeadList();
}

async function playBuildSequence(source, { includeWheelStep = false, revealCard = true } = {}) {
  if (revealCard) {
    replayBuildIntro();
    await wait(320);
  }

  if (includeWheelStep) {
    renderGenerationVisual(state.roll, "spin", false);
    await wait(260);
  }

  for (const [index, reel] of reelOrder.entries()) {
    renderResult(source, {
      revealQuery: false,
      stage: "generate",
      activeReel: reel,
      updateStatic: index === 0,
    });
    await wait(reelStepDuration);
  }

  renderResult(source, { revealQuery: false, stage: "combine", updateStatic: false });
  await wait(combineStepDuration);
  renderResult(source, { revealQuery: true, stage: "done", updateStatic: false });
}

function patternShape(pattern) {
  if (pattern.formatType === "literal") return pattern.examples?.[0] || pattern.prefix || pattern.label;
  if (pattern.formatType === "datetime" || pattern.formatType === "date") {
    return `${pattern.prefix || ""}${pattern.dateFormat || "date"}`;
  }
  if (pattern.formatType === "numeric") {
    return `${pattern.prefix || ""}${"X".repeat(pattern.digitCount || 4)}`;
  }
  if (pattern.formatType === "mixed") {
    return `${pattern.prefix || ""}${pattern.dateFormat || "date"}_N`;
  }
  return pattern.label;
}

function createPatternOption(pattern, family) {
  const option = document.createElement("button");
  const isForced = pattern.id === state.selectedPatternId;
  const isGenerated = pattern.id === state.roll?.pattern?.id;
  option.type = "button";
  option.className = "pattern-option";
  option.classList.toggle("is-forced", isForced);
  option.classList.toggle("is-generated", isGenerated);
  option.title = pattern.notes || pattern.label;

  const label = document.createElement("strong");
  label.textContent = pattern.label;

  const shape = document.createElement("small");
  shape.textContent = patternShape(pattern);

  const usefulness = document.createElement("span");
  usefulness.textContent = pattern.youtubeUsefulness || "signal";

  option.append(label, shape, usefulness);
  option.addEventListener("click", async (event) => {
    event.stopPropagation();
    state.selectedFamilyId = family.id;
    state.selectedPatternId = pattern.id;
    setWheelToFamilyId(family.id);
    await regenerate();
  });

  return option;
}

function updateWheelStatus(family) {
  if (!family) {
    els.wheelFamilyLabel.textContent = "Selector pending";
    els.wheelFamilyCue.textContent = "spin or choose a selector";
    return;
  }

  els.wheelFamilyLabel.textContent = wheelLabels[family.id] || family.name;
  els.wheelFamilyCue.textContent = `${family.count || getFamilyPatterns(family.id).length} patterns · ${family.cue || family.name}`;
}

function renderWheelLegend(activeFamilies, settings = getSettings()) {
  const fragment = document.createDocumentFragment();

  activeFamilies.forEach((family) => {
    const key = document.createElement("button");
    key.type = "button";
    key.className = "wheel-key";
    key.classList.toggle("is-active", family.id === state.selectedFamilyId);
    key.style.setProperty("--key-color", family.color);
    key.setAttribute("aria-pressed", String(family.id === state.selectedFamilyId));
    key.title = `${family.name}: ${family.cue}`;

    const swatch = document.createElement("span");
    swatch.setAttribute("aria-hidden", "true");

    const label = document.createElement("strong");
    label.textContent = wheelLabels[family.id] || family.name;

    key.append(swatch, label);
    key.addEventListener("click", async () => {
      if (state.isSpinning) return;
      state.selectedFamilyId = family.id;
      state.selectedPatternId = null;
      setWheelToFamilyId(family.id, true, settings);
      await regenerate();
    });
    fragment.append(key);
  });

  els.wheelLegend.replaceChildren(fragment);
}

function updateLeadList(settings = getSettings()) {
  const activeFamilies = getActiveFamilies(settings);
  const fragment = document.createDocumentFragment();

  activeFamilies.forEach((family) => {
    const group = document.createElement("div");
    const panelId = `selector-patterns-${family.id}`;
    const isOpen = family.id === state.selectedFamilyId;
    const familyPatterns = getFamilyPatterns(family.id, settings);
    const button = els.leadButtonTemplate.content.firstElementChild.cloneNode(true);

    group.className = "lead-group";
    group.classList.toggle("is-open", isOpen);
    button.style.setProperty("--lead-color", family.color);
    button.classList.toggle("is-active", family.id === state.selectedFamilyId);
    button.setAttribute("aria-expanded", String(isOpen));
    button.setAttribute("aria-controls", panelId);
    button.querySelector("strong").textContent = family.name;
    button.querySelector("small").textContent = `${family.count} patterns · ${family.cue}`;
    button.addEventListener("click", async () => {
      state.selectedFamilyId = family.id;
      state.selectedPatternId = null;
      setWheelToFamilyId(family.id);
      await regenerate();
    });

    const panel = document.createElement("div");
    panel.className = "selector-patterns";
    panel.id = panelId;
    panel.setAttribute("aria-label", `${family.name} patterns`);

    familyPatterns.forEach((pattern) => {
      panel.append(createPatternOption(pattern, family));
    });

    group.append(button, panel);
    fragment.append(group);
  });

  els.leadList.replaceChildren(fragment);
}

function renderWheel(settings = getSettings()) {
  const activeFamilies = getActiveFamilies(settings);
  if (!activeFamilies.length) return;

  const selectedFamily = ensureSelectedFamily(settings);
  const segment = 360 / activeFamilies.length;
  const gradient = activeFamilies
    .map((family, index) => {
      const start = index * segment;
      const end = start + segment;
      return `${family.color} ${start}deg ${end}deg`;
    })
    .join(", ");

  els.wheel.style.setProperty("--wheel-gradient", gradient);
  els.wheel.style.setProperty("--segment-angle", `${segment}deg`);
  els.wheel.innerHTML = "";
  renderWheelLegend(activeFamilies, settings);
  updateWheelStatus(selectedFamily);

  if (selectedFamily) setWheelToFamilyId(selectedFamily.id, false, settings);
}

function setWheelToFamilyId(familyId, updateList = true, settings = getSettings()) {
  const activeFamilies = getActiveFamilies(settings);
  const index = Math.max(0, activeFamilies.findIndex((family) => family.id === familyId));
  const selectedFamily = activeFamilies[index];
  const segment = 360 / activeFamilies.length;
  const targetCenter = index * segment + segment / 2;
  state.rotation = 360 - targetCenter;
  els.wheel.style.transform = `rotate(${state.rotation}deg)`;
  updateWheelStatus(selectedFamily);
  els.wheelLegend.querySelectorAll(".wheel-key").forEach((key, keyIndex) => {
    const isActive = activeFamilies[keyIndex]?.id === familyId;
    key.classList.toggle("is-active", isActive);
    key.setAttribute("aria-pressed", String(isActive));
  });
  if (updateList) updateLeadList(settings);
}

function addMetaItem(label, value, variant = "") {
  const values = Array.isArray(value) ? value.filter(Boolean) : [];
  if (!value || (Array.isArray(value) && !values.length)) return;
  const item = document.createElement("div");
  item.className = "pattern-meta-item";
  if (variant) item.classList.add(`is-${variant}`);

  const labelElement = document.createElement("span");
  labelElement.className = "meta-label";
  labelElement.textContent = label;

  const valueElement = document.createElement(Array.isArray(value) ? "div" : "strong");
  if (Array.isArray(value)) {
    valueElement.className = "meta-chip-row";
    valueElement.tabIndex = 0;
    valueElement.setAttribute("aria-label", `${label} values`);
    values.forEach((entry) => {
      const chip = document.createElement("span");
      chip.className = "meta-chip";
      chip.textContent = entry;
      chip.title = entry;
      valueElement.append(chip);
    });
  } else {
    valueElement.textContent = value;
    valueElement.title = value;
  }

  item.append(labelElement, valueElement);
  els.patternMeta.append(item);
}

function shortText(value, maxLength = 170) {
  if (!value || value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trim()}...`;
}

function renderPatternMeta(roll) {
  els.patternMeta.innerHTML = "";
  const { pattern } = roll;

  addMetaItem("Source hints", pattern.devices?.slice(0, 5), "source");
  addMetaItem("Examples", pattern.examples?.slice(0, 4), "examples");
  addMetaItem("Extensions", pattern.extensions?.slice(0, 8), "extensions");
  addMetaItem("Description", shortText(pattern.notes), "wide");
}

function hideOutputPanels({ clear = false } = {}) {
  window.clearTimeout(outputHideTimer);
  [els.searchCard, els.patternMeta].forEach((element) => {
    element.classList.remove("is-revealing");
    element.classList.add("is-hiding");
  });

  if (clear) {
    outputHideTimer = window.setTimeout(() => {
      els.queryOutput.value = "";
      els.urlOutput.value = "";
      els.patternMeta.innerHTML = "";
    }, 1080);
  }
}

function replayPanelReveal() {
  window.clearTimeout(outputHideTimer);
  [els.searchCard, els.patternMeta].forEach((element) => {
    element.classList.remove("is-revealing", "is-hiding");
    void element.offsetWidth;
  });

  window.requestAnimationFrame(() => {
    els.searchCard.classList.add("is-revealing");
    els.patternMeta.classList.add("is-revealing");
  });
}

function replayBuildIntro() {
  els.buildVisual.classList.remove("is-entering");
  void els.buildVisual.offsetWidth;
  els.buildVisual.classList.add("is-entering");
}

function renderResult(source = "entropy idle", options = {}) {
  const { revealQuery = true, stage = "done", activeReel = "", updateStatic = true } = options;
  const settings = getSettings();
  const family = ensureSelectedFamily(settings);

  if (!patterns.length) {
    els.title.textContent = "Filename data missing";
    els.queryOutput.value = "Load filename-patterns.js before app.js.";
    els.urlOutput.value = "";
    els.entropyChip.textContent = "data unavailable";
    renderGenerationVisual(null, "idle", false);
    return;
  }

  if (!state.roll && family) {
    const roller = makeRoller(cryptoWords(16));
    state.roll = buildRoll(roller, settings, family, state.selectedPatternId);
  }

  const roll = state.roll;
  if (updateStatic) {
    els.leadPrefixLabel.textContent = `${roll.family.name} · ${roll.pattern.prefix || "literal"} · ${roll.pattern.youtubeUsefulness || "unknown"} usefulness`;
    els.title.textContent = roll.pattern.label;
    updateWheelStatus(roll.family);
  }
  if (revealQuery) {
    els.queryOutput.value = roll.query;
    els.urlOutput.value = youtubeSearchUrl(roll.query);
  }
  els.entropyChip.textContent = source;
  if (!revealQuery) {
    hideOutputPanels();
  }

  if (updateStatic) {
    els.tokenRow.innerHTML = "";
    [
      roll.values.filenameWithExtension,
      `${roll.pattern.youtubeUsefulness || "unknown"} signal`,
    ]
      .filter(Boolean)
      .forEach((token) => {
        const element = document.createElement("span");
        element.className = "token";
        element.textContent = token;
        els.tokenRow.append(element);
      });
  }

  renderGenerationVisual(roll, stage, revealQuery, activeReel);
  if (updateStatic) {
    renderPatternMeta(roll);
    updateLeadList(settings);
  }
  if (revealQuery && stage === "done") {
    replayPanelReveal();
  }
}

async function regenerate(updateSource = true) {
  setBusy(true);
  state.spinComplete = true;
  hideOutputPanels({ clear: true });
  const settings = getSettings();
  renderWheel(settings);
  const family = ensureSelectedFamily(settings);
  if (!family) {
    setBusy(false);
    return;
  }
  prepareBuildView(family);
  if (updateSource) els.entropyChip.textContent = "drawing entropy...";

  const entropy = await entropyWords();
  const roller = makeRoller(entropy.words.concat(wordsFromHex(String(Date.now()))));
  state.roll = buildRoll(roller, settings, family, state.selectedPatternId);
  await playBuildSequence(entropy.source, { includeWheelStep: true });
  setBusy(false);
}

async function spinWheel() {
  if (state.isSpinning) return;
  state.isSpinning = true;
  state.spinComplete = false;
  setBusy(true);
  hideOutputPanels({ clear: true });
  const settings = getSettings();
  const activeFamilies = getActiveFamilies(settings);
  els.entropyChip.textContent = "spinning...";

  const entropy = await entropyWords();
  const roller = makeRoller(entropy.words);
  const nextFamily = weightedChoice(activeFamilies, roller, (family) => family.weight);
  const nextIndex = activeFamilies.findIndex((family) => family.id === nextFamily.id);
  const segment = 360 / activeFamilies.length;
  const targetCenter = nextIndex * segment + segment / 2;
  const extraSpins = roller.int(5, 8) * 360;

  state.rotation = state.rotation + extraSpins + (360 - targetCenter - (state.rotation % 360));
  const nextRoll = buildRoll(roller, settings, nextFamily);

  els.wheel.style.transform = `rotate(${state.rotation}deg)`;
  window.setTimeout(async () => {
    try {
      state.selectedFamilyId = nextFamily.id;
      state.selectedPatternId = null;
      state.roll = nextRoll;
      state.spinComplete = true;
      prepareBuildView(nextFamily);
      await playBuildSequence(entropy.source, { revealCard: false });
    } finally {
      state.isSpinning = false;
      state.spinComplete = true;
      setBusy(false);
    }
  }, wheelSpinDuration);
}

function setBusy(isBusy) {
  els.spinButton.disabled = isBusy;
  els.copyButton.disabled = isBusy;
  els.copyUrlButton.disabled = isBusy;
}

async function copyValue(value, button, fallbackField, label) {
  if (!value) return;
  try {
    await navigator.clipboard.writeText(value);
  } catch (error) {
    fallbackField.select();
    document.execCommand("copy");
  }

  button.classList.add("is-copied");
  button.setAttribute("aria-label", `${label} copied`);
  window.setTimeout(() => {
    button.classList.remove("is-copied");
    button.setAttribute("aria-label", label);
  }, 1200);
}

function copyQuery() {
  return copyValue(els.queryOutput.value, els.copyButton, els.queryOutput, "Copy search term");
}

function copyUrl() {
  return copyValue(els.urlOutput.value, els.copyUrlButton, els.urlOutput, "Copy full YouTube URL");
}

function scheduleFilterRefresh() {
  window.clearTimeout(filterTimer);
  filterTimer = window.setTimeout(async () => {
    state.roll = null;
    state.selectedPatternId = null;
    await regenerate();
  }, 250);
}

function bindEvents() {
  els.spinButton.addEventListener("click", spinWheel);
  els.copyButton.addEventListener("click", copyQuery);
  els.copyUrlButton.addEventListener("click", copyUrl);
  els.settingsToggle.addEventListener("click", () => {
    setSettingsCollapsed(!state.settingsCollapsed);
  });
  els.patternInput.addEventListener("input", scheduleFilterRefresh);

  [els.fromYear, els.toYear, els.minNumber, els.maxNumber].forEach((input) => {
    input.addEventListener("change", () => regenerate());
  });

  [els.includeSite, els.includeExtension].forEach((input) => {
    input.addEventListener("change", () => regenerate());
  });
}

async function init() {
  if (!patterns.length) {
    renderResult("data unavailable");
    return;
  }

  setSettingsCollapsed(window.localStorage.getItem(settingsStorageKey) === "true", false);
  renderWheel();
  bindEvents();
  const family = ensureSelectedFamily();
  if (family) setWheelToFamilyId(family.id);
  await regenerate();
}

init();
