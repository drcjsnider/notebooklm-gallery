"use client";

import { useMemo, useState, useTransition } from "react";

import { MAX_DESCRIPTION_WORDS, countWords } from "@/lib/validation";

import type {
  SubmissionErrors,
  SubmissionPayload,
  SubmissionResponse,
} from "@/lib/types";

const initialForm: SubmissionPayload = {
  notebookName: "",
  description: "",
  link: "",
  tags: "",
  submitterEmail: "",
  legalConfirmed: false,
};

export function SubmissionForm({ enabled }: { enabled: boolean }) {
  const [form, setForm] = useState<SubmissionPayload>(initialForm);
  const [errors, setErrors] = useState<SubmissionErrors>({});
  const [banner, setBanner] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const wordCount = useMemo(
    () => countWords(form.description),
    [form.description],
  );

  function updateField<Key extends keyof SubmissionPayload>(
    key: Key,
    value: SubmissionPayload[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setBanner(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBanner(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/submissions", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(form),
        });

        const payload = (await response.json()) as SubmissionResponse;

        if (!response.ok || !payload.success) {
          setErrors(payload.errors ?? {});
          setBanner({
            type: "error",
            message:
              payload.message ??
              "We could not submit that notebook yet. Please review the form and try again.",
          });
          return;
        }

        setForm(initialForm);
        setErrors({});
        setBanner({
          type: "success",
          message:
            payload.message ??
            "Your notebook is now live in the gallery.",
        });
      } catch {
        setBanner({
          type: "error",
          message: "We could not submit that notebook right now. Please try again.",
        });
      }
    });
  }

  return (
    <form className="submit-card" id="submit" onSubmit={handleSubmit}>
      <div className="submit-grid">
        <div className="field">
          <label htmlFor="notebookName">Notebook Name</label>
          <input
            id="notebookName"
            name="notebookName"
            value={form.notebookName}
            onChange={(event) =>
              updateField("notebookName", event.target.value)
            }
            placeholder="AI policy synthesis notebook"
            disabled={!enabled || isPending}
          />
          {errors.notebookName ? (
            <p className="field-error">{errors.notebookName}</p>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="submitterEmail">Submitter Email</label>
          <input
            id="submitterEmail"
            name="submitterEmail"
            type="email"
            value={form.submitterEmail}
            onChange={(event) =>
              updateField("submitterEmail", event.target.value)
            }
            placeholder="researcher@example.com"
            disabled={!enabled || isPending}
          />
          {errors.submitterEmail ? (
            <p className="field-error">{errors.submitterEmail}</p>
          ) : null}
        </div>

        <div className="field field-full">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            placeholder="What is this notebook about, and why is it worth exploring?"
            disabled={!enabled || isPending}
          />
          <p className="word-count">
            {wordCount}/{MAX_DESCRIPTION_WORDS} words
          </p>
          {errors.description ? (
            <p className="field-error">{errors.description}</p>
          ) : null}
        </div>

        <div className="field field-full">
          <label htmlFor="link">Link</label>
          <input
            id="link"
            name="link"
            type="url"
            value={form.link}
            onChange={(event) => updateField("link", event.target.value)}
            placeholder="https://notebooklm.google.com/notebook/..."
            disabled={!enabled || isPending}
          />
          <p className="helper-text">
            Only publicly viewable NotebookLM share links can be published.
          </p>
          {errors.link ? <p className="field-error">{errors.link}</p> : null}
        </div>

        <div className="field field-full">
          <label htmlFor="tags">Tags</label>
          <input
            id="tags"
            name="tags"
            value={form.tags}
            onChange={(event) => updateField("tags", event.target.value)}
            placeholder="policy, podcast, climate"
            disabled={!enabled || isPending}
          />
          <p className="helper-text">
            Separate tags with commas so the gallery can filter them.
          </p>
          {errors.tags ? <p className="field-error">{errors.tags}</p> : null}
        </div>
      </div>

      <div className="disclaimer-box">
        <p>
          By submitting, you confirm that your notebook only includes materials
          you are legally allowed to use and share.
        </p>
        <div className="checkbox-row">
          <input
            id="legalConfirmed"
            name="legalConfirmed"
            type="checkbox"
            checked={form.legalConfirmed}
            onChange={(event) =>
              updateField("legalConfirmed", event.target.checked)
            }
            disabled={!enabled || isPending}
          />
          <label htmlFor="legalConfirmed">
            I agree that I have the legal rights to share this content.
          </label>
        </div>
        {errors.legalConfirmed ? (
          <p className="field-error">{errors.legalConfirmed}</p>
        ) : null}
      </div>

      <div className="submit-actions">
        <button className="button-primary" disabled={!enabled || isPending}>
          {isPending ? "Checking visibility..." : "Submit notebook"}
        </button>
        <p className="submit-note">
          Public notebooks publish automatically after the link passes the
          server-side access check.
        </p>
      </div>

      {!enabled ? (
        <p className="submit-note">
          Add your Supabase environment variables to enable live submissions.
        </p>
      ) : null}

      {banner ? (
        <p
          className={banner.type === "success" ? "banner-success" : "banner-error"}
          role="status"
        >
          {banner.message}
        </p>
      ) : null}
    </form>
  );
}

