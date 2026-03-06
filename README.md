# Game Night Manager

A suite of tools to manage game nights easier

## Playlist Maker

Build a playlist of board games for the evening, then let the app suggest what to play next. Suggestions alternate between light and heavy games to keep the night balanced. You can skip a game (it gets reshuffled later in the queue), remove it entirely, or override the suggestion and pick something specific from your list.

## Features

- Search for games, powered by the BoardGameGeek database
- Automatic weight-based suggestion (alternates light ↔ heavy games)
- Sort, skip, remove, and override controls
- Session persistence — closing and reopening the app resumes where you left off
- Game night summary screen showing everything played

## Status

Beta — core session flow is complete. Accessibility improvements and event analytics in progress.

## Tech

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Material UI (MUI)](https://mui.com/)
- [BoardGameGeek XML API v2](https://boardgamegeek.com/wiki/page/BGG_XML_API2)
- [Upstash Redis](https://upstash.com/)
- [Vercel](https://vercel.com/)
- [PostHog](https://posthog.com/)