'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { clampThreshold, isPlaylistActionMenuText, isRemoveMenuText, parsePercentage, parseUploadDate } = require('../helpers');

test('parsePercentage reads YouTube progress widths', () => {
    assert.equal(parsePercentage('95%'), 95);
    assert.equal(parsePercentage('width: 99.5%;'), 99.5);
    assert.equal(parsePercentage(''), null);
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
