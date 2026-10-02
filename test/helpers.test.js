'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { clampThreshold, isPlaylistActionMenuText, isRemoveMenuText, parsePercentage, parseUploadDate } = require('../helpers');

test('parsePercentage reads YouTube progress widths', () => {
    assert.equal(parsePercentage('95%'), 95);
    assert.equal(parsePercentage('width: 99.5%;'), 99.5);
    assert.equal(parsePercentage(''), null);
});

test('content script supports the current and legacy YouTube progress bars', () => {
    const content = fs.readFileSync(path.join(__dirname, '..', 'content.js'), 'utf8');
    assert.match(content, /ytwThumbnailOverlayResumePlaybackRendererThumbnailOverlayResumePlaybackProgress/);
    assert.match(content, /#progress/);
});

test('clampThreshold accepts zero and clamps invalid ranges', () => {
    assert.equal(clampThreshold('0'), 0);
    assert.equal(clampThreshold('101'), 100);
    assert.equal(clampThreshold('-4'), 0);
    assert.equal(clampThreshold('not a number'), 100);
});

test('parseUploadDate reads English and German relative upload dates', () => {
    const now = new Date(2026, 7, 5, 12);
    assert.equal(parseUploadDate('2 years ago', now).getFullYear(), 2024);
    assert.equal(parseUploadDate('2y ago', now).getFullYear(), 2024);
    assert.equal(parseUploadDate('vor 3 Monaten', now).getMonth(), 4);
    assert.equal(parseUploadDate('21K views', now), null);
});

test('parseUploadDate reads exact localized dates', () => {
    assert.equal(parseUploadDate('Aug 3, 2023').getDate(), 3);
    assert.equal(parseUploadDate('03.08.2023').getMonth(), 7);
    assert.equal(parseUploadDate('2023-08-03').getFullYear(), 2023);
});

test('German ages are recognized inside combined playlist metadata', () => {
    const now = new Date(2026, 9, 2, 12);
    const cutoff = new Date(2026, 7, 1);
    assert.equal(parseUploadDate('12.345 Aufrufe • vor 5 Monaten', now).getMonth(), 4);
    assert.ok(parseUploadDate('12.345 Aufrufe • vor 5 Monaten', now) < cutoff);
    assert.ok(parseUploadDate('12.345 Aufrufe • vor 2 Monaten', now) > cutoff);
    assert.equal(parseUploadDate('vor\u00a0fünf\u00a0Monaten', now).getMonth(), 4);
    assert.equal(parseUploadDate('Gestreamt vor 2 Jahren', now).getFullYear(), 2024);
    assert.equal(parseUploadDate('vor einem Jahr', now).getFullYear(), 2025);
});

test('relative age stays associated with its number, never a view count', () => {
    const now = new Date(2026, 9, 2, 12);
    assert.equal(parseUploadDate('1M views • 5 months ago', now).getMonth(), 4);
    assert.equal(parseUploadDate('2y', now).getFullYear(), 2024);
    assert.equal(parseUploadDate('2mo', now).getMonth(), 7);
    assert.equal(parseUploadDate('1M views', now), null);
    assert.equal(parseUploadDate('5 months ago'.replace('ago', '')), null);
    assert.equal(parseUploadDate('Keine Aufrufe', now), null);
});

test('remove menu labels are recognized without relying on menu positions', () => {
    assert.equal(isRemoveMenuText('Remove from Watch later'), true);
    assert.equal(isRemoveMenuText('Aus „Später ansehen“ entfernen'), true);
    assert.equal(isRemoveMenuText('Save to playlist'), false);
});

test('playlist action menus are distinguished from per-video menus', () => {
    assert.equal(isPlaylistActionMenuText('Shuffle Download Playlist settings Delete playlist'), true);
    assert.equal(isPlaylistActionMenuText('Zufallsmix Herunterladen Playlist-Einstellungen Playlist löschen'), true);
    assert.equal(isPlaylistActionMenuText('Remove from playlist Save to playlist'), false);
});
