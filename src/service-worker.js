let createdTabs = {}
let TabIdRecord = [];
let tabHistory = {}

let TIME_BEFORE_CLOSE = 30000;
const AMT_TABS_IN_RECORD = 10;
let URL = "https://www.bing.com"
let STAY_AWAKE_TIMER = undefined;

chrome.storage.local.get(null, function (data) {
    if (data.urlToOpen !== undefined) {
        URL = data.urlToOpen;
    }
    if (data.savedTime !== undefined) {
        TIME_BEFORE_CLOSE = data.savedTime;
    }
    if (data.tabHistory !== undefined) {
        tabHistory = data.tabHistory;
    }
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    switch (message.action) {
        case 'getTabs':
            chrome.runtime.sendMessage({ action: 'sendTabs', tabInfo: createdTabs });
            break;
        case 'getTabsHistory':
            chrome.runtime.sendMessage({ action: 'sendTabHistory', tabInfo: tabHistory });
            break;
        case 'updateUrlToOpen':
            URL = message.urlToOpen;
            break;
        case 'updateTabTime':
            TIME_BEFORE_CLOSE = message.time;
            console.log(TIME_BEFORE_CLOSE);
            break;
        case 'log':
            console.log(message.message);
            break;
        case 'wakeUp':
            console.log("Good morning!");
            break;
        case 'openTab':
            chrome.tabs.create({ url: message.url }, function (tab) {
            });
            break;
    }
});


chrome.commands.onCommand.addListener(function (command) {
    console.log(command);
    switch (command) {
        case "open_new_tab":
            chrome.tabs.create({ url: URL }, function (tab) {
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
        case "tick_tab":
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                let tabId = tabs[0].id;
                createdTabs[tabId] = null;
            });
    }
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
        //console.log("COMPLETE");
        //resetTimer(tabId);
        ;
    }
});

const PropogateTabs = (tabId, lastTabId) => {
    pauseTimer(tabId);
    if (tabId && lastTabId && tabId != lastTabId && createdTabs?.lastTabId == undefined) {
        startTimer(lastTabId);
    }
    if (TabIdRecord.length > AMT_TABS_IN_RECORD) {
        TabIdRecord = [];
    }
    TabIdRecord.push(tabId);
}

chrome.tabs.onActivated.addListener(function (activeInfo) {
    // Pause the timer if it exists for the tab
    let { tabId } = activeInfo;
    let lastTabId = TabIdRecord[TabIdRecord.length - 1];
    PropogateTabs(tabId, lastTabId);
});

/*
chrome.windows.onFocusChanged.addListener(function (windowId) {
    chrome.tabs.query({ active: true, windowId: windowId }, function (tabs) {
        let tabId = tabs[0];
        let lastTabId = TabIdRecord[TabIdRecord.length - 1];
        PropogateTabs(tabId, lastTabId);
    });
});
*/

function startTimer(tabId) {
    if (tabId in createdTabs) {
        console.log("Started timer: " + tabId);

        createdTabs[tabId] = setTimeout(function () {
            chrome.tabs.get(tabId, function (tab) {
                try { chrome.tabs.remove(tabId); } catch (err) { } // may be causing an error with tab history
                delete createdTabs[tabId];
                tabHistory[tabId] = tab;
                checkTimer();
                chrome.storage.local.set({ 'tabHistory': JSON.stringify(tabHistory) }, function () {
                    console.log('Tab History is set to ' + JSON.stringify(tabHistory));
                });
                //chrome.runtime.sendMessage({ action: 'tabRemoved', tabInfo: tabHistory });
            });
        }, TIME_BEFORE_CLOSE);
        clearInterval(STAY_AWAKE_TIMER);
        STAY_AWAKE_TIMER = undefined
        STAY_AWAKE_TIMER = setInterval(function () {
            console.log("Good morning!");
            console.log(createdTabs)
        }, 5000);
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
        createdTabs[tabId] = undefined;
    }
    checkTimer();

}

function checkTimer() {
    let keys = Object.keys(createdTabs);
    let timersExist = false;
    for (let i = 0; i < keys.length; i++) {
        if (createdTabs[keys[i]] != undefined) {
            timersExist = true;
            break; // Exit the loop as soon as we find a timer
        }
    }
    if (timersExist === false && STAY_AWAKE_TIMER != undefined) {
        //console.log("timer ended.")
        clearInterval(STAY_AWAKE_TIMER);
        STAY_AWAKE_TIMER = undefined;
    }
}
