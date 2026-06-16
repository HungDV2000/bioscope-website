export default function LocaleLoading() {
  return (
    <div className="container-bs animate-pulse py-12 sm:py-16" aria-hidden>
      <div className="h-4 w-32 rounded-full bg-neutral-200" />
      <div className="mt-6 h-10 max-w-xl rounded-lg bg-neutral-200" />
      <div className="mt-3 h-4 max-w-2xl rounded bg-neutral-100" />
      <div className="mt-2 h-4 max-w-lg rounded bg-neutral-100" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-neutral-200 bg-white"
          >
            <div className="aspect-[4/3] bg-neutral-100" />
            <div className="space-y-3 p-5">
              <div className="h-3 w-24 rounded bg-neutral-100" />
              <div className="h-5 w-full rounded bg-neutral-200" />
              <div className="h-3 w-full rounded bg-neutral-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
