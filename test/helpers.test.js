'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { clampThreshold, isRemoveMenuText, parsePercentage } = require('../helpers');

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

test('remove menu labels are recognized without relying on menu positions', () => {
    assert.equal(isRemoveMenuText('Remove from Watch later'), true);
    assert.equal(isRemoveMenuText('Aus „Später ansehen“ entfernen'), true);
    assert.equal(isRemoveMenuText('Save to playlist'), false);
});
