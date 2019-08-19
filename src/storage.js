/**
 * @flow
 */

const useStorage = typeof chrome !== 'undefined' && typeof chrome.storage !== 'undefined';
// eslint-disable-next-line no-unused-vars
let storageData = null;

export function init() {
    return new Promise(resolve => {
        if(useStorage) {
            chrome.storage.local.get(null, result => {
                storageData = result;
                resolve();
            });
        }else{
            storageData = {};
            resolve();
        }
    });
}

export function clear() {
    checkStorage();

    if (useStorage) {
        storageData = {}
        chrome.storage.local.clear()
    } else {
        try {
            localStorage.clear()
        } catch (e) {
            //
        }
    }
}

export function get(key, defaultValue = null) {
    checkStorage();
    if(useStorage) {
        return getDefaultValue(storageData[key], defaultValue);
    }else{
        try {
            return getDefaultValue(JSON.parse(localStorage.getItem(key)), defaultValue);
        } catch (error) {
            //
        }
    }
}

export function set(key, value) {
    checkStorage();
    if(useStorage) {
        storageData[key] = value;
        chrome.storage.local.set({ [key]: value });
    }else{
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            //
        }
    }
}

export function remove(key) {
    checkStorage()
    if(useStorage) {
        delete storageData[key];
        chrome.storage.local.remove([key]);
    }else{
        try {
            localStorage.removeItem(key);
        } catch (error) {
            //
        }
    }
}

function checkStorage () {
    if (!storageData) {
        throw new Error(`Storage wasn't initialized with 'init()'`)
    }
}

function getDefaultValue (value, defaultValue) {
    if (value == null) {
        return defaultValue
    }
    return value
}