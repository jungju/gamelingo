import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Gamepad2,
  GripVertical,
  Languages,
  Pin,
  Plus,
  Search,
  StickyNote,
  UserRound,
  X,
} from "lucide-react";
import "./App.css";

const OHMESH_BASE_URL = "https://ohmesh.jjgo.io";
const OHMESH_APP_SLUG = "gamelingo";
const REGISTERED_REDIRECT_URL = "https://gamelingo.jjgo.io";
const APP_RECORD_TYPE = "gamelingo-study-state";
const APP_STORAGE_VERSION = 3;
const GUEST_APP_KEY = "gamelingo:v3:app:guest";
const PENDING_GUEST_SAVE_KEY = "gamelingo:v3:pendingGuestSave";
const LEGACY_PENDING_GUEST_SAVE_KEY = "gamelingo:v2:pendingGuestSave";
const LEGACY_EDITH_FINCH_RECORD_TYPE = "edith-finch-study-state";
const EDITH_FINCH_STORAGE_VERSION = 2;
const LEGACY_GUEST_EDITH_FINCH_KEY = "gamelingo:v2:edithFinch:guest";
const EDITH_FINCH_ID = "edith-finch";
const HOME_PATH = "/";
const EDITH_FINCH_COVER = "/edith-finch-cover.png";

const defaultGames = [
  {
    id: EDITH_FINCH_ID,
    path: "/games/edith-finch",
    title: "What Remains of Edith Finch",
    description: "대사를 보드에 모아 내 문장으로 바꾸기",
    artwork: EDITH_FINCH_COVER,
    isCustom: false,
  },
];

const missionItems = [
  { id: "save-3-sentences", label: "문장 3개 저장하기" },
  { id: "save-5-words", label: "단어 5개 적기" },
  { id: "leave-story-note", label: "스토리 메모 한 줄 남기기" },
  { id: "make-2-my-sentences", label: "내 문장 1개만 만들어보기" },
  { id: "speak-1-original", label: "원문 1개 소리 내서 따라 말하기" },
  { id: "practice-1-sentence", label: "연습 완료 1개 체크하기" },
];

const sampleSentences = [
  {
    id: "sample-1",
    title: "I remember",
    chapter: "Opening",
    original: "I remember.",
    meaning: "나는 기억한다.",
    mySentence: "I remember my first day at work.",
    practiced: false,
    x: 7,
    y: 12,
  },
  {
    id: "sample-2",
    title: "I was afraid",
    chapter: "Memory",
    original: "I was afraid.",
    meaning: "나는 두려웠다.",
    mySentence: "I was nervous before the meeting.",
    practiced: false,
    x: 38,
    y: 15,
  },
  {
    id: "sample-3",
    title: "Couldn't explain it",
    chapter: "Story",
    original: "I couldn't explain it.",
    meaning: "나는 그것을 설명할 수 없었다.",
    mySentence: "I couldn't explain my idea clearly.",
    practiced: false,
    x: 14,
    y: 53,
  },
];

const defaultVocabularyEntries = [
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

function createDefaultMissionChecks() {
  return missionItems.reduce((checks, item) => ({ ...checks, [item.id]: false }), {});
}

function createDefaultEdithFinchData() {
  return {
    wordMemo: "",
    vocabulary: createDefaultVocabularyEntries(),
    storyMemo: "",
    missionChecks: createDefaultMissionChecks(),
    sentences: sampleSentences.map((sentence) => ({ ...sentence })),
    characters: [],
  };
}

function createEmptyGameNoteData() {
  return {
    wordMemo: "",
    vocabulary: [],
    storyMemo: "",
    missionChecks: createDefaultMissionChecks(),
    sentences: [],
    characters: [],
  };
}

function createDefaultGameNoteData(gameId) {
  return gameId === EDITH_FINCH_ID ? createDefaultEdithFinchData() : createEmptyGameNoteData();
}

function createDefaultAppData(edithFinchData = createDefaultEdithFinchData()) {
  return {
    customGames: [],
    notesByGameId: {
      [EDITH_FINCH_ID]: normalizeGameNoteData(edithFinchData, EDITH_FINCH_ID),
    },
  };
}

function createId(prefix = "item") {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createVocabularyId() {
  return createId("vocabulary");
}

function createCharacterId() {
  return createId("character");
}

function createGameId(title, existingIds = new Set()) {
  const slug = slugifyGameTitle(title);

  while (true) {
    const suffix = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    const candidate = `custom-${slug}-${suffix}`;

    if (!existingIds.has(candidate)) {
      return candidate;
    }
  }
}

function slugifyGameTitle(title) {
  const slug = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return slug || "game";
}

function createDefaultVocabularyEntries() {
  return defaultVocabularyEntries.map((entry) => ({ ...entry }));
}

function normalizeAppData(data) {
  if (!data || typeof data !== "object") {
    return createDefaultAppData();
  }

  if (data.v === APP_STORAGE_VERSION) {
    return normalizeCompactAppData(data);
  }

  if (Array.isArray(data.customGames) || data.notesByGameId) {
    return normalizeRuntimeAppData(data);
  }

  return createDefaultAppData(normalizeEdithFinchData(data));
}

function normalizeCompactAppData(data) {
  const customGames = normalizeCustomGames(data.g);
  const validGameIds = new Set([EDITH_FINCH_ID, ...customGames.map((game) => game.id)]);
  const compactNotes = data.n && typeof data.n === "object" ? data.n : {};
  const notesByGameId = {};

  validGameIds.forEach((gameId) => {
    notesByGameId[gameId] = normalizeCompactGameNoteData(compactNotes[gameId], gameId);
  });

  return { customGames, notesByGameId };
}

function normalizeRuntimeAppData(data) {
  const customGames = normalizeCustomGames(data.customGames);
  const validGameIds = new Set([EDITH_FINCH_ID, ...customGames.map((game) => game.id)]);
  const rawNotesByGameId = data.notesByGameId && typeof data.notesByGameId === "object" ? data.notesByGameId : {};
  const notesByGameId = {};

  validGameIds.forEach((gameId) => {
    notesByGameId[gameId] = normalizeGameNoteData(rawNotesByGameId[gameId], gameId);
  });

  return { customGames, notesByGameId };
}

function normalizeCustomGames(customGames) {
  if (!Array.isArray(customGames)) return [];

  const seenGameIds = new Set(defaultGames.map((game) => game.id));

  return customGames
    .map((game) => normalizeCustomGame(game, seenGameIds))
    .filter(Boolean);
}

function normalizeCustomGame(game, seenGameIds) {
  if (!game || typeof game !== "object") return null;

  const title = typeof game.title === "string" ? game.title.trim() : "";
  if (!title) return null;

  const rawId = typeof game.id === "string" ? game.id : "";
  const id = isSafeGameId(rawId) ? rawId : createGameId(title, seenGameIds);
  if (seenGameIds.has(id)) return null;

  seenGameIds.add(id);

  const timestamp = new Date().toISOString();

  return {
    id,
    title,
    description: typeof game.description === "string" ? game.description.trim() : "",
    createdAt: typeof game.createdAt === "string" ? game.createdAt : timestamp,
    updatedAt: typeof game.updatedAt === "string" ? game.updatedAt : timestamp,
  };
}

function isSafeGameId(id) {
  return /^[a-z0-9][a-z0-9-]{1,96}$/.test(id);
}

function normalizeEdithFinchData(data) {
  return normalizeGameNoteData(data, EDITH_FINCH_ID);
}

function normalizeGameNoteData(data, gameId) {
  const defaultData = createDefaultGameNoteData(gameId);

  if (!data || typeof data !== "object") {
    return defaultData;
  }

  if (data.v === EDITH_FINCH_STORAGE_VERSION) {
    return normalizeCompactGameNoteData(data, gameId);
  }

  const vocabulary = normalizeVocabularyEntries(data.vocabulary, data.wordMemo);

  return {
    wordMemo: typeof data.wordMemo === "string" ? data.wordMemo : defaultData.wordMemo,
    vocabulary: gameId === EDITH_FINCH_ID && isLegacySampleVocabulary(vocabulary) ? defaultData.vocabulary : vocabulary,
    storyMemo: typeof data.storyMemo === "string" ? data.storyMemo : defaultData.storyMemo,
    missionChecks: normalizeMissionChecks(data.missionChecks),
    sentences: Array.isArray(data.sentences)
      ? data.sentences.map(normalizeSentence).filter(Boolean)
      : defaultData.sentences,
    characters: Array.isArray(data.characters)
      ? data.characters.map(normalizeCharacter).filter(Boolean)
      : defaultData.characters,
  };
}

function normalizeCompactGameNoteData(data, gameId) {
  const defaultData = createDefaultGameNoteData(gameId);

  return {
    wordMemo: typeof data?.x === "string" ? data.x : defaultData.wordMemo,
    vocabulary: typeof data?.w === "string" ? parseVocabularyText(data.w) : defaultData.vocabulary,
    storyMemo: typeof data?.m === "string" ? data.m : defaultData.storyMemo,
    missionChecks: normalizeCompactMissionChecks(data?.c),
    sentences: Array.isArray(data?.s)
      ? data.s.map(normalizeCompactSentence).filter(Boolean)
      : defaultData.sentences,
    characters: Array.isArray(data?.p)
      ? data.p.map(normalizeCompactCharacter).filter(Boolean)
      : defaultData.characters,
  };
}

function normalizeCompactMissionChecks(missionMask) {
  const safeMissionMask = Number.isInteger(missionMask) ? missionMask : 0;

  return missionItems.reduce(
    (checks, item, index) => ({
      ...checks,
      [item.id]: Boolean(safeMissionMask & (1 << index)),
    }),
    createDefaultMissionChecks()
  );
}

function normalizeCompactSentence(sentence, index = 0) {
  if (Array.isArray(sentence)) {
    return normalizeSentence(
      {
        original: sentence[0],
        meaning: sentence[1] || "",
        mySentence: sentence[2] || "",
        practiced: Boolean(sentence[3]),
      },
      index
    );
  }

  return normalizeSentence(
    {
      id: sentence?.i || sentence?.id,
      title: sentence?.t || sentence?.title,
      chapter: sentence?.h || sentence?.chapter,
      original: sentence?.o || sentence?.original,
      meaning: sentence?.k || sentence?.meaning,
      mySentence: sentence?.r || sentence?.mySentence,
      practiced: sentence?.p || sentence?.practiced,
      x: sentence?.x,
      y: sentence?.y,
    },
    index
  );
}

function normalizeCompactCharacter(character) {
  if (Array.isArray(character)) {
    return normalizeCharacter({
      id: character[0],
      name: character[1],
      description: character[2],
      createdAt: character[3],
      updatedAt: character[4],
    });
  }

  return normalizeCharacter({
    id: character?.i || character?.id,
    name: character?.n || character?.name,
    description: character?.d || character?.description,
    createdAt: character?.a || character?.createdAt,
    updatedAt: character?.u || character?.updatedAt,
  });
}

function serializeAppData(data) {
  const normalizedData = normalizeAppData(data);
  const compactData = { v: APP_STORAGE_VERSION };
  const notesByGameId = {};
  const gameIds = [EDITH_FINCH_ID, ...normalizedData.customGames.map((game) => game.id)];

  if (normalizedData.customGames.length > 0) {
    compactData.g = normalizedData.customGames.map((game) => ({
      id: game.id,
      title: game.title,
      description: game.description,
      createdAt: game.createdAt,
      updatedAt: game.updatedAt,
    }));
  }

  gameIds.forEach((gameId) => {
    const compactNote = serializeGameNoteData(normalizedData.notesByGameId[gameId], gameId);

    if (Object.keys(compactNote).length > 0) {
      notesByGameId[gameId] = compactNote;
    }
  });

  if (Object.keys(notesByGameId).length > 0) {
    compactData.n = notesByGameId;
  }

  return compactData;
}

function serializeGameNoteData(data, gameId) {
  const normalizedData = normalizeGameNoteData(data, gameId);
  const defaultData = createDefaultGameNoteData(gameId);
  const compactData = {};
  const missionMask = serializeMissionChecks(normalizedData.missionChecks);
  const vocabularyText = formatVocabularyText(normalizedData.vocabulary);
  const defaultVocabularyText = formatVocabularyText(defaultData.vocabulary);

  if (normalizedData.wordMemo) {
    compactData.x = normalizedData.wordMemo;
  }

  if (vocabularyText !== defaultVocabularyText) {
    compactData.w = vocabularyText;
  }

  if (normalizedData.storyMemo) {
    compactData.m = normalizedData.storyMemo;
  }

  if (missionMask) {
    compactData.c = missionMask;
  }

  if (!areSentencesEquivalent(normalizedData.sentences, defaultData.sentences)) {
    compactData.s = normalizedData.sentences.map(serializeSentence);
  }

  if (normalizedData.characters.length > 0) {
    compactData.p = normalizedData.characters.map(serializeCharacter);
  }

  return compactData;
}

function hasCustomAppData(data) {
  return JSON.stringify(serializeAppData(data)) !== JSON.stringify({ v: APP_STORAGE_VERSION });
}

function serializeMissionChecks(missionChecks) {
  return missionItems.reduce((missionMask, item, index) => {
    return missionChecks?.[item.id] ? missionMask | (1 << index) : missionMask;
  }, 0);
}

function serializeSentence(sentence) {
  const compactSentence = { o: sentence.original };

  if (sentence.id) compactSentence.i = sentence.id;
  if (sentence.title) compactSentence.t = sentence.title;
  if (sentence.chapter) compactSentence.h = sentence.chapter;
  if (sentence.meaning) compactSentence.k = sentence.meaning;
  if (sentence.mySentence) compactSentence.r = sentence.mySentence;
  if (sentence.practiced) compactSentence.p = 1;
  if (Number.isFinite(sentence.x)) compactSentence.x = sentence.x;
  if (Number.isFinite(sentence.y)) compactSentence.y = sentence.y;

  return compactSentence;
}

function serializeCharacter(character) {
  const compactCharacter = {
    i: character.id,
    n: character.name,
  };

  if (character.description) compactCharacter.d = character.description;
  if (character.createdAt) compactCharacter.a = character.createdAt;
  if (character.updatedAt) compactCharacter.u = character.updatedAt;

  return compactCharacter;
}

function areSentencesEquivalent(sentences, referenceSentences) {
  if (!Array.isArray(sentences) || sentences.length !== referenceSentences.length) {
    return false;
  }

  return referenceSentences.every((referenceSentence, index) => {
    const sentence = sentences[index];
    return (
      sentence?.original === referenceSentence.original &&
      sentence?.meaning === referenceSentence.meaning &&
      sentence?.mySentence === referenceSentence.mySentence &&
      Boolean(sentence?.practiced) === Boolean(referenceSentence.practiced) &&
      sentence?.x === referenceSentence.x &&
      sentence?.y === referenceSentence.y
    );
  });
}

function isLegacySampleVocabulary(vocabulary) {
  const legacySampleVocabulary = [
    ["remember", "기억하다"],
    ["afraid", "두려운"],
    ["explain", "설명하다"],
    ["remains", "남아 있는 것"],
    ["family", "가족"],
  ];

  return (
    vocabulary.length === legacySampleVocabulary.length &&
    legacySampleVocabulary.every(([word, meaning], index) => {
      const entry = vocabulary[index];
      return entry?.word === word && entry?.meaning === meaning;
    })
  );
}

function normalizeVocabularyEntries(vocabulary, legacyWordMemo) {
  if (Array.isArray(vocabulary)) {
    return vocabulary.map(normalizeVocabularyEntry).filter(Boolean);
  }

  if (typeof legacyWordMemo === "string" && legacyWordMemo.trim()) {
    return parseVocabularyText(legacyWordMemo.replaceAll("/", "\n").replaceAll(",", "\n"));
  }

  return createDefaultVocabularyEntries();
}

function normalizeVocabularyEntry(entry) {
  if (!entry || typeof entry !== "object") return null;

  const rawWord = typeof entry.word === "string" ? entry.word : entry.en;
  const word = typeof rawWord === "string" ? rawWord.trim() : "";
  if (!word) return null;

  return {
    id: entry.id || createVocabularyId(),
    word,
    meaning: typeof entry.meaning === "string" ? entry.meaning : entry.ko || "",
  };
}

function formatVocabularyText(vocabulary) {
  return vocabulary.map((entry) => `${entry.word}: ${entry.meaning}`.trim()).join("\n");
}

function parseVocabularyText(vocabularyText, existingVocabulary = []) {
  const existingEntriesByWord = existingVocabulary.reduce((entriesByWord, entry) => {
    const key = entry.word.toLowerCase();
    const entries = entriesByWord.get(key) || [];
    entriesByWord.set(key, [...entries, entry]);
    return entriesByWord;
  }, new Map());

  return vocabularyText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const delimiterIndex = line.indexOf(":");
      const word = (delimiterIndex >= 0 ? line.slice(0, delimiterIndex) : line).trim();
      const meaning = delimiterIndex >= 0 ? line.slice(delimiterIndex + 1).trim() : "";

      if (!word) return null;

      const key = word.toLowerCase();
      const existingEntries = existingEntriesByWord.get(key) || [];
      const existingEntry = existingEntries[0];

      if (existingEntry) {
        existingEntriesByWord.set(key, existingEntries.slice(1));
      }

      return normalizeVocabularyEntry({
        id: existingEntry?.id || createVocabularyId(),
        word,
        meaning,
      });
    })
    .filter(Boolean);
}

function normalizeMissionChecks(missionChecks) {
  const defaultMissionChecks = createDefaultMissionChecks();

  if (!missionChecks || typeof missionChecks !== "object") {
    return defaultMissionChecks;
  }

  return missionItems.reduce(
    (checks, item) => ({
      ...checks,
      [item.id]: Boolean(missionChecks[item.id]),
    }),
    defaultMissionChecks
  );
}

function normalizeSentence(sentence, index = 0) {
  if (!sentence || typeof sentence !== "object" || typeof sentence.original !== "string") {
    return null;
  }

  const original = sentence.original.trim();
  if (!original) return null;

  const defaultPosition = getDefaultBoardPosition(index);

  return {
    id: sentence.id || createId("sentence"),
    title: typeof sentence.title === "string" ? sentence.title : "",
    chapter: typeof sentence.chapter === "string" ? sentence.chapter : "",
    original,
    meaning: typeof sentence.meaning === "string" ? sentence.meaning : "",
    mySentence: typeof sentence.mySentence === "string" ? sentence.mySentence : "",
    practiced: Boolean(sentence.practiced),
    x: clampBoardPercent(Number.isFinite(sentence.x) ? sentence.x : defaultPosition.x),
    y: clampBoardPercent(Number.isFinite(sentence.y) ? sentence.y : defaultPosition.y),
  };
}

function normalizeCharacter(character) {
  if (!character || typeof character !== "object") return null;

  const name = typeof character.name === "string" ? character.name.trim() : "";
  if (!name) return null;

  const timestamp = new Date().toISOString();

  return {
    id: typeof character.id === "string" && character.id.trim() ? character.id : createCharacterId(),
    name,
    description: typeof character.description === "string" ? character.description.trim() : "",
    createdAt: typeof character.createdAt === "string" ? character.createdAt : timestamp,
    updatedAt: typeof character.updatedAt === "string" ? character.updatedAt : timestamp,
  };
}

function normalizeRoutePath(path) {
  const pathname = path.split("?")[0].replace(/\/+$/, "");
  return pathname || HOME_PATH;
}

function readRoutePath() {
  if (typeof window === "undefined") return HOME_PATH;

  const searchParams = new URLSearchParams(window.location.search);
  const redirectedPath = searchParams.get("path");

  if (redirectedPath) {
    const routePath = normalizeRoutePath(redirectedPath);
    window.history.replaceState({}, "", routePath);
    return routePath;
  }

  return normalizeRoutePath(window.location.pathname);
}

function loadGuestAppData() {
  if (typeof window === "undefined") return createDefaultAppData();

  try {
    const savedData = window.localStorage.getItem(GUEST_APP_KEY);

    if (savedData) {
      return normalizeAppData(JSON.parse(savedData));
    }
  } catch {
    // 새 저장값이 깨졌다면 legacy fallback까지 확인한다.
  }

  try {
    const legacyEdithFinchData = window.localStorage.getItem(LEGACY_GUEST_EDITH_FINCH_KEY);
    return legacyEdithFinchData
      ? createDefaultAppData(normalizeEdithFinchData(JSON.parse(legacyEdithFinchData)))
      : createDefaultAppData();
  } catch {
    return createDefaultAppData();
  }
}

function saveGuestAppData(data) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(GUEST_APP_KEY, JSON.stringify(serializeAppData(data)));
  } catch {
    // 게스트 저장 실패는 앱 사용을 막지 않는다.
  }
}

function markPendingGuestSave() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(PENDING_GUEST_SAVE_KEY, "1");
  } catch {
    // 로그인은 계속 진행한다.
  }
}

function hasPendingGuestSave() {
  if (typeof window === "undefined") return false;

  try {
    return (
      window.localStorage.getItem(PENDING_GUEST_SAVE_KEY) === "1" ||
      window.localStorage.getItem(LEGACY_PENDING_GUEST_SAVE_KEY) === "1"
    );
  } catch {
    return false;
  }
}

function clearPendingGuestSave() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(PENDING_GUEST_SAVE_KEY);
    window.localStorage.removeItem(LEGACY_PENDING_GUEST_SAVE_KEY);
  } catch {
    // 제거 실패는 다음 저장 때 다시 정리된다.
  }
}

function getCurrentAppUrl() {
  if (typeof window === "undefined") return REGISTERED_REDIRECT_URL;

  const currentUrl = new URL(window.location.href);
  currentUrl.hash = "";

  if (!isRegisteredRedirectUrl(currentUrl)) {
    return REGISTERED_REDIRECT_URL;
  }

  return currentUrl.toString();
}

function isRegisteredRedirectUrl(url) {
  const registeredUrl = new URL(REGISTERED_REDIRECT_URL);
  return url.origin === registeredUrl.origin && url.pathname.startsWith(registeredUrl.pathname);
}

function createOhmeshRedirectUrl(path) {
  const url = new URL(path, OHMESH_BASE_URL);
  url.searchParams.set("app", OHMESH_APP_SLUG);
  url.searchParams.set("redirect_url", getCurrentAppUrl());
  return url.toString();
}

function ohmeshFetch(path, options = {}) {
  return fetch(`${OHMESH_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
  });
}

async function readResponseJson(response) {
  if (response.status === 204) return null;

  const responseText = await response.text();
  if (!responseText) return null;

  try {
    return JSON.parse(responseText);
  } catch {
    return null;
  }
}

async function getResponseErrorMessage(response, fallbackMessage) {
  const errorBody = await readResponseJson(response);
  return errorBody?.error || fallbackMessage || `ohmesh 요청 실패 (${response.status})`;
}

function selectLatestRecord(records) {
  return [...records].sort((firstRecord, secondRecord) => {
    const firstTime = new Date(firstRecord.updated_at || firstRecord.created_at || 0).getTime();
    const secondTime = new Date(secondRecord.updated_at || secondRecord.created_at || 0).getTime();
    return secondTime - firstTime;
  })[0] || null;
}

function getUserDisplayName(user) {
  return user?.name || user?.email || "로그인됨";
}

function getSyncStatusLabel(syncState) {
  if (syncState.status === "local") return "브라우저 저장";
  if (syncState.status === "loading") return "불러오는 중";
  if (syncState.status === "saving") return "저장 중";
  if (syncState.status === "saved") return "저장됨";
  if (syncState.status === "error") return "저장 오류";
  return "대기";
}

function createGameLibrary(customGames) {
  return [
    ...defaultGames,
    ...customGames.map((game) => ({
      ...game,
      path: `/games/${game.id}`,
      description: game.description || "내 게임 영어 보드",
      isCustom: true,
    })),
  ];
}

function getKnownGameIds(appData) {
  return new Set([...defaultGames.map((game) => game.id), ...appData.customGames.map((game) => game.id)]);
}

function getGameCoverLabel(game) {
  const titleWords = game.title
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean);

  if (titleWords.length >= 2) {
    return titleWords
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  }

  return (game.title[0] || "G").toUpperCase();
}

function getGameAccentColor(gameId) {
  const colors = ["#38bdf8", "#f97316", "#84cc16", "#f43f5e", "#eab308", "#14b8a6"];
  const colorIndex = [...gameId].reduce((sum, character) => sum + character.charCodeAt(0), 0) % colors.length;
  return colors[colorIndex];
}

function getDefaultBoardPosition(index) {
  const positions = [
    { x: 7, y: 12 },
    { x: 38, y: 15 },
    { x: 14, y: 53 },
    { x: 56, y: 47 },
    { x: 24, y: 28 },
    { x: 49, y: 66 },
  ];
  return positions[index % positions.length];
}

function clampBoardPercent(value) {
  if (!Number.isFinite(value)) return 10;
  return Math.max(2, Math.min(76, Math.round(value * 10) / 10));
}

function getSentenceTitle(sentence) {
  return sentence.title || sentence.original.split(/\s+/).slice(0, 5).join(" ");
}

function getSentenceChapter(sentence, index) {
  return sentence.chapter || `Note ${index + 1}`;
}

function getSentenceSummary(sentence) {
  return sentence.mySentence || sentence.meaning || sentence.original;
}

function findVocabularyForSentence(sentence, vocabulary) {
  const sourceText = `${sentence.original} ${sentence.meaning} ${sentence.mySentence}`.toLowerCase();
  const matches = vocabulary.filter((entry) => sourceText.includes(entry.word.toLowerCase()));
  return (matches.length ? matches : vocabulary).slice(0, 4);
}

export default function App() {
  const [routePath, setRoutePath] = useState(readRoutePath);
  const [authState, setAuthState] = useState({
    status: "checking",
    user: null,
    app: null,
    session: null,
    message: "로그인 상태를 확인하는 중입니다.",
  });
  const [appData, setAppData] = useState(loadGuestAppData);
  const [storageRecord, setStorageRecord] = useState(null);
  const [syncState, setSyncState] = useState({
    status: "local",
    message: "로그인 전에는 이 브라우저에만 저장됩니다.",
  });
  const [isRemoteDataReady, setIsRemoteDataReady] = useState(false);
  const [storageReloadKey, setStorageReloadKey] = useState(0);
  const lastSavedDataJsonRef = useRef("");

  const clearRemoteData = useCallback(() => {
    setStorageRecord(null);
    setIsRemoteDataReady(false);
    lastSavedDataJsonRef.current = "";
  }, []);

  const handleSessionProblem = useCallback(
    (response) => {
      if (response.status === 401) {
        clearRemoteData();
        setAuthState({
          status: "signed-out",
          user: null,
          app: null,
          session: null,
          message: "로그인이 필요합니다. 다시 로그인해주세요.",
        });
        setSyncState({
          status: "local",
          message: "로그인 전에는 이 브라우저에만 저장됩니다.",
        });
        return true;
      }

      if (response.status === 403) {
        clearRemoteData();
        setAuthState({
          status: "wrong-app",
          user: null,
          app: null,
          session: null,
          message: "현재 세션이 gamelingo 앱용이 아닙니다.",
        });
        return true;
      }

      return false;
    },
    [clearRemoteData]
  );

  const loadAuthState = useCallback(async () => {
    try {
      const response = await ohmeshFetch("/auth/me");

      if (response.status === 401) {
        clearRemoteData();
        setAuthState({
          status: "signed-out",
          user: null,
          app: null,
          session: null,
          message: "로그인하면 문장 노트를 안전하게 저장할 수 있습니다.",
        });
        setSyncState({
          status: "local",
          message: "로그인 전에는 이 브라우저에만 저장됩니다.",
        });
        return;
      }

      if (!response.ok) {
        throw new Error(await getResponseErrorMessage(response, "로그인 상태를 확인하지 못했습니다."));
      }

      const sessionInfo = await readResponseJson(response);

      if (sessionInfo?.app?.slug && sessionInfo.app.slug !== OHMESH_APP_SLUG) {
        clearRemoteData();
        setAuthState({
          status: "wrong-app",
          user: sessionInfo.user || null,
          app: sessionInfo.app || null,
          session: sessionInfo.session || null,
          message: "현재 세션이 gamelingo 앱용이 아닙니다.",
        });
        return;
      }

      setAuthState({
        status: "signed-in",
        user: sessionInfo?.user || null,
        app: sessionInfo?.app || null,
        session: sessionInfo?.session || null,
        message: "",
      });
    } catch (error) {
      clearRemoteData();
      setSyncState({
        status: "local",
        message: "ohmesh 확인에 실패해 이 브라우저에만 저장됩니다.",
      });
      setAuthState({
        status: "error",
        user: null,
        app: null,
        session: null,
        message: error instanceof Error ? error.message : "로그인 상태를 확인하지 못했습니다.",
      });
    }
  }, [clearRemoteData]);

  const checkAuth = useCallback(() => {
    setAuthState((previousState) => ({
      ...previousState,
      status: "checking",
      message: "로그인 상태를 확인하는 중입니다.",
    }));
    loadAuthState();
  }, [loadAuthState]);

  useEffect(() => {
    function syncRoutePath() {
      setRoutePath(readRoutePath());
    }

    window.addEventListener("popstate", syncRoutePath);
    return () => window.removeEventListener("popstate", syncRoutePath);
  }, []);

  useEffect(() => {
    let shouldIgnore = false;

    async function loadAuthAfterMount() {
      await Promise.resolve();
      if (!shouldIgnore) loadAuthState();
    }

    loadAuthAfterMount();

    return () => {
      shouldIgnore = true;
    };
  }, [loadAuthState]);

  useEffect(() => {
    if (authState.status !== "signed-out" && authState.status !== "error") return;

    saveGuestAppData(appData);
  }, [authState.status, appData]);

  useEffect(() => {
    if (authState.status !== "signed-in") return undefined;

    let shouldIgnore = false;

    async function loadRemoteData() {
      await Promise.resolve();
      if (shouldIgnore) return;

      setStorageRecord(null);
      setIsRemoteDataReady(false);
      setSyncState({ status: "loading", message: "ohmesh에서 노트를 불러오는 중입니다." });
      lastSavedDataJsonRef.current = "";

      try {
        async function loadLatestRecord(recordType) {
          const listResponse = await ohmeshFetch(
            `/api/apps/${OHMESH_APP_SLUG}/records?type=${encodeURIComponent(recordType)}&limit=100&offset=0`
          );

          if (shouldIgnore || handleSessionProblem(listResponse)) return undefined;

          if (!listResponse.ok) {
            throw new Error(await getResponseErrorMessage(listResponse, "노트를 불러오지 못했습니다."));
          }

          const recordList = await readResponseJson(listResponse);
          const recordSummary = selectLatestRecord(Array.isArray(recordList?.records) ? recordList.records : []);

          if (!recordSummary) return null;

          const recordResponse = await ohmeshFetch(`/api/apps/${OHMESH_APP_SLUG}/records/${recordSummary.id}`);

          if (shouldIgnore || handleSessionProblem(recordResponse)) return undefined;

          if (!recordResponse.ok) {
            throw new Error(await getResponseErrorMessage(recordResponse, "노트를 읽지 못했습니다."));
          }

          return readResponseJson(recordResponse);
        }

        let activeRecord = await loadLatestRecord(APP_RECORD_TYPE);
        if (shouldIgnore || activeRecord === undefined) return;

        let migratedLegacyData = null;

        if (!activeRecord) {
          const legacyRecord = await loadLatestRecord(LEGACY_EDITH_FINCH_RECORD_TYPE);
          if (shouldIgnore || legacyRecord === undefined) return;

          if (legacyRecord) {
            migratedLegacyData = createDefaultAppData(normalizeEdithFinchData(legacyRecord.data));
          }
        }

        const pendingGuestData = hasPendingGuestSave() ? loadGuestAppData() : null;
        const shouldUploadGuestData = Boolean(pendingGuestData && hasCustomAppData(pendingGuestData));
        const normalizedData = shouldUploadGuestData
          ? pendingGuestData
          : activeRecord
            ? normalizeAppData(activeRecord.data)
            : migratedLegacyData || createDefaultAppData();
        const compactData = serializeAppData(normalizedData);
        const compactDataJson = JSON.stringify(compactData);

        if (!activeRecord) {
          const createResponse = await ohmeshFetch(`/api/apps/${OHMESH_APP_SLUG}/records`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: APP_RECORD_TYPE,
              data: compactData,
            }),
          });

          if (shouldIgnore || handleSessionProblem(createResponse)) return;

          if (!createResponse.ok) {
            throw new Error(await getResponseErrorMessage(createResponse, "노트를 만들지 못했습니다."));
          }

          activeRecord = await readResponseJson(createResponse);
        } else if (JSON.stringify(activeRecord?.data) !== compactDataJson) {
          const compactResponse = await ohmeshFetch(`/api/apps/${OHMESH_APP_SLUG}/records/${activeRecord.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: compactData }),
          });

          if (shouldIgnore || handleSessionProblem(compactResponse)) return;

          if (!compactResponse.ok) {
            throw new Error(await getResponseErrorMessage(compactResponse, "노트를 압축 저장하지 못했습니다."));
          }

          activeRecord = await readResponseJson(compactResponse);
        }

        if (pendingGuestData) {
          clearPendingGuestSave();
        }

        lastSavedDataJsonRef.current = compactDataJson;

        if (shouldIgnore) return;

        setStorageRecord(activeRecord);
        setAppData(normalizedData);
        saveGuestAppData(normalizedData);
        setIsRemoteDataReady(true);
        setSyncState({
          status: "saved",
          message: shouldUploadGuestData ? "브라우저 노트를 ohmesh에 저장했습니다." : "ohmesh에 저장되어 있습니다.",
        });
      } catch (error) {
        if (shouldIgnore) return;

        setIsRemoteDataReady(false);
        setSyncState({
          status: "error",
          message: error instanceof Error ? error.message : "노트를 불러오지 못했습니다.",
        });
      }
    }

    loadRemoteData();

    return () => {
      shouldIgnore = true;
    };
  }, [authState.status, handleSessionProblem, storageReloadKey]);

  useEffect(() => {
    if (authState.status !== "signed-in" || !isRemoteDataReady || !storageRecord?.id) {
      return undefined;
    }

    const compactData = serializeAppData(appData);
    const nextDataJson = JSON.stringify(compactData);

    if (nextDataJson === lastSavedDataJsonRef.current) {
      return undefined;
    }

    const abortController = new AbortController();
    const saveTimer = window.setTimeout(async () => {
      setSyncState({ status: "saving", message: "ohmesh에 저장하는 중입니다." });

      try {
        const response = await ohmeshFetch(`/api/apps/${OHMESH_APP_SLUG}/records/${storageRecord.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: compactData }),
          signal: abortController.signal,
        });

        if (handleSessionProblem(response)) return;

        if (!response.ok) {
          throw new Error(await getResponseErrorMessage(response, "노트를 저장하지 못했습니다."));
        }

        const updatedRecord = await readResponseJson(response);
        lastSavedDataJsonRef.current = nextDataJson;
        setStorageRecord(updatedRecord);
        saveGuestAppData(appData);
        setSyncState({ status: "saved", message: "ohmesh에 저장되어 있습니다." });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;

        setSyncState({
          status: "error",
          message: error instanceof Error ? error.message : "노트를 저장하지 못했습니다.",
        });
      }
    }, 650);

    return () => {
      window.clearTimeout(saveTimer);
      abortController.abort();
    };
  }, [authState.status, appData, handleSessionProblem, isRemoteDataReady, storageRecord?.id]);

  const gameLibrary = createGameLibrary(appData.customGames);
  const selectedGameInfo = gameLibrary.find((game) => game.path === routePath);
  const selectedGameData = selectedGameInfo
    ? appData.notesByGameId[selectedGameInfo.id] || createDefaultGameNoteData(selectedGameInfo.id)
    : null;

  function navigateTo(path) {
    const routePath = normalizeRoutePath(path);
    window.history.pushState({}, "", routePath);
    setRoutePath(routePath);
  }

  function login() {
    window.location.assign(createOhmeshRedirectUrl("/login"));
  }

  function saveToOhmesh() {
    saveGuestAppData(appData);
    markPendingGuestSave();
    login();
  }

  function logout() {
    window.location.assign(createOhmeshRedirectUrl("/logout"));
  }

  function retryStorageLoad() {
    setStorageReloadKey((previousKey) => previousKey + 1);
  }

  function setSelectedGameData(updater) {
    if (!selectedGameInfo) return;

    const gameId = selectedGameInfo.id;

    setAppData((previousData) => {
      const previousNote = previousData.notesByGameId[gameId] || createDefaultGameNoteData(gameId);
      const nextNote = typeof updater === "function" ? updater(previousNote) : updater;

      return {
        ...previousData,
        notesByGameId: {
          ...previousData.notesByGameId,
          [gameId]: normalizeGameNoteData(nextNote, gameId),
        },
      };
    });
  }

  function createCustomGame({ title, description }) {
    const timestamp = new Date().toISOString();
    const game = {
      id: createGameId(title, getKnownGameIds(appData)),
      title: title.trim(),
      description: description.trim(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setAppData((previousData) => ({
      ...previousData,
      customGames: [...previousData.customGames, game],
      notesByGameId: {
        ...previousData.notesByGameId,
        [game.id]: createDefaultGameNoteData(game.id),
      },
    }));

    return game;
  }

  function updateCustomGame(gameId, { title, description }) {
    const timestamp = new Date().toISOString();

    setAppData((previousData) => ({
      ...previousData,
      customGames: previousData.customGames.map((game) =>
        game.id === gameId
          ? {
              ...game,
              title: title.trim(),
              description: description.trim(),
              updatedAt: timestamp,
            }
          : game
      ),
    }));
  }

  function deleteCustomGame(gameId) {
    setAppData((previousData) => {
      const remainingNotesByGameId = { ...previousData.notesByGameId };
      delete remainingNotesByGameId[gameId];

      return {
        ...previousData,
        customGames: previousData.customGames.filter((game) => game.id !== gameId),
        notesByGameId: remainingNotesByGameId,
      };
    });

    if (routePath === `/games/${gameId}`) {
      navigateTo(HOME_PATH);
    }
  }

  if (authState.status === "checking") {
    return <AuthStatePage title="로그인 확인 중" description={authState.message} />;
  }

  if (authState.status === "wrong-app") {
    return (
      <AuthStatePage
        title="앱 세션 확인 필요"
        description={authState.message}
        primaryAction="로그아웃"
        onPrimaryAction={logout}
        secondaryAction="다시 확인"
        onSecondaryAction={checkAuth}
      />
    );
  }

  if (authState.status === "signed-in" && !isRemoteDataReady) {
    return (
      <AuthStatePage
        title={syncState.status === "error" ? "노트를 불러오지 못했습니다" : "노트를 불러오는 중"}
        description={syncState.message || "ohmesh에서 내 문장 노트를 준비하고 있습니다."}
        primaryAction={syncState.status === "error" ? "다시 시도" : undefined}
        onPrimaryAction={syncState.status === "error" ? retryStorageLoad : undefined}
        secondaryAction="로그아웃"
        onSecondaryAction={logout}
      />
    );
  }

  const isGuestMode = authState.status === "signed-out" || authState.status === "error";

  if (selectedGameInfo) {
    return (
      <StudyBoardPage
        key={selectedGameInfo.id}
        game={selectedGameInfo}
        data={selectedGameData}
        setData={setSelectedGameData}
        syncState={syncState}
        user={authState.user}
        isGuestMode={isGuestMode}
        onGoHome={() => navigateTo(HOME_PATH)}
        onLogout={logout}
        onSaveToOhmesh={saveToOhmesh}
      />
    );
  }

  return (
    <HomePage
      games={gameLibrary}
      syncState={syncState}
      user={authState.user}
      isGuestMode={isGuestMode}
      onCreateGame={createCustomGame}
      onDeleteGame={deleteCustomGame}
      onUpdateGame={updateCustomGame}
      onLogout={logout}
      onSaveToOhmesh={saveToOhmesh}
      onSelectGame={(game) => navigateTo(game.path)}
    />
  );
}

function AuthStatePage({
  title,
  description,
  primaryAction,
  secondaryAction,
  onPrimaryAction,
  onSecondaryAction,
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-stone-950 p-5 text-stone-100">
      <section className="grid w-full max-w-2xl gap-6 rounded-[2rem] border border-stone-800 bg-stone-900/90 p-7 shadow-2xl">
        <div>
          <p className="text-3xl font-black tracking-tight">Gamelingo</p>
          <p className="mt-1 text-sm text-stone-500">ohmesh 계정으로 게임 영어 보드를 저장합니다.</p>
        </div>
        <div>
          <p className="mb-2 text-xs font-black uppercase tracking-wider text-stone-500">ohmesh</p>
          <h1 className="text-4xl font-black tracking-tight">{title}</h1>
          {description ? <p className="mt-4 leading-7 text-stone-400">{description}</p> : null}
        </div>
        {primaryAction || secondaryAction ? (
          <div className="flex flex-wrap gap-2">
            {primaryAction ? (
              <button className="rounded-2xl bg-stone-100 px-5 py-3 text-sm font-black text-stone-950" type="button" onClick={onPrimaryAction}>
                {primaryAction}
              </button>
            ) : null}
            {secondaryAction ? (
              <button className="rounded-2xl border border-stone-800 bg-stone-950 px-5 py-3 text-sm font-black text-stone-300" type="button" onClick={onSecondaryAction}>
                {secondaryAction}
              </button>
            ) : null}
          </div>
        ) : null}
      </section>
    </main>
  );
}

function HomePage({
  games,
  syncState,
  user,
  isGuestMode,
  onCreateGame,
  onDeleteGame,
  onUpdateGame,
  onLogout,
  onSaveToOhmesh,
  onSelectGame,
}) {
  const [editingGame, setEditingGame] = useState(null);
  const [isGameEditorOpen, setIsGameEditorOpen] = useState(false);

  function openCreateGame() {
    setEditingGame(null);
    setIsGameEditorOpen(true);
  }

  function openEditGame(game) {
    setEditingGame(game);
    setIsGameEditorOpen(true);
  }

  function closeGameEditor() {
    setIsGameEditorOpen(false);
    setEditingGame(null);
  }

  function saveGame(gameDraft) {
    if (editingGame) {
      onUpdateGame(editingGame.id, gameDraft);
    } else {
      onCreateGame(gameDraft);
    }

    closeGameEditor();
  }

  function deleteGame(game) {
    if (window.confirm(`"${game.title}" 게임과 저장한 보드를 삭제할까요?`)) {
      onDeleteGame(game.id);
    }
  }

  return (
    <main className="min-h-screen bg-stone-950 p-5 text-stone-100">
      <div className="mx-auto grid min-h-[calc(100vh-40px)] w-full max-w-6xl content-center gap-5">
        <header className="grid gap-5 rounded-[2rem] border border-stone-800 bg-stone-900/80 p-5 shadow-2xl md:grid-cols-[280px_1fr]">
          <div className="rounded-3xl border border-stone-800 bg-stone-950 p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-stone-800">
                <Gamepad2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-black">Gamelingo</p>
                <p className="text-xs text-stone-500">게임 영어 보드</p>
              </div>
            </div>
            <AccountSummary
              syncState={syncState}
              user={user}
              isGuestMode={isGuestMode}
              onLogout={onLogout}
              onSaveToOhmesh={onSaveToOhmesh}
            />
          </div>
          <div className="flex flex-col justify-between gap-5">
            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-wider text-stone-500">게임 선택</p>
              <h1 className="max-w-2xl text-4xl font-black tracking-tight md:text-5xl">오늘 공부할 게임 보드를 고르세요</h1>
              <p className="mt-4 max-w-2xl leading-7 text-stone-400">문장, 단어, 등장인물을 한 보드 위에 모아 게임 흐름을 보며 공부합니다.</p>
            </div>
            <button className="w-fit rounded-2xl bg-stone-100 px-5 py-3 text-sm font-black text-stone-950 hover:bg-white" type="button" onClick={openCreateGame}>
              게임 추가
            </button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="게임 선택">
          {games.map((game) => (
            <article key={game.id} className="rounded-[2rem] border border-stone-800 bg-stone-900/70 p-4 shadow-xl">
              <a
                href={game.path}
                className="grid grid-cols-[86px_1fr] gap-4 rounded-3xl p-2 text-stone-100 no-underline hover:bg-stone-800/70"
                onClick={(event) => {
                  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                  event.preventDefault();
                  onSelectGame(game);
                }}
              >
                <GameCover game={game} className="h-[122px] w-[86px] rounded-2xl" />
                <span className="grid content-center">
                  <strong className="text-lg font-black leading-tight">{game.title}</strong>
                  <span className="mt-2 text-sm text-stone-500">{game.description}</span>
                  <span className="mt-5 text-xs font-black uppercase tracking-wider text-stone-400">보드 열기</span>
                </span>
              </a>
              {game.isCustom ? (
                <div className="mt-3 flex justify-end gap-2">
                  <button className="rounded-xl border border-stone-800 px-3 py-2 text-xs font-bold text-stone-400 hover:bg-stone-800" type="button" onClick={() => openEditGame(game)}>
                    수정
                  </button>
                  <button className="rounded-xl border border-red-950/60 bg-red-950/30 px-3 py-2 text-xs font-bold text-red-300 hover:bg-red-950/50" type="button" onClick={() => deleteGame(game)}>
                    삭제
                  </button>
                </div>
              ) : null}
            </article>
          ))}
        </section>
      </div>

      {isGameEditorOpen ? (
        <GameEditorModal
          key={editingGame?.id || "new-game"}
          game={editingGame}
          onClose={closeGameEditor}
          onSaveGame={saveGame}
        />
      ) : null}
    </main>
  );
}

function AccountSummary({ syncState, user, isGuestMode, onLogout, onSaveToOhmesh }) {
  return (
    <div className="grid gap-3 border-t border-stone-800 pt-4">
      <div>
        <p className="break-words text-sm font-black text-stone-100">{isGuestMode ? "게스트 모드" : getUserDisplayName(user)}</p>
        <SyncStatusBadge syncState={syncState} />
      </div>
      <button
        className={isGuestMode ? "rounded-2xl bg-stone-100 px-4 py-2.5 text-sm font-black text-stone-950" : "rounded-2xl border border-stone-800 px-4 py-2.5 text-sm font-black text-stone-300"}
        type="button"
        onClick={isGuestMode ? onSaveToOhmesh : onLogout}
      >
        {isGuestMode ? "저장하기" : "로그아웃"}
      </button>
    </div>
  );
}

function SyncStatusBadge({ syncState }) {
  return (
    <span className="sync-status-badge" title={syncState.message}>
      {getSyncStatusLabel(syncState)}
    </span>
  );
}

function GameEditorModal({ game, onClose, onSaveGame }) {
  const [title, setTitle] = useState(game?.title || "");
  const [description, setDescription] = useState(game?.description || "");
  const isEditing = Boolean(game);

  useEffect(() => {
    function closeWithEscape(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", closeWithEscape);
    return () => window.removeEventListener("keydown", closeWithEscape);
  }, [onClose]);

  function saveGame(event) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    onSaveGame({
      title: trimmedTitle,
      description: description.trim(),
    });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-5 backdrop-blur-sm" role="presentation" onClick={onClose}>
      <section
        className="w-full max-w-lg rounded-[2rem] border border-stone-800 bg-stone-950 p-5 text-stone-100 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-editor-title"
        onClick={(event) => event.stopPropagation()}
      >
        <form className="grid gap-4" onSubmit={saveGame}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mb-1 text-xs font-black uppercase tracking-wider text-stone-500">게임 관리</p>
              <h2 id="game-editor-title" className="text-2xl font-black">{isEditing ? "게임 수정" : "게임 추가"}</h2>
            </div>
            <button className="rounded-2xl border border-stone-800 bg-stone-900 p-3 hover:bg-stone-800" type="button" onClick={onClose}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <label className="grid gap-1.5">
            <span className="text-xs font-black text-stone-500">제목</span>
            <input className="rounded-2xl border border-stone-800 bg-stone-900 px-4 py-3 text-sm font-bold outline-none focus:border-stone-500" value={title} onChange={(event) => setTitle(event.target.value)} required />
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs font-black text-stone-500">설명</span>
            <textarea className="h-24 resize-none rounded-2xl border border-stone-800 bg-stone-900 px-4 py-3 text-sm outline-none focus:border-stone-500" value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>

          <div className="flex justify-end gap-2">
            <button className="rounded-2xl px-4 py-3 text-sm font-black text-stone-500 hover:bg-stone-900" type="button" onClick={onClose}>
              취소
            </button>
            <button className="rounded-2xl bg-stone-100 px-5 py-3 text-sm font-black text-stone-950 hover:bg-white" type="submit">
              {isEditing ? "수정 저장" : "게임 추가"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function GameCover({ game, className }) {
  if (game.artwork) {
    return <img className={`${className} object-cover`} src={game.artwork} alt="" />;
  }

  return (
    <div
      className={`${className} grid place-items-center overflow-hidden border border-stone-700 bg-stone-900 text-stone-100`}
      style={{ borderTop: `7px solid ${getGameAccentColor(game.id)}` }}
      aria-hidden="true"
    >
      <span className="grid h-12 w-12 place-items-center rounded-full border border-stone-700 bg-stone-800 text-lg font-black">
        {getGameCoverLabel(game)}
      </span>
    </div>
  );
}

function StudyBoardPage({
  game,
  data,
  setData,
  syncState,
  user,
  isGuestMode,
  onGoHome,
  onLogout,
  onSaveToOhmesh,
}) {
  const [openedSentenceId, setOpenedSentenceId] = useState(null);
  const [isNewSentenceOpen, setIsNewSentenceOpen] = useState(false);
  const [openedCharacterId, setOpenedCharacterId] = useState(null);
  const [wordForm, setWordForm] = useState({ open: false, mode: "add", word: null });
  const [addCharacterOpen, setAddCharacterOpen] = useState(false);
  const boardRef = useRef(null);

  const openedSentence = data.sentences.find((sentence) => sentence.id === openedSentenceId) || null;
  const openedCharacter = data.characters.find((character) => character.id === openedCharacterId) || null;

  function openNewSentence() {
    setOpenedSentenceId(null);
    setIsNewSentenceOpen(true);
  }

  function closeSentenceModal() {
    setOpenedSentenceId(null);
    setIsNewSentenceOpen(false);
  }

  function saveSentence(sentenceDraft) {
    setData((previousData) => {
      if (sentenceDraft.id) {
        return {
          ...previousData,
          sentences: previousData.sentences.map((sentence) =>
            sentence.id === sentenceDraft.id ? normalizeSentence({ ...sentence, ...sentenceDraft }) : sentence
          ),
        };
      }

      const defaultPosition = getDefaultBoardPosition(previousData.sentences.length);
      const newSentence = normalizeSentence({
        ...sentenceDraft,
        id: createId("sentence"),
        x: defaultPosition.x,
        y: defaultPosition.y,
        practiced: false,
      });

      return {
        ...previousData,
        sentences: [newSentence, ...previousData.sentences],
      };
    });
    closeSentenceModal();
  }

  function deleteSentence(sentenceId) {
    setData((previousData) => ({
      ...previousData,
      sentences: previousData.sentences.filter((sentence) => sentence.id !== sentenceId),
    }));
    closeSentenceModal();
  }

  function moveSentence(sentenceId, x, y) {
    setData((previousData) => ({
      ...previousData,
      sentences: previousData.sentences.map((sentence) =>
        sentence.id === sentenceId ? { ...sentence, x: clampBoardPercent(x), y: clampBoardPercent(y) } : sentence
      ),
    }));
  }

  function saveVocabularyEntry(entryDraft) {
    setData((previousData) => {
      if (entryDraft.id) {
        return {
          ...previousData,
          vocabulary: previousData.vocabulary.map((entry) =>
            entry.id === entryDraft.id ? normalizeVocabularyEntry({ ...entry, ...entryDraft }) : entry
          ).filter(Boolean),
        };
      }

      const newEntry = normalizeVocabularyEntry({
        ...entryDraft,
        id: createVocabularyId(),
      });

      return {
        ...previousData,
        vocabulary: newEntry ? [newEntry, ...previousData.vocabulary] : previousData.vocabulary,
      };
    });
    setWordForm({ open: false, mode: "add", word: null });
  }

  function deleteVocabularyEntry(entryId) {
    setData((previousData) => ({
      ...previousData,
      vocabulary: previousData.vocabulary.filter((entry) => entry.id !== entryId),
    }));
    setWordForm({ open: false, mode: "add", word: null });
  }

  function saveCharacter(characterDraft) {
    const timestamp = new Date().toISOString();

    setData((previousData) => {
      if (characterDraft.id) {
        return {
          ...previousData,
          characters: previousData.characters.map((character) =>
            character.id === characterDraft.id
              ? normalizeCharacter({ ...character, ...characterDraft, updatedAt: timestamp })
              : character
          ).filter(Boolean),
        };
      }

      const newCharacter = normalizeCharacter({
        ...characterDraft,
        id: createCharacterId(),
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      return {
        ...previousData,
        characters: newCharacter ? [newCharacter, ...previousData.characters] : previousData.characters,
      };
    });
    setAddCharacterOpen(false);
    setOpenedCharacterId(null);
  }

  function deleteCharacter(characterId) {
    setData((previousData) => ({
      ...previousData,
      characters: previousData.characters.filter((character) => character.id !== characterId),
    }));
    setOpenedCharacterId(null);
  }

  return (
    <div className="study-template app">
      <StudyHeader
        game={game}
        syncState={syncState}
        user={user}
        isGuestMode={isGuestMode}
        onAddNote={openNewSentence}
        onBackToGames={onGoHome}
        onLogout={onLogout}
        onSaveToOhmesh={onSaveToOhmesh}
      />
      {syncState.status === "error" ? (
        <div className="border-b border-red-950/70 bg-red-950/40 px-6 py-3 text-sm font-bold text-red-200">
          {syncState.message || "ohmesh 저장에 실패했습니다. 다시 수정하면 저장을 재시도합니다."}
        </div>
      ) : null}
      <Board
        boardRef={boardRef}
        sentences={data.sentences}
        vocabulary={data.vocabulary}
        characters={data.characters}
        onAddCharacter={() => setAddCharacterOpen(true)}
        onAddWord={() => setWordForm({ open: true, mode: "add", word: null })}
        onMoveSentence={moveSentence}
        onOpenCharacter={(character) => setOpenedCharacterId(character.id)}
        onOpenNote={(sentence) => setOpenedSentenceId(sentence.id)}
        onOpenWord={(word) => setWordForm({ open: true, mode: "edit", word })}
      />
      {isNewSentenceOpen || openedSentence ? (
        <SentenceBoardModal
          key={isNewSentenceOpen ? "new-sentence" : openedSentence.id}
          sentence={isNewSentenceOpen ? null : openedSentence}
          vocabulary={data.vocabulary}
          onClose={closeSentenceModal}
          onDeleteSentence={deleteSentence}
          onSaveSentence={saveSentence}
        />
      ) : null}
      {openedCharacter ? (
        <CharacterModal
          key={openedCharacter.id}
          character={openedCharacter}
          onClose={() => setOpenedCharacterId(null)}
          onDeleteCharacter={deleteCharacter}
          onSaveCharacter={saveCharacter}
        />
      ) : null}
      {wordForm.open ? (
        <WordFormModal
          key={wordForm.word?.id || "new-word"}
          mode={wordForm.mode}
          word={wordForm.word}
          onClose={() => setWordForm({ open: false, mode: "add", word: null })}
          onDeleteWord={deleteVocabularyEntry}
          onSaveWord={saveVocabularyEntry}
        />
      ) : null}
      {addCharacterOpen ? (
        <AddCharacterModal onClose={() => setAddCharacterOpen(false)} onSaveCharacter={saveCharacter} />
      ) : null}
    </div>
  );
}

function StudyHeader({
  game,
  syncState,
  user,
  isGuestMode,
  onAddNote,
  onBackToGames,
  onLogout,
  onSaveToOhmesh,
}) {
  return (
    <header className="header">
      <div className="header-left">
        <button
          onClick={onBackToGames}
          className="back-button"
          title="게임 선택으로 이동"
          type="button"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="game-title">{game.title}</h1>
      </div>
      <div className="header-right">
        <div className="search-box">
          <Search className="h-4 w-4" />
          <span>문장 / 영단어 / 등장인물 검색</span>
        </div>
        <SyncStatusBadge syncState={syncState} />
        <button onClick={onAddNote} className="primary-button" type="button">
          <Plus className="h-4 w-4" />노트 추가
        </button>
        <button
          className={isGuestMode ? "primary-button primary-button--warm" : "small-button"}
          type="button"
          onClick={isGuestMode ? onSaveToOhmesh : onLogout}
          title={isGuestMode ? "ohmesh에 저장" : getUserDisplayName(user)}
        >
          {isGuestMode ? "저장하기" : "로그아웃"}
        </button>
      </div>
    </header>
  );
}

function Board({
  boardRef,
  sentences,
  vocabulary,
  characters,
  onAddCharacter,
  onAddWord,
  onMoveSentence,
  onOpenCharacter,
  onOpenNote,
  onOpenWord,
}) {
  const [noteZIndexes, setNoteZIndexes] = useState(() =>
    Object.fromEntries(sentences.map((sentence, index) => [sentence.id, index + 1]))
  );
  const topZIndexRef = useRef(sentences.length + 1);

  const bringNoteToFront = (noteId) => {
    topZIndexRef.current += 1;
    setNoteZIndexes((previous) => ({ ...previous, [noteId]: topZIndexRef.current }));
  };

  return (
    <main ref={boardRef} className="board">
      <div className="board-grid" />
      <div id="noteLayer">
        {sentences.length === 0 ? (
          <div className="empty-board-note">
            <p>아직 보드 노트가 없습니다.</p>
            <span>상단의 노트 추가를 눌러 게임에서 발견한 영어 문장을 붙여보세요.</span>
          </div>
        ) : null}
        {sentences.map((sentence, index) => (
          <NoteCard
            key={sentence.id}
            boardRef={boardRef}
            sentence={sentence}
            sentenceIndex={index}
            vocabulary={vocabulary}
            onMove={onMoveSentence}
            onOpen={onOpenNote}
            zIndex={noteZIndexes[sentence.id] ?? index + 1}
            onFocus={bringNoteToFront}
          />
        ))}
      </div>
      <WordBoardNote vocabulary={vocabulary} onAddWord={onAddWord} onOpenWord={onOpenWord} />
      <div className="character-strip">
        <div className="character-scroll">
          {characters.map((character) => (
            <CharacterCard key={character.id} character={character} onOpen={onOpenCharacter} />
          ))}
          <button onClick={onAddCharacter} className="add-character-button" type="button">
            <Plus className="h-3.5 w-3.5" />추가
          </button>
        </div>
      </div>
    </main>
  );
}

function NoteCard({ boardRef, sentence, sentenceIndex, vocabulary, onMove, onOpen, zIndex, onFocus }) {
  const dragControls = useDragControls();
  const words = findVocabularyForSentence(sentence, vocabulary);

  function finishDrag(info) {
    const boardRect = boardRef.current?.getBoundingClientRect();
    if (!boardRect) return;

    const x = ((info.point.x - boardRect.left) / boardRect.width) * 100;
    const y = ((info.point.y - boardRect.top) / boardRect.height) * 100;
    onMove(sentence.id, x, y);
  }

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ rotate: -0.5 }}
      whileDrag={{ scale: 1.03, rotate: 1 }}
      onDragEnd={(event, info) => {
        event.stopPropagation();
        finishDrag(info);
      }}
      onPointerDown={() => onFocus(sentence.id)}
      className="note-card"
      style={{ left: `${sentence.x}%`, top: `${sentence.y}%`, zIndex }}
    >
      <button
        onPointerDown={(event) => {
          event.stopPropagation();
          onFocus(sentence.id);
          dragControls.start(event);
        }}
        className="drag-handle"
        title="노트 이동"
        type="button"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <button onClick={() => onOpen(sentence)} className="note-body-button" type="button">
        <div className="note-meta">
          <Pin className="h-4 w-4" />
          {getSentenceChapter(sentence, sentenceIndex)}
        </div>
        <h3 className="note-title">{getSentenceTitle(sentence)}</h3>
        <p className="note-summary">{getSentenceSummary(sentence)}</p>
        <div className="note-words">
          {words.slice(0, 3).map((entry) => (
            <span key={entry.id} className="tag">
              {entry.word}: {entry.meaning}
            </span>
          ))}
        </div>
      </button>
    </motion.div>
  );
}

function WordBoardNote({ vocabulary, onAddWord, onOpenWord }) {
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.96, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="word-panel"
    >
      <div className="word-panel-header">
        <div className="word-title-wrap">
          <Pin className="h-4 w-4 text-stone-500" />
          <h3 className="word-title">영단어</h3>
          <span className="count-badge">{vocabulary.length}개</span>
        </div>
        <button onClick={onAddWord} className="small-button" title="추가" type="button">
          <Plus className="h-3.5 w-3.5" />추가
        </button>
      </div>

      <div className="word-list">
        {vocabulary.length === 0 ? (
          <p className="empty-word-list">저장한 단어가 없습니다.</p>
        ) : (
          vocabulary.map((entry) => (
            <button
              key={entry.id}
              onClick={() => onOpenWord(entry)}
              className="word-item"
              type="button"
            >
              <div className="word-row">
                <span className="word-en">{entry.word}</span>
                <span className="word-ko">{entry.meaning}</span>
              </div>
            </button>
          ))
        )}
      </div>
    </motion.section>
  );
}

function CharacterCard({ character, onOpen }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={() => onOpen(character)}
      className="character-card"
      type="button"
    >
      <div className="character-inner">
        <div className="avatar">
          <UserRound className="h-5 w-5" />
        </div>
        <div className="character-info">
          <p className="character-name">{character.name}</p>
          <p className="character-role">{character.description || "인물 메모"}</p>
        </div>
      </div>
    </motion.button>
  );
}

function SentenceBoardModal({ sentence, vocabulary, onClose, onDeleteSentence, onSaveSentence }) {
  const [draft, setDraft] = useState(createSentenceDraft(sentence));
  const [showKorean, setShowKorean] = useState(true);
  const isEdit = Boolean(sentence);

  function updateDraft(field, value) {
    setDraft((previousDraft) => ({ ...previousDraft, [field]: value }));
  }

  function saveDraft() {
    const original = draft.original.trim();
    if (!original) return;

    onSaveSentence({
      ...draft,
      original,
      title: draft.title.trim(),
      chapter: draft.chapter.trim(),
      meaning: draft.meaning.trim(),
      mySentence: draft.mySentence.trim(),
    });
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="overlay"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          className="modal"
        >
          <div className="modal-header">
            <div className="modal-title">
              <BookOpen className="h-5 w-5 text-amber-200/70" />노트
            </div>
            <div className="modal-actions">
              <button className="toggle-button" type="button" onClick={() => setShowKorean((previous) => !previous)}>
                <span>{showKorean ? "◑" : "◐"}</span>
                <span>{showKorean ? "한글 숨기기" : "한글 보기"}</span>
              </button>
              <button onClick={onClose} className="icon-button" type="button">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className={showKorean ? "note-editor" : "note-editor only-english"}>
            <section className="editor-section">
              <div className="field-label">
                <StickyNote className="h-4 w-4" />English
              </div>
              <textarea
                value={draft.original}
                onChange={(event) => updateDraft("original", event.target.value)}
                className="editor-textarea english-textarea"
                placeholder="게임에서 발견한 영어 문장을 적습니다."
              />
            </section>

            {showKorean ? (
              <section className="editor-section">
                <div className="field-label">
                  <Languages className="h-4 w-4" />한글 / 해석
                </div>
                <textarea
                  value={draft.meaning}
                  onChange={(event) => updateDraft("meaning", event.target.value)}
                  className="editor-textarea korean-textarea"
                  placeholder="번역, 해석 설명, 문맥 설명을 적습니다."
                />
              </section>
            ) : null}
          </div>

          <div className="linked-word-row">
            {findVocabularyForSentence(draft, vocabulary).map((entry) => (
              <span key={entry.id} className="tag">
                {entry.word}: {entry.meaning}
              </span>
            ))}
          </div>

          <div className="modal-footer">
            {isEdit ? (
              <button onClick={() => onDeleteSentence(sentence.id)} className="danger-button" type="button">
                삭제
              </button>
            ) : (
              <span />
            )}
            <div className="footer-right">
              <button onClick={onClose} className="secondary-button" type="button">
                취소
              </button>
              <button onClick={saveDraft} className="save-button" type="button">
                저장
              </button>
            </div>
            </div>
          </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function createSentenceDraft(sentence) {
  return {
    id: sentence?.id || "",
    title: sentence?.title || "",
    chapter: sentence?.chapter || "",
    original: sentence?.original || "",
    meaning: sentence?.meaning || "",
    mySentence: sentence?.mySentence || "",
    x: sentence?.x,
    y: sentence?.y,
    practiced: sentence?.practiced || false,
  };
}

function CharacterModal({ character, onClose, onDeleteCharacter, onSaveCharacter }) {
  const [draft, setDraft] = useState(createCharacterDraft(character));

  if (!character) return null;

  function updateDraft(field, value) {
    setDraft((previousDraft) => ({ ...previousDraft, [field]: value }));
  }

  function saveDraft() {
    const name = draft.name.trim();
    if (!name) return;

    onSaveCharacter({
      ...draft,
      name,
      description: draft.description.trim(),
    });
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed bottom-0 left-0 right-[400px] top-0 z-40 bg-black/70 p-6 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          className="flex h-full w-full flex-col overflow-hidden rounded-[2rem] border border-slate-700 bg-slate-950 text-stone-100 shadow-2xl"
        >
          <div className="flex items-start justify-between gap-4 border-b border-slate-800 p-5">
            <div className="flex items-center gap-5">
              <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-3xl border border-slate-700 bg-slate-800 text-slate-400">
                <UserRound className="h-12 w-12" />
              </div>
              <div>
                <p className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-sky-200/70">
                  <UserRound className="h-4 w-4" />Character
                </p>
                <h2 className="text-3xl font-black tracking-tight">{character.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{character.description || "등장인물"}</p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-2xl border border-slate-800 bg-slate-900 p-3 hover:bg-slate-800" type="button">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-[1fr_320px] overflow-hidden">
            <div className="grid content-start gap-4 overflow-y-auto p-6">
              <label className="grid gap-1.5 rounded-3xl border border-slate-800 bg-slate-900 p-5">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">이름</span>
                <input className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm font-bold outline-none focus:border-slate-500" value={draft.name} onChange={(event) => updateDraft("name", event.target.value)} />
              </label>
              <label className="grid gap-1.5 rounded-3xl border border-slate-800 bg-slate-900 p-5">
                <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500">
                  <BookOpen className="h-4 w-4" />Character Note
                </span>
                <textarea className="h-48 resize-none rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-lg leading-8 outline-none focus:border-slate-500" value={draft.description} onChange={(event) => updateDraft("description", event.target.value)} />
              </label>
            </div>

            <aside className="overflow-y-auto border-l border-slate-800 bg-slate-950 p-4">
              <div className="mb-4 grid aspect-square place-items-center rounded-3xl border border-slate-800 bg-slate-900 text-slate-500">
                <UserRound className="h-16 w-16" />
              </div>
              <div className="mb-3 text-xs font-black uppercase tracking-wider text-slate-500">Actions</div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={saveDraft} className="rounded-2xl border border-slate-800 bg-slate-900 px-3 py-3 text-sm font-bold text-slate-300 hover:bg-slate-800" type="button">
                  저장
                </button>
                <button onClick={() => onDeleteCharacter(character.id)} className="rounded-2xl border border-red-950/60 bg-red-950/30 px-3 py-3 text-sm font-bold text-red-300 hover:bg-red-950/50" type="button">
                  삭제
                </button>
              </div>
            </aside>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function createCharacterDraft(character) {
  return {
    id: character?.id || "",
    name: character?.name || "",
    description: character?.description || "",
  };
}

function WordFormModal({ mode, word, onClose, onDeleteWord, onSaveWord }) {
  const [draft, setDraft] = useState(createWordDraft(word));
  const isEdit = mode === "edit";

  function updateDraft(field, value) {
    setDraft((previousDraft) => ({ ...previousDraft, [field]: value }));
  }

  function saveDraft() {
    const wordText = draft.word.trim();
    if (!wordText) return;

    onSaveWord({
      ...draft,
      word: wordText,
      meaning: draft.meaning.trim(),
    });
  }

  return (
    <AnimatePresence>
      <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/65 p-6 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            className="w-full max-w-md rounded-[2rem] border border-emerald-900/40 bg-emerald-50 p-5 text-stone-900 shadow-2xl"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="mb-1 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-800/60">
                  <Languages className="h-4 w-4" />Vocabulary
                </p>
                <h2 className="text-2xl font-black">{isEdit ? "영단어 수정" : "영단어 추가"}</h2>
              </div>
              <button onClick={onClose} className="rounded-2xl bg-black/10 p-3 hover:bg-black/15" type="button">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-black text-stone-500">영단어</span>
                <input
                  value={draft.word}
                  onChange={(event) => updateDraft("word", event.target.value)}
                  className="w-full rounded-2xl border border-emerald-900/20 bg-white/70 px-4 py-3 text-sm font-bold outline-none focus:border-emerald-700"
                  placeholder="example: discover"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-black text-stone-500">한글 뜻</span>
                <input
                  value={draft.meaning}
                  onChange={(event) => updateDraft("meaning", event.target.value)}
                  className="w-full rounded-2xl border border-emerald-900/20 bg-white/70 px-4 py-3 text-sm font-bold outline-none focus:border-emerald-700"
                  placeholder="example: 발견하다"
                />
              </label>
            </div>

            <div className="mt-5 flex items-center justify-between gap-2">
              {isEdit ? (
                <button onClick={() => onDeleteWord(word.id)} className="rounded-2xl border border-red-900/20 bg-red-100 px-4 py-3 text-sm font-black text-red-700 hover:bg-red-200" type="button">
                  삭제
                </button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <button onClick={onClose} className="rounded-2xl px-4 py-3 text-sm font-black text-stone-500 hover:bg-black/10" type="button">취소</button>
                <button onClick={saveDraft} className="rounded-2xl bg-stone-950 px-5 py-3 text-sm font-black text-white hover:bg-stone-800" type="button">
                  {isEdit ? "저장" : "추가"}
                </button>
              </div>
            </div>
          </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function createWordDraft(word) {
  return {
    id: word?.id || "",
    word: word?.word || "",
    meaning: word?.meaning || "",
  };
}

function AddCharacterModal({ onClose, onSaveCharacter }) {
  const [draft, setDraft] = useState(createCharacterDraft(null));

  function updateDraft(field, value) {
    setDraft((previousDraft) => ({ ...previousDraft, [field]: value }));
  }

  function saveDraft() {
    const name = draft.name.trim();
    if (!name) return;

    onSaveCharacter({
      name,
      description: draft.description.trim(),
    });
  }

  return (
    <AnimatePresence>
      <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-0 left-0 right-[400px] top-0 z-40 grid place-items-center bg-black/65 p-6 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            className="w-full max-w-3xl overflow-hidden rounded-[2rem] border border-slate-700 bg-slate-950 text-stone-100 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 p-5">
              <div>
                <p className="mb-1 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-sky-200/70">
                  <UserRound className="h-4 w-4" />Character
                </p>
                <h2 className="text-2xl font-black">등장인물 추가</h2>
              </div>
              <button onClick={onClose} className="rounded-2xl border border-slate-800 bg-slate-900 p-3 hover:bg-slate-800" type="button">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-[180px_1fr] gap-5 p-5">
              <div>
                <div className="grid h-36 w-36 place-items-center rounded-3xl border border-dashed border-slate-700 bg-slate-900 text-slate-500">
                  <UserRound className="h-14 w-14" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-black text-slate-500">이름</span>
                  <input className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-bold outline-none focus:border-slate-500" value={draft.name} onChange={(event) => updateDraft("name", event.target.value)} placeholder="Ethan Carter" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-black text-slate-500">인물 메모</span>
                  <textarea className="h-28 w-full resize-none rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-slate-500" value={draft.description} onChange={(event) => updateDraft("description", event.target.value)} placeholder="스토리에서 어떤 인물인지 적습니다." />
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-800 p-5">
              <button onClick={onClose} className="rounded-2xl px-4 py-3 text-sm font-black text-slate-500 hover:bg-slate-900" type="button">취소</button>
              <button onClick={saveDraft} className="rounded-2xl bg-stone-100 px-5 py-3 text-sm font-black text-stone-950 hover:bg-white" type="button">추가</button>
            </div>
          </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
