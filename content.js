(() => {
    'use strict';

    const helpers = globalThis.WVOYTRHelpers;
    const IDS = {
        action: 'wvoytr-remove-watched',
        dialog: 'wvoytr-dialog',
        dialogBackdrop: 'wvoytr-dialog-backdrop',
        progress: 'wvoytr-progress',
        progressBar: 'wvoytr-progress-bar',
        progressTitle: 'wvoytr-progress-title',
        progressText: 'wvoytr-progress-text',
        progressNote: 'wvoytr-progress-note',
        progressCancel: 'wvoytr-progress-cancel',
        toast: 'wvoytr-toast'
    };
    const SELECTORS = {
        popupContainer: 'ytd-popup-container',
        menuList: 'ytd-menu-popup-renderer tp-yt-paper-listbox',
        videos: 'ytd-playlist-video-renderer',
        videoMenuButton: '#menu #interaction, #menu button, ytd-menu-renderer button',
        progress: '#progress'
    };
    const MENU_WAIT_TIMEOUT = 5000;
    const DELETE_WAIT_TIMEOUT = 5000;
    const LAZY_LOAD_DELAY = 800;
    const MAX_LAZY_LOAD_ROUNDS = 300;
    const MAX_CONSECUTIVE_FAILURES = 3;
    const BETWEEN_REMOVALS_DELAY = 250;
    const TRANSLATIONS = {
        en: {
            action: 'Remove watched videos',
            threshold: 'Threshold',
            thresholdAria: 'Watched percentage threshold',
            dialogTitle: 'Remove watched videos?',
            dialogMessage: (threshold) => `The complete playlist will be loaded. All videos watched at least ${threshold}% will then be removed.`,
            cancel: 'Cancel',
            confirm: 'Remove videos',
            loadingTitle: 'Loading playlist',
            loading: (count, total) => total ? `${count} of ${total} videos loaded` : `${count} videos loaded`,
            loadingNote: 'YouTube is scrolling through the playlist automatically.',
            removingTitle: 'Removing watched videos',
            removing: (processed, total) => `${processed} of ${total} videos processed`,
            cancelling: 'Cancelling…',
            cancelled: 'Cleanup was cancelled.',
            noneFound: (threshold) => `No videos watched at least ${threshold}% were found.`,
            partialResult: (removed, failed) => `Removed ${removed} videos; ${failed} could not be removed.`,
            result: (removed) => `Removed ${removed} watched video${removed === 1 ? '' : 's'}.`,
            repeatedFailure: (failed) => `Cleanup stopped after ${failed} consecutive removal failures. Reload YouTube and try again.`,
            failed: 'Cleanup stopped because YouTube changed or did not finish loading.'
        },
        de: {
            action: 'Gesehene Videos entfernen',
            threshold: 'Schwellenwert',
            thresholdAria: 'Schwellenwert für den angesehenen Prozentsatz',
            dialogTitle: 'Gesehene Videos entfernen?',
            dialogMessage: (threshold) => `Die vollständige Playlist wird geladen. Anschließend werden alle Videos entfernt, die zu mindestens ${threshold} % angesehen wurden.`,
            cancel: 'Abbrechen',
            confirm: 'Videos entfernen',
            loadingTitle: 'Playlist wird geladen',
            loading: (count, total) => total ? `${count} von ${total} Videos geladen` : `${count} Videos geladen`,
            loadingNote: 'YouTube scrollt automatisch durch die Playlist.',
            removingTitle: 'Gesehene Videos werden entfernt',
            removing: (processed, total) => `${processed} von ${total} Videos verarbeitet`,
            cancelling: 'Wird abgebrochen…',
            cancelled: 'Die Bereinigung wurde abgebrochen.',
            noneFound: (threshold) => `Keine zu mindestens ${threshold} % angesehenen Videos gefunden.`,
            partialResult: (removed, failed) => `${removed} Videos entfernt; ${failed} konnten nicht entfernt werden.`,
            result: (removed) => `${removed} gesehene${removed === 1 ? 's Video' : ' Videos'} entfernt.`,
            repeatedFailure: (failed) => `Die Bereinigung wurde nach ${failed} aufeinanderfolgenden Fehlern beendet. Lade YouTube neu und versuche es erneut.`,
            failed: 'Die Bereinigung wurde abgebrochen, weil YouTube geändert wurde oder nicht vollständig geladen hat.'
        }
    };

    let popupObserver;
    let navigationObserver;
    let running = false;
    let cancelRequested = false;

    function strings() {
        const language = (document.documentElement.lang || navigator.language || 'en').toLowerCase();
        return language.startsWith('de') ? TRANSLATIONS.de : TRANSLATIONS.en;
    }

    function isPlaylistPage(url = location.href) {
        try {
            const parsed = new URL(url);
            return parsed.hostname === 'www.youtube.com' &&
                parsed.pathname === '/playlist' &&
                Boolean(parsed.searchParams.get('list'));
        } catch {
            return false;
        }
    }

    function isWatchLaterPage() {
        return new URL(location.href).searchParams.get('list') === 'WL';
    }

    function wait(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    function visibleMenuLists() {
        return Array.from(document.querySelectorAll(SELECTORS.menuList))
            .filter((list) => list.offsetParent !== null);
    }

    function closeVisibleMenus() {
        for (const list of visibleMenuLists()) {
            const dropdown = list.closest('tp-yt-iron-dropdown');
            if (typeof dropdown?.close === 'function') dropdown.close();
        }
        document.dispatchEvent(new KeyboardEvent('keydown', {
            key: 'Escape',
            code: 'Escape',
            bubbles: true
        }));
    }

    async function closeMenusAndWait(timeout = 1000) {
        closeVisibleMenus();
        const startedAt = Date.now();
        while (visibleMenuLists().length && Date.now() - startedAt < timeout) {
            await wait(50);
        }
        if (visibleMenuLists().length) throw new Error('Could not close the previous menu');
    }

    function waitForNewVisibleMenu(previousMenus, timeout = MENU_WAIT_TIMEOUT) {
        const startedAt = Date.now();
        return new Promise((resolve, reject) => {
            const check = () => {
                const menu = visibleMenuLists().find((list) => !previousMenus.has(list));
                if (menu) return resolve(menu);
                if (Date.now() - startedAt >= timeout) {
                    reject(new Error('Timed out waiting for the video menu'));
                    return;
                }
                requestAnimationFrame(check);
            };
            check();
        });
    }

    function waitForElement(selector, { root = document, timeout = MENU_WAIT_TIMEOUT } = {}) {
        const existing = root.querySelector(selector);
        if (existing) return Promise.resolve(existing);

        return new Promise((resolve, reject) => {
            const observer = new MutationObserver(() => {
                const element = root.querySelector(selector);
                if (element) {
                    clearTimeout(timer);
                    observer.disconnect();
                    resolve(element);
                }
            });
            const timer = setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Timed out waiting for ${selector}`));
            }, timeout);
            observer.observe(root === document ? document.documentElement : root, {
                childList: true,
                subtree: true
            });
        });
    }

    function createActionItem(menuList) {
        if (menuList.querySelector(`#${IDS.action}`) || document.getElementById(IDS.action)) return;

        const popupRenderer = menuList.closest('ytd-menu-popup-renderer');
        const dropdown = popupRenderer?.closest('tp-yt-iron-dropdown');
        popupRenderer?.classList.add('wvoytr-expanded-menu');
        dropdown?.classList.add('wvoytr-expanded-dropdown');

        const item = document.createElement('div');
        item.id = IDS.action;
        item.className = 'wvoytr-action-menu-item';
        item.setAttribute('role', 'menuitem');
        item.tabIndex = 0;

        const icon = document.createElement('img');
        icon.src = chrome.runtime.getURL('images/icon16.png');
        icon.alt = '';
        icon.className = 'wvoytr-action-icon';

        const label = document.createElement('span');
        label.className = 'wvoytr-action-label';
        label.textContent = strings().action;

        const thresholdGroup = document.createElement('label');
        thresholdGroup.className = 'wvoytr-threshold';
        thresholdGroup.textContent = strings().threshold;

        const threshold = document.createElement('input');
        threshold.type = 'number';
        threshold.min = '0';
        threshold.max = '100';
        threshold.step = '1';
        threshold.value = '95';
        threshold.setAttribute('aria-label', strings().thresholdAria);

        const unit = document.createElement('span');
        unit.textContent = '%';

        thresholdGroup.append(threshold, unit);
        item.append(icon, label, thresholdGroup);
        menuList.appendChild(item);

        threshold.addEventListener('click', (event) => event.stopPropagation());
        threshold.addEventListener('keydown', (event) => event.stopPropagation());
        item.addEventListener('click', () => {
            closeVisibleMenus();
            startCleanup(threshold);
        });
        item.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                closeVisibleMenus();
                startCleanup(threshold);
            }
        });

        // YouTube measures the popup before extensions can add their entries.
        // Refit it after our wider content has participated in layout.
        requestAnimationFrame(() => {
            if (typeof dropdown?.refit === 'function') dropdown.refit();
        });
    }

    function inspectPopup() {
        if (!isPlaylistPage()) return;
        const lists = document.querySelectorAll(SELECTORS.menuList);
        for (const list of lists) {
            if (list.offsetParent !== null) createActionItem(list);
        }
    }

    function observePopup() {
        const popupContainer = document.querySelector(SELECTORS.popupContainer);
        if (!popupContainer) return;
        popupObserver?.disconnect();
        popupObserver = new MutationObserver(inspectPopup);
        popupObserver.observe(popupContainer, { childList: true, subtree: true });
        inspectPopup();
    }

    function createStatusUi() {
        if (!document.getElementById(IDS.progress)) {
            const container = document.createElement('div');
            container.id = IDS.progress;
            container.hidden = true;
            container.setAttribute('role', 'status');
            container.setAttribute('aria-live', 'polite');

            const header = document.createElement('div');
            header.className = 'wvoytr-progress-header';
            const title = document.createElement('strong');
            title.id = IDS.progressTitle;
            const cancelButton = document.createElement('button');
            cancelButton.id = IDS.progressCancel;
            cancelButton.type = 'button';
            cancelButton.addEventListener('click', () => {
                cancelRequested = true;
                cancelButton.disabled = true;
                cancelButton.textContent = strings().cancelling;
            });
            header.append(title, cancelButton);

            const text = document.createElement('div');
            text.id = IDS.progressText;
            const track = document.createElement('div');
            track.className = 'wvoytr-progress-track';
            const bar = document.createElement('div');
            bar.id = IDS.progressBar;
            track.appendChild(bar);
            const note = document.createElement('div');
            note.id = IDS.progressNote;
            container.append(header, text, track, note);
            document.body.appendChild(container);
        }
        if (!document.getElementById(IDS.toast)) {
            const toast = document.createElement('div');
            toast.id = IDS.toast;
            toast.hidden = true;
            toast.setAttribute('role', 'status');
            toast.setAttribute('aria-live', 'polite');
            document.body.appendChild(toast);
        }
    }

    function confirmCleanup(threshold) {
        const copy = strings();
        const previousFocus = document.activeElement;
        document.getElementById(IDS.dialogBackdrop)?.remove();

        const backdrop = document.createElement('div');
        backdrop.id = IDS.dialogBackdrop;

        const dialog = document.createElement('div');
        dialog.id = IDS.dialog;
        dialog.setAttribute('role', 'dialog');
        dialog.setAttribute('aria-modal', 'true');
        dialog.setAttribute('aria-labelledby', 'wvoytr-dialog-title');
        dialog.setAttribute('aria-describedby', 'wvoytr-dialog-message');

        const title = document.createElement('h2');
        title.id = 'wvoytr-dialog-title';
        title.textContent = copy.dialogTitle;

        const message = document.createElement('p');
        message.id = 'wvoytr-dialog-message';
        message.textContent = copy.dialogMessage(threshold);

        const actions = document.createElement('div');
        actions.className = 'wvoytr-dialog-actions';
        const cancelButton = document.createElement('button');
        cancelButton.type = 'button';
        cancelButton.className = 'wvoytr-dialog-cancel';
        cancelButton.textContent = copy.cancel;
        const confirmButton = document.createElement('button');
        confirmButton.type = 'button';
        confirmButton.className = 'wvoytr-dialog-confirm';
        confirmButton.textContent = copy.confirm;
        actions.append(cancelButton, confirmButton);
        dialog.append(title, message, actions);
        backdrop.appendChild(dialog);
        document.body.appendChild(backdrop);

        return new Promise((resolve) => {
            function finish(confirmed) {
                document.removeEventListener('keydown', handleKeydown, true);
                backdrop.remove();
                if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
                resolve(confirmed);
            }
            function handleKeydown(event) {
                if (event.key === 'Escape') {
                    event.preventDefault();
                    finish(false);
                } else if (event.key === 'Tab') {
                    const target = document.activeElement === confirmButton ? cancelButton : confirmButton;
                    event.preventDefault();
                    target.focus();
                }
            }
            cancelButton.addEventListener('click', () => finish(false), { once: true });
            confirmButton.addEventListener('click', () => finish(true), { once: true });
            backdrop.addEventListener('click', (event) => {
                if (event.target === backdrop) finish(false);
            });
            document.addEventListener('keydown', handleKeydown, true);
            confirmButton.focus();
        });
    }

    function updateProgress(processed, total, message, phase = 'removing') {
        createStatusUi();
        const copy = strings();
        const container = document.getElementById(IDS.progress);
        const percentage = total ? Math.round((processed / total) * 100) : 0;
        container.hidden = false;
        container.dataset.phase = phase;
        document.getElementById(IDS.progressBar).style.width = `${percentage}%`;
        document.getElementById(IDS.progressText).textContent = message || `${processed} / ${total}`;
        document.getElementById(IDS.progressTitle).textContent = phase === 'loading' ? copy.loadingTitle : copy.removingTitle;
        document.getElementById(IDS.progressNote).textContent = phase === 'loading' ? copy.loadingNote : '';
        const cancelButton = document.getElementById(IDS.progressCancel);
        cancelButton.textContent = cancelRequested ? copy.cancelling : copy.cancel;
        cancelButton.disabled = cancelRequested;
    }

    function hideProgress() {
        const progress = document.getElementById(IDS.progress);
        if (progress) progress.hidden = true;
    }

    function showToast(message, isError = false) {
        createStatusUi();
        const toast = document.getElementById(IDS.toast);
        toast.textContent = message;
        toast.classList.toggle('wvoytr-error', isError);
        toast.hidden = false;
        clearTimeout(showToast.timer);
        showToast.timer = setTimeout(() => { toast.hidden = true; }, 6000);
    }

    function getLoadedVideos() {
        return Array.from(document.querySelectorAll(SELECTORS.videos));
    }

    function getExpectedPlaylistCount() {
        const header = document.querySelector('ytd-playlist-header-renderer');
        if (!header) return null;
        const text = header.textContent || '';
        const match = text.match(/([\d.,\s]+)\s+(?:videos?|Videos?)/);
        if (!match) return null;
        const count = Number(match[1].replace(/\D/g, ''));
        return Number.isFinite(count) && count > 0 ? count : null;
    }

    async function loadAllPlaylistVideos() {
        const originalScrollY = window.scrollY;
        const expectedCount = getExpectedPlaylistCount();
        let previousCount = -1;
        let stableRounds = 0;

        for (let round = 0; round < MAX_LAZY_LOAD_ROUNDS && stableRounds < 6; round++) {
            if (cancelRequested) break;
            const count = getLoadedVideos().length;
            updateProgress(0, 0, strings().loading(count, expectedCount), 'loading');
            if (expectedCount && count >= expectedCount) break;
            stableRounds = count === previousCount ? stableRounds + 1 : 0;
            previousCount = count;
            window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'auto' });
            await wait(LAZY_LOAD_DELAY);
        }

        window.scrollTo({ top: originalScrollY, behavior: 'auto' });
        await wait(150);
        return { videos: getLoadedVideos(), cancelled: cancelRequested };
    }

    function watchedPercentage(video) {
        const progress = video.querySelector(SELECTORS.progress);
        if (!progress) return null;
        return helpers.parsePercentage(progress.style.width || progress.getAttribute('style'));
    }

    function findRemoveCommand(menuList) {
        const serviceItems = Array.from(menuList.querySelectorAll('ytd-menu-service-item-renderer'));
        const navigationItems = Array.from(menuList.querySelectorAll('ytd-menu-navigation-item-renderer'));
        const candidates = [...serviceItems, ...navigationItems]
            .filter((item) => item.id !== IDS.action && item.offsetParent !== null);

        return candidates.find((item) => helpers.isRemoveMenuText(item.textContent)) || null;
    }

    async function removeVideo(video) {
        video.scrollIntoView({ block: 'center', behavior: 'auto' });
        await wait(100);

        const menuButton = video.querySelector(SELECTORS.videoMenuButton);
        if (!menuButton) throw new Error('Video menu button not found');

        await closeMenusAndWait();
        const previousMenus = new Set(visibleMenuLists());
        menuButton.click();

        const menuList = await waitForNewVisibleMenu(previousMenus);
        const removeCommand = findRemoveCommand(menuList);
        if (!removeCommand) throw new Error('Remove command not found');

        removeCommand.click();
        await new Promise((resolve, reject) => {
            const observer = new MutationObserver(() => {
                if (!video.isConnected) {
                    clearTimeout(timer);
                    observer.disconnect();
                    resolve();
                }
            });
            const timer = setTimeout(() => {
                observer.disconnect();
                reject(new Error('Video was not removed before timeout'));
            }, DELETE_WAIT_TIMEOUT);
            observer.observe(video.parentElement || document.body, { childList: true, subtree: true });
        });
    }

    async function startCleanup(thresholdInput) {
        if (running) return;
        const threshold = helpers.clampThreshold(thresholdInput.value, 95);
        thresholdInput.value = String(threshold);

        if (!await confirmCleanup(threshold)) return;

        running = true;
        cancelRequested = false;
        popupObserver?.disconnect();
        let removed = 0;
        let failed = 0;
        let consecutiveFailures = 0;
        try {
            const loadResult = await loadAllPlaylistVideos();
            if (loadResult.cancelled) {
                showToast(strings().cancelled);
                return;
            }
            const loadedVideos = loadResult.videos;
            const targets = loadedVideos.filter((video) => {
                const percentage = watchedPercentage(video);
                return percentage !== null && percentage >= threshold;
            });

            if (!targets.length) {
                showToast(strings().noneFound(threshold));
                return;
            }

            for (const video of targets) {
                if (cancelRequested) break;
                if (!video.isConnected) continue;
                updateProgress(
                    removed + failed,
                    targets.length,
                    strings().removing(removed + failed, targets.length)
                );
                try {
                    await removeVideo(video);
                    removed++;
                    consecutiveFailures = 0;
                } catch (error) {
                    console.warn('[WVOYTR] Could not remove a video:', error);
                    failed++;
                    consecutiveFailures++;
                    closeVisibleMenus();
                    if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
                        showToast(strings().repeatedFailure(consecutiveFailures), true);
                        return;
                    }
                }
                await wait(BETWEEN_REMOVALS_DELAY);
            }

            if (cancelRequested) {
                showToast(strings().cancelled);
                return;
            }
            updateProgress(targets.length, targets.length, strings().removing(targets.length, targets.length));
            showToast(
                failed
                    ? strings().partialResult(removed, failed)
                    : strings().result(removed),
                failed > 0
            );
        } catch (error) {
            console.error('[WVOYTR] Cleanup failed:', error);
            showToast(strings().failed, true);
        } finally {
            running = false;
            if (isPlaylistPage()) observePopup();
            setTimeout(hideProgress, 800);
        }
    }

    function syncWithNavigation() {
        document.getElementById(IDS.action)?.remove();
        if (!isPlaylistPage()) {
            popupObserver?.disconnect();
            hideProgress();
            return;
        }
        createStatusUi();
        observePopup();
    }

    function init() {
        syncWithNavigation();
        document.addEventListener('yt-navigate-finish', syncWithNavigation);
        navigationObserver = new MutationObserver(() => {
            if (isPlaylistPage() && !popupObserver) observePopup();
        });
        navigationObserver.observe(document.documentElement, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
