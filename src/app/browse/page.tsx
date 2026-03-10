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
