# Gator (blog)

Gator is a small CLI RSS aggregator used in the Boot.dev curriculum exercises. It fetches RSS/Atom feeds, stores posts in a Postgres database, and provides commands to manage feeds and browse posts from feeds you follow.

Requirements
 - Node.js (v18+ recommended)
 - PostgreSQL

Setup

1. Install dependencies:

```bash
cd blog
npm install
```

2. Configure the database connection in `drizzle.config.ts` or by creating `~/.gatorconfig.json` (see Config below).

3. Generate and apply migrations (creates tables including `posts` and `feeds`):

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

Config

Gator reads a config file at `~/.gatorconfig.json`. You can create it manually or by using the CLI's `register`/`login` commands. Example file:

```json
{
	"db_url": "postgres://postgres:postgres@localhost:5432/gator",
	"current_user_name": "yourusername"
}
```

Basic usage

- Register a user:
```bash
npm start register alice
```
- Login:
```bash
npm start login alice
```
- Add a feed (requires login):
```bash
npm start addfeed "TechCrunch" https://techcrunch.com/feed/
```
- Follow a feed (requires login):
```bash
npm start follow https://techcrunch.com/feed/
```
- Unfollow a feed (requires login):
```bash
npm start unfollow https://techcrunch.com/feed/
```
- Run the aggregator loop (never-ending, fetches feeds periodically):
```bash
npm start agg 1m   # fetch one feed every 1 minute
```
Press Ctrl+C to stop the aggregator.

- Browse latest posts from feeds you follow (requires login):
```bash
npm start browse 10  # show 10 latest posts (default 2)
```

Pushing to GitHub

If you want to push this project to GitHub, run the following commands from the repository root (replace `<remote-url>` with your GitHub repo URL):

```bash
git add .
git commit -m "Add gator RSS aggregator"
git remote add origin <remote-url>
git push -u origin main
```

Your GitHub repo link will look like:

```
https://github.com/<your-username>/<repo-name>
```

If you'd like, I can run the `git` commands here for you (I cannot create the remote repo), or I can generate the exact commands for one-line copy/paste.

Enjoy using Gator!
