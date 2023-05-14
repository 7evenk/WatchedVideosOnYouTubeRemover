let mutationObserver;
let actionsMenuReadyDispatched = false;
function onWatchLaterUrl() {
    mutationObserver = new MutationObserver(function (mutations) {
        const actionsMenuReady = new CustomEvent('actionsMenuReady');
        
        if (!actionsMenuReadyDispatched) {
            mutations.forEach(async function (mutation) {
                let el = mutation.target;
                if (mutation.target.tagName) {
                    if (el.querySelector('ytd-menu-popup-renderer > tp-yt-paper-listbox')) {
                        await wait(200);
                        document.dispatchEvent(actionsMenuReady);
                        actionsMenuReadyDispatched = true;
                        el.style.width = "400px";
                    }
                }
            });
        }
    });

    document.addEventListener('actionsMenuReady', async () => {
        await customizeActionsMenu();
    });

    function waitUntilActionsMenuIsReady() {
        return new Promise((resolve, reject) => {
            // resolve();
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
            let text2 = delItem2.querySelector('yt-formatted-string').textContent;

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
            textDiv.innerHTML = text == 'Videos hinzufügen' || text2 == 'Gesehene Videos entfernen' ? 'Vollständig gesehene Videos entfernen' : 'Remove completely watched videos';

            delComplWatchedVideosBtn.appendChild(logoDiv);
            delComplWatchedVideosBtn.appendChild(textDiv);

            delComplWatchedVideosBtn.removeEventListener('tap', () => { }); // ontap gives an exeption but I can't remove it because th event listener comes from the webcomponent ytd-menu-service-item-renderer
            delComplWatchedVideosBtn.addEventListener('click', async () => {
                // await scrollPlaylist();
                list = document.querySelector("#contents .ytd-section-list-renderer").querySelector("#contents").querySelector("#contents").querySelectorAll("ytd-playlist-video-renderer")
                remove();
                document.querySelector("ytd-playlist-header-renderer").click(); // pseudo click to get focus back to the playlist and to make it scrollable again
            })

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


    mutationObserver.observe(document.documentElement, {
        attributes: true,
        characterData: true,
        childList: true,
        subtree: true,
        attributeOldValue: true,
        characterDataOldValue: true
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
        for (let el of list) {
          let pgBar = el.querySelectorAll("#content")[0].querySelector("#progress");
          if (pgBar) {
            if (pgBar.style.width == "100%") {
              el.querySelector("#menu").querySelector("#interaction").click();
              await wait(500);
              if (document.querySelector("ytd-popup-container tp-yt-iron-dropdown").style.display == '') {
                document.querySelector("ytd-menu-popup-renderer").querySelector("tp-yt-paper-listbox").children[2].click();
              }
              await wait(1000);
            }
          }
        }
        document.querySelector("ytd-popup-container tp-yt-iron-dropdown").style.display = 'none';
      }
      


};

function observeTitleChanges(callback) {
    const titleElement = document.querySelector('head > title');

    if (titleElement) {
        const observer = new MutationObserver(mutations => {
            callback();
        });

        observer.observe(titleElement, { childList: true });
    }
}

function checkAndUpdate() {
    if (window.location.href === "https://www.youtube.com/playlist?list=WL") {
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
    }
}

// Run the script if the current URL matches the Watch Later playlist
checkAndUpdate();

// Listen for URL changes and run the script if the URL matches the Watch Later playlist
observeTitleChanges(checkAndUpdate);