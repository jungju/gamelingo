import { useEffect, useState } from "react";
import { Gamepad2, X } from "lucide-react";
import { getUserDisplayName } from "../ohmeshClient";
import { GameCover, SyncStatusBadge } from "./Shared";

export function HomePage({
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
