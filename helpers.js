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
        const normalized = String(value || '').replace(/[\u200b-\u200f\u202a-\u202e]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
        if (!normalized) return null;

        const relativePatterns = [
            { names: 'seconds?|sekunden?|s', unit: 'seconds' },
            { names: 'minutes?|minuten?|m', unit: 'minutes' },
            { names: 'hours?|stunden?|h', unit: 'hours' },
            { names: 'days?|tag(?:e|en)?|d', unit: 'days' },
            { names: 'weeks?|wochen?|w', unit: 'weeks' },
            { names: 'months?|monat(?:e|en)?|mo', unit: 'months' },
            { names: 'years?|jahr(?:e|en)?|y', unit: 'years' }
        ];
        const germanNumbers = { einem: 1, einer: 1, zwei: 2, drei: 3, vier: 4, fünf: 5, sechs: 6, sieben: 7, acht: 8, neun: 9, zehn: 10, elf: 11, zwölf: 12 };
        const abbreviations = { seconds: 's', minutes: 'm', hours: 'h', days: 'd', weeks: 'w', months: 'mo', years: 'y' };
        {
            // Match the age and its amount together: view counts must not become ages.
            const amountPattern = `(?:\\d+|${Object.keys(germanNumbers).join('|')})`;
            for (const { names, unit } of relativePatterns) {
                const german = normalized.match(new RegExp(`\\bvor (${amountPattern})\\s*(?:${names})\\b`));
                const english = normalized.match(new RegExp(`\\b(\\d+)\\s*(?:${names})\\s+ago\\b`));
                const compact = normalized.match(new RegExp(`^(\\d+)\\s*${abbreviations[unit]}$`));
                const match = german || english || compact;
                if (!match) continue;
                const result = new Date(now);
                const amount = germanNumbers[match[1]] ?? Number(match[1]);
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
