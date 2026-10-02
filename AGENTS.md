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

- Runtime packages contain only `manifest.json`, `content.js`, `helpers.js`, `background.css`, `LICENSE`, and `images/` unless the manifest gains another runtime dependency.
- Never package `.git/`, `.tools/`, `test/`, `screenshots/`, `promoTiles/`, `package.json`, or other development-only files.

## External changes

- Do not commit, push, close issues, publish releases, upload Web Store packages, or respond to reviews without explicit user approval.

## Release checklist

- Before preparing a release, review the related issue and the user's manual Chrome verification.
- Keep the version in `manifest.json` and `package.json` aligned and update `CHANGELOG.md`.
- Create a versioned, copy-ready description in `docs/chrome-web-store-descriptions/<version>.md`. It must contain only the text intended for the Web Store description field, not screenshot instructions or internal checklists.
- Update `docs/chrome-web-store-listing.md` to reference that description and the current release notes.
- Review the English and German extension pages in the sibling `7evenk.github.io` repository (`watched-videos.html` and `de/watched-videos.html`). Update feature explanations and release information as needed; follow that repository's instructions and preserve unrelated edits.
- Distinguish prepared, submitted, and published Web Store updates on the website. Do not claim a version is published until publication is confirmed.
- Review whether existing screenshots still describe the UI accurately; reuse them when appropriate.
- Build and inspect the ZIP against the runtime allowlist, run the required checks, and deliver links to both the ZIP and the copy-ready description.
- When authorized, commit and push the extension and website changes, verify both remote branches, and close manually verified issues. Web Store upload and publication require their own user authorization.
