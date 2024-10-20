let mutationObserver;
let actionsMenuReadyDispatched = false;
let waitAfterFirstElMatch = false;
const actionsMenuReady = new CustomEvent('actionsMenuReady');

function onWatchLaterUrl() {
    mutationObserver = new MutationObserver(function (mutations) {
        mutations.forEach(async function (mutation, index) {
            if (actionsMenuReadyDispatched && !document.querySelector('#delComplWatched'))
                actionsMenuReadyDispatched = false;
            if (!actionsMenuReadyDispatched) {
                let actionMenu = null;
                let queriedElement = elementToObserve.querySelector('ytd-menu-popup-renderer > tp-yt-paper-listbox');
                if (isWatchLaterUrl) {
                    if (queriedElement && queriedElement.lastElementChild && queriedElement.lastElementChild.tagName == 'YTD-MENU-NAVIGATION-ITEM-RENDERER') {
                        actionMenu = queriedElement;
                    }
                } else {
                    if (queriedElement && queriedElement.lastElementChild && queriedElement.childElementCount == 5) {
                        actionMenu = queriedElement;
                    }
                }
                if (actionMenu) {
                    document.dispatchEvent(actionsMenuReady);
                    actionsMenuReadyDispatched = true;
                }
            }
        });
    });

    document.addEventListener('actionsMenuReady', async () => {
        await customizeActionsMenu();
    });

    function waitUntilActionsMenuIsReady() {
        return new Promise((resolve) => {
            const handleEvent = () => {
                console.log('actionsMenuReady!!!');
                document.removeEventListener('actionsMenuReady', handleEvent);
                resolve();
            };
            document.addEventListener('actionsMenuReady', handleEvent);
        });
    }

    async function customizeActionsMenu() {
        observeMenuPopupRenderer();
        await waitUntilActionsMenuIsReady();

        let delComplWatchedAdded = document.querySelector('#delComplWatched') != null;
        if (!delComplWatchedAdded) {
            let delItem = document.querySelectorAll("ytd-menu-service-item-renderer")[document.querySelectorAll("ytd-menu-service-item-renderer").length - 1];
            let delItem2 = document.querySelectorAll("ytd-menu-navigation-item-renderer")[document.querySelectorAll("ytd-menu-navigation-item-renderer").length - 1];
            let text = '';
            if (delItem)
                text = delItem.querySelector('yt-formatted-string').textContent;
            let text2 = '';
            if (delItem2)
                text2 = delItem2.querySelector('yt-formatted-string').textContent;

            const item = document.createElement('div');
            item.setAttribute('id', 'delComplWatched');
            item.classList.add('wvoytr-action-menu-item');
            item.style.cursor = 'pointer';
            item.style.fontSize = '14px';
            item.style.padding = '4px 0';
            item.style.overflow = 'hidden';
            item.style.alignItems = 'center';
            const logo = document.createElement('img');
            logo.src = chrome.runtime.getURL("images/icon16.png");

            if (delItem) {
                delItem.parentElement.appendChild(item);
            } else if (delItem2) {
                delItem2.parentElement.appendChild(item);
            }

            let delComplWatchedVideosBtn = document.querySelector("#delComplWatched");
            delComplWatchedVideosBtn.style.display = 'flex';
            delComplWatchedVideosBtn.style.marginTop = '2px';

            const logoDiv = document.createElement('div');
            logoDiv.style.marginLeft = '8px';
            logoDiv.style.display = 'flex';
            //logoDiv.style.justifyContent = 'center';
            //logoDiv.style.alignItems = 'center';
            logoDiv.appendChild(logo);

            const textDiv = document.createElement('div');
            textDiv.style.marginLeft = '8px';
            textDiv.style.marginRight = '8px';
            textDiv.style.whiteSpace = 'nowrap';
            textDiv.innerHTML = text === 'Videos hinzufügen' || text === 'Playlist löschen' || text2 === 'Gesehene Videos entfernen' ? 'Vollständig gesehene Videos entfernen' : 'Remove completely watched videos';

            delComplWatchedVideosBtn.appendChild(logoDiv);
            delComplWatchedVideosBtn.appendChild(textDiv);

            // Input field for percentage threshold
            const percentageInputDiv = document.createElement('div');
            percentageInputDiv.style.display = 'flex';
            percentageInputDiv.style.alignItems = 'center';
            percentageInputDiv.style.marginLeft = '8px';
            percentageInputDiv.style.marginRight = '8px';
            percentageInputDiv.style.marginTop = '0';

            // Label for the input
            const percentageLabel = document.createElement('span');
            percentageLabel.innerHTML = 'Threshold: ';
            percentageLabel.style.marginRight = '8px'; 

            // Input field for percentage
            const percentageInput = document.createElement('input');
            percentageInput.type = 'number';
            percentageInput.min = '0';
            percentageInput.max = '100';
            percentageInput.value = '100';
            percentageInput.style.width = '50px';
            percentageInput.style.padding = '4px';
            percentageInput.style.margin = '0'; 
            percentageInput.style.boxSizing = 'border-box';
            percentageInput.style.height = 'auto';
            
            // Unit for percentage
            const percentageUnit = document.createElement('span');
            percentageUnit.innerHTML = '%';
            percentageUnit.style.marginLeft = '8px';
            percentageUnit.style.marginRight = '4px';

            // Append elements
            percentageInputDiv.appendChild(percentageLabel);
            percentageInputDiv.appendChild(percentageInput);
            percentageInputDiv.appendChild(percentageUnit);

            // Append the percentage div to the main container
            delComplWatchedVideosBtn.appendChild(percentageInputDiv);

            // Event listener for removing videos
            delComplWatchedVideosBtn.addEventListener('click', async (event) => {
                if (event.target === percentageInput || event.target === percentageLabel) {
                    event.stopPropagation();
                    return;
                }

                const userPercentage = parseInt(percentageInput.value, 10) || 100;
                console.log(`Removing videos watched at least ${userPercentage}%`);

                list = document.querySelector("#contents .ytd-section-list-renderer").querySelector("#contents").querySelector("#contents").querySelectorAll("ytd-playlist-video-renderer");

                remove(userPercentage);

                document.querySelector("ytd-playlist-header-renderer").click();
            });

            // Use MutationObserver to remove max-width after the element is rendered
            const popupRenderer = document.querySelector("ytd-menu-popup-renderer");
            const popupObserver = new MutationObserver(function (mutations) {
                mutations.forEach((mutation) => {
                    if (mutation.attributeName === "style" && popupRenderer.style.maxWidth) {
                        popupRenderer.style.maxWidth = 'none'; // Remove the max-width
                    }
                });
            });

            // Observe changes to the styles of the popup renderer
            popupObserver.observe(popupRenderer, { attributes: true });
        }
    }

    function observeMenuPopupRenderer() {
        const menuPopupRendererObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const target = mutation.target;
                    if (target.style.maxHeight !== '') {
                        target.style.maxHeight = '';
                    }
                }
            }
        });

        const menuPopupRenderer = document.querySelector('ytd-menu-popup-renderer');
        if (menuPopupRenderer) {
            menuPopupRendererObserver.observe(menuPopupRenderer, {
                attributes: true,
                attributeFilter: ['style'],
            });
        }
    }

    let elementToObserve = document.querySelector('ytd-popup-container');
    mutationObserver.observe(elementToObserve, {
        attributes: true,
        childList: true,
        subtree: true,
    });

    function wait(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async function remove(userPercentage) {
        let list = document.querySelectorAll("ytd-playlist-video-renderer");

        let totalItemsToRemove = 0;
        for (let el of list) {
            let pgBar = el.querySelectorAll("#content")[0].querySelector("#progress");
            if (pgBar && parseFloat(pgBar.style.width) >= userPercentage) {
                totalItemsToRemove++;
            }
        }

        const progressBarContainer = document.querySelector('#progressBarContainer');
        progressBarContainer.style.display = 'block';

        let itemsProcessed = 0;
        for (let el of list) {
            let pgBar = el.querySelectorAll("#content")[0].querySelector("#progress");
            if (pgBar && parseFloat(pgBar.style.width) >= userPercentage) {
                el.querySelector("#menu").querySelector("#interaction").click();
                await wait(500);
                if (document.querySelector("ytd-popup-container tp-yt-iron-dropdown").style.display == '') {
                    if (isWatchLaterUrl) {
                        document.querySelector("ytd-menu-popup-renderer").querySelector("tp-yt-paper-listbox").children[2].click();
                    } else {
                        document.querySelector("ytd-menu-popup-renderer").querySelector("tp-yt-paper-listbox").children[3].click();
                    }
                }
                await wait(1000);
                itemsProcessed++;
                updateProgressBar((itemsProcessed / totalItemsToRemove) * 100);
            }
        }
        document.querySelector("ytd-popup-container tp-yt-iron-dropdown").style.display = 'none';
        hideProgressBar();
    }
}

const regex = /^https:\/\/www\.youtube\.com\/playlist\?list=.+$/;
let isWatchLaterUrl = false;

function checkAndUpdate() {
    isWatchLaterUrl = false;
    if (window.location.href === "https://www.youtube.com/playlist?list=WL") {
        createProgressBar();
        onWatchLaterUrl();
        isWatchLaterUrl = true;
    } else if (regex.test(window.location.href)) {
        createProgressBar();
        onWatchLaterUrl();
    } else {
        if (mutationObserver) {
            mutationObserver.disconnect();
        }

        const delComplWatchedVideosBtn = document.querySelector("#delComplWatched");
        if (delComplWatchedVideosBtn) {
            delComplWatchedVideosBtn.remove();
        }
        actionsMenuReadyDispatched = false;
        waitAfterFirstElMatch = false;
    }
}

checkAndUpdate();

const targetNode = document.querySelector('title');
const config = { childList: true };

const callback = function (mutationsList, observer) {
    for (let mutation of mutationsList) {
        if (mutation.type === 'childList') {
            checkAndUpdate();
        }
    }
};

const observer = new MutationObserver(callback);
observer.observe(targetNode, config);

function createProgressBar() {
    if (document.querySelector('#progressBarContainer')) {
        return;
    }

    const progressBarContainer = document.createElement('div');
    progressBarContainer.style.position = 'fixed';
    progressBarContainer.style.top = '0';
    progressBarContainer.style.left = '0';
    progressBarContainer.style.width = '100%';
    progressBarContainer.style.height = '5px';
    progressBarContainer.style.backgroundColor = '#ddd';
    progressBarContainer.style.zIndex = '9999';
    progressBarContainer.style.display = 'none';
    progressBarContainer.id = 'progressBarContainer';

    const progressBar = document.createElement('div');
    progressBar.style.height = '5px';
    progressBar.style.width = '0%';
    progressBar.style.backgroundColor = '#4CAF50';
    progressBar.id = 'progressBar';

    progressBarContainer.appendChild(progressBar);
    document.body.appendChild(progressBarContainer);
}

function updateProgressBar(percentage) {
    const progressBar = document.querySelector('#progressBar');
    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
    }
}

function hideProgressBar() {
    const progressBarContainer = document.querySelector('#progressBarContainer');
    if (progressBarContainer) {
        progressBarContainer.style.display = 'none';
    }
}
