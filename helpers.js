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

    function isRemoveMenuText(value) {
        const normalized = String(value || '').trim().toLocaleLowerCase();
        return REMOVE_LABELS.some((label) => normalized.includes(label));
    }

    const api = { parsePercentage, clampThreshold, isRemoveMenuText };
    root.WVOYTRHelpers = api;
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
