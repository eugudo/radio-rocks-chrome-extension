import { Channels } from 'src/ts/types';
import { LastActiveChannel } from 'src/ts/types';
import { VolumeLevel } from 'src/ts/types';
import { Player } from 'src/ts/types';
import { State } from 'src/ts/types';
import { Bookmark } from 'src/ts/types';
import { ChannelInfoResponseDTO } from 'src/ts/types';
import { ChannelInfo } from 'src/ts/types';

const settings = {
    channelsList: 'channelsList',
    lastActiveChannel: 'lastActiveChannel',
    volumeLevel: 'volumeLevel',
    bookmarksList: 'bookmarksList'
};

const channelsList: Channels = {
    main: {
        channelName: chrome.i18n.getMessage('channelsMainHeader'),
        channelUrl: 'http://online-radioroks.tavrmedia.ua/RadioROKS',
        infoUrl: 'http://o.tavrmedia.ua:9561/get/?k=roks',
        order: 1,
    },
    ukrainian: {
        channelName: chrome.i18n.getMessage('channelsUkrainianHeader'),
        channelUrl: 'http://online-radioroks.tavrmedia.ua/RadioROKS_Ukr',
        infoUrl: 'http://o.tavrmedia.ua:9561/get/?k=roksukr',
        order: 2,
    },
    new: {
        channelName: chrome.i18n.getMessage('channelsNewHeader'),
        channelUrl: 'http://online-radioroks2.tavrmedia.ua/RadioROKS_NewRock',
        infoUrl: 'http://o.tavrmedia.ua:9561/get/?k=roksnew',
        order: 3,
    },
    hard: {
        channelName: chrome.i18n.getMessage('channelsHardHeader'),
        channelUrl: 'http://online-radioroks.tavrmedia.ua/RadioROKS_HardnHeavy',
        infoUrl: 'http://o.tavrmedia.ua:9561/get/?k=rokshar',
        order: 4,
    },
    ballads: {
        channelName: chrome.i18n.getMessage('channelsBalladsHeader'),
        channelUrl: 'http://online-radioroks.tavrmedia.ua/RadioROKS_Ballads',
        infoUrl: 'http://o.tavrmedia.ua:9561/get/?k=roksbal',
        order: 5,
    },
    indi: {
        channelName: chrome.i18n.getMessage('channelsIndiHeader'),
        channelUrl: 'https://online.radioplayer.ua/RadioIndieUA_HD',
        infoUrl: 'http://o.tavrmedia.ua:9561/get/?k=radio3indieua',
        order: 6,
    },
};

const lastActiveChannel: LastActiveChannel = {
    channelName: chrome.i18n.getMessage('channelsMainHeader'),
    channelUrl: 'http://online-radioroks.tavrmedia.ua/RadioROKS',
    infoUrl: 'http://o.tavrmedia.ua:9561/get/?k=roks',
    order: 1,
};

const getChromeStorageData = <T>(key: string): Promise<T | void> => {
    return new Promise((resolve) => {
        chrome.storage.sync.get(key, (response: Record<string, T | void>) => {
            resolve(response[key]);
        });
    });
};

const setChromeStorageData = <T>(key: Record<string, T>): void => {
    chrome.storage.sync.set(key);
};

const setAudioSrc = (src?: string): void => {
    const audioElement = document.getElementById('audio')!;
    if (src) {
        audioElement.setAttribute('src', src);
        return;
    }
    const lastActiveChannelPromise = getChromeStorageData<LastActiveChannel>(settings.lastActiveChannel);
    lastActiveChannelPromise.then((response) => {
        if (!response) {
            return;
        }
        audioElement.setAttribute('src', response.channelUrl);
    });
};

const player: Player = {
    isPlaying: false,
    audio: <HTMLAudioElement>document.getElementById('audio')!,
    getPlaingStatus(): boolean {
        return this.isPlaying;
    },
    setPlaingStatus(bool: boolean): void {
        if (bool) {
            chrome.browserAction.setBadgeBackgroundColor({color:'red'});
            chrome.browserAction.setBadgeText({text:'air'});
            this.isPlaying = bool;
            this.audio.play();
            return;
        }
        chrome.browserAction.setBadgeText({text:''});
        this.isPlaying = bool;
        // TODO: разобраться с отставанием аудио. this.currentTime = 0; не помогает. Нужно сдвигать в конец воспроизведения либо обнулять src и сетить заново 
        this.audio.pause();
    },
    setVolumeLevel(level: number): void {
        this.audio.volume = level;
    },
    getVolumeLevel(): number {
        return this.audio.volume;
    },
    switchChannel(channel: LastActiveChannel): void {
        this.audio.setAttribute('src', channel.channelUrl);
        if (this.isPlaying) {
            this.setPlaingStatus(false);
            this.setPlaingStatus(true);
        }
    }
};

const channelInfo: ChannelInfo = {
    currentTime: null,
    singerName: null,
    songName: null,
    coverUrl: null,
};

const state: State = {
    lastActiveNavButtonId: '',
    lastActiveScreenId: '',
    getLastActiveNavButtonId(): string | null {
        return this.lastActiveNavButtonId === '' ? null : this.lastActiveNavButtonId;
    },
    setLastActiveNavButtonId(id: string): void {
        this.lastActiveNavButtonId = id;
    },
    getLastActiveScreenId(): string | null {
        return this.lastActiveScreenId === '' ? null : this.lastActiveScreenId;
    },
    setLastActiveScreenId(id: string): void {
        this.lastActiveScreenId = id;
    },
    player,
    channelInfo,
};

const getChannelInfo = <T>(url: string): Promise<T> => {
    return new Promise((resolve) => {
        const ajax = new XMLHttpRequest();
        ajax.open('GET', url)
        ajax.onreadystatechange = () => {
            if (ajax.readyState === 4 && ajax.status === 200) {
                resolve(JSON.parse(ajax.responseText));
            }
        }
        ajax.send();
    });
};

document.addEventListener('DOMContentLoaded', () => initializeBackgroundPage());

const initializeBackgroundPage = (): void => {
    const channelsListPromise = getChromeStorageData<Channels>(settings.channelsList);
    const bookmarksListPromise = getChromeStorageData<Bookmark[]>(settings.bookmarksList);
    const lastActiveChannelPromise = getChromeStorageData<LastActiveChannel>(settings.lastActiveChannel);
    const volumeLevelPromise = getChromeStorageData<VolumeLevel>(settings.volumeLevel);
    Promise.all([channelsListPromise, bookmarksListPromise, lastActiveChannelPromise, volumeLevelPromise]).then(
        (values) => {
            if (!values[0]) {
                setChromeStorageData({ [settings.channelsList]: channelsList });
            }
            if (!values[1]) {
                setChromeStorageData({ [settings.bookmarksList]: [] });
            }
            if (!values[2]) {
                setChromeStorageData({ [settings.lastActiveChannel]: lastActiveChannel });
            }
            if (!values[3]) {
                setChromeStorageData({ [settings.volumeLevel]: 1 });
            }
            setAudioSrc();
        }
    );
    const channelInfoUpdater = new ChannelInfoUpdater(state);
    setInterval(() => channelInfoUpdater.updateChannelInfo(), 5000);
};

function getState() { return state }

class ChannelInfoUpdater {
    state: State;

    constructor(state: State) {
        this.state = state;
    }

    updateChannelInfo(): void {
        if (!state.player.getPlaingStatus()) {
            return;
        }
        const lastActiveChannelPromise = getChromeStorageData<LastActiveChannel>(settings.lastActiveChannel);
        lastActiveChannelPromise.then((lastActiveChannel) => {
            if(!lastActiveChannel) {
                return;
            }
            const getChannelInfoPromise = getChannelInfo<ChannelInfoResponseDTO[]>(lastActiveChannel.infoUrl);
            getChannelInfoPromise.then((channelInfo) => {
                if(!channelInfo || channelInfo.length === 0) {
                    return;
                }
                const currentInfo = channelInfo[0];
                const artistId = currentInfo.artist_id;
                if (artistId === 0) {
                    this.state.channelInfo.currentTime = null;
                }
                this.state.channelInfo.currentTime = currentInfo.time;
                this.state.channelInfo.singerName = currentInfo.singer;
                this.state.channelInfo.songName = currentInfo.song;
                this.state.channelInfo.coverUrl = currentInfo.cover ? currentInfo.cover : '';
            });
        });
    }
}