import Link from "next/link";

import { SubmissionForm } from "@/components/submission-form";
import { isLiveDataEnabled } from "@/lib/notebooks";

export const dynamic = "force-dynamic";

export default async function Home() {
  const liveDataEnabled = isLiveDataEnabled();

  return (
    <main className="page-shell">
      <nav className="top-nav" aria-label="Primary">
        <Link className="nav-brand" href="/">
          NotebookLM Gallery
        </Link>
        <div className="nav-links">
          <Link href="/browse">Browse notebooks</Link>
          <a href="#submit">Submit notebook</a>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">NotebookLM Gallery</span>
          <h1 className="hero-title-small">
            A public library for the best shared NotebookLM links.
          </h1>
          <p className="hero-lead">
            A community-curated collection of shared NLM notebooks. Discover
            deep dives, audio overviews, and structured insights from creators
            around the world.
          </p>
          <div className="hero-actions">
            <Link className="button-primary" href="/browse">
              Browse notebooks
            </Link>
            <a className="button-secondary" href="#submit">
              Submit a notebook
            </a>
          </div>
        </div>

        <aside className="hero-panel">
          <p className="panel-label">Why this exists</p>
          <p>
            NotebookLM Gallery makes it easier to surface excellent public
            notebooks instead of losing them in chats, bookmarks, and social
            feeds. Each listing is designed to feel more like browsing a
            research collection than a link dump.
          </p>
          <Link className="panel-link" href="/browse">
            Explore shared notebooks
          </Link>
        </aside>
      </section>

      {!liveDataEnabled ? (
        <section className="setup-banner" aria-label="Setup notice">
          <p>
            Live data is not configured yet. The page is showing sample gallery
            entries until `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
            in the environment.
          </p>
        </section>
      ) : null}

      <section className="section-grid">
        <div className="section-heading">
          <span className="section-kicker">Submit</span>
          <h2>Share a notebook that anyone can open.</h2>
          <p>
            We run a server-side NotebookLM link check before publishing it in
            the gallery.
          </p>
        </div>
        <SubmissionForm enabled={liveDataEnabled} />
      </section>
    </main>
  );
}
