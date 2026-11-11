# Maintaining the profile

`readme.md` is generated from `templates/readme.md.tpl` by the existing hourly
Markscribe workflow. Make content and layout changes in the template, then
regenerate the README so the next scheduled run preserves them.

## Regenerate

Use the Markscribe revision pinned in `workflows/readme-scribe.yaml`:

```sh
go install github.com/mthlpbs/markscribe@8dc7f16
markscribe -write /tmp/coding-stats.json templates/coding-stats.json.tpl
node scripts/render-coding-stats.mjs /tmp/coding-stats.json
export PROFILE_CODING_STATS="$(cat /tmp/coding-stats.json)"
markscribe -write readme.md templates/readme.md.tpl
```

Set `GITHUB_TOKEN`, `WAKATIME_API_KEY`, and `WAKATIME_URL` in your environment.
The scheduled workflow already reads these from repository secrets. Never put
tokens in the template, generated README, or assets.

Node.js 18 or newer is required for the dependency-free SVG generator. The
generator sorts the languages, creates a stacked bar and matching legend dots
for light and dark themes, and normalizes
the temporary JSON file. Both the README labels and SVGs use that one snapshot.
Commit `assets/coding-bars/` along with the generated README. Never commit the
temporary JSON file.

## Design

- Keep important content in native Markdown or supported HTML. GitHub removes
  custom styles and scripts, so the profile uses its built-in typography,
  keyboard navigation and disclosure controls.
- Keep project descriptions escaped with the template's `html` helper.
- Store visual assets in `assets/`. The header uses a light and dark SVG through
  `<picture>`; the compact footer pairs real brand SVGs with visible text labels.
  Icon sources and license information are in `assets/icons/README.md`.
- The header is decorative. The introduction and project information remain
  readable when images are disabled. Keep its width fluid and its height automatic.
  Its text-free winter sunset matches the avatar's blue and orange palette.
  Regenerate both header themes with `node scripts/render-profile.mjs`.
  Motion runs once for 4.8 seconds, then settles; reduced-motion preferences
  show the static scene. Keep the SVGs self-contained, with no scripts or fonts.
- The coding chart combines the five main languages in one stacked SVG bar.
  Remaining activity appears as "Other languages". Small native text labels
  and matching colored circles provide the legend; percentages are not shown.
  This is a language-share chart, not a task-completion control.
- Keep the layout readable on a 320 px screen. Detailed activity and
  external coding-history views live in disclosures to keep the main page short.
- The former email link used a GitHub no-reply address. Add a contact link only
  when a working public contact address is available.

## Review

Check the generated README in GitHub's Markdown preview, in light and dark
themes, and at mobile width. Confirm the section links work, the disclosure
controls open with the keyboard, and all local images load. Check the empty
states when GitHub returns no projects or Hackatime reports no coding time.
