// background.js
let lastTabId = null;
let currentTabId = null;

// Cargar última sesión
chrome.storage.session.get(["lastTabId", "currentTabId"], (data) => {
    lastTabId = data.lastTabId || null;
    currentTabId = data.currentTabId || null;
});

// Guardar datos en almacenamiento
function saveTabState() {
    chrome.storage.session.set({ lastTabId, currentTabId });
}

// Escuchar cambios de pestañas
chrome.tabs.onActivated.addListener((activeInfo) => {
    if (currentTabId !== activeInfo.tabId) {
        lastTabId = currentTabId;
        currentTabId = activeInfo.tabId;
        saveTabState();
    }
});

// Manejar cierre de pestañas
chrome.tabs.onRemoved.addListener((tabId) => {
    if (tabId === lastTabId) {
        lastTabId = null;
    }
    if (tabId === currentTabId) {
        currentTabId = lastTabId;
        lastTabId = null;
    }
    saveTabState();
});

// Atajo de teclado para alternar pestañas
chrome.commands.onCommand.addListener((command) => {
    if (command === "switch-tab" && lastTabId) {
        chrome.tabs.update(lastTabId, { active: true }, (tab) => {
            if (chrome.runtime.lastError || !tab) {
                lastTabId = null;
            } else {
                [lastTabId, currentTabId] = [currentTabId, lastTabId];
            }
            saveTabState();
        });
    }
});
