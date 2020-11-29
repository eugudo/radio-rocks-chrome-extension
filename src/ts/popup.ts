import { State } from 'src/ts/types';
import { LastActiveChannel } from 'src/ts/types';
import { VolumeLevel } from 'src/ts/types';
import { Channels } from 'src/ts/types';
import { Bookmark } from 'src/ts/types';

document.addEventListener('DOMContentLoaded', () => initializePage());

const settings = {
    channelsList: 'channelsList',
    lastActiveChannel: 'lastActiveChannel',
    volumeLevel: 'volumeLevel',
    bookmarksList: 'bookmarksList',
};

const navButtonsMap = {
    containerId: 'nav',
    defaultNavButtonClass: 'nav__button',
    activeNavButtonClass: 'nav__button_active',
    playerButtonId: 'playerNav',
    channelsButtonId: 'channelsNav',
    bookmarksButtonId: 'bookmarksNav',
};

const screensMap = {
    containerId: 'main',
    activeScreenClass: 'activeScreen',
    player: {
        screenId: 'playerScreen',
        buttons: {
            playPauseButtonId: 'playPauseButton',
            playPauseButtonHiddenClass: 'hidden',
            playPauseButtonActiveClass: 'active',
            bookmarkButtonId: 'bookmarkButton',
        },
    },
    channels: {
        screenId: 'channelsScreen',
        channelItemTemplateId: 'channelItemTemplate',
        channelItemDefaultClass: 'channels__item',
    },
    bookmarks: {
        screenId: 'bookmarksScreen',
        bookmarksListId: "bookmarksList",
        bookmarkTemplateId: 'bookmarksListItem',
        bookmarkItemDefaultClass: 'bookmarksList__item',
        bookmarkItemImageClass: 'bookmarksList__image',
        bookmarkItemSingerClass: 'bookmarksList__singer',
        bookmarkItemSongClass: 'bookmarksList__song',
    },
};

const footerMap = {
    lastActiveChannelTitle: {
        id: 'lastActiveChannelTitle',
    },
    volumeLevel: {
        id: 'volumeLevel',
    },
    volumeIcon: {
        id: 'volumeIcon',
        svgSpeakerClass: 'volumeIcon__speaker',
        svgMaxVolumeClass: 'volumeIcon__max',
        svgMediumVolumeClass: 'volumeIcon__medium',
        svgMinVolumeClass: 'volumeIcon__min',
    }
};

const initializePage = (): void => {
    const backgroundPage: Window = chrome.extension.getBackgroundPage()!;
    const state = <State>backgroundPage.getState();
    const pageUi = new PageUi(state);
    pageUi.loadBaseUi();
    const pageContentManager = new PageContentManager(state);
    pageContentManager.setPageContent();
    const pageEventsHandler = new PageEventsHandler(state);
    pageEventsHandler.addHandlers();
    setInterval(() => pageContentManager.setSongInfo(), 500);
};

class PageUi {
    state: State;
    lastActiveNavButtonId: string | null;
    lastActiveScreenId: string | null;

    constructor(state: State) {
        this.state = state;
        this.lastActiveNavButtonId = state.getLastActiveNavButtonId();
        this.lastActiveScreenId = state.getLastActiveScreenId();
    }

    loadBaseUi(): void {
        this.setLastActiveNavButton();
        this.setLastActiveScreen();
    }

    setLastActiveNavButton(): void {
        if (this.lastActiveNavButtonId === null) {
            this.lastActiveNavButtonId = navButtonsMap.playerButtonId;
            this.state.setLastActiveNavButtonId(this.lastActiveNavButtonId);
            this.setLastActiveNavButton();
        } else {
            document.getElementById(this.lastActiveNavButtonId)!.classList.add(navButtonsMap.activeNavButtonClass);
        }
    }

    setLastActiveScreen(): void {
        if (this.lastActiveScreenId === null) {
            this.lastActiveScreenId = screensMap.player.screenId;
            this.state.setLastActiveScreenId(this.lastActiveScreenId);
            this.setLastActiveScreen();
        } else {
            const main = document.getElementById(screensMap.containerId)!;
            const screensList = main.children;
            for (let i = 0; i < screensList.length; i++) {
                const screen = screensList[i];
                screen.classList.remove(screensMap.activeScreenClass);
            }
            document.getElementById(this.lastActiveScreenId)!.classList.add(screensMap.activeScreenClass);
        }
    }

    getChromeStorageData = <T>(key: string): Promise<T | void> => {
        return new Promise((resolve) => {
            chrome.storage.sync.get(key, (response: Record<string, T | void>) => {
                resolve(response[key]);
            });
        });
    };
}

class PageContentManager extends PageUi {
    state: State;
    lastActiveNavButtonId: string | null;
    lastActiveScreenId: string | null;

    constructor(state: State) {
        super(state);
        this.state = state;
        this.lastActiveNavButtonId = state.getLastActiveNavButtonId();
        this.lastActiveScreenId = state.getLastActiveScreenId();
    }

    setPageContent(): void {
        this.setFooterChannelTitle();
        this.setFooterUiVolumelevel();
        this.setChannelsList();
        this.setBookmarksList();
        this.setPlayPauseButtonStatus();
    }

    setFooterChannelTitle(): void {
        const lastActiveChannelPromise = this.getChromeStorageData<LastActiveChannel>(settings.lastActiveChannel);
        lastActiveChannelPromise.then((response) => {
            if (response !== undefined) {
                document.getElementById(footerMap.lastActiveChannelTitle.id)!.innerText = String(response.channelName);
            }
        });
    }

    setFooterUiVolumelevel(): void {
        const volumeElem = document.getElementById(footerMap.volumeLevel.id)!;
        const volumeLevelPromise = this.getChromeStorageData<VolumeLevel>(settings.volumeLevel);
        volumeLevelPromise.then((response) => {
            if (response === undefined) {
                volumeElem.setAttribute('value', '1');
            } else {
                volumeElem.setAttribute('value', `${response}`);
                const volumeSetter = new PageEventsHandler(this.state);
                volumeSetter.setVolumeIconValue(response);
            }
        });
    }

    setChannelsList(): void {
        const ul = document.getElementById(screensMap.channels.screenId)!;
        const template = <HTMLTemplateElement>document.getElementById(screensMap.channels.channelItemTemplateId)!;
        const channelsListPromise = this.getChromeStorageData<Channels>(settings.channelsList);
        const lastActiveChannelPromise = this.getChromeStorageData<LastActiveChannel>(settings.lastActiveChannel);
        Promise.all([channelsListPromise, lastActiveChannelPromise]).then((response) => {
            if (response[0] === undefined || response[1] === undefined) {
                return;
            }
            const lastActiveChannel = response[1];
            Object.values(response[0])
                .sort((channel1, channel2) => channel1.order - channel2.order)
                .forEach((channel) => {
                    const clone = <HTMLElement>template.content.cloneNode(true);
                    const li = <HTMLElement>clone.querySelector(`.${screensMap.channels.channelItemDefaultClass}`)!;
                    if (channel.channelName === lastActiveChannel.channelName) {
                        li.classList.add('active');
                    }
                    li.innerText = channel.channelName;
                    li.setAttribute('data-url', channel.channelUrl);
                    ul.append(li);
                });
        })
    }

    setBookmarksList(): void {
        const ul = document.getElementById(screensMap.bookmarks.bookmarksListId)!;
        ul.innerHTML = '';
        const template = <HTMLTemplateElement>document.getElementById(screensMap.bookmarks.bookmarkTemplateId)!;
        const bookmarksListPromise = this.getChromeStorageData<Bookmark[]>(settings.bookmarksList);
        bookmarksListPromise.then((response) => {
            if (response === undefined) {
                return;
            }
            Object.values(response).forEach((bookmark) => {
                const clone = <HTMLElement>template.content.cloneNode(true);           
                const li = clone.querySelector(`.${screensMap.bookmarks.bookmarkItemDefaultClass}`)!;
                const img = clone.querySelector(`.${screensMap.bookmarks.bookmarkItemImageClass}`)!;
                const h2 = <HTMLElement>clone.querySelector(`.${screensMap.bookmarks.bookmarkItemSingerClass}`)!;
                const span = <HTMLElement>clone.querySelector(`.${screensMap.bookmarks.bookmarkItemSongClass}`)!;
                li.setAttribute('data-timestamp', bookmark.timestamp);
                img.setAttribute('src', bookmark.coverUrl);
                img.setAttribute('alt', bookmark.songAuthor);
                h2.innerText = bookmark.songAuthor;
                span.innerText = bookmark.songTitle;
                ul.append(clone);
            });
        });
    }

    setPlayPauseButtonStatus(): void {
        const isPlaing = this.state.player.getPlaingStatus();
        document.getElementById(screensMap.player.buttons.playPauseButtonId)!.classList.toggle(screensMap.player.buttons.playPauseButtonHiddenClass);
        if (isPlaing && this.lastActiveScreenId === screensMap.player.screenId) {
            document.getElementById(screensMap.player.buttons.playPauseButtonId)!.classList.toggle(screensMap.player.buttons.playPauseButtonActiveClass);
        } else {
            document.getElementById(screensMap.player.buttons.playPauseButtonId)!.classList.remove(screensMap.player.buttons.playPauseButtonActiveClass);
        }
    }

    setSongInfo(): void {
        const songInfo = document.getElementById('songInfo')!;
        const bookmarkButton = document.getElementById('bookmarkButton')!;
        const isHidden = songInfo.classList.contains('hidden');
        if (!isHidden && this.state.channelInfo.currentTime === null) {
            songInfo.classList.add('hidden');
            return
        }
        if (!this.state.player.getPlaingStatus()) {
            isHidden ? null : songInfo.classList.add('hidden');
            return
        }      
        if (isHidden && this.state.channelInfo.currentTime !== null) {
            songInfo.classList.remove('hidden');
        }
        const author = songInfo.querySelector('.songAuthor')!;
        const songTitle = songInfo.querySelector('.songTitle')!;
        const singer = this.state.channelInfo.singerName;
        const song = this.state.channelInfo.songName;
        author.textContent = singer;
        songTitle.textContent = song;  
        const bookmarksPromise = this.getChromeStorageData<Bookmark[]>(settings.bookmarksList);
        bookmarksPromise.then((bookmarksList) => {
            if (!bookmarksList) {
                return;
            }
            const isExistSong = bookmarksList.find((bookmark) => bookmark.songAuthor === singer && bookmark.songTitle === song);
            if (isExistSong && !bookmarkButton.classList.contains('active')) {
                bookmarkButton.classList.add('active');
            } else if (!isExistSong && bookmarkButton.classList.contains('active')) {
                bookmarkButton.classList.remove('active');
            }
        });
    }

}

class PageEventsHandler extends PageUi {
    state: State;
    lastActiveNavButtonId: string | null;
    lastActiveScreenId: string | null;

    constructor(state: State) {
        super(state);
        this.state = state;
        this.lastActiveNavButtonId = state.getLastActiveNavButtonId();
        this.lastActiveScreenId = state.getLastActiveScreenId();
    }

    addHandlers(): void {
        document.getElementById(navButtonsMap.containerId)!.addEventListener('click', this.changeNav.bind(this));
        document.getElementById(screensMap.player.buttons.playPauseButtonId)!.addEventListener('click', this.changePlayingState.bind(this));
        document.getElementById(footerMap.volumeLevel.id)!.addEventListener('click', this.changeVolumeLevel.bind(this));
        document.getElementById(footerMap.volumeIcon.id)!.addEventListener('click', this.muteAudio.bind(this));
        document.getElementById(screensMap.channels.screenId)!.addEventListener('click', this.switchChannel.bind(this));
        document.getElementById(screensMap.player.buttons.bookmarkButtonId)!.addEventListener('click', this.addOrRemoveBookmark.bind(this));
        document.getElementById(screensMap.bookmarks.bookmarksListId)!.addEventListener('click', this.removeBookmarkFromList.bind(this));
    }

    changeNav(event: MouseEvent): void {
        const navButton: HTMLButtonElement | null = (event.target as Element).closest('button');
        if (navButton === null || navButton.classList.contains(navButtonsMap.activeNavButtonClass)) {
            return;
        }
        document
            .getElementById(navButtonsMap.containerId)!
            .querySelectorAll(`.${navButtonsMap.activeNavButtonClass}`)
            .forEach((element) => element.classList.remove(navButtonsMap.activeNavButtonClass));
        navButton.classList.add(navButtonsMap.activeNavButtonClass);
        this.lastActiveNavButtonId = navButton.id;
        this.state.setLastActiveNavButtonId(this.lastActiveNavButtonId);
        this.lastActiveScreenId = this.getScreenId();
        this.state.setLastActiveScreenId(this.lastActiveScreenId);
        const main = document.getElementById(screensMap.containerId)!;
        const screensList = main.children;
        for (let i = 0; i < screensList.length; i++) {
            const screen = screensList[i];
            screen.classList.remove(screensMap.activeScreenClass);
        }
        document.getElementById(this.lastActiveScreenId)!.classList.add(screensMap.activeScreenClass);
        this.setActiveElements();
    }

    // при смене вкладок функция отслеживает состояние элементов и добавляет нужные классы
    setActiveElements(): void {
        if (this.lastActiveScreenId === screensMap.player.screenId) {
            const playPauseButton = document.getElementById(screensMap.player.buttons.playPauseButtonId)!;
            // prettier-ignore
            if (!playPauseButton.classList.contains(screensMap.player.buttons.playPauseButtonActiveClass) && this.state.player.getPlaingStatus()) {
                playPauseButton.classList.toggle(screensMap.player.buttons.playPauseButtonActiveClass);
            }
        }
    }

    getScreenId(): string {
        switch (this.lastActiveNavButtonId) {
            case navButtonsMap.playerButtonId:
                return screensMap.player.screenId;
            case navButtonsMap.channelsButtonId:
                return screensMap.channels.screenId;
            case navButtonsMap.bookmarksButtonId:
                return screensMap.bookmarks.screenId;
            default:
                return '';
        }
    }

    changePlayingState(event: MouseEvent): void {
        const playPauseButton: HTMLButtonElement | null = (event.target as Element).closest('button')!;
        if (playPauseButton === null) {
            return;
        }
        playPauseButton.classList.toggle(screensMap.player.buttons.playPauseButtonActiveClass);
        if (this.state.player.getPlaingStatus()) {
            this.state.player.setPlaingStatus(false);
            return;
        }
        this.state.player.setPlaingStatus(true);
    }

    setChromeStorageData = <T>(key: Record<string, T>): void => {
        chrome.storage.sync.set(key);
    }

    changeVolumeLevel(event: MouseEvent): void {
        const volumeElem = document.getElementById(footerMap.volumeLevel.id)!;
        const percent = Math.round((event.offsetX / volumeElem.getBoundingClientRect().width) * 10) / 10;
        const lastVolumeLevelPromise = this.getChromeStorageData<VolumeLevel>(settings.volumeLevel);
        lastVolumeLevelPromise.then((result) => {
            if (result) {
                if (percent === result) {
                    return;
                }
                this.state.player.setVolumeLevel(percent);
                this.setChromeStorageData({ [settings.volumeLevel]: percent });
                volumeElem.setAttribute('value', `${percent}`);
                this.setVolumeIconValue(percent);
            }
        });
    }

    setVolumeIconValue(percent: number): void {
        const volumeIcon = document.getElementById(footerMap.volumeIcon.id)!;
        const minVolumePath = volumeIcon.querySelector(`.${footerMap.volumeIcon.svgMinVolumeClass}`)!;
        const mediumVolumePath = volumeIcon.querySelector(`.${footerMap.volumeIcon.svgMediumVolumeClass}`)!;
        const maxVolumePath = volumeIcon.querySelector(`.${footerMap.volumeIcon.svgMaxVolumeClass}`)!;
        const speakerIcon = volumeIcon.querySelector(`.${footerMap.volumeIcon.svgSpeakerClass}`)!;
        if (percent === 0) {
            [minVolumePath, mediumVolumePath, maxVolumePath].forEach(elem => elem.classList.add('hidden'));
            speakerIcon.classList.add('muted');
            return;
        } else if (percent > 0 && percent < 0.5) {
            minVolumePath.classList.remove('hidden');
            speakerIcon.classList.remove('muted');
            [mediumVolumePath, maxVolumePath].forEach(elem => elem.classList.add('hidden'));
            return;
        } else if (percent > 0.5 && percent < 0.8) {
            maxVolumePath.classList.add('hidden');
            speakerIcon.classList.remove('muted');
            [minVolumePath, mediumVolumePath].forEach(elem => elem.classList.remove('hidden'));
            return;
        } else if (percent > 0.8) {
            speakerIcon.classList.remove('muted');
            [minVolumePath, mediumVolumePath, maxVolumePath].forEach(elem => elem.classList.remove('hidden'));
        }
        return;
    }

    muteAudio(): void {
        // TODO: сделать lastVolumeLevel чтобы не возвращать к 100% звук
        const volumeElem = document.getElementById(footerMap.volumeLevel.id)!;
        if (this.state.player.getVolumeLevel() === 0) {
            this.state.player.setVolumeLevel(1);
            this.setChromeStorageData({ [settings.volumeLevel]: 1 });
            volumeElem.setAttribute('value', `${1}`);
            this.setVolumeIconValue(1);
        } else {
            this.state.player.setVolumeLevel(0);
            this.setChromeStorageData({ [settings.volumeLevel]: 0 });
            volumeElem.setAttribute('value', `${0}`);
            this.setVolumeIconValue(0);
        }
    }

    switchChannel(event: MouseEvent): void {
        const li: HTMLElement | null = (event.target as Element).closest('li')!;
        if (li === null) {
            return;
        }
        const url = li.getAttribute('data-url');
        if (url === null) {
            return
        }
        const lastActiveChannelPromise = this.getChromeStorageData<LastActiveChannel>(settings.lastActiveChannel);
        lastActiveChannelPromise.then((response) => {
            if (response === undefined || response.channelUrl === url) {
                return;
            }
            const channelsListPromise = this.getChromeStorageData<Channels>(settings.channelsList);
            channelsListPromise.then((response) => {
                if (response === undefined) {
                    return;
                }
                const newChannel = Object.values(response).find(channel => channel.channelUrl === url)!;
                document.getElementById(screensMap.channels.screenId)!.querySelectorAll("li").forEach(elem => elem.classList.remove('active'));
                li.classList.add('active');
                this.setChromeStorageData({ [settings.lastActiveChannel]: newChannel });
                const pageContentManager = new PageContentManager(this.state);
                pageContentManager.setFooterChannelTitle();
                this.state.player.switchChannel(newChannel);
            });
        })
    }

    addOrRemoveBookmark(event: MouseEvent): void {
        const bookmarkButton: HTMLButtonElement | null = (event.target as Element).closest('button')!;
        const songAuthor = this.state.channelInfo.singerName;
        const songTitle = this.state.channelInfo.songName;
        if (!this.state.player.getPlaingStatus() || songAuthor === '') {
            return
        }
        const newBookmark: Bookmark = {
            songAuthor,
            songTitle,
            coverUrl: this.state.channelInfo.coverUrl !== '' ? this.state.channelInfo.coverUrl : 'img/icon128.png',
            timestamp: new Date().getTime().toString(),
        }
        const bookmarksPromise = this.getChromeStorageData<Bookmark[]>(settings.bookmarksList);
        bookmarksPromise.then((bookmarksList) => {
            if (!bookmarksList) {
                return;
            }
            const isDouble = bookmarksList.some((bookmark) => bookmark.songAuthor === newBookmark.songAuthor && bookmark.songTitle === newBookmark.songTitle);
            if (!isDouble) {
                if(!bookmarkButton.classList.contains('active')) {
                    bookmarkButton.classList.add('active');
                }
                bookmarksList.push(newBookmark);
                this.setChromeStorageData<Bookmark[]>({[settings.bookmarksList]: bookmarksList});
                const pageContentManager = new PageContentManager(this.state);
                pageContentManager.setBookmarksList();
            } else {
                // TODO: реализовать анимацию помещения в избранное значок белый становится фон и все - addclass и remove class для кнопки меню, чтобы успела анимация проиграть
                const newBookmarksList = bookmarksList.filter((bookmark) => bookmark.songAuthor !== newBookmark.songAuthor && bookmark.songTitle !== newBookmark.songTitle);
                if(bookmarkButton.classList.contains('active')) {
                    bookmarkButton.classList.remove('active');
                }
                bookmarksList = newBookmarksList;
                this.setChromeStorageData<Bookmark[]>({[settings.bookmarksList]: bookmarksList});
                const pageContentManager = new PageContentManager(this.state);
                pageContentManager.setBookmarksList();
            }
        });
    }

    removeBookmarkFromList(event: MouseEvent): void {
        const target = <HTMLElement> event.target!;
        if(!target.classList.contains('bookmarksList__deleteButton')) {
            return;
        }
        const bookmarkItem: HTMLLIElement | null = (event.target as Element).closest('li');
        if (bookmarkItem === null) {
            return;
        }
        const timestamp = bookmarkItem.getAttribute('data-timestamp');
        if (timestamp === null) {
            return;
        }
        const bookmarksPromise = this.getChromeStorageData<Bookmark[]>(settings.bookmarksList);
        bookmarksPromise.then((bookmarksList) => {
            if (!bookmarksList) {
                return;
            }
            const filteredBookmarks = bookmarksList.filter(bookmark => bookmark.timestamp !== timestamp);
            this.setChromeStorageData<Bookmark[]>({[settings.bookmarksList]: filteredBookmarks});
        });
        bookmarkItem.remove();
    }

}










