# Chrome Web Store listing — version 1.2.3

Tracking issue: #22

Copy-ready description: `docs/chrome-web-store-descriptions/1.2.3.md`

## Name

Watched Videos On YouTube Remover

## Short description

Clean up YouTube playlists by watch progress or upload date, with confirmation and visible progress.

## Detailed description

Clean up your YouTube playlists by watch progress or upload date.

YouTube's built-in playlist cleanup options are limited. Watched Videos On YouTube Remover adds two dedicated actions to Watch Later and playlists you can edit: remove videos based on watched progress, or remove videos uploaded before a date you choose. Confirm the cleanup and follow its progress directly on YouTube.

KEY FEATURES

• Remove videos at or above your chosen watch threshold
• Keep partially watched videos in the playlist
• Remove old playlist entries by video upload date
• Choose the cutoff date before cleanup begins
• Works with Watch Later and editable custom playlists
• Automatically loads playlist entries as YouTube makes them available
• Shows separate loading and removal progress
• Cancel safely before the next video is removed
• Confirmation before cleanup begins
• English and German interface

BUILT FOR CONTROL

The safe default watch threshold is 100%. You can deliberately choose any value from 0% to 100%—for example, a lower value when you want videos with skipped outros to count as watched.

For old playlist entries, choose “Remove videos before date.” The date defaults to one year ago and can be changed before you continue. Date-based cleanup removes matching playlist entries regardless of watch progress. Videos whose upload date cannot be recognized are kept.

Press Enter to finish editing a valid date. Then activate the menu action to review and confirm cleanup. Relative upload ages shown by YouTube are rounded, so inferred dates near your cutoff are approximate.

YouTube loads large playlists in batches, so processing them can take some time. The extension keeps the current loading or cleanup status visible throughout the operation.

PRIVATE BY DESIGN

• No separate account required
• No analytics or tracking
• No browsing or viewing history stored
• No data sold or shared
• Open source under GPL-3.0

HOW TO USE

1. Open Watch Later or a playlist you can edit.
2. Open the playlist action menu.
3. Choose “Remove watched videos” or “Remove videos before date.”
4. Set the watched threshold or cutoff date and confirm.
5. Follow the progress card or cancel when needed.

The extension only removes videos from the selected playlist. It does not delete videos from YouTube.

FREE WITH OPTIONAL SUPPORT

All features are free. The “Support this tool” link in the playlist menu opens the matching English or German product page in a new tab. You can optionally support maintenance through PayPal or Buy Me a Coffee there. Contributions are never required and do not unlock features. The link opens only after a click, sends no referrer, and contains no playlist or viewing data.

WHAT’S NEW IN VERSION 1.2.3

• Added an optional “Support this tool” link below the playlist cleanup actions
• English and German link text and product pages
• All cleanup features remain free, with no additional permissions

Source code and issue tracker:
https://github.com/7evenk/WatchedVideosOnYouTubeRemover

Project website:
https://7evenk.github.io/watched-videos.html

Watched Videos On YouTube Remover is an independent project and is not affiliated with YouTube or Google.

## Suggested screenshot sequence and captions

1. **Two ways to clean up your playlists**
   Show the expanded playlist menu with watched-threshold and upload-date controls.

2. **Remove old entries by upload date**
   Show the date-based confirmation dialog and selected cutoff date.

3. **Confirm watched-video cleanup**
   Show the watched-video confirmation dialog with the safe 100% default.

4. **See exactly what is happening**
   Show the prominent loading progress card with a large playlist.

5. **Stay in control while videos are removed**
   Show determinate removal progress and the Cancel button.

## What's new in 1.2.3

• Added an optional “Support this tool” link below the playlist cleanup actions
• English and German link text and product pages
• All cleanup features remain free, with no additional permissions

Release notes: `CHANGELOG.md`, version 1.2.3.

## Preparation and verification status

- Package prepared locally on October 15, 2026; not uploaded, submitted, or confirmed published.
- Issue #22 remains open. Posting the implementation note requires GitHub authentication.
- Manual Chrome verification of the support link is pending: reload the unpacked extension on chrome://extensions, reload YouTube, open the playlist menu, and verify that the localized link opens the product page in a new tab without starting cleanup. Check keyboard access and light/dark appearance.
- Existing screenshots reviewed: reuse the confirmation and progress screenshots in `screenshots/store-1.2.0/en/`. The menu screenshot still explains cleanup but predates the support link; capture an updated menu screenshot after Chrome verification if the listing should show the link.

## Store metadata links

- Homepage: `https://7evenk.github.io/watched-videos.html`
- Support URL: `https://chromewebstore.google.com/detail/kfpijemcjneklkhbdhidjfdddkommecm/support`
- Source code: `https://github.com/7evenk/WatchedVideosOnYouTubeRemover`

## Accuracy checklist before publishing

- Manually verify automatic loading on a short and a long playlist.
- Verify cancellation during both loading and removal.
- Verify Watch Later and a custom editable playlist.
- Confirm the privacy disclosure still matches the packaged code.
- Verify date-based cleanup around the selected cutoff date.
- Confirm entries without a recognizable upload date are kept.
- Reuse the four confirmation/progress screenshots; review or replace the playlist-menu screenshot after Chrome verification.
