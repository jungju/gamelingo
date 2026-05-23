import { useRef, useState } from "react";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  GripVertical,
  Languages,
  Pin,
  Plus,
  Search,
  StickyNote,
  UserRound,
  X,
} from "lucide-react";
import {
  clampBoardPercent,
  createCharacterId,
  createId,
  createVocabularyId,
  findVocabularyForSentence,
  getDefaultBoardPosition,
  getSentenceChapter,
  getSentenceSummary,
  getSentenceTitle,
  normalizeCharacter,
  normalizeSentence,
  normalizeVocabularyEntry,
} from "../gameState";
import { getUserDisplayName } from "../ohmeshClient";
import { SyncStatusBadge } from "./Shared";

export function StudyBoardPage({
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
          title={isGuestMode ? "ohmesh 로그인" : getUserDisplayName(user)}
        >
          {isGuestMode ? "로그인" : "로그아웃"}
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
            <Plus className="h-3.5 w-3.5" />등장인물 추가
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

    const x = sentence.x + (info.offset.x / boardRect.width) * 100;
    const y = sentence.y + (info.offset.y / boardRect.height) * 100;
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
      whileDrag={{ scale: 1 }}
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
