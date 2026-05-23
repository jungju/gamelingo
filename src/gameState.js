import {
  APP_STORAGE_VERSION,
  defaultGames,
  defaultVocabularyEntries,
  EDITH_FINCH_ID,
  EDITH_FINCH_STORAGE_VERSION,
  missionItems,
  sampleSentences,
} from "./constants";

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

export function createDefaultGameNoteData(gameId) {
  return gameId === EDITH_FINCH_ID ? createDefaultEdithFinchData() : createEmptyGameNoteData();
}

export function createDefaultAppData(edithFinchData = createDefaultEdithFinchData()) {
  return {
    customGames: [],
    notesByGameId: {
      [EDITH_FINCH_ID]: normalizeGameNoteData(edithFinchData, EDITH_FINCH_ID),
    },
  };
}

export function createId(prefix = "item") {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createVocabularyId() {
  return createId("vocabulary");
}

export function createCharacterId() {
  return createId("character");
}

export function createGameId(title, existingIds = new Set()) {
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

export function normalizeAppData(data) {
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

export function normalizeEdithFinchData(data) {
  return normalizeGameNoteData(data, EDITH_FINCH_ID);
}

export function normalizeGameNoteData(data, gameId) {
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

export function serializeAppData(data) {
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

export function hasCustomAppData(data) {
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

export function normalizeVocabularyEntry(entry) {
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

export function normalizeSentence(sentence, index = 0) {
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

export function normalizeCharacter(character) {
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

export function createGameLibrary(customGames) {
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

export function getKnownGameIds(appData) {
  return new Set([...defaultGames.map((game) => game.id), ...appData.customGames.map((game) => game.id)]);
}

export function getGameCoverLabel(game) {
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

export function getGameAccentColor(gameId) {
  const colors = ["#38bdf8", "#f97316", "#84cc16", "#f43f5e", "#eab308", "#14b8a6"];
  const colorIndex = [...gameId].reduce((sum, character) => sum + character.charCodeAt(0), 0) % colors.length;
  return colors[colorIndex];
}

export function getDefaultBoardPosition(index) {
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

export function clampBoardPercent(value) {
  if (!Number.isFinite(value)) return 10;
  return Math.max(2, Math.min(76, Math.round(value * 10) / 10));
}

export function getSentenceTitle(sentence) {
  return sentence.title || sentence.original.split(/\s+/).slice(0, 5).join(" ");
}

export function getSentenceChapter(sentence, index) {
  return sentence.chapter || `Note ${index + 1}`;
}

export function getSentenceSummary(sentence) {
  return sentence.mySentence || sentence.meaning || sentence.original;
}

export function findVocabularyForSentence(sentence, vocabulary) {
  const sourceText = `${sentence.original} ${sentence.meaning} ${sentence.mySentence}`.toLowerCase();
  const matches = vocabulary.filter((entry) => sourceText.includes(entry.word.toLowerCase()));
  return (matches.length ? matches : vocabulary).slice(0, 4);
}
