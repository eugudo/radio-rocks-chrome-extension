import { AppBackgroundData } from "src/ts/types";

enum TabButtonsIds {
    Player = "playerNav",
    Channels = "channelsNav",
    Bookmarks = "bookmarksNav",
}

enum ScreensIds {
    Player = "player",
    Channels = "channels",
    Bookmarks = "bookmarks",
}

const BACKGROUND: any = chrome.extension.getBackgroundPage();

document.addEventListener("DOMContentLoaded", initializePopupPage);

function initializePopupPage() {
    const APP_BACKGROUND_DATA: AppBackgroundData = BACKGROUND.getAppBackgroundData();
    const appInitializer = new AppInitializer(APP_BACKGROUND_DATA);
    appInitializer.initializePopupPage();
    console.log(APP_BACKGROUND_DATA)
    // chrome.storage.sync.get(null, function(items) {
    //     var allKeys = Object.keys(items);
    //     console.log(allKeys);
    // });
    // chrome.storage.sync.get("AvailableChannels", (response) => {
    //     console.log(response["AvailableChannels"])
    // });
}












class AppInitializer {
    data: AppBackgroundData;
    activeTabId: string | null;
    activeScreenId: string | null;

    constructor(data: AppBackgroundData) {
      this.data = data;
      this.activeTabId = data.getActiveButtonTabId();
      this.activeScreenId = data.getActiveScreenId();
    }

    initializePopupPage() {
        this.setActiveTabButton();
        this.setActiveScreen();
    }

    setActiveTabButton(): void {
        if (this.activeTabId === null) {
            document.getElementById(TabButtonsIds.Player)!.classList.add('nav__button_active');
        } else {
            document.getElementById(this.activeTabId)!.classList.add('nav__button_active');
        }
    }
    
    setActiveScreen(): void {
        if (this.activeScreenId === null) {
            document.getElementById(ScreensIds.Player)!.classList.add('active');
        } else {
            document.getElementById(this.activeScreenId)!.classList.add('active');
        }
    }

}












// const SETTINGS: LocasStorageSettings = JSON.parse(chrome.extension.getBackgroundPage().localStorage.getItem("settings"));

// class Initializer {
//     settings: LocasStorageSettings;

//     constructor (settings: LocasStorageSettings) {
//       this.settings = settings;
//     }

//     initializeUI() {
//         this.setActiveScreen();
//     }

//     setActiveScreen() {
//         // убираем активную кнопку меню, устанавливаем из LS
//         document.getElementById("nav").querySelectorAll(".nav__button").forEach(element => element.classList.remove("nav__button_active"));
//         document.getElementById(this.settings.activeTab).classList.add("nav__button_active");
//         // убираем активный экран, устанавливаем из LS
//         document.getElementById("main").querySelectorAll("#player, #channels, #bookmarks").forEach(element =>element.classList.remove("active"));
//         document.getElementById(this.settings.activeScreen).classList.add("active");



//         // засетить активный скрин в типах чтобы можно было всем убрать отображение и добавить кому нужно через active




//         // document.getElementById("player").classList.remove("hidden");






//         // document.getElementById("channels").classList.remove("hidden");
//         // document.getElementById("bookmarks").classList.remove("hidden");
//         // document.getElementById("bookmarks").classList.remove("hidden");


//     }

// }

// const INITIALIZER = new Initializer(SETTINGS);
// INITIALIZER.initializeUI();

// console.log("Запустил")
// console.log("Запустилeeee")



// // добавить последний тайтл песни которая играла
// // для избранного постоянная проверка при смене тайтла - есть ли в избранном если есть - подсветить козу


// // -------------------- Инициализация --------------------

// // получить-засетить активную вкладку
// // получить-засетить активный канал
// // получить-засетить статус проигрыватетя (играет или нет)
// // получить-засетить текущего автора
// // получить-засетить текущее название песни
// // засетить текущий канал в левом нижнем углу
// // получить-засетить уровень звука
// // получить-засетить список каналов
// // получить-засетить избанные песни

// // document.getElementById("player")?.addEventListener("click", play);

// // function play(event: Event) {
// //     const TARGET = event.target as HTMLTextAreaElement;
// //     const BUTTON = TARGET.closest('button');
// //     BUTTON?.classList.toggle("active");
// // }

// // enum NavigationButtonsIds {
// //     Player = 'playerNav',
// //     Challens = 'channelsNav',
// //     Bookmarks = 'bookmarksNav',
// // }

// // enum ChannelsheaderIds {
// //     Main = 'channelsMain',
// //     Ukrainian = 'channelsUkrainian',
// //     New = 'channelsNew',
// //     Hard = 'channelsHard',
// //     Ballads = 'channelsBallads',
// //     Indi = 'channelsIndi',
// // }

// // const BUTTONS = {
// //     player: document.getElementById(NavigationButtonsIds.Player),
// //     channels: document.getElementById(NavigationButtonsIds.Challens),
// //     bookmarks: document.getElementById(NavigationButtonsIds.Bookmarks),
// // };

// // const CHANNELS = {
// //     main: document.getElementById(ChannelsheaderIds.Main),
// //     ukrainian: document.getElementById(ChannelsheaderIds.Ukrainian),
// //     new: document.getElementById(ChannelsheaderIds.New),
// //     hard: document.getElementById(ChannelsheaderIds.Hard),
// //     ballads: document.getElementById(ChannelsheaderIds.Ballads),
// //     indi: document.getElementById(ChannelsheaderIds.Indi),
// // };

// // (() => {
// //     if (BUTTONS.player && BUTTONS.channels && BUTTONS.bookmarks) {
// //         BUTTONS.player.title = chrome.i18n.getMessage('playerButtonTitle');
// //         BUTTONS.channels.title = chrome.i18n.getMessage('channelsButtonTitle');
// //         BUTTONS.bookmarks.title = chrome.i18n.getMessage('bookmarksButtonTitle');
// //     }
// //     if (CHANNELS.main && CHANNELS.ukrainian && CHANNELS.new && CHANNELS.hard && CHANNELS.ballads && CHANNELS.indi) {
// //         CHANNELS.main.innerText = chrome.i18n.getMessage('channelsMainHeader');
// //         CHANNELS.ukrainian.innerText = chrome.i18n.getMessage('channelsUkrainianHeader');
// //         CHANNELS.new.innerText = chrome.i18n.getMessage('channelsNewHeader');
// //         CHANNELS.hard.innerText = chrome.i18n.getMessage('channelsHardHeader');
// //         CHANNELS.ballads.innerText = chrome.i18n.getMessage('channelsBalladsHeader');
// //         CHANNELS.indi.innerText = chrome.i18n.getMessage('channelsIndiHeader');
// //         document.querySelectorAll('.channels__item').forEach((element: Element) => {
// //             element.setAttribute('title', chrome.i18n.getMessage('channelsTitle'));
// //         });
// //     }
// // })();

// // const NAVIGATION_PANEL: HTMLElement | null = document.getElementById('nav');

// // if (NAVIGATION_PANEL !== null) {
// //     NAVIGATION_PANEL.addEventListener('click', getNavigationButton);
// // }

// // function getNavigationButton(event: Event) {
// //     const TARGET = event.target as HTMLTextAreaElement;
// //     const BUTTON = TARGET.closest('button');
// //     if (!BUTTON) {
// //         return;
// //     }
// //     switch (BUTTON.id) {
// //         case NavigationButtonsIds.Player: { switchScreen(BUTTON); }
// //             break;
// //         case NavigationButtonsIds.Challens: {switchScreen(BUTTON); }
// //             break;
// //         case NavigationButtonsIds.Bookmarks: { switchScreen(BUTTON); }
// //             break;
// //         default:
// //             break;
// //     }
// // }

// // function switchScreen(button: HTMLButtonElement) {
// //     if (button.classList.contains('nav__button_active')) {
// //         return;
// //     }
// //     document
// //         .getElementById('nav')
// //         ?.querySelectorAll('.nav__button_active')
// //         .forEach((element) => element.classList.remove('nav__button_active'));
// //     button.classList.add('nav__button_active');
// //     if (button.id === NavigationButtonsIds.Player) {
// //         document.getElementById('player')?.classList.toggle('hidden');
// //         document.getElementById('bookmarks')?.classList.add('hidden');
// //         document.getElementById('channels')?.classList.add('hidden');
// //     }
// //     if (button.id === NavigationButtonsIds.Challens) {
// //         document.getElementById('player')?.classList.add('hidden');
// //         document.getElementById('bookmarks')?.classList.add('hidden');
// //         document.getElementById('channels')?.classList.toggle('hidden');
// //     }
// //     if (button.id === NavigationButtonsIds.Bookmarks) {
// //         document.getElementById('bookmarks')?.classList.toggle('hidden');
// //         document.getElementById('player')?.classList.add('hidden');
// //         document.getElementById('channels')?.classList.add('hidden');
// //     }
// // }

// // const x = "fdidfoi"

// // chrome.storage.local.set({key: "value"}, function() {
// //     console.log('Value is set to ' + "value");
// //   });

// //   chrome.storage.local.get(['key'], function(result) {
// //     console.log('Value currently is ' + result.key);
// //   });


// //removeIf(production)
// const VARIABLE_TO_DELETE = "Переменная для удаления при компилляции вместе с export{};. Нужно размещать в самом конце скрипта";
// //endRemoveIf(production)