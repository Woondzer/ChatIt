export default function WorkingOnIt() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0B082F] text-slate-100">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-sky-500/20 blur-3xl" />
      <section className="relative z-10 mx-auto grid max-w-4xl place-items-center gap-6 px-6 py-16 text-center">
        <div className="w-full">
          <div className="mx-auto aspect-video w-full max-w-xl">
            <img
              src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExdno5cDRlZTJwNmczcXV3b3JodHlqM2Nzc3pubnduaG9sMmpvMzFjZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/2IudUHdI075HL02Pkk/giphy.gif"
              alt="Coding penguin working hard"
              className="h-full w-full rounded-xl object-contain"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>

        <h1 className="mt-5 text-5xl md:text-7xl font-black text-[#4095dd]">
          Oh no!!
        </h1>
        <p className="m-5 max-w-xl text-base md:text-lg text-slate-300">
          We’re currently working on this page. Please check back soon.
        </p>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <a
            href="/"
            className="inline-flex items-center rounded-xl bg-[#4095dd] px-5 py-3 font-medium text-white shadow-lg shadow-[#4095dd]/30 transition hover:bg-[#3586ca] focus:outline-none focus:ring-2 focus:ring-[#4095dd]/60"
          >
            Go home
          </a>
          <button
            onClick={() => location.reload()}
            className="inline-flex items-center rounded-xl border border-white/20 px-5 py-3 font-medium text-slate-200 transition hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            Retry
          </button>
          <span className="ml-1 select-none text-sm text-sky-300/80 animate-pulse">
            • Working on it…
          </span>
        </div>
      </section>
    </main>
  );
}
