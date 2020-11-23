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
        },
    },
    channels: {
        screenId: 'channelsScreen',
        channelItemTemplateId: 'channelItemTemplate',
        channelItemDefaultClass: 'channels__item',
    },
    bookmarks: {
        screenId: 'bookmarksScreen',
        bookmarkTemplateId: 'bookmarkTemplate',
        bookmarkItemDefaultClass: 'bookmarks__item',
        bookmarkItemHeaderDefaultClass: 'songAuthor',
        bookmarkItemSpanTagName: 'span',
    },
};

const footerMap = {
    lastActiveChannelTitle: {
        id: 'lastActiveChannelTitle',
    },
    volumeLevel: {
        id: 'volumeLevel',
    },
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
                volumeElem.setAttribute('value', '100');
            } else {
                volumeElem.setAttribute('value', `${response}`);
            }
        });
    }

    setChannelsList(): void {
        const ul = document.getElementById(screensMap.channels.screenId)!;
        const template = <HTMLTemplateElement>document.getElementById(screensMap.channels.channelItemTemplateId)!;
        const channelsListPromise = this.getChromeStorageData<Channels>(settings.channelsList);
        channelsListPromise.then((response) => {
            if (response === undefined) {
                return;
            }
            Object.values(response)
                .sort((channel1, channel2) => channel1.order - channel2.order)
                .forEach((channel) => {
                    const clone = <HTMLElement>template.content.cloneNode(true);
                    const li = <HTMLElement>clone.querySelector(`.${screensMap.channels.channelItemDefaultClass}`)!;
                    li.innerText = channel.channelName;
                    li.setAttribute('data-url', channel.channelUrl);
                    ul.append(li);
                });
        });
    }

    setBookmarksList(): void {
        const ul = document.getElementById(screensMap.bookmarks.screenId)!;
        const template = <HTMLTemplateElement>document.getElementById(screensMap.bookmarks.bookmarkTemplateId)!;
        const bookmarksListPromise = this.getChromeStorageData<Bookmark[]>(settings.bookmarksList);
        bookmarksListPromise.then((response) => {
            if (response === undefined) {
                return;
            }
            Object.values(response).forEach((bookmark) => {
                const clone = <HTMLElement>template.content.cloneNode(true);
                const h2 = <HTMLElement>clone.querySelector(`.${screensMap.bookmarks.bookmarkItemHeaderDefaultClass}`)!;
                const span = <HTMLElement>clone.querySelector(`${screensMap.bookmarks.bookmarkItemSpanTagName}`)!;
                h2.innerText = bookmark.songAuthor;
                span.innerText = bookmark.songTitle;
                ul.append(clone);
            });
        });
    }

    setPlayPauseButtonStatus(): void {
        const isPlaing = this.state.player.getPlaingStatus();
        document
            .getElementById(screensMap.player.buttons.playPauseButtonId)!
            .classList.toggle(screensMap.player.buttons.playPauseButtonHiddenClass);
        if (isPlaing && this.lastActiveScreenId === screensMap.player.screenId) {
            document
                .getElementById(screensMap.player.buttons.playPauseButtonId)!
                .classList.toggle(screensMap.player.buttons.playPauseButtonActiveClass);
        } else {
            document
                .getElementById(screensMap.player.buttons.playPauseButtonId)!
                .classList.remove(screensMap.player.buttons.playPauseButtonActiveClass);
        }
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


        // сюда же обработка кнопки play
        // document.getElementById('channelsScreen')!.addEventListener('click', this.changeChannel.bind(this));
        // console.log('сделано');
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
    }

    getScreenId(): string {
        switch(this.lastActiveNavButtonId) {
            case (navButtonsMap.playerButtonId): return screensMap.player.screenId;
            case (navButtonsMap.channelsButtonId): return screensMap.channels.screenId;
            case (navButtonsMap.bookmarksButtonId): return screensMap.bookmarks.screenId;
            default: return '';
        }
    }

    changePlayingState(event: MouseEvent): void {
        const playPauseButton: HTMLButtonElement | null = (event.target as Element).closest('button')!;
        // if (navButton === null || navButton.classList.contains(navButtonsMap.activeNavButtonClass)) {
        //     return;
        // }
        if(this.state.player.getPlaingStatus()) {
            this.state.player.setPlaingStatus(false);
            return;
        }
        this.state.player.setPlaingStatus(true);


    }






}


// setLastAuthorAndSong(); // засетить под кнопкой последнего автора и название песни.  // добавить просто обработчик на это дело, чтобы один раз проверялся при смене автора дергался ивент
// 2 - добавить события+состояния (что там активно, что нет)
// на кнопки проигрывания (со сменой состояния)
// на тайтл если новый есть - сменить
// на кнопку коза - если есть в избранном - активна, если нет - нажать добавить в избранное
// на звук - в зависимости от уровня иконка + при нажатии смена уровня и иконки
// на выбор канала - активный подсветить и при нажатии получить канал - отправить событие в обработчик кнопки получить канал и проиграть убрать старый активный подсветить новый и обработчик снизу титр

