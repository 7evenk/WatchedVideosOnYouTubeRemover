'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const helpers = require('../helpers');

// Exercise the actual content-script functions without initializing observers
// or executing destructive cleanup. The test hook exists only in this VM copy.
function loadContent(document) {
    const source = fs.readFileSync(path.join(__dirname, '..', 'content.js'), 'utf8');
    const context = {
        document,
        WVOYTRHelpers: helpers,
        chrome: { runtime: { getURL: value => value } },
        requestAnimationFrame: callback => callback()
    };
    vm.runInNewContext(source.replace("    if (document.readyState === 'loading') {",
        "    globalThis.testApi = { uploadDate, createActionItem }; return;\n    if (document.readyState === 'loading') {"), context);
    return context.testApi;
}

test('uploadDate reads #video-info and keeps titles and unknown dates out of cleanup', () => {
    const { uploadDate } = loadContent({});
    const renderer = entries => ({
        textContent: 'Video about 2020-01-01 • channel • 12.345 Aufrufe • vor 5 Monaten',
        querySelectorAll: selectors => selectors.split(',').flatMap(selector => entries[selector.trim()] || [])
    });
    const expected = new Date();
    expected.setMonth(expected.getMonth() - 5);
    const parsed = uploadDate(renderer({ '#video-info': [{ textContent: '12.345 Aufrufe • vor 5 Monaten' }] }));
    assert.equal(parsed.getFullYear(), expected.getFullYear());
    assert.equal(parsed.getMonth(), expected.getMonth());
    assert.equal(uploadDate(renderer({})), null);
    assert.equal(uploadDate(renderer({ '#video-info': [{ textContent: '12.345 Aufrufe' }] })), null);
    assert.equal(uploadDate(renderer({ '.inline-metadata-item': [{ textContent: '2020-01-01' }] })).getFullYear(), 2020);
    assert.equal(uploadDate(renderer({ '#metadata-line': [{ textContent: '123 views • 2 years ago' }] })).getFullYear(), new Date().getFullYear() - 2);
});

function menuFixture() {
    const document = {
        documentElement: { lang: 'de' },
        activeElement: null,
        getElementById: () => null,
        createElement: tag => new Element(tag)
    };
    class Element {
        constructor(tag) {
            this.tag = tag;
            this.children = [];
            this.listeners = {};
            this.classList = { toggle() {} };
            this.valid = true;
        }
        setAttribute() {}
        append(...children) { this.children.push(...children); }
        appendChild(child) { this.children.push(child); }
        querySelector() { return null; }
        closest() { return null; }
        matches() { return false; }
        cloneNode() { return new Element(this.tag); }
        addEventListener(type, callback) { this.listeners[type] = callback; }
        focus() { document.activeElement = this; }
        blur() { if (document.activeElement === this) document.activeElement = null; }
        reportValidity() { return this.valid; }
    }
    const menu = new Element('menu');
    loadContent(document).createActionItem(menu);
    const item = menu.children.find(child => child.id === 'wvoytr-remove-by-date');
    const input = item.children.find(child => child.tag === 'input');
    return { document, item, input };
}

test('Enter confirms a valid date and moves focus out of the input', () => {
    const { document, item, input } = menuFixture();
    let stopped = false;
    let prevented = false;
    input.focus();
    input.value = '2026-08-01';
    input.listeners.keydown({ key: 'Enter', stopPropagation() { stopped = true; }, preventDefault() { prevented = true; } });
    assert.equal(document.activeElement, item);
    assert.equal(input.value, '2026-08-01');
    assert.ok(stopped && prevented);
});

test('incomplete dates and ordinary editing keys retain input focus', () => {
    const { document, input } = menuFixture();
    for (const [key, value, valid] of [['Enter', '', true], ['Enter', '2026-08-01', false], ['ArrowRight', '2026-08-01', true]]) {
        input.focus();
        input.value = value;
        input.valid = valid;
        input.listeners.keydown({ key, stopPropagation() {}, preventDefault() {} });
        assert.equal(document.activeElement, input);
    }
});
