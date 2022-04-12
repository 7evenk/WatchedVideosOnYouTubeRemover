
var mutationObserver = new MutationObserver(function (mutations) {  
    const actionsMenuReady = new CustomEvent('actionsMenuReady');

    mutations.forEach(function (mutation) {
        let el = mutation.target;
        if (mutation.target.tagName) {
            if (el.querySelector('tp-yt-paper-listbox')){
                document.dispatchEvent(actionsMenuReady);
            }

            el = el.querySelector('#menu.ytd-playlist-sidebar-primary-info-renderer');
            el = el != null ? el.querySelector('ytd-menu-renderer') : null;
            el = el != null ? el.querySelector(':scope > yt-icon-button > button') : null;
            if (el) {
                console.log(mutation);
                el.addEventListener('click', customizeActionsMenu);
            }
        }
    });
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
    await waitUntilActionsMenuIsReady();

    let delComplWatchedAdded = document.querySelector('#delComplWatched') != null;
    if (!delComplWatchedAdded) {
        let delItem = document.querySelectorAll("ytd-menu-service-item-renderer")[document.querySelectorAll("ytd-menu-service-item-renderer").length - 1];
        let text = delItem.querySelector('yt-formatted-string').textContent;

        const item = document.createElement('div');
        item.setAttribute('id', 'delComplWatched')
        item.style.cursor = 'pointer';

        delItem.parentElement.appendChild(item);

        let delComplWatchedVideosBtn = document.querySelector("#delComplWatched");
        delComplWatchedVideosBtn.innerHTML = text == 'Gesehene Videos entfernen' ? 'Vollständig gesehene Videos entfernen' : 'Remove completely watched videos';
        // delComplWatchedVideosBtn.removeEventListener('tap', () => {}); // ontap gives an exeption but I can't remove it because th event listener comes from the webcomponent ytd-menu-service-item-renderer
        // delComplWatchedVideosBtn.addEventListener('click', () => {
        //     list = document.querySelector("#contents .ytd-section-list-renderer").querySelector("#contents").querySelector("#contents").querySelectorAll("ytd-playlist-video-renderer")
        //     remove();
        // })
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



// window.onload = () => {
//     let list;
//     const interval = setInterval(() => {
//         let actionsMenu = document.querySelector('ytd-playlist-sidebar-primary-info-renderer').querySelector('ytd-menu-renderer').querySelector(':scope > yt-icon-button');
//         if (actionsMenu) {
//             actionsMenu.addEventListener('click', () => {
//                 let delComplWatchedAdded = document.querySelector("ytd-menu-service-item-renderer#delComplWatched") != null;
//                 if (!delComplWatchedAdded) {
//                     let delItem = document.querySelectorAll("ytd-menu-service-item-renderer")[document.querySelectorAll("ytd-menu-service-item-renderer").length - 1];
//                     let svgClone = delItem.querySelector('svg').cloneNode(true);
//                     let text = delItem.querySelector('yt-formatted-string').textContent;

//                     // const item = document.createElement('ytd-menu-service-item-renderer');
//                     const item = document.createElement('div');
//                     item.setAttribute('id', 'delComplWatched')
//                     // item.setAttribute('use-icons', true);

//                     item.style.cursor = 'pointer';

//                     delItem.parentElement.appendChild(item);


//                     // let delComplWatchedVideosBtn = document.querySelector("ytd-menu-service-item-renderer#delComplWatched");
//                     let delComplWatchedVideosBtn = document.querySelector("#delComplWatched");
//                     // delComplWatchedVideosBtn.querySelector('yt-icon').appendChild(svgClone);
//                     // delComplWatchedVideosBtn.querySelector('yt-formatted-string').innerHTML = text == 'Gesehene Videos entfernen' ? 'Vollständig gesehene Videos entfernen' : 'Remove completely watched videos';
//                     delComplWatchedVideosBtn.innerHTML = text == 'Gesehene Videos entfernen' ? 'Vollständig gesehene Videos entfernen' : 'Remove completely watched videos';
//                     // delComplWatchedVideosBtn.removeEventListener('tap', () => {}); // ontap gives an exeption but I can't remove it because th event listener comes from the webcomponent ytd-menu-service-item-renderer
//                     delComplWatchedVideosBtn.addEventListener('click', () => {
//                         list = document.querySelector("#contents .ytd-section-list-renderer").querySelector("#contents").querySelector("#contents").querySelectorAll("ytd-playlist-video-renderer")
//                         remove();
//                     })
//                 }
//             });
//             clearInterval(interval);
//         }
//     }, 1000);

//     function wait(ms) {
//         return new Promise(resolve => { setTimeout(resolve, ms); });
//     }

//     async function remove() {

//         for (let el of list) {
//             let pgBar = el.querySelectorAll("#content")[0].querySelector("#progress");
//             if (pgBar) {
//                 if (pgBar.style.width == "100%") {
//                     debugger;
//                     el.querySelector("#menu").querySelector("#interaction").click();
//                     setTimeout(() => {
//                         if (document.querySelector("ytd-popup-container tp-yt-iron-dropdown").style.display == '') {
//                             debugger;
//                             document.querySelector("ytd-menu-popup-renderer").querySelector("tp-yt-paper-listbox").children[2].click();
//                         }
//                     }, 100);

//                     await wait(1000);
//                 };
//             }
//         }
//         document.querySelector("ytd-popup-container tp-yt-iron-dropdown").style.display = 'none';
//     }
// }


