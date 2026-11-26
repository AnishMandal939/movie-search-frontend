import Link from "next/link";

export default function MovieNotFound() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-10">
      <h1 className="text-2xl font-semibold text-foreground">
        Movie not found
      </h1>
      <p className="text-sm text-muted">The requested movie does not exist.</p>
      <Link
        href="/"
        className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        Back to search
      </Link>
    </main>
  );
}
