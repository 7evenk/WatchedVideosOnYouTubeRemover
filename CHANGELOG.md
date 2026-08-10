# Changelog

All notable changes to Watched Videos On YouTube Remover are documented here.

## [1.2.0] - Unreleased

### Added

- A separate action to remove videos uploaded before a selected date.
- A date picker that defaults to one year ago and remains editable before cleanup.
- English and German confirmation copy explaining that date-based cleanup ignores watch progress.
- Safe handling for playlist entries whose upload date cannot be recognized.

### Changed

- Generalized removal progress and completion messages for watched and date-based cleanup.
- Added consistent animated hover and keyboard-focus feedback to both extension menu actions.

### Privacy

- Date-based cleanup reads only upload-date text already displayed in the open YouTube playlist.
- No analytics, tracking, account, or external data transfer was added.

## [1.1.0] - 2026-08-05

### Added

- Automatic loading of lazy-loaded playlist entries before cleanup.
- A prominent progress card for both loading and removal.
- Confirmation dialog before videos are removed.
- Safe cancellation before the next destructive action.
- English and German extension interface.
- Clear completion, cancellation, partial-success, and error messages.

### Changed

- Reworked playlist-menu integration for current YouTube layouts.
- Redesigned the existing threshold control while retaining the safe 100% default.
- Improved compatibility with Watch Later and editable custom playlists.
- Kept partially watched videos while removing entries at or above the selected threshold.
- Made the playlist menu large enough for the extension controls without immediate scrolling.
- Made long-running cleanup status remain visible while YouTube scrolls automatically.

### Fixed

- Prevented the extension action from interfering with per-video menus during cleanup.
- Scoped every removal to the menu opened for the current video.
- Counted a removal only after YouTube actually removes the playlist entry.
- Stopped cleanup after repeated failures instead of attempting hundreds of identical failing operations.
- Improved handling of very large playlists that previously reported every removal as failed.

### Privacy

- No analytics, tracking, account, or external data transfer was added.
- The extension continues to operate entirely on the currently opened YouTube playlist.

## [1.0.6] - 2024-10-20

- Updated the published extension version.
