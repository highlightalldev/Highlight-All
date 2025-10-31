// Helper to set a setting in chrome.storage
function setSetting(key, value) {
    let obj = {};
    obj[key] = value;
    chrome.storage.local.set(obj);
}

// Toggle functions
async function toggleAutoHighlight(info, tab) {
    setSetting("highlightOnSelect", info.checked);
}

async function toggleClearBetweenSelect(info, tab) {
    setSetting("clearBetweenSelect", info.checked);
}

async function toggleSingleWordSearch(info, tab) {
    setSetting("singleWordSearch", info.checked);
}

// Highlight and clear commands
function highlight(info, tab) {
	chrome.tabs.sendMessage(tab.id, { command: "highlight" })
		.catch((error) => {/* Would be triggered if we tried to use it on internal Chrome pages. We ignore this error. */});
}

function clear(info, tab) {
    chrome.tabs.sendMessage(tab.id, { command: "clearHighlights" })
		.catch((error) => {/* Would be triggered if we tried to use it on internal Chrome pages. We ignore this error. */});
}

async function updateContextMenuCheckboxes(){
	options = await chrome.storage.local.get();
	chrome.contextMenus.update("autoHighlight", { checked: options.highlightOnSelect });
	chrome.contextMenus.update("clearBetween", { checked: options.clearBetweenSelect });
	chrome.contextMenus.update("splitSelection", { checked: options.singleWordSearch });

}

// Context menu setup
chrome.runtime.onInstalled.addListener(() => {
	chrome.contextMenus.create({
        id: "highlightSelection",
        title: "Highlight Selection",
        contexts: ["selection"]
    });
    chrome.contextMenus.create({
        id: "clearHighlights",
        title: "Clear highlights",
        contexts: ["all"]
    });
    chrome.contextMenus.create({
		id: "highlightAllSeparator",
        type: "separator",
        contexts: ["all"]
    });
    chrome.contextMenus.create({
        id: "autoHighlight",
        title: "Auto highlight selection",
        type: "checkbox",
        contexts: ["all"]
    });
    chrome.contextMenus.create({
        id: "clearBetween",
        title: "Clear between selections",
        type: "checkbox",
        contexts: ["all"]
    });
    chrome.contextMenus.create({
        id: "splitSelection",
        title: "Split selection into words",
        type: "checkbox",
        contexts: ["all"]
    });
	updateContextMenuCheckboxes();
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    switch (info.menuItemId) {
        case "highlightSelection":
            highlight(info, tab);
            break;
        case "clearHighlights":
            clear(info, tab);
            break;
        case "autoHighlight":
            toggleAutoHighlight(info, tab);
            break;
        case "clearBetween":
            toggleClearBetweenSelect(info, tab);
            break;
        case "splitSelection":
            toggleSingleWordSearch(info, tab);
            break;
    }
});

