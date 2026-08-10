(function (root) {
    'use strict';

    const REMOVE_LABELS = [
        'remove from', 'remove video', 'delete from',
        'aus entfernen', 'video entfernen', 'entfernen',
        'retirer de', 'supprimer de',
        'eliminar de', 'quitar de',
        'rimuovi da', 'remover de',
        'удалить из', 'usuń z', 'verwijderen uit'
    ];
    const PLAYLIST_MENU_LABELS = [
        'add videos', 'add all to', 'playlist settings', 'delete playlist',
        'videos hinzufügen', 'alle hinzufügen zu', 'playlist-einstellungen', 'playlist löschen'
    ];

    function parsePercentage(value) {
        const match = String(value || '').match(/(-?\d+(?:[.,]\d+)?)\s*%?/);
        if (!match) return null;
        const number = Number(match[1].replace(',', '.'));
        return Number.isFinite(number) ? number : null;
    }

    function clampThreshold(value, fallback = 100) {
        const parsed = parsePercentage(value);
        if (parsed === null) return fallback;
        return Math.min(100, Math.max(0, Math.round(parsed)));
    }

    function parseUploadDate(value, now = new Date()) {
        const normalized = String(value || '').trim().toLocaleLowerCase();
        if (!normalized) return null;

        const relativePatterns = [
            { pattern: /(\d+)\s*(?:seconds?|sekunden?|s\b)/, unit: 'seconds' },
            { pattern: /(\d+)\s*(?:minutes?|minuten?|m\b)/, unit: 'minutes' },
            { pattern: /(\d+)\s*(?:hours?|stunden?|h\b)/, unit: 'hours' },
            { pattern: /(\d+)\s*(?:days?|tagen?|d\b)/, unit: 'days' },
            { pattern: /(\d+)\s*(?:weeks?|wochen?|w\b)/, unit: 'weeks' },
            { pattern: /(\d+)\s*(?:months?|monaten?|mo\b)/, unit: 'months' },
            { pattern: /(\d+)\s*(?:years?|jahren?|y\b)/, unit: 'years' }
        ];
        if (normalized.includes('ago') || normalized.startsWith('vor ')) {
            for (const { pattern, unit } of relativePatterns) {
                const match = normalized.match(pattern);
                if (!match) continue;
                const result = new Date(now);
                const amount = Number(match[1]);
                if (unit === 'seconds') result.setSeconds(result.getSeconds() - amount);
                if (unit === 'minutes') result.setMinutes(result.getMinutes() - amount);
                if (unit === 'hours') result.setHours(result.getHours() - amount);
                if (unit === 'days') result.setDate(result.getDate() - amount);
                if (unit === 'weeks') result.setDate(result.getDate() - amount * 7);
                if (unit === 'months') result.setMonth(result.getMonth() - amount);
                if (unit === 'years') result.setFullYear(result.getFullYear() - amount);
                return result;
            }
        }

        const iso = normalized.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
        if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
        const german = normalized.match(/\b(\d{1,2})\.(\d{1,2})\.(\d{4})\b/);
        if (german) return new Date(Number(german[3]), Number(german[2]) - 1, Number(german[1]));
        const english = normalized.match(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2}),?\s+(\d{4})\b/);
        if (english) {
            const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
            return new Date(Number(english[3]), months.indexOf(english[1].slice(0, 3)), Number(english[2]));
        }
        return null;
    }

    function isRemoveMenuText(value) {
        const normalized = String(value || '').trim().toLocaleLowerCase();
        return REMOVE_LABELS.some((label) => normalized.includes(label));
    }

    function isPlaylistActionMenuText(value) {
        const normalized = String(value || '').trim().toLocaleLowerCase();
        return PLAYLIST_MENU_LABELS.some((label) => normalized.includes(label));
    }

    const api = { parsePercentage, clampThreshold, parseUploadDate, isPlaylistActionMenuText, isRemoveMenuText };
    root.WVOYTRHelpers = api;
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
