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
        return new Promise((resolve, reject) => {
            const handleEvent = () => {
                console.log('actionsMenuReady!!!');
                document.removeEventListener('actionsMenuReady', handleEvent);
                resolve();
            }
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
            let text = delItem.querySelector('yt-formatted-string').textContent;
            let text2 = '';
            if (delItem2)
                text2 = delItem2.querySelector('yt-formatted-string').textContent;

            const item = document.createElement('div');
            item.setAttribute('id', 'delComplWatched')
            item.classList.add('wvoytr-action-menu-item');
            item.style.cursor = 'pointer';
            item.style.fontSize = '14px';
            item.style.padding = '8px 0';
            const logo = document.createElement('img');
            logo.src = chrome.runtime.getURL("images/icon16.png");

            delItem.parentElement.appendChild(item);

            let delComplWatchedVideosBtn = document.querySelector("#delComplWatched");
            delComplWatchedVideosBtn.style.display = 'flex';
            delComplWatchedVideosBtn.style.marginTop = '4px';

            const logoDiv = document.createElement('div');
            logoDiv.style.marginLeft = '22px';
            logoDiv.style.display = 'flex';
            logoDiv.style.justifyContent = 'center';
            logoDiv.style.alignItems = 'center';

            logoDiv.appendChild(logo);

            const textDiv = document.createElement('div');
            textDiv.style.marginLeft = '18px';
            textDiv.style.marginRight = '18px';
            textDiv.innerHTML = text == 'Videos hinzufügen' || text == 'Playlist löschen' || text2 == 'Gesehene Videos entfernen' ? 'Vollständig gesehene Videos entfernen' : 'Remove completely watched videos';

            delComplWatchedVideosBtn.appendChild(logoDiv);
            delComplWatchedVideosBtn.appendChild(textDiv);

            delComplWatchedVideosBtn.removeEventListener('tap', () => { }); // ontap gives an exeption but I can't remove it because th event listener comes from the webcomponent ytd-menu-service-item-renderer
            delComplWatchedVideosBtn.addEventListener('click', async () => {
                // await scrollPlaylist();
                list = document.querySelector("#contents .ytd-section-list-renderer").querySelector("#contents").querySelector("#contents").querySelectorAll("ytd-playlist-video-renderer")
                remove();
                document.querySelector("ytd-playlist-header-renderer").click(); // pseudo click to get focus back to the playlist and to make it scrollable again
            })
            document.querySelector('#delComplWatched').closest("ytd-menu-popup-renderer").style.maxWidth = '';
            document.querySelector('#delComplWatched').closest("ytd-menu-popup-renderer").style.maxHeight = '';
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
                attributeFilter: ['style']
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
        return new Promise(resolve => { setTimeout(resolve, ms); });
    }

    // async function scrollPlaylist() {
    //     let oldHeight = 0;
    //     let list = document.querySelector('ytd-playlist-video-list-renderer #contents');
    //     let newHeight = list.scrollHeight;
    //     while (newHeight > oldHeight) {
    //       await wait(500);
    //       oldHeight = newHeight;
    //       list.scrollTo(0, newHeight);
    //       await wait(5000);
    //       newHeight = list.scrollHeight;
    //     }
    //   }

    async function remove() {
        let list = document.querySelectorAll("ytd-playlist-video-renderer");
    
        let totalItemsToRemove = 0;
        for (let el of list) {
            let pgBar = el.querySelectorAll("#content")[0].querySelector("#progress");
            if (pgBar && pgBar.style.width.replace(/%/, "") >= "95") {
                totalItemsToRemove++;
            }
        }
    
        const progressBarContainer = document.querySelector('#progressBarContainer');
        progressBarContainer.style.display = 'block';
    
        let itemsProcessed = 0;
        for (let el of list) {
            let pgBar = el.querySelectorAll("#content")[0].querySelector("#progress");
            if (pgBar && pgBar.style.width.replace(/%/, "") >= "95") {
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

// function observeTitleChanges(callback) {
//     const titleElement = document.querySelector('head > title');

//     if (titleElement) {
//         const observer = new MutationObserver(mutations => {
//             callback();
//         });

//         observer.observe(titleElement, { childList: true });
//     }
// }

const regex = /^https:\/\/www\.youtube\.com\/playlist\?list=.+$/;
let isWatchLaterUrl = false;

function checkAndUpdate() {
    isWatchLaterUrl = false;    
    if (window.location.href === "https://www.youtube.com/playlist?list=WL") {
        createProgressBar();
        onWatchLaterUrl();
        isWatchLaterUrl = true;
    }
    else if (regex.test(window.location.href)) {
        createProgressBar();
        onWatchLaterUrl();
    } else {
        if (mutationObserver) {
            mutationObserver.disconnect();
        }

        // Remove menu item from other pages
        const delComplWatchedVideosBtn = document.querySelector("#delComplWatched");
        if (delComplWatchedVideosBtn) {
            delComplWatchedVideosBtn.remove();
        }
        actionsMenuReadyDispatched = false;
        waitAfterFirstElMatch = false;
    }
}

// Run the script if the current URL matches the Watch Later playlist
checkAndUpdate();

// Listen for URL changes and run the script if the URL matches the Watch Later playlist
//observeTitleChanges(checkAndUpdate);

// Select the node that will be observed for mutations
const targetNode = document.querySelector('title');

// Options for the observer (which mutations to observe)
const config = { childList: true };

// Callback function to execute when mutations are observed
const callback = function (mutationsList, observer) {
    // Use traditional 'for loops' for IE 11
    for (let mutation of mutationsList) {
        if (mutation.type === 'childList') {
            checkAndUpdate();
        }
    }
};

// Create an observer instance linked to the callback function
const observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
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

