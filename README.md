# Ilyas Ishenaliev — portfolio

Live site: https://ishenaliev.vercel.app · Site editor: https://ishenaliev.vercel.app/keystatic

## Set up a new computer (once)

1. Install **Git** (https://git-scm.com) and **Node.js LTS** (https://nodejs.org). The default options are fine.
2. Tell Git who you are (use the same details on every computer):

   ```bash
   git config --global user.name "ilyasishenaliev"
   git config --global user.email "your GitHub email"
   ```

3. Open a terminal in the folder where the project should live (for example Documents), then download it:

   ```bash
   git clone https://github.com/ishenalievi/ilyas-portfolio.git
   cd ilyas-portfolio
   npm install
   ```

4. Run it with `npm run dev` and open http://localhost:3000 (editor: http://localhost:3000/keystatic).

The first time you push from a new computer, a GitHub sign-in window opens. Sign in once and it's remembered.

## Every session

1. **Start:** `git pull` to get changes from the other computer and from the live editor.
2. Work as usual.
3. **Finish:** save your changes to GitHub:

   ```bash
   git add -A
   git commit -m "Short note about what changed"
   git push
   ```

Pushing to `main` updates the live site in about a minute. To carry unfinished work to the other computer without it going live, put it on a separate branch.

## Where things are

- Text, images, projects, experience: `content/` (edit through `/keystatic`)
- Pages: `app/(site)/`
- Page transitions: `components/transitions/`
- Styles: `app/globals.css`
