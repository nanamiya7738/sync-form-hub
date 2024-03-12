/* eslint-disable @typescript-eslint/no-empty-interface */
import type { WithId } from "mongodb";

/** YouTubeAPI v3 動画取得APIへのリクエスト情報 */
export declare interface YoutubeApisSnipetQueryItems {
    id?: boolean;
    title?: boolean;
    channelId?: boolean;
    description?: boolean;
    tags?: boolean;
    thumbnails?: boolean;
    actualStartTime?: boolean;
    actualEndTime?: boolean;
    scheduledStartTime?: boolean;
    concurrentViewers?: boolean;
    uploadStatus?: boolean;
    privacyStatus?: boolean;
}

/**
 * https://www.googleapis.com/youtube/v3/~ からのレスポンス定義
 */

/**
 * ----------------------------------------------------------------------------------------------------------------
 */
/** YouTubeAPI v3 レスポンス */
export declare interface YoutubeAPIResponse<T> {
    /** 種別
     * - フォーマット: youtube#xxxx
     * - xxxx は video または channel
     */
    kind?: string;
    etag?: string;
    /** 取得データリスト */
    items: T[];
    pageInfo?: {
        totalResults?: number;
        resultsPerPage?: number;
    };
}

/** YouTubeAPI v3 動画取得レスポンス */
export declare interface YoutubeVideoResponse
    extends YoutubeAPIResponse<YoutubeVideoResponseItem> { }
/** YouTubeAPI v3 チャンネル取得レスポンス */
export declare interface YoutubeChannelResponse
    extends YoutubeAPIResponse<YoutubeChannelResponseItem> { }

/**
 * ----------------------------------------------------------------------------------------------------------------
 */

/** YouTubeAPI v3 レスポンスデータ */
export declare interface YoutubeResponseItem<T> {
    kind?: string;
    etag?: string;
    snippet: T;
}

/** YouTubeAPI v3 動画取得レスポンスデータ */
export declare interface YoutubeVideoResponseItem
    extends YoutubeResponseItem<YoutubeVideoResponseItemSnippet> {
    /** 動画ID */
    id: string;
    /** 配信詳細 */
    liveStreamingDetails?: LiveStreamingDetails;
    /** 動画公開状態 */
    status?: YoutubeApiItemStatus;
}
/** YouTubeAPI v3 チャンネル取得レスポンスデータ */
export declare interface YoutubeChannelResponseItem
    extends YoutubeResponseItem<YoutubeChannelResponseItemSnippet> {
    /** チャンネルID */
    id?: string;
    country?: string;
}

/**
 * ----------------------------------------------------------------------------------------------------------------
 */

export declare interface YoutubeResponseItemSnippet {
    /** 動画タイトル */
    title: string;
    /** YouTubeチャンネルID */
    channelId: string;
    country?: string;
    /** 動画概要 */
    description?: string;
    publishedAt?: string;
    /** サムネイル情報 */
    thumbnails: Thumbnails;
}

export declare interface YoutubeChannelResponseItemSnippet
    extends YoutubeResponseItemSnippet {
    customUrl?: string
}

export declare interface YoutubeVideoResponseItemSnippet
    extends YoutubeResponseItemSnippet {
    tags?: string[];
    localized?: {
        title?: string;
        description?: string;
    };
}

/**
 * ----------------------------------------------------------------------------------------------------------------
 */

/** 配信データ */
export declare interface LiveStreamingDetails {
    /** 開始時刻 */
    actualStartTime?: string;
    /** 終了時刻 */
    actualEndTime?: string;
    /** 開始予定時刻 */
    scheduledStartTime?: string;
    /** 同時接続数 */
    concurrentViewers?: string;
}

/** 動画公開状況 */
export declare interface YoutubeApiItemStatus {
    uploadStatus?: string;
    privacyStatus?: string;
}

export declare interface Thumbnails {
    default?: ThumbnailsDetail;
    medium?: ThumbnailsDetail;
    high?: ThumbnailsDetail;
    standard?: {
        url: string;
    };
}

export declare interface ThumbnailsDetail {
    url: string;
    width?: number;
    height?: number;
}

export declare type UploadStatus = 'deleted' | 'failed' | 'processed' | 'rejected' | 'uploaded'

export declare type PrivacyStatus = 'public' | 'unlisted' | 'private'

/**
 * https://www.youtube.com/feeds からのXMLレスポンス変換後データ型定義
 * ----------------------------------------------------------------------------------------------------------------
 */

/** YouTubeFeed から抽出された動画情報 */
export interface ResEntry {
    videoId: string;
    channelId: string;
    /** 動画タイトル */
    title: string;
    /** Feed公開時間 */
    published: string;
    /** Feed最終更新時間 */
    updated: string;
    content: {
        url: string;
        type: string;
        width: string;
        height: string;
    };
    /** サムネイル情報 */
    thumbnail: {
        url: string;
        width: string;
        height: string;
    };
    /** 動画概要 */
    description: string;
}

/**
 * Twitch API 型定義
 * ----------------------------------------------------------------------------------------------------------------
 */

/** API使用に当たって必要なトークンの取得 */
export declare interface TwitchToken {
    access_token: string
    expires_in: number
    token_type: string
}

/** Twitchユーザー情報リスト */
export declare interface TwitchUserData {
    data: TwitchUser[]
}

/** Twitchユーザー情報 */
export declare interface TwitchUser {
    id: string
    login: string
    display_name: string
    type: string
    broadcaster_type: string
    description: string
    profile_image_url: string
    offline_image_url: string
    view_count: number
    created_at: string
}

/** Twitchスケジュール情報 */
export declare interface TwitchSchedule {
    data: TwitchScheduleData
}
/** Twitchスケジュール詳細情報 */
export declare interface TwitchScheduleData {
    segments: TwitchScheduleSegment[]
    broadcaster_id: string
    broadcaster_name: string
    broadcaster_login: string
    vacation: null | {
        start_time: string
        end_time: string
    }
    pagination: {
        cursor?: string
    }
}
/** Twitchスケジュールセグメント情報 */
export declare interface TwitchScheduleSegment {
    id: string
    /** 開始予定時間 UTC Datetime */
    start_time: string
    /** 終了予定時間 UTC Datetime */
    end_time: string
    /** タイトル */
    title: string
    canceled_until: string
    category: null | { id: string, name: string }
    is_recurring: boolean
}

/** Twitch配信情報 */
export declare interface TwitchStreaming {
    data: TwitchStreamingData[]
    pagination: {
        cursor?: string
    }
}
/** Twitch配信データ情報 */
export declare interface TwitchStreamingData {
    id: string
    user_id: string
    user_login: string
    user_name: string
    game_id: string
    game_name: string
    type: "live"
    title: string
    tags: string[]
    viewer_count: number
    started_at: string
    language: string
    thumbnail_url: string
    tag_ids: string[]
    is_mature: boolean
}


/**
 * ----------------------------------------------------------------------------------------------------------------
 */

/** Visheデータベース Streamerテーブル スキーマ定義
 * - 追跡対象の配信者の情報を管理する
 */
export declare type StreamerRawData = WithId<Streamer>

/** Visheデータベース Streamer情報型
 * - 追跡対象の配信者の情報を管理する
 */
export declare interface Streamer {
    /** ストリーマー基本情報 */
    base_info: StreamerBaseInfo;
    /** ストリーマー所属情報
     * - 所属する団体がない場合項目なし
     */
    group_info?: StreamerGroupInfo;
    /** ストリーマー外部参照情報 */
    external_info?: StreamerExternalInfo;
}

/** ストリーマー基本情報 */
export declare interface StreamerBaseInfo {
    /** 名前 */
    name: string;
    /** 名前（英語表記） */
    en_name?: string
    /** 活動中フラグ */
    is_active: boolean;
    /** 誕生日 */
    birthday_info?: Birthday;
    /** YYYY-MM-DD */
    activity_start?: string;
    /** アイコン */
    icon_url: string;
    /** 活動国 */
    country?: string;
    /** イメージカラー */
    image_color?: string;
}

/** 誕生日設定
 * - 年情報がない場合が多いため構造体で保持する
 */
export declare interface Birthday {
    year?: string;
    month: number;
    date: number;
}

/** ストリーマー所属情報 */
export declare interface StreamerGroupInfo {
    id: string;
    is_group: boolean;
    sub_groups: string[];
}

/** ストリーマー外部参照情報 */
export declare interface StreamerExternalInfo {
    facebook?: Website[];
    fanclab?: Website[];
    nijisanji?: Nijisanji[];
    nonoficial_wiki?: Website[];
    official_site?: Website[];
    reddit?: Website[];
    tiktok?: Website[];
    twicas?: Website[];
    twitch?: Twitch[];
    twitter?: Twitter[];
    youtube?: Youtube[];
    [key: string]: any[] | undefined;
}

export declare interface Website {
    url: string;
}
export declare interface Twitch {
    /** TwitchチャンネルID */
    broadcaster_id: string;
    /** Twitch検索用名称 */
    broadcaster_name: string;
    /** APIからの取得情報 */
    api_data?: TwitchUser
}
export declare interface Youtube {
    /** YouTubeチャンネルID */
    channel_id: string;
    /** @ から始まるURL設定情報 */
    handle_id?: string
    /** 概要欄で区切り文字として使用している文字列
     * - コラボ配信者を概要欄から抽出する際、区切り文字で区切られたブロック1番目に存在することが多いため保持する
     */
    description_delimiter?: string
    /** APIからの取得情報 */
    api_data?: YoutubeChannelResponseItem
}
export declare interface Nijisanji {
    /** APIからの取得情報 */
    api_data: NijisanjiApiLiverData
}
export declare interface Twitter {
    id: string;
    type?: AccountType;
    hash_tags?: HashTag[];
}

export declare type AccountType = 'General' | 'News' | 'Sub'

export declare interface HashTag {
    name: string;
    type: HashTagType;
}

export declare type HashTagType = 'General' | 'News' | 'FanArt' | 'FanArtNSFW' | 'FanActivity' | 'FanTalk' | 'VoiceImpression' | 'Streaming' | 'MemberStreaming' | 'TwitterSpaceStreaming' | 'Other'

/**
 * ----------------------------------------------------------------------------------------------------------------
 */

/** Visheデータベース Streamingテーブル スキーマ定義
 * - 追跡対象の配信者の情報を管理する
 */
export declare type StreamingRawData = WithId<Streaming>

/** Visheデータベース Streaming情報
 * - 表示すべき配信枠を管理する
 */
export declare interface Streaming {
    /** 動画ID
     * - YouTube動画IDと同じ
    */
    video_id: string;

    date_info: DateInfo

    /** 配信状況 */
    streaming_status: StreamingStatus;

    /** プラットフォーム種別 */
    platform_type: LivePlatformType;
    /** 配信URL */
    url: string;
    /** サムネイル画像URL */
    thumbnail: string;
    /** サムネイル情報 */
    thumbnail_ifno?: Thumbnails
    /** 配信タイトル */
    title: string;
    /** 配信概要 */
    description: string;

    /** 配信者情報 */
    streamer_info: StreamingTalent;
    /** コラボ相手配信者情報 */
    collabo_streamer_info: StreamingTalent[];

    /** 配信タグ情報 */
    streaming_tags?: string[];
}

export declare interface DateInfo {
    /** 表示日付（簡易）
     * - hh:mm
     */
    display_date: string;
    /** 表示日付
     * - YYYYY/MM/DD hh:mm:ss
     */
    datetime: string;
    /** データの日付情報
     * - 開始時間があれば開始時間、なければ予定時間が入る
     */
    date?: Date;
    /** 動画枠作成日付 */
    create_date_time: string;
    /** 動画枠更新日付 */
    update_date_time: string;
    /** 配信枠開始予定日付 */
    scheduled_time: string;
    /** 配信枠公開日付 */
    start_time?: string;
    /** 配信枠終了日付 */
    end_time?: string;
}

/** 配信者情報 */
export declare interface StreamingTalent {
    /** 名前 */
    name: string;
    /** アイコン画像URL */
    icon_image_url: string;
    /** ID */
    streamer_id: string;
    /** イメージカラー */
    image_color?: string;
    /** URL情報 */
    link_url?: string;
    /** グループ情報 */
    group_info?: StreamingTalent;
}

/** 配信状況  */
export declare type StreamingStatus = 'not_on_air' | 'on_air' | 'finished'

/** 配信プラットフォーム種別  */
export declare type LivePlatformType = 'twitter' | 'youtube' | 'twitch' | 'bilibili' | 'radio' | 'other'

/** プラットフォーム種別  */
export declare type PlatformType = 'facebook' | 'officialShop' | 'fanclub' | 'reddit' | 'nonOficialWiki' | 'twitter' | 'youtube' | 'twitch' | 'bilibili'

export interface Tag {
    label: string, count: number
}
/**
 * ----------------------------------------------------------------------------------------------------------------
 */

/**
 * にじさんじライバー情報から取得したライバー情報
*/
export interface NijisanjiApiLiverData {
    slug: string;
    hidden: boolean;
    /** ライバー名 */
    name: string;
    /** ライバー名（英語表記） */
    enName: string;
    /** ライバーの画像情報 */
    images: NijisanjiApiImages;
    /** 関連SNSアカウント */
    socialLinks: NijisanjiApiSocialLinks;
    /** 色情報 */
    siteColor: NijisanjiApiSiteColor;
    /** にじさんじAPI上のライバー固有ID */
    id: string;
    /** 登録者数 */
    subscriberCount: number;
}

export interface NijisanjiApiImages {
    fieldId: NijisanjiApiImagesFieldID;
    /** 全身画像情報 */
    fullbody: NijisanjiApiFullbody;
    halfbodyNew: NijisanjiApiFullbody;
    head: NijisanjiApiFullbody;
    variation: NijisanjiApiVariation[];
}

export enum NijisanjiApiImagesFieldID {
    Images = "images",
}

export interface NijisanjiApiFullbody {
    url: string;
    height: number;
    width: number;
}

export interface NijisanjiApiVariation {
    fieldId: NijisanjiApiVariationFieldID;
    fullbody: NijisanjiApiFullbody;
}

export enum NijisanjiApiVariationFieldID {
    ImagesVariation = "imagesVariation",
}

export interface NijisanjiApiSiteColor {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    publishedAt: Date;
    revisedAt: Date;
    name: string;
    color1: string;
    color2: string;
}

export interface NijisanjiApiSocialLinks {
    fieldId: NijisanjiApiSocialLinksFieldID;
    twitter?: string;
    youtube?: string;
    facebook?: string;
    twitch?: string;
    officialShop?: string;
    fanclub?: string;
    bilibili?: string;
    reddit?: string;
}

export enum NijisanjiApiSocialLinksFieldID {
    SocialLinks = "socialLinks",
}
