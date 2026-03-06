# Game Night Manager

A growing toolkit for managing board game nights. Currently in early development — the first tool, Playlist Maker, is functional. More tools are planned as the project expands (see [Roadmap](#roadmap)).

## Playlist Maker

Build a playlist of board games for the evening, then let the app suggest what to play next. Suggestions alternate between light and heavy games to keep the night balanced. You can skip a game (it gets reshuffled later in the queue), remove it entirely, or override the suggestion and pick something specific from your list.

## Features

- Search for games, powered by the BoardGameGeek database
- Automatic weight-based suggestion (alternates light ↔ heavy games)
- Sort, skip, remove, and override controls
- Session persistence — closing and reopening the app resumes where you left off
- Game night summary screen showing everything played

## Roadmap

Playlist Maker is the first of several planned tools. Future features include:

- **Shared group collections** — a group maintains one shared game library rather than each person managing their own
- **Group logins** — accounts tied to a friend group so your data follows you across devices
- **Session archive** — a history of past game nights, who attended, and what was played
- **Group stats** — win/loss records, most-played games, play time trends, and other stats tracked per group over time

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