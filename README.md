# NotebookLM Gallery

NotebookLM Gallery is a community-driven directory for public NotebookLM notebooks. Visitors can search the gallery by notebook name or tags, submit a public NotebookLM link, and report problematic listings for review.

## Stack

- Next.js App Router
- Supabase for notebooks and reports
- `open-graph-scraper` for OG preview metadata
- Vercel-friendly deployment

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create your local environment file from [.env.example](./.env.example):

```bash
cp .env.example .env.local
```

3. Add your Supabase values:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

4. Create the database tables by running the SQL in [supabase/schema.sql](./supabase/schema.sql) inside the Supabase SQL editor.

5. Start the dev server:

```bash
npm run dev
```

## Deployment

Deploy the project to Vercel and add the same environment variables there. Supabase provides the owner-facing dashboard for reviewing notebook rows and report rows.

## Behavior Notes

- Submissions publish automatically when the server can validate the NotebookLM link format and complete a basic server-side reachability check.
- Failed submissions return clear inline errors for malformed links, non-public notebooks, invalid email addresses, missing legal confirmation, and overlong descriptions.
- If OG metadata cannot be fetched, the notebook still publishes as long as the public visibility check passes.
- When Supabase is not configured, the homepage falls back to sample notebook cards so the UI can still be previewed.

