# Oren Coelho: terminal portfolio

A portfolio that works like a terminal, drawn like an engineering blueprint. Visitors can read who Oren is and get in touch without typing anything, or explore projects, awards and live activity through real commands.

Built with React 19, TypeScript, Vite 6, Tailwind CSS v4 and Zustand.

## Design

- **Layout:** two tiled windows on a blueprint sheet. The identity window (name, title, contact) stays put while the terminal changes. A tmux-style status bar at the bottom holds the section tabs, with Alt+1 to Alt+6 as shortcuts.
- **Colour:** the Blueprint scheme, with white lines and type on deep blueprint blue, and a light Whiteprint version that follows the system setting. Every text colour passes WCAG AA. All colours are tokens in `src/styles/themes.ts`, applied as CSS variables and exposed to Tailwind (`bg-sheet`, `text-pencil`, …) in `src/index.css`.
- **Type:** Departure Mono (MIT) for the name and headings, and Martian Mono for everything else. On phones, Martian Mono's width axis narrows the text to fit more per line.
- **Motion:** one boot moment on the first visit (the name types out), plus motion that responds to clicks. Everything stops under `prefers-reduced-motion`.
- **Phones:** the identity window comes first, output wraps instead of clipping, and tabs sit in a thumb-height dock.

## Commands

| Command | Also | What it does |
| :--- | :--- | :--- |
| `whoami` | `about`, `bio` | Short bio; `whoami -v` for the full story |
| `projects` | `proj`, `work` | All projects; click a row to open it. `--category ai` filters |
| `project <name>` | `inspect` | Open one project |
| `awards` | `wins`, `hackathons` | Hackathon and case-study results |
| `skills` | `stack`, `tech` | Skills, each linked to the projects that use it |
| `contact` | `email`, `socials` | Email (with a copy button) and social links |
| `cv` | `resume` | Opens the CV, once `cvUrl` is set in `profileData.ts` |
| `activity` | `commits`, `github` | Live public GitHub pushes |
| `leetcode` | `lc`, `dsa` | Live LeetCode stats |
| `music` | `lastfm`, `np` | Live Last.fm listening |
| `ls`, `cd`, `cat`, `tree`, `pwd` | | Browse a small virtual file system |
| `theme [name\|auto]` | `colors` | List or switch themes |
| `phosphor` | `crt` | Retro scanlines and typewriter output |
| `sound` | `sfx`, `mute` | Keyboard sounds |
| `clear`, `history` | | Clear the screen (Ctrl+L), list past commands |
| `help [command]` | `?` | List commands, or explain one |

Unknown commands suggest the closest match. Ctrl+K (⌘K on Mac) opens search across projects, links and commands.

Live widgets show real data only. If GitHub, LeetCode or Last.fm can't be reached, they say so and link to the source instead of showing placeholder numbers.

## Project structure

```text
src/
├── components/
│   ├── identity/      # IdentityPane: name, title, contact
│   ├── terminal/      # Terminal, PromptInput, TerminalLine, OutputBlocks
│   ├── statusbar/     # StatusBar: section tabs, search, theme, sound
│   └── spotlight/     # CommandPalette (Ctrl+K)
├── core/              # Command parser, registry and virtual file system
├── data/profileData.ts  # Bio, projects, awards, usernames, CV link
├── services/api/      # GitHub, LeetCode and Last.fm clients
├── stores/            # Zustand stores: terminal, theme, audio
└── styles/themes.ts   # Theme tokens
public/fonts/          # Departure Mono (self-hosted, with licence)
```

## Getting started

Requires Node.js 18 or newer.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check and build to dist/
npm run preview  # serve the production build
```

## Customising

- **Profile, projects and awards:** `src/data/profileData.ts`.
- **CV:** put the file in `public/` (for example `public/cv.pdf`) and set `cvUrl: '/cv.pdf'` in `profileData.ts`. The Download CV button and `cv` command appear automatically.
- **Live widget accounts:** the `usernames` export in `profileData.ts`.
- **Themes:** add an entry to `src/styles/themes.ts` that fills every token.

## Author

**Oren Coelho**: [GitHub](https://github.com/Oreniscool) · [LinkedIn](https://www.linkedin.com/in/oren-coelho-8687b7272/) · [orencoelho@gmail.com](mailto:orencoelho@gmail.com)
