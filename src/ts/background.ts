import { AppBackgroundData } from 'src/ts/types';
import { Player } from 'src/ts/types';
import { AvailableChannels } from 'src/ts/types';
import { SavedSongs } from 'src/ts/types';
import { LastActiveChannel } from 'src/ts/types';
import { VolumeLevel } from 'src/ts/types';
import { AvailableChannelsSettings } from 'src/ts/types';

enum Settings {
    AvailableChannels = 'AvailableChannels',
    SavedSongs = 'SavedSongs',
    LastActiveChannel = 'LastActiveChannel',
    VolumeLevel = 'VolumeLevel',
}

function getAppBackgroundData() { return APP_BACKGROUND_DATA };

const PLAYER: Player = {
    isPlaying: false,
    getPlaingStatus(): boolean {
        return this.isPlaying;
    },
    setPlaingStatus(bool: boolean): void {
        this.isPlaying = bool;
    },
};

const APP_BACKGROUND_DATA: AppBackgroundData = {
    activeTabId: null,
    activeScreenId: null,
    getActiveButtonTabId(): string | null {
        return this.activeTabId;
    },
    setActiveButtonTabId(id: string): void {
        this.activeTabId = id;
    },
    getActiveScreenId(): string | null {
        return this.activeTabId;
    },
    setActiveScreenId(id: string): void {
        this.activeTabId = id;
    },
    player: PLAYER,
};

const getSetting = <T>(key: string): Promise<T | void> => {
    return new Promise((resolve) => {
        chrome.storage.sync.get(key, (response: Record<string, T | void>) => {
            resolve(response[key]);
        });
    });
};

const setSetting = (key: Record<string, any>): void => {
    chrome.storage.sync.set(key);
};

function getAviableChannels(): AvailableChannelsSettings {
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

const setStrorageSetting = (key: Settings) => {
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

function initialize(): void {
    let availableChannels = getSetting<AvailableChannels>(Settings.AvailableChannels);
    let savedSongs = getSetting<SavedSongs>(Settings.SavedSongs);
    let lastActiveChannel = getSetting<LastActiveChannel>(Settings.LastActiveChannel);
    let volumeLevel = getSetting<VolumeLevel>(Settings.VolumeLevel);
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

//removeIf(production)
const VARIABLE_TO_DELETE = 'Переменная при компилляции будет удалена вместе с export{}.';
//endRemoveIf(production)
