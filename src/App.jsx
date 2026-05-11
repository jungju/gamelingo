import { useEffect, useMemo, useState } from "react";
import "./App.css";

const EDITH_FINCH_KEY = "gamelingo:v1:edithFinch";
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
  {
    id: "vocab-remember",
    word: "remember",
    meaning: "기억하다",
    gameExample: "I remember.",
    myExample: "I remember my first day at work.",
  },
  {
    id: "vocab-afraid",
    word: "afraid",
    meaning: "두려운",
    gameExample: "I was afraid.",
    myExample: "I was afraid to ask.",
  },
  {
    id: "vocab-explain",
    word: "explain",
    meaning: "설명하다",
    gameExample: "I couldn't explain it.",
    myExample: "I can explain my idea.",
  },
  {
    id: "vocab-remains",
    word: "remains",
    meaning: "남아 있는 것",
    gameExample: "What remains?",
    myExample: "Only the memory remains.",
  },
  {
    id: "vocab-family",
    word: "family",
    meaning: "가족",
    gameExample: "My family lived here.",
    myExample: "My family likes quiet weekends.",
  },
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

function createEmptyVocabularyForm() {
  return {
    word: "",
    meaning: "",
    gameExample: "",
    myExample: "",
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

function loadEdithFinchData() {
  try {
    const savedData = localStorage.getItem(EDITH_FINCH_KEY);
    if (!savedData) return createDefaultEdithFinchData();

    const parsedData = JSON.parse(savedData);
    return normalizeEdithFinchData(parsedData);
  } catch {
    return createDefaultEdithFinchData();
  }
}

function normalizeEdithFinchData(data) {
  const defaultData = createDefaultEdithFinchData();

  if (!data || typeof data !== "object") {
    return defaultData;
  }

  return {
    wordMemo: typeof data.wordMemo === "string" ? data.wordMemo : defaultData.wordMemo,
    vocabulary: normalizeVocabularyEntries(data.vocabulary, data.wordMemo),
    storyMemo: typeof data.storyMemo === "string" ? data.storyMemo : defaultData.storyMemo,
    missionChecks: normalizeMissionChecks(data.missionChecks),
    sentences: Array.isArray(data.sentences)
      ? data.sentences.map(normalizeSentence).filter(Boolean)
      : defaultData.sentences,
  };
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

export default function App() {
  const [routePath, setRoutePath] = useState(readRoutePath);
  const [edithFinchData, setEdithFinchData] = useState(loadEdithFinchData);

  useEffect(() => {
    function syncRoutePath() {
      setRoutePath(readRoutePath());
    }

    window.addEventListener("popstate", syncRoutePath);
    return () => window.removeEventListener("popstate", syncRoutePath);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(EDITH_FINCH_KEY, JSON.stringify(edithFinchData));
    } catch {
      // 저장 실패가 앱 전체 오류로 이어지지 않게 둔다.
    }
  }, [edithFinchData]);

  const selectedGameInfo = games.find((game) => game.path === routePath);

  function navigateTo(path) {
    const routePath = normalizeRoutePath(path);
    window.history.pushState({}, "", routePath);
    setRoutePath(routePath);
  }

  return (
    <div className={`app-shell ${selectedGameInfo ? "study-shell" : "home-shell"}`}>
      {selectedGameInfo ? (
        <main className="main-content">
          {selectedGameInfo.id === EDITH_FINCH_ID ? (
            <EdithFinchPage data={edithFinchData} setData={setEdithFinchData} onGoHome={() => navigateTo(HOME_PATH)} />
          ) : (
            <ComingSoonPage game={selectedGameInfo} onGoHome={() => navigateTo(HOME_PATH)} />
          )}
        </main>
      ) : (
        <HomePage games={games} onSelectGame={(game) => navigateTo(game.path)} />
      )}
    </div>
  );
}

function HomePage({ games, onSelectGame }) {
  return (
    <main className="home-page">
      <header className="home-header">
        <div className="brand home-brand">
          <p className="brand-label">Gamelingo</p>
          <p className="brand-text">게임별 영어 문장 노트</p>
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

function EdithFinchPage({ data, setData, onGoHome }) {
  const [searchText, setSearchText] = useState("");
  const [editingSentenceId, setEditingSentenceId] = useState(null);
  const [sentenceForm, setSentenceForm] = useState(createEmptySentenceForm());
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isFamilyTreeOpen, setIsFamilyTreeOpen] = useState(false);

  const sentenceCount = data.sentences.length;
  const vocabularyCount = data.vocabulary.length;
  const mySentenceCount = data.sentences.filter((sentence) => sentence.mySentence.trim()).length;
  const practicedSentenceCount = data.sentences.filter((sentence) => sentence.practiced).length;
  const progressScore = sentenceCount + vocabularyCount + mySentenceCount + practicedSentenceCount;

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

  function addVocabularyEntry(entry) {
    const nextEntry = normalizeVocabularyEntry({
      id: createVocabularyId(),
      ...entry,
    });

    if (!nextEntry) return;

    setData((previousData) => ({
      ...previousData,
      vocabulary: [nextEntry, ...previousData.vocabulary],
    }));
  }

  function updateVocabularyEntry(entryId, field, value) {
    setData((previousData) => ({
      ...previousData,
      vocabulary: previousData.vocabulary.map((entry) =>
        entry.id === entryId
          ? {
              ...entry,
              [field]: value,
            }
          : entry
      ),
    }));
  }

  function deleteVocabularyEntry(entryId) {
    setData((previousData) => ({
      ...previousData,
      vocabulary: previousData.vocabulary.filter((entry) => entry.id !== entryId),
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
          <div>
            <p className="eyebrow">공부 중</p>
            <h1>What Remains of Edith Finch</h1>
          </div>
        </div>
        <div className="page-header-side">
          <button className="button small secondary" type="button" onClick={onGoHome}>
            홈
          </button>
          <button className="button secondary guide-button" type="button" onClick={() => setIsGuideOpen(true)}>
            플레이 미션 보기
          </button>
          <div className="summary-grid">
            <SummaryCard label="저장 문장" value={sentenceCount} />
            <SummaryCard label="단어" value={vocabularyCount} />
            <SummaryCard label="내 문장" value={mySentenceCount} />
            <SummaryCard label="연습 완료" value={practicedSentenceCount} />
          </div>
          <div className="score-pill">
            진행 점수 <strong>{progressScore}</strong>점
          </div>
        </div>
      </header>

      <VocabularyPanel
        sentenceOptions={data.sentences}
        vocabulary={data.vocabulary}
        onAddVocabulary={addVocabularyEntry}
        onDeleteVocabulary={deleteVocabularyEntry}
        onUpdateVocabulary={updateVocabularyEntry}
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

        <div className="memo-column">
          <StoryMemoPanel storyMemo={data.storyMemo} onUpdateMemo={updateStudyMemo} />
        </div>
      </section>

      <GuideModal guide={edithFinchGuide} isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
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

function VocabularyPanel({
  sentenceOptions,
  vocabulary,
  onAddVocabulary,
  onDeleteVocabulary,
  onUpdateVocabulary,
}) {
  const [vocabularyForm, setVocabularyForm] = useState(createEmptyVocabularyForm());

  function updateVocabularyForm(field, value) {
    setVocabularyForm((previousForm) => ({
      ...previousForm,
      [field]: value,
    }));
  }

  function saveVocabularyEntry(event) {
    event.preventDefault();

    if (!vocabularyForm.word.trim()) return;

    onAddVocabulary({
      word: vocabularyForm.word.trim(),
      meaning: vocabularyForm.meaning.trim(),
      gameExample: vocabularyForm.gameExample.trim(),
      myExample: vocabularyForm.myExample.trim(),
    });
    setVocabularyForm(createEmptyVocabularyForm());
  }

  return (
    <section className="panel word-panel">
      <div className="word-panel-heading">
        <div>
          <h2>알아두어야 할 단어</h2>
        </div>
        <span className="small-badge">{vocabulary.length}개</span>
      </div>

      <div className="word-panel-content">
        <form className="word-form" onSubmit={saveVocabularyEntry}>
          <label className="word-field">
            <input
              value={vocabularyForm.word}
              onChange={(event) => updateVocabularyForm("word", event.target.value)}
              aria-label="단어"
              placeholder="단어"
              required
            />
          </label>

          <label className="word-field">
            <input
              value={vocabularyForm.meaning}
              onChange={(event) => updateVocabularyForm("meaning", event.target.value)}
              aria-label="뜻"
              placeholder="뜻"
            />
          </label>

          <button className="button primary word-add-button" type="submit">
            추가
          </button>

          <details className="word-extra-fields">
            <summary>예문</summary>
            <div className="word-extra-grid">
              <label className="word-field">
                <input
                  list="edith-finch-sentence-options"
                  value={vocabularyForm.gameExample}
                  onChange={(event) => updateVocabularyForm("gameExample", event.target.value)}
                  aria-label="게임 문장"
                  placeholder="게임 문장"
                />
              </label>

              <label className="word-field">
                <input
                  value={vocabularyForm.myExample}
                  onChange={(event) => updateVocabularyForm("myExample", event.target.value)}
                  aria-label="내 문장"
                  placeholder="내 문장"
                />
              </label>
            </div>
          </details>
        </form>

        <datalist id="edith-finch-sentence-options">
          {sentenceOptions.map((sentence) => (
            <option key={sentence.id} value={sentence.original} />
          ))}
        </datalist>

        <div className="word-entry-list" aria-label="단어장">
          {vocabulary.length === 0 ? (
            <p className="empty-message">아직 저장한 단어가 없습니다.</p>
          ) : (
            vocabulary.map((entry) => (
              <VocabularyEntry
                key={entry.id}
                entry={entry}
                onDeleteVocabulary={onDeleteVocabulary}
                onUpdateVocabulary={onUpdateVocabulary}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function VocabularyEntry({ entry, onDeleteVocabulary, onUpdateVocabulary }) {
  return (
    <article className="word-entry">
      <label className="word-field">
        <input
          value={entry.word}
          onChange={(event) => onUpdateVocabulary(entry.id, "word", event.target.value)}
          aria-label="단어"
          placeholder="단어"
        />
      </label>

      <label className="word-field">
        <input
          value={entry.meaning}
          onChange={(event) => onUpdateVocabulary(entry.id, "meaning", event.target.value)}
          aria-label={`${entry.word} 뜻`}
          placeholder="뜻"
        />
      </label>

      <button className="button small danger word-delete-button" type="button" onClick={() => onDeleteVocabulary(entry.id)}>
        삭제
      </button>

      <details className="word-extra-fields">
        <summary>예문</summary>
        <div className="word-extra-grid">
          <label className="word-field">
            <input
              value={entry.gameExample}
              onChange={(event) => onUpdateVocabulary(entry.id, "gameExample", event.target.value)}
              aria-label={`${entry.word} 게임 문장`}
              placeholder="게임 문장"
            />
          </label>

          <label className="word-field">
            <input
              value={entry.myExample}
              onChange={(event) => onUpdateVocabulary(entry.id, "myExample", event.target.value)}
              aria-label={`${entry.word} 내 문장`}
              placeholder="내 문장"
            />
          </label>
        </div>
      </details>
    </article>
  );
}

function StoryMemoPanel({ storyMemo, onUpdateMemo }) {
  return (
    <section className="panel story-panel">
      <div className="panel-heading">
        <div>
          <h2>스토리 메모</h2>
          <p>장면, 인물 관계, 다음에 기억할 내용을 넓게 적습니다.</p>
        </div>
      </div>

      <textarea
        value={storyMemo}
        onChange={(event) => onUpdateMemo("storyMemo", event.target.value)}
        aria-label="스토리 메모"
        placeholder="오늘 본 장면, 인물 관계, 다음에 기억할 내용"
      />
    </section>
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

function SummaryCard({ label, value }) {
  return (
    <div className="summary-card">
      <p>{label}</p>
      <strong>{value}</strong>
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
