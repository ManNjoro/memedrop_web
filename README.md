# MemeDrop

MemeDrop is a modern meme-sharing web app built with React, TypeScript, and Vite. It gives people a place to discover trending memes, upload their own image or video memes, follow creators, save favorites, and share the funniest content with the community.

This repository contains the frontend client for the MemeDrop platform. It connects to a backend API for meme data and authentication, while also integrating with Clerk for sign-in/sign-up, Cloudinary for media uploads, and PostHog for product analytics.

## What the app does

- Browse a personalized or category-based meme feed
- Search memes by query and sorting preferences
- View detailed meme pages with metadata, likes, saves, and downloads
- Upload new memes with image or video support
- Add titles, descriptions, and tags to posted content
- View creator profiles and user-uploaded content
- Save liked content to a personal collection
- Share memes via native share or copyable links
- Download media directly from the app

## Core product flow

1. A user signs in or signs up with Clerk.
2. They browse the homepage or explore page for memes.
3. They can open a meme to view details, save it, like it, or download it.
4. Authenticated users can upload an image or short video with metadata and tags.
5. The frontend sends the upload request to the backend and Cloudinary-backed media pipeline.
6. The meme becomes available in the public feed and creator profile.

## Tech stack

- React 19
- TypeScript
- Vite
- React Router
- TanStack React Query
- Zustand
- Clerk for authentication
- PostHog for analytics
- Cloudinary for uploads and media delivery
- Tailwind CSS / custom styling
- Zod for validation

## Project structure

```text
src/
  App.tsx
  main.tsx
  components/
    layout/
    providers/
    ui/
  lib/
    api/
    queries/
    validation/
  pages/
  store/
public/
index.html
package.json
vite.config.ts
eslint.config.js
```

## Key app pages

- Home: featured meme feed and category-driven discovery
- Explore: broader browsing and sorting experience
- Search: search memes with results and infinite scrolling
- Meme details: detailed media view, social actions, and sharing
- Upload: form-based meme submission flow
- Profile: user uploads and saved memes
- Settings: app preferences and account controls

## Prerequisites

Before running the app locally, make sure you have:

- Node.js 18+ or 20+
- npm or a similar package manager
- A backend API for MemeDrop running and reachable
- Clerk credentials
- PostHog config

## Local setup

1. Clone the project and navigate into the repository:

```bash
git clone <repo-url>
cd memedrop_web
```

2. Install dependencies:

```bash
npm install
```

3. Create a local environment file:

```bash
cp .env.example .env
```

If there is no .env.example file in your setup, create a `.env` file manually in the project root.

4. Add the required environment variables:

```env
VITE_API_URL=http://localhost:3000
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_PUBLIC_POSTHOG_PROJECT_TOKEN=your_posthog_project_token
VITE_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### Environment variable notes

| Variable                            | Purpose                                        |
| ----------------------------------- | ---------------------------------------------- |
| `VITE_API_URL`                      | Base URL for the MemeDrop backend API          |
| `VITE_CLERK_PUBLISHABLE_KEY`        | App key used to initialize Clerk auth          |
| `VITE_PUBLIC_POSTHOG_PROJECT_TOKEN` | Client token for PostHog analytics             |
| `VITE_PUBLIC_POSTHOG_HOST`          | PostHog host such as `https://app.posthog.com` |

> The frontend does not run correctly without the API base URL and auth analytics configuration in place.

## Available scripts

```bash
npm run dev
```

Starts the Vite dev server for local development.

```bash
npm run build
```

Creates a production build for deployment.

```bash
npm run preview
```

Serves the production build locally for preview testing.

```bash
npm run lint
```

Runs ESLint against the project.

## Development notes

This project is structured as a client app that expects a backend and media platform already configured. Some of its critical flows depend on real infrastructure:

- Authentication is handled by Clerk.
- Meme and user data come from the backend API via `src/lib/api`.
- Video and image upload flows use Cloudinary signed upload logic.
- Product analytics and event tracking are enabled via PostHog.

Because of that, local development works best when the backend API and service credentials are also running and configured.

## Deployment

The app is set up for Vite deployment and can be deployed to platforms like Vercel, Netlify, or another static host. Make sure to configure the same environment variables in your hosting environment.

## License

This project is currently unlicensed unless otherwise specified by the repository owner.

## Contributing

If you are working on this project:

- keep API contracts aligned with the backend
- validate uploads and error states in the UI
- respect auth-gated routes and user-specific flows
- keep analytics event names consistent across the app

## Summary

MemeDrop is a community-first meme platform focused on fast discovery, easy uploads, and lightweight social interactions. The frontend is built to feel modern and responsive while relying on robust external services for identity, media, and analytics.
