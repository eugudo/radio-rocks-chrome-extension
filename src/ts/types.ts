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
    coverUrl: string;
};

export type LastActiveChannel = {
    channelName: string;
    channelUrl: string;
    infoUrl: string;
    order: number;
};

export type VolumeLevel = number;

export interface Player {
    isPlaying: boolean;
    audio: HTMLAudioElement;
    getPlaingStatus(): boolean;
    setPlaingStatus(bool: boolean): void;
    setVolumeLevel(level: number): void;
    getVolumeLevel(): number;
    switchChannel(channel: LastActiveChannel): void;
}

export interface State {
    lastActiveNavButtonId: string;
    lastActiveScreenId: string;
    getLastActiveNavButtonId(): string | null;
    setLastActiveNavButtonId(id: string): void;
    getLastActiveScreenId(): string | null;
    setLastActiveScreenId(id: string): void;
    player: Player;
    channelInfo: ChannelInfo;
}

export interface BaseChannelInfoDTO {
    stime: string;
    time: string;
    singer: string;
    song: string;
    cover: string;
}

export interface FullChannelInfoDTO extends BaseChannelInfoDTO {
    artist_id: number;
    url?: string;
    program: string;
    song_url: string;
    video: string;
    year?: null;
}

export interface ChannelInfo {
    currentTime: string|null;
    singerName: string;
    songName: string;
    coverUrl: string;
}
