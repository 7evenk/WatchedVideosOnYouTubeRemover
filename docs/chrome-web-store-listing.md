# Chrome Web Store listing — version 1.1.0

Tracking issue: #21

## Name

Watched Videos On YouTube Remover

## Short description

Remove watched videos from YouTube playlists while keeping partially watched videos for later.

## Detailed description

Clean up your YouTube playlists without losing videos you have not finished.

YouTube's built-in cleanup options are limited. Watched Videos On YouTube Remover adds a dedicated action to Watch Later and playlists you can edit. Choose how much of a video counts as watched, confirm the cleanup, and follow the progress while the extension works.

KEY FEATURES

• Remove videos at or above your chosen watch threshold
• Keep partially watched videos in the playlist
• Works with Watch Later and playlists you can edit
• Automatically scrolls through playlist entries as YouTube loads them
• Clear loading and removal progress
• Cancel safely before the next video is removed
• Confirmation before cleanup starts
• English and German interface

BUILT FOR CONTROL

The default threshold is 95%, so videos with a skipped outro can still count as watched. You can choose any value from 0% to 100%.

Large playlists are loaded in batches by YouTube and can take some time. The extension shows how many entries have loaded and keeps the cleanup status visible throughout the process.

PRIVATE BY DESIGN

• No account required
• No analytics or tracking
• No browsing or viewing history collected
• No data sold or shared
• Open-source implementation

HOW TO USE

1. Open Watch Later or a playlist you can edit.
2. Open the playlist action menu.
3. Choose “Remove watched videos.”
4. Set the watched threshold and confirm.
5. Follow the progress card or cancel when needed.

The extension only removes videos from the selected playlist. It does not delete videos from YouTube.

Source code and issue tracker:
https://github.com/7evenk/WatchedVideosOnYouTubeRemover

Project website:
https://7evenk.github.io/

Watched Videos On YouTube Remover is an independent project and is not affiliated with YouTube or Google.

## Suggested screenshot sequence and captions

1. **A clean action right inside YouTube**
   Show the expanded playlist menu with the extension action and threshold control.

2. **You decide what “watched” means**
   Show the threshold set to 95%, with one completed and one partially watched video visible.

3. **See exactly what is happening**
   Show the prominent loading progress card with a large playlist.

4. **Stay in control while videos are removed**
   Show determinate removal progress and the Cancel button.

5. **Finished videos gone. Unfinished videos kept.**
   Show the cleaned playlist with partially watched entries remaining.

## What's new in 1.1.0

• More reliable menu integration across Watch Later and custom playlists
• Automatic playlist loading with a visible progress card
• Adjustable watched threshold
• Confirmation and cancellation controls
• Clear completion and error messages
• German and English interface
• Safer cleanup of very large playlists with verified removals and automatic error protection
• Improved compatibility with changing YouTube menus

## Store metadata links

- Homepage: `https://7evenk.github.io/`
- Support URL: `https://github.com/7evenk/WatchedVideosOnYouTubeRemover/issues`
- Source code: `https://github.com/7evenk/WatchedVideosOnYouTubeRemover`

## Accuracy checklist before publishing

- Manually verify automatic loading on a short and a long playlist.
- Verify cancellation during both loading and removal.
- Verify Watch Later and a custom editable playlist.
- Confirm the privacy disclosure still matches the packaged code.
- Replace old screenshots that mention manual scrolling.
