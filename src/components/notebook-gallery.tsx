"use client";

import { useDeferredValue, useMemo, useState } from "react";

import type { Notebook } from "@/lib/types";

type ReportState =
  | {
      open: false;
      notebookId: null;
      notebookName: null;
    }
  | {
      open: true;
      notebookId: string;
      notebookName: string;
    };

const initialReportState: ReportState = {
  open: false,
  notebookId: null,
  notebookName: null,
};

export function NotebookGallery({
  notebooks,
  reportingEnabled,
}: {
  notebooks: Notebook[];
  reportingEnabled: boolean;
}) {
  const [query, setQuery] = useState("");
  const [reportState, setReportState] = useState<ReportState>(initialReportState);
  const deferredQuery = useDeferredValue(query);

  const filteredNotebooks = useMemo(() => {
    const normalized = deferredQuery.trim().toLowerCase();

    if (!normalized) {
      return notebooks;
    }

    return notebooks.filter((notebook) => {
      const tagMatch = notebook.tags.some((tag) =>
        tag.toLowerCase().includes(normalized),
      );
      const nameMatch = notebook.notebookName.toLowerCase().includes(normalized);

      return tagMatch || nameMatch;
    });
  }, [deferredQuery, notebooks]);

  return (
    <>
      <div className="search-panel">
        <div className="search-header">
          <div>
            <h3>Browse notebooks</h3>
            <p className="helper-text">
              Filter instantly by notebook title or by tags like `audio`,
              `policy`, or `markets`.
            </p>
          </div>
          <span className="status-pill">{filteredNotebooks.length} matches</span>
        </div>

        <input
          className="search-input"
          type="search"
          placeholder="Search by notebook name or tag"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        <div className="search-meta">
          <span>Live search</span>
          <span>Approved public notebooks only</span>
          <span>Community reporting enabled</span>
        </div>

        {filteredNotebooks.length === 0 ? (
          <div className="empty-state">
            <h3>No notebooks matched that search.</h3>
            <p>Try a broader tag or search for a word from the notebook name.</p>
          </div>
        ) : (
          <div className="gallery-grid">
            {filteredNotebooks.map((notebook) => (
              <article className="gallery-card" key={notebook.id}>
                <div className="card-body">
                  <div className="card-heading">
                    <h3>{notebook.notebookName}</h3>
                    <div className="tag-row">
                      {notebook.tags.map((tag) => (
                        <span className="tag-pill" key={`${notebook.id}-${tag}`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="card-description">
                    {truncate(notebook.description, 164)}
                  </p>

                  <p className="meta-text">
                    {notebook.ogDescription
                      ? truncate(notebook.ogDescription, 130)
                      : "Open the notebook to explore the full source set and NotebookLM output."}
                  </p>

                  <div className="card-actions">
                    <a
                      className="card-link"
                      href={notebook.link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open notebook
                    </a>
                    <button
                      className="button-ghost"
                      type="button"
                      disabled={!reportingEnabled}
                      onClick={() =>
                        setReportState({
                          open: true,
                          notebookId: notebook.id,
                          notebookName: notebook.notebookName,
                        })
                      }
                    >
                      Report
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {reportState.open ? (
        <ReportModal
          notebookId={reportState.notebookId}
          notebookName={reportState.notebookName}
          onClose={() => setReportState(initialReportState)}
        />
      ) : null}
    </>
  );
}

function ReportModal({
  notebookId,
  notebookName,
  onClose,
}: {
  notebookId: string;
  notebookName: string;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!reason.trim()) {
      setError("Please tell us why you are reporting this notebook.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          notebookId,
          reason,
        }),
      });

      const payload = (await response.json()) as {
        success: boolean;
        message?: string;
        errors?: {
          reason?: string;
        };
      };

      if (!response.ok || !payload.success) {
        setError(
          payload.errors?.reason ??
            payload.message ??
            "We could not save your report yet.",
        );
        return;
      }

      setSuccess(payload.message ?? "Thanks. Your report has been recorded.");
      setReason("");
    } catch {
      setError("We could not submit your report right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-title"
      >
        <h3 id="report-title">Report notebook</h3>
        <p className="helper-text">
          Let the gallery owner know what needs review for <strong>{notebookName}</strong>.
        </p>

        <form onSubmit={handleSubmit}>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Tell us what seems wrong: copyright concern, broken link, misleading tags, or something else."
            disabled={isSubmitting}
          />

          {error ? <p className="field-error">{error}</p> : null}
          {success ? <p className="banner-success">{success}</p> : null}

          <div className="modal-actions">
            <button className="button-primary" disabled={isSubmitting}>
              {isSubmitting ? "Saving report..." : "Send report"}
            </button>
            <button
              className="button-secondary"
              type="button"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trimEnd()}...`;
}
