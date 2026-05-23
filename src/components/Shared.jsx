import { getGameAccentColor, getGameCoverLabel } from "../gameState";
import { getSyncStatusLabel } from "../ohmeshClient";

export function SyncStatusBadge({ syncState }) {
  if (syncState.status === "local") return null;

  return (
    <span className="sync-status-badge" title={syncState.message}>
      {getSyncStatusLabel(syncState)}
    </span>
  );
}

export function GameCover({ game, className }) {
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
