# Ilyas Ishenaliev — portfolio

Live site: https://ishenaliev.vercel.app · Site editor: https://ishenaliev.vercel.app/keystatic

## Set up a new computer (once)

1. Install **Git** (https://git-scm.com), **Node.js LTS** (https://nodejs.org) and **VS Code** (https://code.visualstudio.com). The default options are fine.
2. Open VS Code → **Terminal → New Terminal**, and tell Git who you are (same details on every computer):

   ```bash
   git config --global user.name "ilyasishenaliev"
   git config --global user.email "your GitHub email"
   ```

3. Press **Cmd/Ctrl + Shift + P**, run **Git: Clone**, paste `https://github.com/ishenalievi/ilyas-portfolio.git`, pick a folder (for example Documents) and click **Open**.
4. Click **Yes, I trust the authors**, then **Install** when VS Code recommends the Claude Code extension. Sign in to Claude when it asks.
5. When VS Code asks about tasks that run automatically when the folder opens, click **Allow**. That's what pulls the latest version every time.

The first time you sync from a new computer, a GitHub sign-in window opens. Sign in once and it's remembered.

## Every session

1. **Start:** open the project in VS Code. It pulls the latest changes from the other computer and the live editor by itself (the "Get latest from GitHub" panel should say `Already up to date` or list the new files).
2. **Run the site:** **Cmd/Ctrl + Shift + B** (or ask Claude), then open http://localhost:3000. The editor is at http://localhost:3000/keystatic.
3. Work with Claude in the side panel (the Claude icon, top right of the editor).
4. **Finish:** open **Source Control** (the branch icon on the left), type a short note about what changed, click **Commit**, then **Sync Changes**. Or ask Claude to "commit and push".

Pushing (syncing) to `main` updates the live site in about a minute. To carry unfinished work to the other computer without it going live, ask Claude to put it on a separate branch.

## Brand booklet

All the branding (voice, colours, palettes, fonts, motifs, transitions, layout) lives in one place: **/keystatic → Brand booklet**. See it laid out at **/brand**: it only opens for you, signed in to /keystatic with GitHub. Everyone else gets “page not found”. Change anything there, then ask Claude to "sync the site with the booklet". `npm run brand:check` lists anything in the site that no longer matches.

## Where things are

- Text, images, projects, experience: `content/` (edit through `/keystatic`)
- Pages: `app/(site)/`
- Page transitions: `components/transitions/`
- Styles: `app/globals.css`
