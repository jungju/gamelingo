import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

const OHMESH_BASE_URL = "https://ohmesh.okgo.click";
const OHMESH_APP_SLUG = "gamelingo";
const REGISTERED_REDIRECT_URL = "https://gamelingo.jjgo.io";
const EDITH_FINCH_RECORD_TYPE = "edith-finch-study-state";
const EDITH_FINCH_STORAGE_VERSION = 2;
const EDITH_FINCH_ID = "edith-finch";
const HOME_PATH = "/";
const EDITH_FINCH_COVER = "/edith-finch-cover.png";

const games = [
  {
    id: EDITH_FINCH_ID,
    path: "/games/edith-finch",
    title: "What Remains of Edith Finch",
    description: "대사를 내 문장으로 바꾸기",
    artwork: EDITH_FINCH_COVER,
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
    original: "I remember.",
    meaning: "나는 기억한다.",
    mySentence: "I remember my first day at work.",
    practiced: false,
  },
  {
    id: "sample-2",
    original: "I was afraid.",
    meaning: "나는 두려웠다.",
    mySentence: "I was nervous before the meeting.",
    practiced: false,
  },
  {
    id: "sample-3",
    original: "I couldn't explain it.",
    meaning: "나는 그것을 설명할 수 없었다.",
    mySentence: "I couldn't explain my idea clearly.",
    practiced: false,
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
  { id: "vocab-monster", word: "monster", meaning: "괴물" },
  { id: "vocab-nursery", word: "nursery", meaning: "아이 방, 유아실" },
  { id: "vocab-passage", word: "passage", meaning: "통로" },
  { id: "vocab-portrait", word: "portrait", meaning: "초상화" },
  { id: "vocab-remains", word: "remains", meaning: "남은 것, 유해" },
  { id: "vocab-room", word: "room", meaning: "방" },
  { id: "vocab-sailor", word: "sailor", meaning: "선원" },
  { id: "vocab-secret", word: "secret", meaning: "비밀" },
  { id: "vocab-shore", word: "shore", meaning: "해안, 바닷가" },
  { id: "vocab-story", word: "story", meaning: "이야기" },
  { id: "vocab-survive", word: "survive", meaning: "살아남다" },
  { id: "vocab-swing", word: "swing", meaning: "그네" },
  { id: "vocab-tower", word: "tower", meaning: "탑" },
  { id: "vocab-tree", word: "tree", meaning: "나무" },
  { id: "vocab-tunnel", word: "tunnel", meaning: "터널" },
  { id: "vocab-unlock", word: "unlock", meaning: "잠금을 풀다" },
  { id: "vocab-wedding", word: "wedding", meaning: "결혼식" },
  { id: "vocab-will", word: "will", meaning: "유언장" },
  { id: "vocab-window", word: "window", meaning: "창문" },
];

const edithFinchGuide = {
  title: "What Remains of Edith Finch 플레이 미션",
  description:
    "스토리를 즐기면서 마음에 남는 영어 문장을 모읍니다. 모든 문장을 공부하려고 하지 말고, 내가 실제로 써볼 수 있는 짧은 문장만 가져옵니다.",
  steps: [
    {
      title: "먼저 게임을 즐기기",
      bullets: [
        "처음부터 멈추지 말고 스토리를 진행합니다.",
        "모르는 문장이 나와도 괜찮습니다.",
        "게임 흐름을 놓치지 않는 게 먼저입니다.",
      ],
    },
    {
      title: "문장 사냥하기",
      bullets: [
        "플레이 중 짧고 마음에 드는 영어 문장을 발견하면 저장합니다.",
        "좋은 문장 기준은 짧다, 감정이 있다, 내 상황에 바꿔 쓸 수 있다, 소리 내서 말하기 쉽다입니다.",
      ],
    },
    {
      title: "단어와 장면 메모하기",
      bullets: [
        "자주 들리는 단어는 뜻과 함께 짧게 적습니다.",
        "스토리 메모에는 오늘 본 장면이나 인물 관계만 한두 줄 남깁니다.",
      ],
    },
    {
      title: "내 문장으로 바꾸기",
      bullets: ["게임 문장을 그대로 외우지 말고 내 상황에 맞게 바꿉니다."],
      example: {
        original: "I was afraid.",
        mine: "I was nervous before the meeting.",
      },
    },
    {
      title: "소리 내서 말하기",
      bullets: [
        "원문을 듣고 따라 말합니다.",
        "그다음 내 문장도 한 번 말합니다.",
        "완벽한 발음보다 입으로 말해보는 것이 중요합니다.",
      ],
    },
    {
      title: "익숙해지면 체크하기",
      bullets: ["문장을 보고 뜻을 알고, 내 문장으로 한 번 말할 수 있으면 연습 완료로 체크합니다."],
    },
    {
      title: "가볍게 반복하기",
      bullets: ["다음 플레이 전에 저장한 문장을 한두 개만 다시 듣고 말합니다."],
    },
  ],
  tips: [
    "게임을 멈추면서까지 공부하지 않아도 됩니다.",
    "한 번 플레이할 때 문장 3개면 충분합니다.",
    "많이 저장하는 것보다 저장한 문장을 내 말로 바꾸는 것이 더 중요합니다.",
    "긴 문장보다 내가 실제로 쓸 수 있는 짧은 문장이 좋습니다.",
    "단어와 스토리 메모는 완벽하게 정리하지 말고 다음에 기억날 만큼만 적습니다.",
    "목표는 모든 대사를 해석하는 것이 아니라 게임 속 문장을 내 영어로 바꾸는 것입니다.",
  ],
};

function createDefaultMissionChecks() {
  return missionItems.reduce((checks, item) => ({ ...checks, [item.id]: false }), {});
}

function createDefaultEdithFinchData() {
  return {
    wordMemo: "",
    vocabulary: createDefaultVocabularyEntries(),
    storyMemo: "",
    missionChecks: createDefaultMissionChecks(),
    sentences: sampleSentences,
  };
}

function createEmptySentenceForm() {
  return {
    original: "",
    meaning: "",
    mySentence: "",
  };
}

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `sentence-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createVocabularyId() {
  return `vocabulary-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createDefaultVocabularyEntries() {
  return defaultVocabularyEntries.map((entry) => ({ ...entry }));
}

function normalizeEdithFinchData(data) {
  const defaultData = createDefaultEdithFinchData();

  if (!data || typeof data !== "object") {
    return defaultData;
  }

  if (data.v === EDITH_FINCH_STORAGE_VERSION) {
    return normalizeCompactEdithFinchData(data);
  }

  const vocabulary = normalizeVocabularyEntries(data.vocabulary, data.wordMemo);

  return {
    wordMemo: typeof data.wordMemo === "string" ? data.wordMemo : defaultData.wordMemo,
    vocabulary: isLegacySampleVocabulary(vocabulary) ? defaultData.vocabulary : vocabulary,
    storyMemo: typeof data.storyMemo === "string" ? data.storyMemo : defaultData.storyMemo,
    missionChecks: normalizeMissionChecks(data.missionChecks),
    sentences: Array.isArray(data.sentences)
      ? data.sentences.map(normalizeSentence).filter(Boolean)
      : defaultData.sentences,
  };
}

function normalizeCompactEdithFinchData(data) {
  const defaultData = createDefaultEdithFinchData();

  return {
    wordMemo: typeof data.x === "string" ? data.x : defaultData.wordMemo,
    vocabulary: typeof data.w === "string" ? parseVocabularyText(data.w) : defaultData.vocabulary,
    storyMemo: typeof data.m === "string" ? data.m : defaultData.storyMemo,
    missionChecks: normalizeCompactMissionChecks(data.c),
    sentences: Array.isArray(data.s)
      ? data.s.map(normalizeCompactSentence).filter(Boolean)
      : defaultData.sentences,
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

function normalizeCompactSentence(sentence) {
  if (Array.isArray(sentence)) {
    return normalizeSentence({
      original: sentence[0],
      meaning: sentence[1] || "",
      mySentence: sentence[2] || "",
      practiced: Boolean(sentence[3]),
    });
  }

  return normalizeSentence(sentence);
}

function serializeEdithFinchData(data) {
  const normalizedData = normalizeEdithFinchData(data);
  const compactData = { v: EDITH_FINCH_STORAGE_VERSION };
  const missionMask = serializeMissionChecks(normalizedData.missionChecks);
  const vocabularyText = formatVocabularyText(normalizedData.vocabulary);
  const defaultVocabularyText = formatVocabularyText(createDefaultVocabularyEntries());

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

  if (!areSentencesEquivalent(normalizedData.sentences, sampleSentences)) {
    compactData.s = normalizedData.sentences.map(serializeSentence);
  }

  return compactData;
}

function serializeMissionChecks(missionChecks) {
  return missionItems.reduce((missionMask, item, index) => {
    return missionChecks?.[item.id] ? missionMask | (1 << index) : missionMask;
  }, 0);
}

function serializeSentence(sentence) {
  const compactSentence = [sentence.original];

  if (sentence.meaning || sentence.mySentence || sentence.practiced) {
    compactSentence.push(sentence.meaning);
  }

  if (sentence.mySentence || sentence.practiced) {
    compactSentence.push(sentence.mySentence);
  }

  if (sentence.practiced) {
    compactSentence.push(1);
  }

  return compactSentence;
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
      Boolean(sentence?.practiced) === Boolean(referenceSentence.practiced)
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
    return legacyWordMemo
      .split(/\r?\n|\/|,/)
      .map((memoLine) => memoLine.trim())
      .filter(Boolean)
      .map((memoLine) => {
        const [word, ...meaningParts] = memoLine.split(/\s+/);
        return normalizeVocabularyEntry({
          id: createVocabularyId(),
          word: word || memoLine,
          meaning: meaningParts.join(" "),
        });
      })
      .filter(Boolean);
  }

  return createDefaultVocabularyEntries();
}

function normalizeVocabularyEntry(entry) {
  if (!entry || typeof entry !== "object" || typeof entry.word !== "string") {
    return null;
  }

  const word = entry.word.trim();
  if (!word) {
    return null;
  }

  return {
    id: entry.id || createVocabularyId(),
    word,
    meaning: typeof entry.meaning === "string" ? entry.meaning : "",
    gameExample: typeof entry.gameExample === "string" ? entry.gameExample : "",
    myExample: typeof entry.myExample === "string" ? entry.myExample : "",
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
        gameExample: existingEntry?.gameExample || "",
        myExample: existingEntry?.myExample || "",
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

function normalizeSentence(sentence) {
  if (!sentence || typeof sentence !== "object" || typeof sentence.original !== "string") {
    return null;
  }

  return {
    id: sentence.id || createId(),
    original: sentence.original,
    meaning: typeof sentence.meaning === "string" ? sentence.meaning : "",
    mySentence: typeof sentence.mySentence === "string" ? sentence.mySentence : "",
    practiced: Boolean(sentence.practiced),
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
  if (syncState.status === "loading") return "불러오는 중";
  if (syncState.status === "saving") return "저장 중";
  if (syncState.status === "saved") return "저장됨";
  if (syncState.status === "error") return "저장 오류";
  return "대기";
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
  const [edithFinchData, setEdithFinchData] = useState(createDefaultEdithFinchData);
  const [storageRecord, setStorageRecord] = useState(null);
  const [syncState, setSyncState] = useState({ status: "idle", message: "" });
  const [isRemoteDataReady, setIsRemoteDataReady] = useState(false);
  const [storageReloadKey, setStorageReloadKey] = useState(0);
  const lastSavedDataJsonRef = useRef("");

  const clearRemoteData = useCallback(() => {
    setStorageRecord(null);
    setIsRemoteDataReady(false);
    setSyncState({ status: "idle", message: "" });
    setEdithFinchData(createDefaultEdithFinchData());
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
        const listResponse = await ohmeshFetch(
          `/api/apps/${OHMESH_APP_SLUG}/records?type=${encodeURIComponent(EDITH_FINCH_RECORD_TYPE)}&limit=100&offset=0`
        );

        if (shouldIgnore || handleSessionProblem(listResponse)) return;

        if (!listResponse.ok) {
          throw new Error(await getResponseErrorMessage(listResponse, "노트를 불러오지 못했습니다."));
        }

        const recordList = await readResponseJson(listResponse);
        let activeRecord = selectLatestRecord(Array.isArray(recordList?.records) ? recordList.records : []);

        if (activeRecord) {
          const recordResponse = await ohmeshFetch(`/api/apps/${OHMESH_APP_SLUG}/records/${activeRecord.id}`);

          if (shouldIgnore || handleSessionProblem(recordResponse)) return;

          if (!recordResponse.ok) {
            throw new Error(await getResponseErrorMessage(recordResponse, "노트를 읽지 못했습니다."));
          }

          activeRecord = await readResponseJson(recordResponse);
        } else {
          const defaultData = createDefaultEdithFinchData();
          const createResponse = await ohmeshFetch(`/api/apps/${OHMESH_APP_SLUG}/records`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: EDITH_FINCH_RECORD_TYPE,
              data: serializeEdithFinchData(defaultData),
            }),
          });

          if (shouldIgnore || handleSessionProblem(createResponse)) return;

          if (!createResponse.ok) {
            throw new Error(await getResponseErrorMessage(createResponse, "노트를 만들지 못했습니다."));
          }

          activeRecord = await readResponseJson(createResponse);
        }

        const normalizedData = normalizeEdithFinchData(activeRecord?.data);
        const compactData = serializeEdithFinchData(normalizedData);
        const compactDataJson = JSON.stringify(compactData);

        if (JSON.stringify(activeRecord?.data) !== compactDataJson) {
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

        lastSavedDataJsonRef.current = compactDataJson;

        if (shouldIgnore) return;

        setStorageRecord(activeRecord);
        setEdithFinchData(normalizedData);
        setIsRemoteDataReady(true);
        setSyncState({ status: "saved", message: "ohmesh에 저장되어 있습니다." });
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

    const compactData = serializeEdithFinchData(edithFinchData);
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
  }, [authState.status, edithFinchData, handleSessionProblem, isRemoteDataReady, storageRecord?.id]);

  const selectedGameInfo = games.find((game) => game.path === routePath);

  function navigateTo(path) {
    const routePath = normalizeRoutePath(path);
    window.history.pushState({}, "", routePath);
    setRoutePath(routePath);
  }

  function login() {
    window.location.assign(createOhmeshRedirectUrl("/login"));
  }

  function logout() {
    window.location.assign(createOhmeshRedirectUrl("/logout"));
  }

  function retryStorageLoad() {
    setStorageReloadKey((previousKey) => previousKey + 1);
  }

  if (authState.status === "checking") {
    return (
      <div className="app-shell home-shell">
        <AuthStatePage title="로그인 확인 중" description={authState.message} />
      </div>
    );
  }

  if (authState.status === "signed-out") {
    return (
      <div className="app-shell home-shell">
        <AuthStatePage
          title="Gamelingo 로그인"
          description={authState.message}
          primaryAction="ohmesh로 로그인"
          onPrimaryAction={login}
        />
      </div>
    );
  }

  if (authState.status === "wrong-app") {
    return (
      <div className="app-shell home-shell">
        <AuthStatePage
          title="앱 세션 확인 필요"
          description={authState.message}
          primaryAction="로그아웃"
          onPrimaryAction={logout}
          secondaryAction="다시 확인"
          onSecondaryAction={checkAuth}
        />
      </div>
    );
  }

  if (authState.status === "error") {
    return (
      <div className="app-shell home-shell">
        <AuthStatePage
          title="로그인 상태를 확인하지 못했습니다"
          description={authState.message}
          primaryAction="다시 확인"
          onPrimaryAction={checkAuth}
          secondaryAction="ohmesh로 로그인"
          onSecondaryAction={login}
        />
      </div>
    );
  }

  if (!isRemoteDataReady) {
    return (
      <div className="app-shell home-shell">
        <AuthStatePage
          title={syncState.status === "error" ? "노트를 불러오지 못했습니다" : "노트를 불러오는 중"}
          description={syncState.message || "ohmesh에서 내 문장 노트를 준비하고 있습니다."}
          primaryAction={syncState.status === "error" ? "다시 시도" : undefined}
          onPrimaryAction={syncState.status === "error" ? retryStorageLoad : undefined}
          secondaryAction="로그아웃"
          onSecondaryAction={logout}
        />
      </div>
    );
  }

  return (
    <div className={`app-shell ${selectedGameInfo ? "study-shell" : "home-shell"}`}>
      {selectedGameInfo ? (
        <main className="main-content">
          {selectedGameInfo.id === EDITH_FINCH_ID ? (
            <EdithFinchPage
              data={edithFinchData}
              setData={setEdithFinchData}
              syncState={syncState}
              user={authState.user}
              onGoHome={() => navigateTo(HOME_PATH)}
              onLogout={logout}
            />
          ) : (
            <ComingSoonPage game={selectedGameInfo} onGoHome={() => navigateTo(HOME_PATH)} />
          )}
        </main>
      ) : (
        <HomePage
          games={games}
          syncState={syncState}
          user={authState.user}
          onLogout={logout}
          onSelectGame={(game) => navigateTo(game.path)}
        />
      )}
    </div>
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
    <main className="auth-page">
      <section className="panel auth-card">
        <div>
          <p className="brand-label">Gamelingo</p>
          <p className="brand-text">ohmesh 계정으로 문장 노트를 저장합니다.</p>
        </div>

        <div>
          <p className="eyebrow">ohmesh</p>
          <h1>{title}</h1>
          {description ? <p className="page-description">{description}</p> : null}
        </div>

        {primaryAction || secondaryAction ? (
          <div className="auth-actions">
            {primaryAction ? (
              <button className="button primary" type="button" onClick={onPrimaryAction}>
                {primaryAction}
              </button>
            ) : null}
            {secondaryAction ? (
              <button className="button secondary" type="button" onClick={onSecondaryAction}>
                {secondaryAction}
              </button>
            ) : null}
          </div>
        ) : null}
      </section>
    </main>
  );
}

function HomePage({ games, syncState, user, onLogout, onSelectGame }) {
  return (
    <main className="home-page">
      <header className="home-header">
        <div className="brand home-brand">
          <p className="brand-label">Gamelingo</p>
          <p className="brand-text">게임별 영어 문장 노트</p>
          <AccountSummary syncState={syncState} user={user} onLogout={onLogout} />
        </div>
        <div>
          <p className="eyebrow">게임 선택</p>
          <h1>오늘 공부할 게임을 고르세요</h1>
          <p className="page-description">공부 화면에서는 선택한 게임의 문장 노트에만 집중합니다.</p>
        </div>
      </header>

      <section className="home-game-grid" aria-label="게임 선택">
        {games.map((game) => (
          <a
            key={game.id}
            href={game.path}
            className="home-game-button"
            onClick={(event) => {
              if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
              event.preventDefault();
              onSelectGame(game);
            }}
          >
            <img className="game-card-art" src={game.artwork} alt="" />
            <span className="game-title">{game.title}</span>
            <span className="game-description">{game.description}</span>
            <span className="game-action">공부 시작</span>
          </a>
        ))}
      </section>
    </main>
  );
}

function AccountSummary({ syncState, user, onLogout }) {
  return (
    <div className="account-summary">
      <div>
        <p className="account-name">{getUserDisplayName(user)}</p>
        <SyncStatusBadge syncState={syncState} />
      </div>
      <button className="button small secondary" type="button" onClick={onLogout}>
        로그아웃
      </button>
    </div>
  );
}

function SyncStatusBadge({ syncState }) {
  return (
    <span className={`sync-badge ${syncState.status}`} title={syncState.message}>
      {getSyncStatusLabel(syncState)}
    </span>
  );
}

function EdithFinchPage({ data, setData, syncState, user, onGoHome, onLogout }) {
  const [searchText, setSearchText] = useState("");
  const [editingSentenceId, setEditingSentenceId] = useState(null);
  const [sentenceForm, setSentenceForm] = useState(createEmptySentenceForm());
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isFamilyTreeOpen, setIsFamilyTreeOpen] = useState(false);
  const [isStoryDrawerOpen, setIsStoryDrawerOpen] = useState(false);
  const [isVocabularyDrawerOpen, setIsVocabularyDrawerOpen] = useState(false);

  const sentenceCount = data.sentences.length;
  const vocabularyCount = data.vocabulary.length;
  const mySentenceCount = data.sentences.filter((sentence) => sentence.mySentence.trim()).length;
  const practicedSentenceCount = data.sentences.filter((sentence) => sentence.practiced).length;
  const progressScore = sentenceCount + vocabularyCount + mySentenceCount + practicedSentenceCount;
  const studyStats = [
    {
      label: "저장 문장",
      value: sentenceCount,
      description: "게임에서 발견해 저장한 영어 원문 문장입니다.",
    },
    {
      label: "단어",
      value: vocabularyCount,
      description: "알아두어야 할 단어 목록에 남긴 항목입니다.",
    },
    {
      label: "내 문장",
      value: mySentenceCount,
      description: "게임 문장을 내 상황에 맞게 바꿔 쓴 문장입니다.",
    },
    {
      label: "연습 완료",
      value: practicedSentenceCount,
      description: "뜻을 알고 소리 내서 연습했다고 체크한 문장입니다.",
    },
    {
      label: "진행 점수",
      value: `${progressScore}점`,
      description: "저장 문장, 단어, 내 문장, 연습 완료를 합친 간단한 진행 지표입니다.",
    },
  ];

  const filteredSentences = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return data.sentences.filter((sentence) => {
      return (
        !keyword ||
        sentence.original.toLowerCase().includes(keyword) ||
        sentence.meaning.toLowerCase().includes(keyword) ||
        sentence.mySentence.toLowerCase().includes(keyword)
      );
    });
  }, [data.sentences, searchText]);

  function toggleMissionCheck(missionId) {
    setData((previousData) => ({
      ...previousData,
      missionChecks: {
        ...createDefaultMissionChecks(),
        ...previousData.missionChecks,
        [missionId]: !previousData.missionChecks?.[missionId],
      },
    }));
  }

  function updateStudyMemo(field, value) {
    setData((previousData) => ({
      ...previousData,
      [field]: value,
    }));
  }

  function updateVocabularyFromText(vocabularyText) {
    setData((previousData) => ({
      ...previousData,
      vocabulary: parseVocabularyText(vocabularyText, previousData.vocabulary),
    }));
  }

  function updateSentenceForm(field, value) {
    setSentenceForm((previousForm) => ({
      ...previousForm,
      [field]: value,
    }));
  }

  function resetSentenceForm() {
    setSentenceForm(createEmptySentenceForm());
    setEditingSentenceId(null);
  }

  function saveSentence(event) {
    event.preventDefault();

    const original = sentenceForm.original.trim();
    if (!original) return;

    if (editingSentenceId) {
      setData((previousData) => ({
        ...previousData,
        sentences: previousData.sentences.map((sentence) =>
          sentence.id === editingSentenceId
            ? {
                ...sentence,
                original,
                meaning: sentenceForm.meaning.trim(),
                mySentence: sentenceForm.mySentence.trim(),
              }
            : sentence
        ),
      }));
    } else {
      const newSentence = {
        id: createId(),
        original,
        meaning: sentenceForm.meaning.trim(),
        mySentence: sentenceForm.mySentence.trim(),
        practiced: false,
      };

      setData((previousData) => ({
        ...previousData,
        sentences: [newSentence, ...previousData.sentences],
      }));
    }

    resetSentenceForm();
  }

  function editSentence(sentence) {
    setEditingSentenceId(sentence.id);
    setSentenceForm({
      original: sentence.original,
      meaning: sentence.meaning,
      mySentence: sentence.mySentence,
    });
  }

  function deleteSentence(sentenceId) {
    setData((previousData) => ({
      ...previousData,
      sentences: previousData.sentences.filter((sentence) => sentence.id !== sentenceId),
    }));
  }

  function toggleSentencePracticed(sentenceId) {
    setData((previousData) => ({
      ...previousData,
      sentences: previousData.sentences.map((sentence) =>
        sentence.id === sentenceId ? { ...sentence, practiced: !sentence.practiced } : sentence
      ),
    }));
  }

  function speakEnglish(text) {
    if (!text || typeof window === "undefined" || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  }

  function resetEdithFinchData() {
    const confirmed = window.confirm("What Remains of Edith Finch 플레이 노트를 초기화할까요?");
    if (!confirmed) return;

    const defaultData = createDefaultEdithFinchData();
    setData(defaultData);
    setSearchText("");
    setEditingSentenceId(null);
    setSentenceForm(createEmptySentenceForm());
  }

  return (
    <div className="page-stack study-page">
      <header className="page-header">
        <div className="study-title">
          <img className="study-game-art" src={EDITH_FINCH_COVER} alt="" />
          <div className="study-title-copy">
            <p className="eyebrow">공부 중 · {getUserDisplayName(user)}</p>
            <h1>What Remains of Edith Finch</h1>
          </div>
        </div>
        <div className="page-header-side">
          <SyncStatusBadge syncState={syncState} />
          <button className="button icon-button secondary" type="button" onClick={onGoHome} aria-label="홈" title="홈">
            ⌂
          </button>
          <button
            className="button icon-button secondary"
            type="button"
            onClick={() => setIsGuideOpen(true)}
            aria-label="플레이 미션 보기"
            title="플레이 미션 보기"
          >
            ☑
          </button>
          <button
            className="button icon-button secondary"
            type="button"
            onClick={() => setIsStatsOpen(true)}
            aria-label="통계 보기"
            title="통계 보기"
          >
            ▦
          </button>
          <button
            className="button icon-button secondary"
            type="button"
            onClick={() => setIsStoryDrawerOpen(true)}
            aria-label="스토리 메모"
            aria-expanded={isStoryDrawerOpen}
            aria-controls="story-memo-drawer"
            title="스토리 메모"
          >
            ✎
          </button>
          <button className="button small secondary" type="button" onClick={onLogout}>
            로그아웃
          </button>
        </div>
      </header>

      {syncState.status === "error" ? (
        <section className="panel notice-panel error">
          <p>{syncState.message || "ohmesh 저장에 실패했습니다. 다시 수정하면 저장을 재시도합니다."}</p>
        </section>
      ) : null}

      <VocabularyPanel
        vocabulary={data.vocabulary}
        onOpenEditor={() => setIsVocabularyDrawerOpen(true)}
      />

      <section className="study-layout">
        <div className="study-main">
          <SentenceForm
            form={sentenceForm}
            editingSentenceId={editingSentenceId}
            onCancelEdit={resetSentenceForm}
            onSaveSentence={saveSentence}
            onUpdateForm={updateSentenceForm}
          />

          <div className="study-main-grid">
            <div className="left-column">
              <MissionPanel missionChecks={data.missionChecks} onToggleMission={toggleMissionCheck} />
            </div>

            <div className="right-column">
              <SentenceList
                filteredSentences={filteredSentences}
                searchText={searchText}
                onDeleteSentence={deleteSentence}
                onEditSentence={editSentence}
                onSearchTextChange={setSearchText}
                onSpeakEnglish={speakEnglish}
                onTogglePracticed={toggleSentencePracticed}
                onResetData={resetEdithFinchData}
              />
            </div>
          </div>
        </div>
      </section>

      <GuideModal guide={edithFinchGuide} isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      <StatsModal stats={studyStats} isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} />
      <StoryMemoDrawer
        storyMemo={data.storyMemo}
        isOpen={isStoryDrawerOpen}
        onClose={() => setIsStoryDrawerOpen(false)}
        onUpdateMemo={updateStudyMemo}
      />
      {isVocabularyDrawerOpen ? (
        <VocabularyEditorDrawer
          vocabulary={data.vocabulary}
          onClose={() => setIsVocabularyDrawerOpen(false)}
          onSaveVocabulary={updateVocabularyFromText}
        />
      ) : null}
      <FamilyTreeReference isOpen={isFamilyTreeOpen} onClose={() => setIsFamilyTreeOpen(false)} onOpen={() => setIsFamilyTreeOpen(true)} />
    </div>
  );
}

function FamilyTreeReference({ isOpen, onClose, onOpen }) {
  const [hasImage, setHasImage] = useState(true);
  const imageSrc = "/edith-finch-family-tree.png";

  useEffect(() => {
    if (!isOpen) return undefined;

    function closeWithEscape(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", closeWithEscape);
    return () => window.removeEventListener("keydown", closeWithEscape);
  }, [isOpen, onClose]);

  function renderReferenceImage(className) {
    if (!hasImage) {
      return (
        <div className={`${className} family-tree-missing`} role="img" aria-label="Finch 가족 트리 이미지 없음">
          <span>캡처 이미지 필요</span>
        </div>
      );
    }

    return (
      <img
        className={className}
        src={imageSrc}
        alt="The Finches family tree"
        onError={() => setHasImage(false)}
      />
    );
  }

  return (
    <>
      <button className="family-tree-float" type="button" onClick={onOpen} aria-label="Finch 가족 트리 크게 보기">
        {renderReferenceImage("family-tree-thumb")}
        <span>The Finches</span>
      </button>

      {isOpen ? (
        <div className="reference-backdrop" role="presentation" onClick={onClose}>
          <section
            className="reference-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="family-tree-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="reference-header">
              <div>
                <p className="eyebrow">참고 이미지</p>
                <h2 id="family-tree-title">The Finches</h2>
              </div>
              <button className="button small secondary" type="button" onClick={onClose}>
                닫기
              </button>
            </div>
            <div className="reference-image-wrap">{renderReferenceImage("family-tree-large")}</div>
          </section>
        </div>
      ) : null}
    </>
  );
}

function VocabularyPanel({ vocabulary, onOpenEditor }) {
  return (
    <section className="panel word-panel">
      <div className="word-panel-heading">
        <div>
          <h2>알아두어야 할 단어</h2>
        </div>
        <span className="small-badge">{vocabulary.length}개</span>
      </div>

      <div className="word-panel-content">
        <button className="button small secondary word-edit-button" type="button" onClick={onOpenEditor}>
          단어 수정
        </button>

        <div className="word-entry-list" aria-label="단어장">
          {vocabulary.length === 0 ? (
            <p className="empty-message">아직 저장한 단어가 없습니다.</p>
          ) : (
            vocabulary.map((entry) => <VocabularyEntry key={entry.id} entry={entry} />)
          )}
        </div>
      </div>
    </section>
  );
}

function VocabularyEntry({ entry }) {
  return (
    <p className="word-entry">
      <strong>{entry.word}:</strong> {entry.meaning}
    </p>
  );
}

function VocabularyEditorDrawer({ vocabulary, onClose, onSaveVocabulary }) {
  const [draftText, setDraftText] = useState(() => formatVocabularyText(vocabulary));

  useEffect(() => {
    function closeWithEscape(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", closeWithEscape);
    return () => window.removeEventListener("keydown", closeWithEscape);
  }, [onClose]);

  function saveVocabularyText(event) {
    event.preventDefault();
    onSaveVocabulary(draftText);
    onClose();
  }

  function resetVocabularyText() {
    setDraftText(formatVocabularyText(createDefaultVocabularyEntries()));
  }

  return (
    <div className="story-drawer-layer" role="presentation" onClick={onClose}>
      <aside
        className="story-drawer-panel"
        id="vocabulary-editor-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="vocabulary-editor-title"
        onClick={(event) => event.stopPropagation()}
      >
        <form className="drawer-form" onSubmit={saveVocabularyText}>
          <div className="panel-heading">
            <div>
              <h2 id="vocabulary-editor-title">단어 수정</h2>
            </div>
            <button className="button small secondary" type="button" onClick={onClose}>
              닫기
            </button>
          </div>

          <textarea
            value={draftText}
            onChange={(event) => setDraftText(event.target.value)}
            aria-label="단어 수정"
            placeholder={"remember: 기억하다\nafraid: 두려운"}
          />

          <div className="button-row">
            <button className="button secondary" type="button" onClick={resetVocabularyText}>
              리셋
            </button>
            <button className="button primary" type="submit">
              저장
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}

function StoryMemoDrawer({ storyMemo, isOpen, onClose, onUpdateMemo }) {
  useEffect(() => {
    if (!isOpen) return undefined;

    function closeWithEscape(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", closeWithEscape);
    return () => window.removeEventListener("keydown", closeWithEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="story-drawer-layer" role="presentation" onClick={onClose}>
      <aside
        className="story-drawer-panel"
        id="story-memo-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="story-memo-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="panel-heading">
          <div>
            <h2 id="story-memo-title">스토리 메모</h2>
            <p>장면, 인물 관계, 다음에 기억할 내용을 적습니다.</p>
          </div>
          <button className="button small secondary" type="button" onClick={onClose}>
            닫기
          </button>
        </div>

        <textarea
          value={storyMemo}
          onChange={(event) => onUpdateMemo("storyMemo", event.target.value)}
          aria-label="스토리 메모"
          placeholder="오늘 본 장면, 인물 관계, 다음에 기억할 내용"
        />
      </aside>
    </div>
  );
}

function MissionPanel({ missionChecks, onToggleMission }) {
  const completedMissionCount = missionItems.filter((item) => missionChecks?.[item.id]).length;

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>이번 플레이 미션</h2>
          <p>게임 흐름을 지키면서 가볍게 챙길 목표입니다.</p>
        </div>
        <span className="small-badge">
          {completedMissionCount}/{missionItems.length}
        </span>
      </div>

      <div className="mission-list">
        {missionItems.map((item) => (
          <label key={item.id} className="mission-check">
            <input
              type="checkbox"
              checked={Boolean(missionChecks?.[item.id])}
              onChange={() => onToggleMission(item.id)}
            />
            <span>{item.label}</span>
          </label>
        ))}
      </div>
    </section>
  );
}

function SentenceForm({ form, editingSentenceId, onCancelEdit, onSaveSentence, onUpdateForm }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>{editingSentenceId ? "문장 수정" : "문장 추가"}</h2>
          <p>원문만 저장해도 충분합니다. 나머지는 나중에 채워도 됩니다.</p>
        </div>
      </div>

      <form className="sentence-form" onSubmit={onSaveSentence}>
        <label className="field full-width">
          <span>게임 원문 영어 문장</span>
          <input
            value={form.original}
            onChange={(event) => onUpdateForm("original", event.target.value)}
            placeholder="I remember."
            required
          />
        </label>

        <label className="field full-width">
          <span>한국어 뜻</span>
          <textarea
            value={form.meaning}
            onChange={(event) => onUpdateForm("meaning", event.target.value)}
            placeholder="나는 기억한다."
            rows="3"
          />
        </label>

        <label className="field full-width">
          <span>내 문장</span>
          <textarea
            value={form.mySentence}
            onChange={(event) => onUpdateForm("mySentence", event.target.value)}
            placeholder="나중에 내 상황에 맞게 바꿔 적기"
            rows="3"
          />
        </label>

        <div className="button-row">
          {editingSentenceId ? (
            <button className="button secondary" type="button" onClick={onCancelEdit}>
              취소
            </button>
          ) : null}
          <button className="button primary" type="submit">
            {editingSentenceId ? "수정 저장" : "문장 추가"}
          </button>
        </div>
      </form>
    </section>
  );
}

function SentenceList({
  filteredSentences,
  searchText,
  onDeleteSentence,
  onEditSentence,
  onSearchTextChange,
  onSpeakEnglish,
  onTogglePracticed,
  onResetData,
}) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>영어 문장 노트</h2>
        </div>
        <div className="list-tools">
          <input
            className="search-input"
            value={searchText}
            onChange={(event) => onSearchTextChange(event.target.value)}
            aria-label="문장 검색"
            placeholder="원문, 뜻, 내 문장"
          />
          <button className="button small danger" type="button" onClick={onResetData}>
            초기화
          </button>
        </div>
      </div>

      <div className="sentence-list">
        {filteredSentences.length === 0 ? (
          <p className="empty-message">조건에 맞는 문장이 없습니다.</p>
        ) : (
          filteredSentences.map((sentence) => (
            <SentenceCard
              key={sentence.id}
              sentence={sentence}
              onDeleteSentence={onDeleteSentence}
              onEditSentence={onEditSentence}
              onSpeakEnglish={onSpeakEnglish}
              onTogglePracticed={onTogglePracticed}
            />
          ))
        )}
      </div>
    </section>
  );
}

function SentenceCard({
  sentence,
  onDeleteSentence,
  onEditSentence,
  onSpeakEnglish,
  onTogglePracticed,
}) {
  return (
    <article className={`sentence-card ${sentence.practiced ? "done" : ""}`}>
      <div className="sentence-top">
        <div>
          <h3>{sentence.original}</h3>
          {sentence.meaning ? <p className="meaning">{sentence.meaning}</p> : null}
        </div>

        <label className="practice-check">
          <input
            type="checkbox"
            checked={sentence.practiced}
            onChange={() => onTogglePracticed(sentence.id)}
          />
          <span>연습 완료</span>
        </label>
      </div>

      <div className="sentence-body">
        <div>
          <p className="card-label">내 문장</p>
          <p>{sentence.mySentence || "나중에 만들어도 괜찮음"}</p>
        </div>
      </div>

      <div className="card-actions">
        <button className="button small" type="button" onClick={() => onSpeakEnglish(sentence.original)}>
          원문 듣기
        </button>
        <button
          className="button small"
          type="button"
          onClick={() => onSpeakEnglish(sentence.mySentence)}
          disabled={!sentence.mySentence}
        >
          내 문장 듣기
        </button>
        <button className="button small secondary" type="button" onClick={() => onEditSentence(sentence)}>
          수정
        </button>
        <button className="button small danger" type="button" onClick={() => onDeleteSentence(sentence.id)}>
          삭제
        </button>
      </div>
    </article>
  );
}

function StatsModal({ stats, isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return undefined;

    function closeWithEscape(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", closeWithEscape);
    return () => window.removeEventListener("keydown", closeWithEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="modal-card stats-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="stats-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">공부 현황</p>
            <h2 id="stats-title">통계</h2>
          </div>
          <button className="button small secondary" type="button" onClick={onClose}>
            닫기
          </button>
        </div>

        <div className="stats-list">
          {stats.map((stat) => (
            <article key={stat.label} className="stat-row">
              <div>
                <h3>{stat.label}</h3>
                <p>{stat.description}</p>
              </div>
              <strong>{stat.value}</strong>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function GuideModal({ guide, isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return undefined;

    function closeWithEscape(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", closeWithEscape);
    return () => window.removeEventListener("keydown", closeWithEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">사용 방법</p>
            <h2 id="guide-title">{guide.title}</h2>
          </div>
          <button className="button small secondary" type="button" onClick={onClose}>
            닫기
          </button>
        </div>

        <p className="modal-description">{guide.description}</p>

        <div className="modal-section">
          <h3>진행 방식</h3>
          <ol className="guide-step-list">
            {guide.steps.map((step) => (
              <li key={step.title} className="guide-step">
                <h4>{step.title}</h4>
                <ul>
                  {step.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
                {step.example ? (
                  <div className="guide-example">
                    <p>
                      <span>게임 문장</span>
                      {step.example.original}
                    </p>
                    <p>
                      <span>내 문장</span>
                      {step.example.mine}
                    </p>
                  </div>
                ) : null}
              </li>
            ))}
          </ol>
        </div>

        <div className="modal-section">
          <h3>기억할 점</h3>
          <div className="tip-list">
            {guide.tips.map((tip) => (
              <p key={tip}>{tip}</p>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function ComingSoonPage({ game, onGoHome }) {
  return (
    <section className="panel">
      <button className="button small secondary" type="button" onClick={onGoHome}>
        홈
      </button>
      <h1>{game?.title || "선택한 게임"}</h1>
      <p className="page-description">아직 준비 중입니다.</p>
    </section>
  );
}
