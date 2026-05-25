export const OHMESH_BASE_URL = "https://ohmesh.jjgo.io";
export const OHMESH_APP_SLUG = "gamelingo";
export const REGISTERED_REDIRECT_URL = "https://gamelingo.jjgo.io";
export const APP_RECORD_TYPE = "gamelingo-study-state";
export const APP_STORAGE_VERSION = 3;
export const GUEST_APP_KEY = "gamelingo:v3:app:guest";
export const PENDING_GUEST_SAVE_KEY = "gamelingo:v3:pendingGuestSave";
export const LEGACY_PENDING_GUEST_SAVE_KEY = "gamelingo:v2:pendingGuestSave";
export const LEGACY_EDITH_FINCH_RECORD_TYPE = "edith-finch-study-state";
export const EDITH_FINCH_STORAGE_VERSION = 2;
export const LEGACY_GUEST_EDITH_FINCH_KEY = "gamelingo:v2:edithFinch:guest";
export const EDITH_FINCH_ID = "edith-finch";
export const HOME_PATH = "/";

const EDITH_FINCH_COVER = "/edith-finch-cover.png";
const SAMPLE_CREATED_AT = "2026-05-23T00:00:00.000Z";

export const defaultGames = [
  {
    id: EDITH_FINCH_ID,
    path: "/games/edith-finch",
    title: "What Remains of Edith Finch",
    description: "Collect game lines and turn them into your own.",
    artwork: EDITH_FINCH_COVER,
    isCustom: false,
  },
];

export const missionItems = [
  { id: "save-3-sentences", label: "Save 3 lines" },
  { id: "save-5-words", label: "Add 5 vocabulary items" },
  { id: "leave-story-note", label: "Leave 1 story note" },
  { id: "make-2-my-sentences", label: "Make 1 line your own" },
  { id: "speak-1-original", label: "Read 1 original line aloud" },
  { id: "practice-1-sentence", label: "Mark 1 practice complete" },
];

export const sampleSentences = [
  {
    id: "sample-1",
    title: "I remember",
    chapter: "Opening",
    original: "I remember.",
    meaning: "나는 기억한다.",
    mySentence: "I remember my first day at work.",
    practiced: false,
    createdAt: SAMPLE_CREATED_AT,
    updatedAt: SAMPLE_CREATED_AT,
  },
  {
    id: "sample-2",
    title: "I was afraid",
    chapter: "Memory",
    original: "I was afraid.",
    meaning: "나는 두려웠다.",
    mySentence: "I was nervous before the meeting.",
    practiced: false,
    createdAt: SAMPLE_CREATED_AT,
    updatedAt: SAMPLE_CREATED_AT,
  },
  {
    id: "sample-3",
    title: "Couldn't explain it",
    chapter: "Story",
    original: "I couldn't explain it.",
    meaning: "나는 그것을 설명할 수 없었다.",
    mySentence: "I couldn't explain my idea clearly.",
    practiced: false,
    createdAt: SAMPLE_CREATED_AT,
    updatedAt: SAMPLE_CREATED_AT,
  },
];

export const defaultVocabularyEntries = [
  { id: "vocab-alive", word: "alive", meaning: "살아 있는" },
  { id: "vocab-attic", word: "attic", meaning: "다락방" },
  { id: "vocab-basement", word: "basement", meaning: "지하실" },
  { id: "vocab-bathroom", word: "bathroom", meaning: "욕실" },
  { id: "vocab-bedroom", word: "bedroom", meaning: "침실" },
  { id: "vocab-branch", word: "branch", meaning: "나뭇가지, 가지" },
  { id: "vocab-cannery", word: "cannery", meaning: "통조림 공장" },
  { id: "vocab-cemetery", word: "cemetery", meaning: "묘지" },
  { id: "vocab-closet", word: "closet", meaning: "벽장, 옷장" },
  { id: "vocab-crawlspace", word: "crawlspace", meaning: "기어 들어가는 좁은 공간" },
  { id: "vocab-curse", word: "curse", meaning: "저주" },
  { id: "vocab-death", word: "death", meaning: "죽음" },
  { id: "vocab-disappear", word: "disappear", meaning: "사라지다" },
  { id: "vocab-dream", word: "dream", meaning: "꿈" },
  { id: "vocab-family", word: "family", meaning: "가족" },
  { id: "vocab-ferry", word: "ferry", meaning: "연락선, 페리" },
  { id: "vocab-finch", word: "Finch", meaning: "핀치, 핀치 가문" },
  { id: "vocab-forest", word: "forest", meaning: "숲" },
  { id: "vocab-funeral", word: "funeral", meaning: "장례식" },
  { id: "vocab-grave", word: "grave", meaning: "무덤" },
  { id: "vocab-hallway", word: "hallway", meaning: "복도" },
  { id: "vocab-history", word: "history", meaning: "역사, 과거" },
  { id: "vocab-house", word: "house", meaning: "집" },
  { id: "vocab-inherit", word: "inherit", meaning: "물려받다, 상속받다" },
  { id: "vocab-island", word: "island", meaning: "섬" },
  { id: "vocab-journal", word: "journal", meaning: "일기, 기록장" },
  { id: "vocab-key", word: "key", meaning: "열쇠" },
  { id: "vocab-letter", word: "letter", meaning: "편지" },
  { id: "vocab-library", word: "library", meaning: "서재, 도서관" },
  { id: "vocab-map", word: "map", meaning: "지도" },
  { id: "vocab-memory", word: "memory", meaning: "기억" },
  { id: "vocab-passage", word: "passage", meaning: "통로" },
  { id: "vocab-portrait", word: "portrait", meaning: "초상화" },
  { id: "vocab-remains", word: "remains", meaning: "남은 것, 유해" },
  { id: "vocab-room", word: "room", meaning: "방" },
  { id: "vocab-secret", word: "secret", meaning: "비밀" },
  { id: "vocab-story", word: "story", meaning: "이야기" },
  { id: "vocab-survive", word: "survive", meaning: "살아남다" },
  { id: "vocab-window", word: "window", meaning: "창문" },
];
