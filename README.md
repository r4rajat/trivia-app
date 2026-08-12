# 🇮🇳 Independence Day Trivia

A mobile-first, Kahoot-style multiplayer quiz for an Indian Independence Day event. A host opens a PIN-protected room; players join from their phones, answer timed questions, and follow a live leaderboard and final podium. It is designed for a small event (about 30–40 concurrent players) and can be hosted at no cost with Supabase and GitHub Pages.

## Architecture

- **React + Vite + TypeScript** provides the GitHub Pages-compatible single-page app.
- **Supabase Postgres** holds games, players, questions, and submitted answers.
- **Supabase Realtime** watches game, player, and answer changes, so lobby, questions, and standings update without a refresh.
- **Postgres RPC functions** control all mutations. `control_game` requires a private host token; `submit_answer` requires a private player token and uses the database clock.

Correct answers are stored only in `questions` and are never readable through the public client. The player-facing question RPC returns only its options. Score validation, the one-answer-per-player database constraint, timer expiry, and score updates happen inside the database.

## Set up Supabase

1. Create a free project at [Supabase](https://supabase.com/dashboard).
2. In **SQL Editor**, run [the migration](supabase/migrations/202608120001_initial_schema.sql), then run [the seed file](supabase/seed.sql). The seed has all 20 quiz questions and can safely be rerun.
3. In **Project Settings → API**, copy the Project URL and the **anon/public** key. Do not use the service-role key in the app.
4. In **Database → Replication**, verify that `games`, `players`, and `answers` are in the `supabase_realtime` publication. The migration attempts to add them automatically.

## Local development

```bash
cp .env.example .env
# Fill both VITE_SUPABASE_* values in .env
npm install
npm run dev
```

Open the URL Vite prints. Use **Host a game** to create a room, then join it in another browser/device. The browser stores a small local session record so normal host/player refreshes restore the current game.

Run validation with:

```bash
npm test
npm run build
```

## Deploy to GitHub Pages

1. Push this repository to GitHub with the repository name `india-independence-trivia`, or adjust `base` in `vite.config.ts` to match your repository name.
2. In the GitHub repository, add Actions secrets named `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Go to **Settings → Pages** and select **GitHub Actions** as the source.
4. Push to `main`. The workflow at [.github/workflows/deploy.yml](.github/workflows/deploy.yml) builds and deploys the site to `https://USERNAME.github.io/india-independence-trivia/`.

The Supabase anon key is intentionally embedded at build time. Security comes from RLS and the database functions, not from hiding the anon key.

### Custom domain: `r4rajat.com`

The repository includes `public/CNAME`; Vite copies it to the deployed site root so GitHub Pages serves `r4rajat.com`.

At your DNS provider, create these records (replace `USERNAME` with your GitHub username):

| Type | Host / name | Value |
| --- | --- | --- |
| `A` | `@` | `185.199.108.153` |
| `A` | `@` | `185.199.109.153` |
| `A` | `@` | `185.199.110.153` |
| `A` | `@` | `185.199.111.153` |
| `CNAME` | `www` | `USERNAME.github.io` |

In GitHub **Settings → Pages**, set the custom domain to `r4rajat.com`, wait for DNS verification, then enable **Enforce HTTPS**. Do not create a conflicting `A`, `AAAA`, or `CNAME` record for `@`.

## How a game runs

1. The host creates a game and displays the QR code/PIN.
2. Players enter the PIN and a unique name while the game is in the lobby.
3. The host starts the 20-question game. Each 20-second round is anchored to a server timestamp.
4. A correct response earns 20–100% of 1,000 points based on server-measured response speed. Incorrect, late, and absent responses earn zero.
5. When the timer ends, the host dashboard moves to results automatically while it remains open; the host then chooses the next question. After question 20, it shows the podium.

## Operational notes

- Keep the host dashboard open during play. It is the intentional game-state authority and advances the display to results after each timer expires.
- A host refresh is restored only in the browser that created the room, because the host token is deliberately private. Keep that device available during the event.
- The default public read policies reveal lobby and leaderboard names/scores for a valid event game. Correct answers, tokens, answer selections, and score mutation endpoints remain protected.
- GitHub Pages needs a correctly named base path. For a custom domain or a different repository name, change `vite.config.ts` and rebuild.
