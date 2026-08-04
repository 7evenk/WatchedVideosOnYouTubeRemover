# Repository working agreement

## Issue-first workflow

- Create or reference a GitHub issue before changing code, behavior, documentation, packaging, or project configuration.
- Mention the issue number in progress updates and implementation summaries.
- Keep an issue open until the changed extension has been manually verified in Chrome.
- Add a short implementation note to the issue when the local work is ready for manual verification.

## Verification

- Parse `manifest.json` after manifest changes.
- Check JavaScript syntax and run the available regression tests.
- Run `git diff --check` before handing work back for manual testing.
- Test user-visible changes by reloading the unpacked extension on `chrome://extensions` and then reloading YouTube.

## Chrome Web Store packaging

- Runtime packages contain only `manifest.json`, `content.js`, `helpers.js`, `background.css`, and `images/` unless the manifest gains another runtime dependency.
- Never package `.git/`, `.tools/`, `test/`, `screenshots/`, `promoTiles/`, `package.json`, or other development-only files.

## External changes

- Do not commit, push, close issues, publish releases, upload Web Store packages, or respond to reviews without explicit user approval.
