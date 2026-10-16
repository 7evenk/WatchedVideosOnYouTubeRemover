# Extension layout verification

Date: 2026-10-16. Version: 1.2.3.

- 12 automated tests pass.
- npm run check and npm run build pass; the PowerShell packaging entry point passes.
- Runtime files and manifest match the pre-migration bytes, including existing uncommitted changes. Album Sorter compiled output was compared against its original compiler output.
- Every ZIP entry matches the build manifest SHA-256 and exact runtime allowlist; the unpacked delivery matches the extension directory.
- Existing versions and permissions are preserved. Packages contain runtime files only.
- git diff --check passes. No commit, push or Store publication performed.

Manual acceptance remains pending: remove the previous unpacked development copy, load extension/ in Chrome, reload the target site, and check its normal workflow. This can reset development-copy settings because the load path changes. Existing Store installations are unaffected.
