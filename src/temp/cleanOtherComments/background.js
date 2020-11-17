var Settings;
(function (Settings) {
    Settings["AvailableChannels"] = "AvailableChannels";
    Settings["SavedSongs"] = "SavedSongs";
    Settings["LastActiveChannel"] = "LastActiveChannel";
    Settings["VolumeLevel"] = "VolumeLevel";
})(Settings || (Settings = {}));
function getAppBackgroundData() { return APP_BACKGROUND_DATA; }
;
const PLAYER = {
    isPlaying: false,
    getPlaingStatus() {
        return this.isPlaying;
    },
    setPlaingStatus(bool) {
        this.isPlaying = bool;
    },
};
const APP_BACKGROUND_DATA = {
    activeTabId: null,
    activeScreenId: null,
    getActiveButtonTabId() {
        return this.activeTabId;
    },
    setActiveButtonTabId(id) {
        this.activeTabId = id;
    },
    getActiveScreenId() {
        return this.activeTabId;
    },
    setActiveScreenId(id) {
        this.activeTabId = id;
    },
    player: PLAYER,
};
const getSetting = (key) => {
    return new Promise((resolve) => {
        chrome.storage.sync.get(key, (response) => {
            resolve(response[key]);
        });
    });
};
const setSetting = (key) => {
    chrome.storage.sync.set(key);
};
function getAviableChannels() {
    return {
        main: {
            channelName: chrome.i18n.getMessage('channelsMainHeader'),
            channelUrl: 'http://o.tavrmedia.ua:9561/get/?k=roks',
        },
        ukrainian: {
            channelName: chrome.i18n.getMessage('channelsUkrainianHeader'),
            channelUrl: 'http://o.tavrmedia.ua:9561/get/?k=roksukr',
        },
        new: {
            channelName: chrome.i18n.getMessage('channelsNewHeader'),
            channelUrl: 'http://o.tavrmedia.ua:9561/get/?k=roksnew',
        },
        hard: {
            channelName: chrome.i18n.getMessage('channelsHardHeader'),
            channelUrl: 'http://o.tavrmedia.ua:9561/get/?k=rokshar',
        },
        ballads: {
            channelName: chrome.i18n.getMessage('channelsBalladsHeader'),
            channelUrl: 'http://o.tavrmedia.ua:9561/get/?k=roksbal',
        },
        indi: {
            channelName: chrome.i18n.getMessage('channelsIndiHeader'),
            channelUrl: 'hz',
        },
    };
}
const setStrorageSetting = (key) => {
    switch (key) {
        case Settings.AvailableChannels:
            setSetting({ [Settings.AvailableChannels]: getAviableChannels() });
            break;
        case Settings.SavedSongs:
            setSetting({ [Settings.SavedSongs]: [] });
            break;
        case Settings.LastActiveChannel:
            setSetting({ [Settings.LastActiveChannel]: getAviableChannels()['main'] });
            break;
        case Settings.VolumeLevel:
            setSetting({ [Settings.VolumeLevel]: 100 });
            break;
        default:
            setSetting({ [Settings.AvailableChannels]: getAviableChannels() });
    }
};
function initialize() {
    let availableChannels = getSetting(Settings.AvailableChannels);
    let savedSongs = getSetting(Settings.SavedSongs);
    let lastActiveChannel = getSetting(Settings.LastActiveChannel);
    let volumeLevel = getSetting(Settings.VolumeLevel);
    Promise.all([availableChannels, savedSongs, lastActiveChannel, volumeLevel]).then((values) => {
        if (!values[0]) {
            setStrorageSetting(Settings.AvailableChannels);
        }
        if (!values[1]) {
            setStrorageSetting(Settings.SavedSongs);
        }
        if (!values[2]) {
            setStrorageSetting(Settings.LastActiveChannel);
        }
        if (!values[3]) {
            setStrorageSetting(Settings.VolumeLevel);
        }
    });
}
initialize();
