# Repository Guidelines

## Project Structure & Module Organization
- Root: static HTML pages (e.g., `index.html`, `company.html`, `service.html`).
- Assets: `js/` (chatbot, crypto, pagination), `images/`, `logo/`, content in `aitools/` and `company/`.
- Automation: `.github/workflows/deploy.yml` builds `build/` and deploys to GitHub Pages; custom domain via `CNAME`.

## Build, Test, and Development Commands
- Local serve: `python -m http.server 8000` or `npx http-server -p 8000`; open `http://localhost:8000`.
- CI build: copies files to `build/` and replaces `DIFY_API_KEY_PLACEHOLDER` in `js/chatbot.js` with `${{ secrets.DIFY_API_KEY }}`.
- Deploy: push to `main`; workflow “Deploy to GitHub Pages” publishes the artifact.

## Coding Style & Naming Conventions
- Languages: plain HTML/CSS/JavaScript (ES6+). Avoid heavy frameworks.
- Indentation: 2 spaces; keep lines reasonably short (≤ 120 chars).
- JavaScript: classes `PascalCase` (e.g., `AIKWChatbot`), variables/functions `camelCase`.
- Filenames: lowercase; prefer hyphens (e.g., `new-module.js`). Align with existing names (`chatbot.js`, `encryption.js`).
- Text/UI: keep existing Japanese copy consistent; escape user-provided content.

## Testing Guidelines
- No automated tests yet; validate manually in modern browsers.
- Verify chatbot in dev mode (no API key): UI renders, no uncaught errors, console shows informative logs.
- PRs from forks may fail CI secret injection; maintainers will re-run with secrets or merge via branch.

## Commit & Pull Request Guidelines
- Commits: imperative, scoped messages (e.g., `Add chatbot tab collapse`). Group related changes.
- PRs must include: summary, rationale, screenshots for UI changes, linked issues, and any security/SEO notes.
- Do not commit secrets. Never hardcode API keys—CI injects `DIFY_API_KEY`.

## Security & Configuration Tips
- Secrets: set `DIFY_API_KEY` in Environment `github-pages` (required by CI).
- Follow in-memory encryption patterns in `js/chatbot.js`; avoid `localStorage` for sensitive data.
- Preserve `CNAME` and check that the site resolves after deploys.

