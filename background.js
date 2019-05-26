// retrieve or initialize settings
var highlightOnSelect = localStorage["highlightOnSelect"];
var clearBetweenSelect = localStorage["clearBetweenSelect"];
var singleWordSearch = localStorage["singleWordSearch"];

if (!['true', 'false'].includes(highlightOnSelect)){
	highlightOnSelect = true;
	localStorage["highlightOnSelect"] = highlightOnSelect.toString();
}

if (!['true', 'false'].includes(clearBetweenSelect)){
	clearBetweenSelect = false;
	localStorage["clearBetweenSelect"] = clearBetweenSelect.toString();
}

if (!['true', 'false'].includes(singleWordSearch)){
	singleWordSearch = false;
	localStorage["singleWordSearch"] = singleWordSearch.toString();
}

//Toggle settings
function toggleAutoHighlight(info, tab){
	value = info.checked;
	highlightOnSelect = value;
	localStorage["highlightOnSelect"] = value.toString();
	sendContextBooleans();
}

function toggleClearBetweenSelect(info, tab){
	value = info.checked;
	clearBetweenSelect = value;
	localStorage["clearBetweenSelect"] = value.toString();
	sendContextBooleans();
}

function toggleSingleWordSearch(info, tab){
	value = info.checked;
	singleWordSearch = value;
	localStorage["singleWordSearch"] = value.toString();
	sendContextBooleans();
}


var messages = [];

//Highlight all occurances of selection in current tab
function highlight(){
	messages.push({command:"highlight"});
	getCurrentTabAndSendMessages();
}

//Clear all highlights in current tab
function clear(){
	messages.push({command:"clearHighlights"});
	getCurrentTabAndSendMessages();
}

//Send settings to current tab
function sendContextBooleans(){
	messages.push({command:"updateBooleans",value:[highlightOnSelect, clearBetweenSelect, singleWordSearch]});
	getCurrentTabAndSendMessages();
}

function getCurrentTabAndSendMessages(){
	chrome.tabs.getSelected(null, sendMessagesToTab)
}

function sendMessagesToTab(tab){
	for (i in messages){
		chrome.tabs.sendRequest(tab.id, messages[i], null)
	}
	messages = [];
}

//Setup context menus
chrome.contextMenus.create({"title": "Highlight Selection", "contexts":["selection"], "onclick": highlight});
chrome.contextMenus.create({"title": "Clear highlights", "contexts":["all"], "onclick": clear});
chrome.contextMenus.create({"type":"separator", "contexts":["all"] })
chrome.contextMenus.create({"title": "Auto highlight selection", "contexts":["all"], "type": "checkbox", "checked":highlightOnSelect, "onclick": toggleAutoHighlight});
chrome.contextMenus.create({"title": "Clear between selections", "contexts":["all"], "type":"checkbox", "checked":clearBetweenSelect, "onclick":toggleClearBetweenSelect});
chrome.contextMenus.create({"title": "Split selection into words", "contexts":["all"], "type":"checkbox", "checked":singleWordSearch, "onclick":toggleSingleWordSearch});

// Process an incoming request
function processRequest(request, sender, sendResponse){
	var obj = {checked:request.value}
	switch(request.command){
		case("getSettings"):
			sendResponse({
				highlightOnSelect:highlightOnSelect,
				clearBetweenSelect:clearBetweenSelect,
				singleWordSearch:singleWordSearch});
			return;
	}
	sendResponse({});
}

//Event listeners
chrome.extension.onRequest.addListener(processRequest);

// Context menu booleans, when changed, are only sent to the visible tab
// To avoid making requests for every highlight event, tabs are automatically updated when they come into view
chrome.tabs.onSelectionChanged.addListener(sendContextBooleans);
