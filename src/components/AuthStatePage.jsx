export function AuthStatePage({
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
