// Listen for messages sent from content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.listingData) {
        chrome.storage.local.set({ listingData: message.listingData });
    }

});