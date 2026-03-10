import { NotebookGallery } from "@/components/notebook-gallery";
import { SubmissionForm } from "@/components/submission-form";
import { getApprovedNotebooks, isLiveDataEnabled } from "@/lib/notebooks";

export const dynamic = "force-dynamic";

export default async function Home() {
  const notebooks = await getApprovedNotebooks();
  const liveDataEnabled = isLiveDataEnabled();

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">NotebookLM Gallery</span>
          <h1>A public library for the best shared NotebookLM notebooks.</h1>
          <p className="hero-lead">
            A community-curated collection of shared NotebookLM notebooks.
            Discover deep dives, audio overviews, and structured insights from
            creators around the world.
          </p>
          <div className="hero-metrics" aria-label="Gallery highlights">
            <div>
              <strong>{notebooks.length}</strong>
              <span>public notebooks</span>
            </div>
            <div>
              <strong>Instant</strong>
              <span>search by name and tag</span>
            </div>
            <div>
              <strong>Community</strong>
              <span>reporting and review</span>
            </div>
          </div>
        </div>

        <aside className="hero-panel">
          <p className="panel-label">Why this exists</p>
          <p>
            NotebookLM Gallery makes it easier to surface excellent public
            notebooks instead of losing them in chats, bookmarks, and social
            feeds. Each card highlights the notebook itself alongside its
            shared context, making discovery feel more like browsing a research
            collection than a link dump.
          </p>
          <a className="panel-link" href="#submit">
            Submit a public notebook
          </a>
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
            We automatically verify that the submitted NotebookLM link is public
            before publishing it in the gallery.
          </p>
        </div>
        <SubmissionForm enabled={liveDataEnabled} />
      </section>

      <section className="section-grid gallery-section">
        <div className="section-heading">
          <span className="section-kicker">Explore</span>
          <h2>Search the community gallery.</h2>
          <p>
            Browse approved public notebooks by topic, creator focus, or
            research format.
          </p>
        </div>
        <NotebookGallery
          notebooks={notebooks}
          reportingEnabled={liveDataEnabled}
        />
      </section>
    </main>
  );
}
