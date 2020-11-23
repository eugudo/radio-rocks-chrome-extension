export type Channels = {
    [key: string]: {
        channelName: string;
        channelUrl: string;
        infoUrl: string;
        order: number;
    };
};

export type Bookmark = {
    songAuthor: string;
    songTitle: string;
};

export type LastActiveChannel = {
    channelName: string;
    channelUrl: string;
    infoUrl: string;
};

export type VolumeLevel = number;

export interface Player {
    isPlaying: boolean;
    getPlaingStatus(): boolean;
    setPlaingStatus(bool: boolean): void;
}

export interface State {
    lastActiveNavButtonId: string;
    lastActiveScreenId: string;
    getLastActiveNavButtonId(): string | null;
    setLastActiveNavButtonId(id: string): void;
    getLastActiveScreenId(): string | null;
    setLastActiveScreenId(id: string): void;
    player: Player;
}
