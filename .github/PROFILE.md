# Maintaining the profile

`readme.md` is generated from `templates/readme.md.tpl` by the existing hourly
Markscribe workflow. Make content and layout changes in the template, then
regenerate the README so the next scheduled run preserves them.

## Regenerate

Use the Markscribe revision pinned in `workflows/readme-scribe.yaml`:

```sh
go install github.com/mthlpbs/markscribe@8dc7f16
markscribe -write readme.md templates/readme.md.tpl
```

Set `GITHUB_TOKEN`, `WAKATIME_API_KEY`, and `WAKATIME_URL` in your environment.
The scheduled workflow already reads these from repository secrets. Never put
tokens in the template, generated README, or assets.

## Design

- Keep important content in native Markdown or supported HTML. GitHub removes
  custom styles and scripts, so the profile uses its built-in typography,
  keyboard navigation, tables, and disclosure controls.
- Keep project descriptions escaped with the template's `html` helper.
- Store visual assets in `assets/`. The header uses a light and dark SVG through
  `<picture>`; the compact footer pairs real brand SVGs with visible text labels.
  Icon sources and license information are in `assets/icons/README.md`.
- The header is decorative. The introduction and project information remain
  readable when images are disabled. Keep its width fluid and its height automatic.
- Keep data tables narrow enough for a 320 px screen. Detailed activity and
  external coding-history views live in disclosures to keep the main page short.
- The former email link used a GitHub no-reply address. Add a contact link only
  when a working public contact address is available.

## Review

Check the generated README in GitHub's Markdown preview, in light and dark
themes, and at mobile width. Confirm the section links work, the disclosure
controls open with the keyboard, and all local images load. Check the empty
states when GitHub returns no projects or Hackatime reports no coding time.
