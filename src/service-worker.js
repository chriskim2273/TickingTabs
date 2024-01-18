let createdTabs = {}
let TabIdRecord = [];

const TIME_BEFORE_CLOSE = 5000;
const AMT_TABS_IN_RECORD = 10;

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    switch (message.action) {
        case 'getTabs':
            chrome.runtime.sendMessage({ action: 'sendTabs', tabInfo: createdTabs });
            break;
    }
});


chrome.commands.onCommand.addListener(function (command) {
    switch (command) {
        case "open_new_tab":
            chrome.tabs.create({ url: 'http://www.google.com' }, function (tab) {
                createdTabs[tab.id] = null;
            });
            break;
        case "perpetuate_tab":
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                let tabId = tabs[0].id;
                pauseTimer(tabId);
                if (tabId in createdTabs) {
                    delete createdTabs[tabId];
                }
                console.log("Perpetuated Tab: " + tabId);
            });
            break;
    }
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
        //console.log("COMPLETE");
        //resetTimer(tabId);
        ;
    }
});



chrome.tabs.onActivated.addListener(function (activeInfo) {
    //pauseTimer(lastTabId);
    //lastTabId = activeInfo.tabId;
    //pauseTimer(activeInfo.tabId)
    //console.log(activeInfo);
    // Pause the timer if it exists for the tab
    let tabId = activeInfo.tabId;
    pauseTimer(tabId);
    let lastTabId = TabIdRecord[TabIdRecord.length - 1];
    if (tabId && lastTabId && tabId != lastTabId && createdTabs?.lastTabId == undefined) {
        startTimer(lastTabId);
    }
    if (TabIdRecord.length > AMT_TABS_IN_RECORD) {
        TabIdRecord = [];
    }
    TabIdRecord.push(tabId);
});
/*
chrome.windows.onFocusChanged.addListener(function (windowId) {
    chrome.tabs.query({ active: true, windowId: windowId }, function (tabs) {
        if (tabs[0]) {
            resetTimer(tabs[0].id);
        }
    });
});
*/
function startTimer(tabId) {
    if (tabId in createdTabs) {
        console.log("Started timer: " + tabId);
        createdTabs[tabId] = setTimeout(function () {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                const tab = tabs[0];
                chrome.tabs.remove(tabId);
                delete createdTabs[tabId];
                chrome.runtime.sendMessage({ action: 'tabRemoved', tabInfo: tab });
            });
        }, TIME_BEFORE_CLOSE);
    }
}

function resetTimer(tabId) {
    if (tabId in createdTabs) {
        console.log("Reset");
        clearTimeout(createdTabs[tabId]);
        startTimer(tabId);
    }
}

function pauseTimer(tabId) {
    if (tabId in createdTabs) {
        console.log("Paused: " + tabId);
        clearTimeout(createdTabs[tabId]);
    }
}
