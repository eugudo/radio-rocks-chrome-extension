export type AvailableChannels = {[key: string]: string};
export type SavedSongs = string[];
export type LastActiveChannel = string;
export type VolumeLevel = number;
export type AvailableChannelsSettings = {
    [key: string]: {
        channelName: string;
        channelUrl: string;
    }
};

export interface AppBackgroundData {
    activeTabId: string | null;
    activeScreenId: string | null;
    getActiveButtonTabId(): string | null;
    setActiveButtonTabId(id: string): void;
    getActiveScreenId(): string | null;
    setActiveScreenId(id: string): void;
    player: Player;
}

export interface Player {
    isPlaying: boolean;
    getPlaingStatus(): boolean;
    setPlaingStatus(bool: boolean): void;
}


