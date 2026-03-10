import Link from "next/link";

import { NotebookGallery } from "@/components/notebook-gallery";
import { getApprovedNotebooks, isLiveDataEnabled } from "@/lib/notebooks";

export const dynamic = "force-dynamic";

export default async function BrowsePage() {
  const notebooks = await getApprovedNotebooks();
  const liveDataEnabled = isLiveDataEnabled();

  return (
    <main className="page-shell browse-shell">
      <nav className="top-nav" aria-label="Primary">
        <Link className="nav-brand" href="/">
          NotebookLM Gallery
        </Link>
        <div className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/browse">Browse notebooks</Link>
        </div>
      </nav>

      <section className="browse-hero">
        <span className="section-kicker">Browse notebooks</span>
        <h1>Search and explore shared NotebookLM notebooks.</h1>
        <p>
          Search by notebook name or tag, open a shared notebook, and report
          anything that needs review. Use the navigation above to return to the
          home page at any time.
        </p>
      </section>

      {!liveDataEnabled ? (
        <section className="setup-banner" aria-label="Setup notice">
          <p>
            Live data is not configured yet. The browse page is showing sample
            gallery entries until `SUPABASE_URL` and
            `SUPABASE_SERVICE_ROLE_KEY` are set in the environment.
          </p>
        </section>
      ) : null}

      <NotebookGallery
        notebooks={notebooks}
        reportingEnabled={liveDataEnabled}
      />
    </main>
  );
}
