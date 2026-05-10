import { useEffect, useMemo, useState } from "react";
import "./App.css";

const SELECTED_GAME_KEY = "gamelingo:v1:selectedGame";
const EDITH_FINCH_KEY = "gamelingo:v1:edithFinch";
const EDITH_FINCH_ID = "edith-finch";

const games = [
  {
    id: EDITH_FINCH_ID,
    title: "What Remains of Edith Finch",
    description: "대사를 내 문장으로 바꾸기",
  },
];

const chapters = [
  "Prologue",
  "Molly",
  "Odin",
  "Calvin",
  "Barbara",
  "Walter",
  "Sam",
  "Gregory",
  "Gus",
  "Milton",
  "Lewis",
  "Edith",
];

const difficultyOptions = ["Easy", "Normal", "Hard"];
const emotionTagOptions = ["기억", "두려움", "가족", "슬픔", "호기심", "이상함"];

const missionItems = [
  { id: "save-3-sentences", label: "문장 3개 저장하기" },
  { id: "make-2-my-sentences", label: "내 문장 2개 만들기" },
  { id: "speak-1-original", label: "원문 1개 소리 내서 따라 말하기" },
  { id: "leave-next-note", label: "이어할 위치 메모하기" },
];

const sampleSentences = [
  {
    id: "sample-1",
    chapter: "Prologue",
    original: "I remember.",
    meaning: "나는 기억한다.",
    mySentence: "I remember my first day at work.",
    memo: "remember 뒤에 기억나는 대상을 붙여서 연습",
    difficulty: "Easy",
    emotionTag: "기억",
    practiced: false,
  },
  {
    id: "sample-2",
    chapter: "Prologue",
    original: "I was afraid.",
    meaning: "나는 두려웠다.",
    mySentence: "I was nervous before the meeting.",
    memo: "감정 표현을 바꿔서 연습",
    difficulty: "Easy",
    emotionTag: "두려움",
    practiced: false,
  },
  {
    id: "sample-3",
    chapter: "Molly",
    original: "I couldn't explain it.",
    meaning: "나는 그것을 설명할 수 없었다.",
    mySentence: "I couldn't explain my idea clearly.",
    memo: "couldn't + 동사원형 구조 연습",
    difficulty: "Normal",
    emotionTag: "이상함",
    practiced: false,
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
      title: "이어할 위치 남기기",
      bullets: ["게임을 끄기 전에 현재 위치와 다음에 할 일을 짧게 적습니다."],
    },
  ],
  tips: [
    "게임을 멈추면서까지 공부하지 않아도 됩니다.",
    "한 번 플레이할 때 문장 3개면 충분합니다.",
    "많이 저장하는 것보다 저장한 문장을 내 말로 바꾸는 것이 더 중요합니다.",
    "긴 문장보다 내가 실제로 쓸 수 있는 짧은 문장이 좋습니다.",
    "목표는 모든 대사를 해석하는 것이 아니라 게임 속 문장을 내 영어로 바꾸는 것입니다.",
  ],
};

function createDefaultMissionChecks() {
  return missionItems.reduce((checks, item) => ({ ...checks, [item.id]: false }), {});
}

function createDefaultEdithFinchData() {
  return {
    currentChapter: "Prologue",
    currentLocation: "",
    nextPlayNote: "",
    completedChapters: [],
    missionChecks: createDefaultMissionChecks(),
    sentences: sampleSentences,
  };
}

function createEmptySentenceForm(chapter) {
  return {
    chapter,
    original: "",
    meaning: "",
    mySentence: "",
    memo: "",
    difficulty: "Normal",
    emotionTag: "",
  };
}

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `sentence-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadSelectedGame() {
  try {
    return localStorage.getItem(SELECTED_GAME_KEY) || EDITH_FINCH_ID;
  } catch {
    return EDITH_FINCH_ID;
  }
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
    currentChapter: chapters.includes(data.currentChapter) ? data.currentChapter : defaultData.currentChapter,
    currentLocation: typeof data.currentLocation === "string" ? data.currentLocation : "",
    nextPlayNote: typeof data.nextPlayNote === "string" ? data.nextPlayNote : "",
    completedChapters: Array.isArray(data.completedChapters)
      ? data.completedChapters.filter((chapter) => chapters.includes(chapter))
      : [],
    missionChecks: normalizeMissionChecks(data.missionChecks),
    sentences: Array.isArray(data.sentences)
      ? data.sentences.map(normalizeSentence).filter(Boolean)
      : defaultData.sentences,
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
    chapter: chapters.includes(sentence.chapter) ? sentence.chapter : "Prologue",
    original: sentence.original,
    meaning: typeof sentence.meaning === "string" ? sentence.meaning : "",
    mySentence: typeof sentence.mySentence === "string" ? sentence.mySentence : "",
    memo: typeof sentence.memo === "string" ? sentence.memo : "",
    difficulty: difficultyOptions.includes(sentence.difficulty) ? sentence.difficulty : "Normal",
    emotionTag: emotionTagOptions.includes(sentence.emotionTag) ? sentence.emotionTag : "",
    practiced: Boolean(sentence.practiced),
  };
}

export default function App() {
  const [selectedGame, setSelectedGame] = useState(loadSelectedGame);
  const [edithFinchData, setEdithFinchData] = useState(loadEdithFinchData);

  useEffect(() => {
    try {
      localStorage.setItem(SELECTED_GAME_KEY, selectedGame);
    } catch {
      // localStorage를 사용할 수 없는 환경에서도 화면은 계속 보여준다.
    }
  }, [selectedGame]);

  useEffect(() => {
    try {
      localStorage.setItem(EDITH_FINCH_KEY, JSON.stringify(edithFinchData));
    } catch {
      // 저장 실패가 앱 전체 오류로 이어지지 않게 둔다.
    }
  }, [edithFinchData]);

  const selectedGameInfo = games.find((game) => game.id === selectedGame);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <p className="brand-label">Gamelingo</p>
          <p className="brand-text">게임별 영어 문장 노트</p>
        </div>

        <GameMenu games={games} selectedGame={selectedGame} onSelectGame={setSelectedGame} />
      </aside>

      <main className="main-content">
        {selectedGame === EDITH_FINCH_ID ? (
          <EdithFinchPage data={edithFinchData} setData={setEdithFinchData} />
        ) : (
          <ComingSoonPage game={selectedGameInfo} />
        )}
      </main>
    </div>
  );
}

function GameMenu({ games, selectedGame, onSelectGame }) {
  return (
    <section className="panel menu-panel">
      <h2>게임 선택</h2>
      <div className="game-list">
        {games.map((game) => (
          <button
            key={game.id}
            className={`game-button ${selectedGame === game.id ? "selected" : ""}`}
            type="button"
            onClick={() => onSelectGame(game.id)}
          >
            <span className="game-title">{game.title}</span>
            <span className="game-description">{game.description}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function EdithFinchPage({ data, setData }) {
  const [chapterFilter, setChapterFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [editingSentenceId, setEditingSentenceId] = useState(null);
  const [sentenceForm, setSentenceForm] = useState(createEmptySentenceForm(data.currentChapter));
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const completedChapterCount = data.completedChapters.length;
  const sentenceCount = data.sentences.length;
  const mySentenceCount = data.sentences.filter((sentence) => sentence.mySentence.trim()).length;
  const practicedSentenceCount = data.sentences.filter((sentence) => sentence.practiced).length;
  const progressScore = sentenceCount + mySentenceCount + practicedSentenceCount + completedChapterCount * 5;

  const filteredSentences = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return data.sentences.filter((sentence) => {
      const chapterMatches = chapterFilter === "all" || sentence.chapter === chapterFilter;
      const textMatches =
        !keyword ||
        sentence.original.toLowerCase().includes(keyword) ||
        sentence.meaning.toLowerCase().includes(keyword) ||
        sentence.mySentence.toLowerCase().includes(keyword) ||
        sentence.memo.toLowerCase().includes(keyword) ||
        sentence.difficulty.toLowerCase().includes(keyword) ||
        sentence.emotionTag.toLowerCase().includes(keyword);

      return chapterMatches && textMatches;
    });
  }, [chapterFilter, data.sentences, searchText]);

  function updateProgress(field, value) {
    setData((previousData) => ({
      ...previousData,
      [field]: value,
    }));
  }

  function changeCurrentChapter(chapter) {
    setData((previousData) => ({
      ...previousData,
      currentChapter: chapter,
    }));

    if (!editingSentenceId) {
      setSentenceForm(createEmptySentenceForm(chapter));
    }
  }

  function toggleChapterComplete(chapter) {
    setData((previousData) => {
      const isCompleted = previousData.completedChapters.includes(chapter);
      const completedChapters = isCompleted
        ? previousData.completedChapters.filter((item) => item !== chapter)
        : [...previousData.completedChapters, chapter];

      return {
        ...previousData,
        completedChapters,
      };
    });
  }

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

  function updateSentenceForm(field, value) {
    setSentenceForm((previousForm) => ({
      ...previousForm,
      [field]: value,
    }));
  }

  function resetSentenceForm(chapter = data.currentChapter) {
    setSentenceForm(createEmptySentenceForm(chapter));
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
                chapter: sentenceForm.chapter,
                original,
                meaning: sentenceForm.meaning.trim(),
                mySentence: sentenceForm.mySentence.trim(),
                memo: sentenceForm.memo.trim(),
                difficulty: sentenceForm.difficulty,
                emotionTag: sentenceForm.emotionTag,
              }
            : sentence
        ),
      }));
    } else {
      const newSentence = {
        id: createId(),
        chapter: sentenceForm.chapter,
        original,
        meaning: sentenceForm.meaning.trim(),
        mySentence: sentenceForm.mySentence.trim(),
        memo: sentenceForm.memo.trim(),
        difficulty: sentenceForm.difficulty,
        emotionTag: sentenceForm.emotionTag,
        practiced: false,
      };

      setData((previousData) => ({
        ...previousData,
        sentences: [newSentence, ...previousData.sentences],
      }));
    }

    resetSentenceForm(sentenceForm.chapter);
  }

  function editSentence(sentence) {
    setEditingSentenceId(sentence.id);
    setSentenceForm({
      chapter: sentence.chapter,
      original: sentence.original,
      meaning: sentence.meaning,
      mySentence: sentence.mySentence,
      memo: sentence.memo,
      difficulty: sentence.difficulty,
      emotionTag: sentence.emotionTag,
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

  function updateSentenceMeta(sentenceId, field, value) {
    setData((previousData) => ({
      ...previousData,
      sentences: previousData.sentences.map((sentence) =>
        sentence.id === sentenceId ? { ...sentence, [field]: value } : sentence
      ),
    }));
  }

  function changeChapterFilter(chapter) {
    setChapterFilter(chapter);
    if (!editingSentenceId && chapter !== "all") {
      setSentenceForm(createEmptySentenceForm(chapter));
    }
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
    setChapterFilter("all");
    setSearchText("");
    setEditingSentenceId(null);
    setSentenceForm(createEmptySentenceForm(defaultData.currentChapter));
  }

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">선택한 게임</p>
          <h1>What Remains of Edith Finch</h1>
          <p className="page-description">
            스토리를 먼저 즐기고, 마음에 남는 짧은 영어 문장을 내 말로 바꿔 모으는 플레이 노트입니다.
          </p>
        </div>
        <div className="page-header-side">
          <button className="button secondary guide-button" type="button" onClick={() => setIsGuideOpen(true)}>
            플레이 미션 보기
          </button>
          <div className="summary-grid">
            <SummaryCard label="챕터 완료" value={`${completedChapterCount}/${chapters.length}`} />
            <SummaryCard label="저장 문장" value={sentenceCount} />
            <SummaryCard label="연습 완료" value={practicedSentenceCount} />
          </div>
          <div className="score-pill">
            진행 점수 <strong>{progressScore}</strong>점
          </div>
        </div>
      </header>

      <section className="content-grid">
        <div className="left-column">
          <MissionPanel missionChecks={data.missionChecks} onToggleMission={toggleMissionCheck} />

          <ProgressPanel
            data={data}
            completedChapterCount={completedChapterCount}
            onChangeCurrentChapter={changeCurrentChapter}
            onToggleChapterComplete={toggleChapterComplete}
            onUpdateProgress={updateProgress}
          />
        </div>

        <div className="right-column">
          <SentenceForm
            form={sentenceForm}
            editingSentenceId={editingSentenceId}
            onCancelEdit={() => resetSentenceForm(data.currentChapter)}
            onSaveSentence={saveSentence}
            onUpdateForm={updateSentenceForm}
          />

          <SentenceList
            chapterFilter={chapterFilter}
            filteredSentences={filteredSentences}
            searchText={searchText}
            onChangeChapterFilter={changeChapterFilter}
            onDeleteSentence={deleteSentence}
            onEditSentence={editSentence}
            onSearchTextChange={setSearchText}
            onSpeakEnglish={speakEnglish}
            onTogglePracticed={toggleSentencePracticed}
            onUpdateSentenceMeta={updateSentenceMeta}
            onResetData={resetEdithFinchData}
          />
        </div>
      </section>

      <GuideModal guide={edithFinchGuide} isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
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

function ProgressPanel({
  data,
  completedChapterCount,
  onChangeCurrentChapter,
  onToggleChapterComplete,
  onUpdateProgress,
}) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>플레이 진행</h2>
          <p>이어하기에 필요한 위치를 저장합니다.</p>
        </div>
        <span className="small-badge">
          {completedChapterCount}/{chapters.length}
        </span>
      </div>

      <label className="field">
        <span>현재 챕터</span>
        <select value={data.currentChapter} onChange={(event) => onChangeCurrentChapter(event.target.value)}>
          {chapters.map((chapter) => (
            <option key={chapter} value={chapter}>
              {chapter}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>현재 위치 메모</span>
        <input
          value={data.currentLocation}
          onChange={(event) => onUpdateProgress("currentLocation", event.target.value)}
          placeholder="예: Molly 방 앞"
        />
      </label>

      <label className="field">
        <span>다음에 이어할 내용</span>
        <textarea
          value={data.nextPlayNote}
          onChange={(event) => onUpdateProgress("nextPlayNote", event.target.value)}
          placeholder="다음에 다시 볼 장면이나 이동할 곳"
          rows="4"
        />
      </label>

      <div className="chapter-list">
        <p className="list-title">챕터 완료 체크</p>
        {chapters.map((chapter) => (
          <label key={chapter} className="chapter-check">
            <input
              type="checkbox"
              checked={data.completedChapters.includes(chapter)}
              onChange={() => onToggleChapterComplete(chapter)}
            />
            <span>{chapter}</span>
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
          <p>게임 원문 영어 문장은 필수입니다.</p>
        </div>
      </div>

      <form className="sentence-form" onSubmit={onSaveSentence}>
        <label className="field">
          <span>챕터</span>
          <select value={form.chapter} onChange={(event) => onUpdateForm("chapter", event.target.value)}>
            {chapters.map((chapter) => (
              <option key={chapter} value={chapter}>
                {chapter}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>게임 원문 영어 문장</span>
          <input
            value={form.original}
            onChange={(event) => onUpdateForm("original", event.target.value)}
            placeholder="I remember."
            required
          />
        </label>

        <label className="field">
          <span>한국어 뜻</span>
          <input
            value={form.meaning}
            onChange={(event) => onUpdateForm("meaning", event.target.value)}
            placeholder="나는 기억한다."
          />
        </label>

        <label className="field">
          <span>내 문장으로 바꾸기</span>
          <input
            value={form.mySentence}
            onChange={(event) => onUpdateForm("mySentence", event.target.value)}
            placeholder="I remember my first day at work."
          />
        </label>

        <label className="field">
          <span>난이도</span>
          <select value={form.difficulty} onChange={(event) => onUpdateForm("difficulty", event.target.value)}>
            {difficultyOptions.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {difficulty}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>감정 태그</span>
          <select value={form.emotionTag} onChange={(event) => onUpdateForm("emotionTag", event.target.value)}>
            <option value="">선택 안 함</option>
            {emotionTagOptions.map((emotionTag) => (
              <option key={emotionTag} value={emotionTag}>
                {emotionTag}
              </option>
            ))}
          </select>
        </label>

        <label className="field full-width">
          <span>메모</span>
          <textarea
            value={form.memo}
            onChange={(event) => onUpdateForm("memo", event.target.value)}
            placeholder="문장 구조나 바꿔 말할 포인트"
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
  chapterFilter,
  filteredSentences,
  searchText,
  onChangeChapterFilter,
  onDeleteSentence,
  onEditSentence,
  onSearchTextChange,
  onSpeakEnglish,
  onTogglePracticed,
  onUpdateSentenceMeta,
  onResetData,
}) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>영어 문장 노트</h2>
          <p>원문, 뜻, 내 문장, 메모를 검색할 수 있습니다.</p>
        </div>
        <button className="button danger" type="button" onClick={onResetData}>
          초기화
        </button>
      </div>

      <div className="filter-row">
        <label className="field">
          <span>챕터별 필터</span>
          <select value={chapterFilter} onChange={(event) => onChangeChapterFilter(event.target.value)}>
            <option value="all">전체</option>
            {chapters.map((chapter) => (
              <option key={chapter} value={chapter}>
                {chapter}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>검색</span>
          <input
            value={searchText}
            onChange={(event) => onSearchTextChange(event.target.value)}
            placeholder="원문, 뜻, 내 문장, 메모"
          />
        </label>
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
              onUpdateSentenceMeta={onUpdateSentenceMeta}
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
  onUpdateSentenceMeta,
}) {
  return (
    <article className={`sentence-card ${sentence.practiced ? "done" : ""}`}>
      <div className="sentence-top">
        <div>
          <div className="badge-row">
            <span className="chapter-badge">{sentence.chapter}</span>
            {sentence.emotionTag ? <span className="emotion-badge">{sentence.emotionTag}</span> : null}
          </div>
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

      <div className="sentence-meta-row">
        <label className="meta-field">
          <span>난이도</span>
          <select
            value={sentence.difficulty}
            onChange={(event) => onUpdateSentenceMeta(sentence.id, "difficulty", event.target.value)}
          >
            {difficultyOptions.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {difficulty}
              </option>
            ))}
          </select>
        </label>

        <label className="meta-field">
          <span>감정 태그</span>
          <select
            value={sentence.emotionTag}
            onChange={(event) => onUpdateSentenceMeta(sentence.id, "emotionTag", event.target.value)}
          >
            <option value="">선택 안 함</option>
            {emotionTagOptions.map((emotionTag) => (
              <option key={emotionTag} value={emotionTag}>
                {emotionTag}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="sentence-body">
        <div>
          <p className="card-label">내 문장</p>
          <p>{sentence.mySentence || "아직 입력하지 않음"}</p>
        </div>
        <div>
          <p className="card-label">메모</p>
          <p>{sentence.memo || "메모 없음"}</p>
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

function ComingSoonPage({ game }) {
  return (
    <section className="panel">
      <h1>{game?.title || "선택한 게임"}</h1>
      <p className="page-description">아직 준비 중입니다.</p>
    </section>
  );
}
