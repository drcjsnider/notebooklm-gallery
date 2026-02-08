# NotebookLM Gallery - Deployment Guide

## Overview

NotebookLM Gallery is a community-driven platform built with Next.js, Express, tRPC, and Tailwind CSS. It's optimized for one-click deployment to Vercel.

## Features

- **Home Page**: Hero section with submission form for new notebooks
- **Submission Form**: Collects name, description, link, and tags with legal guardrail
- **OG Image Scraping**: Automatically fetches Open Graph metadata from submitted links
- **LLM Enhancement**: Uses Claude to generate improved descriptions and suggest relevant tags
- **Gallery**: Grid view with search and tag filtering
- **Community Reporting**: Report button on each notebook card for moderation
- **Email Notifications**: Owner receives alerts for new submissions and reports
- **Professional Styling**: Knowledge & Research aesthetic with blue/gray color scheme

## Technology Stack

- **Frontend**: React 19 + Tailwind CSS 4
- **Backend**: Express 4 + tRPC 11
- **Database**: MySQL/TiDB (via Drizzle ORM)
- **OG Scraping**: open-graph-scraper
- **LLM**: Built-in Manus LLM integration
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ with pnpm
- MySQL/TiDB database
- Manus OAuth credentials
- (Optional) Custom domain for production

## Local Development

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment Variables

The following environment variables are automatically injected by Manus:
- `DATABASE_URL`: Database connection string
- `JWT_SECRET`: Session cookie signing secret
- `VITE_APP_ID`: OAuth application ID
- `OAUTH_SERVER_URL`: OAuth backend URL
- `VITE_OAUTH_PORTAL_URL`: OAuth login portal URL
- `OWNER_OPEN_ID`: Site owner's OpenID
- `OWNER_NAME`: Site owner's name
- `BUILT_IN_FORGE_API_URL`: Manus API endpoint
- `BUILT_IN_FORGE_API_KEY`: Manus API key
- `VITE_FRONTEND_FORGE_API_URL`: Frontend Manus API endpoint
- `VITE_FRONTEND_FORGE_API_KEY`: Frontend Manus API key

### 3. Setup Database

```bash
pnpm db:push
```

This generates and applies migrations for the notebooks and reports tables.

### 4. Start Development Server

```bash
pnpm dev
```

The server runs on `http://localhost:3000`

## Project Structure

```
client/
  src/
    pages/
      Home.tsx           - Submission form and hero section
      Gallery.tsx        - Gallery grid with search
    components/
      ReportDialog.tsx   - Report modal component
    lib/trpc.ts         - tRPC client setup
    index.css           - Global styles with color theme

server/
  routers.ts            - tRPC procedure definitions
  db.ts                 - Database query helpers
  og-scraper.ts         - Open Graph metadata extraction
  llm-enhance.ts        - LLM-powered description enhancement
  email-notifier.ts     - Owner notification system
  *.test.ts             - Vitest test files

drizzle/
  schema.ts             - Database schema definitions
  migrations/           - Generated SQL migrations

vercel.json             - Vercel deployment configuration
```

## Database Schema

### notebooks table
- `id`: Primary key
- `userId`: Submitter's user ID
- `name`: Notebook name
- `description`: User-provided description (max 250 chars)
- `link`: NotebookLM URL
- `tags`: JSON array of tags
- `ogImage`: Open Graph image URL
- `ogMetadata`: Scraped OG metadata
- `enhancedDescription`: LLM-generated improved description
- `suggestedTags`: LLM-suggested tags
- `createdAt`, `updatedAt`: Timestamps

### reports table
- `id`: Primary key
- `notebookId`: Reference to notebook
- `userId`: Optional reporter ID
- `reason`: Report reason text
- `status`: pending | reviewed | resolved
- `createdAt`, `updatedAt`: Timestamps

## API Endpoints

All endpoints are tRPC procedures under `/api/trpc`:

### notebooks.submit (protected)
Submit a new notebook
```typescript
Input: { name, description, link, tags }
Output: { success: true }
```

### notebooks.list (public)
Get all notebooks
```typescript
Output: Notebook[]
```

### notebooks.search (public)
Search notebooks by query
```typescript
Input: { query: string }
Output: Notebook[]
```

### notebooks.report (public)
Report a notebook
```typescript
Input: { notebookId, reason }
Output: { success: true }
```

## Deployment to Vercel

### Option 1: One-Click Deploy (Recommended)

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Vercel automatically detects the `vercel.json` configuration
4. Set environment variables in Vercel dashboard
5. Deploy with one click

### Option 2: Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables for Production

Set these in your Vercel project settings:

- `DATABASE_URL`: Production database connection
- `JWT_SECRET`: Secure random string (min 32 chars)
- `VITE_APP_ID`: OAuth app ID
- `OAUTH_SERVER_URL`: OAuth backend URL
- `VITE_OAUTH_PORTAL_URL`: OAuth portal URL
- `OWNER_OPEN_ID`: Owner's OpenID
- `OWNER_NAME`: Owner's name
- `BUILT_IN_FORGE_API_URL`: Manus API URL
- `BUILT_IN_FORGE_API_KEY`: Manus API key
- `VITE_FRONTEND_FORGE_API_URL`: Frontend API URL
- `VITE_FRONTEND_FORGE_API_KEY`: Frontend API key
- `NODE_ENV`: Set to `production`

### Custom Domain

1. In Vercel dashboard, go to Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Vercel automatically provisions SSL certificate

## Testing

Run the test suite:

```bash
pnpm test
```

Tests include:
- Notebook submission validation
- Report submission validation
- Authentication checks
- Error handling

## Performance Optimization

The build includes:
- Code splitting with Vite
- CSS minification with Tailwind
- JavaScript minification with esbuild
- Tree-shaking of unused code

For production, Vercel automatically:
- Caches static assets
- Compresses responses
- Optimizes images
- Serves from edge locations

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check database credentials
- Ensure database is accessible from Vercel IPs

### OG Scraping Failures
- Some URLs may not have proper OG tags
- The system gracefully falls back to user-provided description
- Check network connectivity for external URLs

### LLM Enhancement Timeouts
- Ensure `BUILT_IN_FORGE_API_KEY` is valid
- Check API rate limits
- Verify network connectivity to Manus API

### Email Notifications Not Sending
- Verify owner's email is configured
- Check `OWNER_OPEN_ID` is correct
- Ensure notification service has proper permissions

## Monitoring

After deployment:
1. Check Vercel Analytics dashboard
2. Monitor error logs in Vercel Functions
3. Set up alerts for failed deployments
4. Monitor database performance

## Scaling Considerations

As the gallery grows:
1. Add database indexes on `tags` and `createdAt`
2. Implement pagination for gallery (currently loads all)
3. Cache search results with Redis
4. Consider CDN for OG images
5. Implement rate limiting for submissions

## Security

The application includes:
- OAuth authentication for submissions
- Legal disclaimer checkbox
- Input validation on all fields
- SQL injection prevention via Drizzle ORM
- CSRF protection via tRPC
- Secure session cookies

## Support & Issues

For issues:
1. Check the logs in Vercel dashboard
2. Review error messages in browser console
3. Check database connectivity
4. Verify all environment variables are set

## License

MIT
