import * as Iridium from "../iridium";
export interface UserDocument {
    _id: string;
    fullname: string;
    email: string;
    password: string;
    type: string;
    banned: boolean;
    statistics: {
        won: number;
        drawn: number;
        lost: number;
        incomplete: number;
    };
    skill: {
        matchmaking: number;
        trend: number;
        level: number;
        xp: number;
        current_level: number;
        next_level: number;
    };
    friends: string[];
    pending_messages: {
        from: string;
        time: Date;
        message: string;
        group?: string;
        game?: string;
    }[];
    sessions: string[];
    friend_requests: string[];
    last_seen: Date;
}
export declare class User extends Iridium.Instance<UserDocument, User> implements UserDocument {
    _id: string;
    readonly username: string;
    fullname: string;
    email: string;
    password: string;
    type: string;
    banned: boolean;
    statistics: {
        won: number;
        drawn: number;
        lost: number;
        incomplete: number;
    };
    skill: {
        matchmaking: number;
        trend: number;
        level: number;
        xp: number;
        current_level: number;
        next_level: number;
    };
    friends: string[];
    pending_messages: {
        from: string;
        time: Date;
        message: string;
        group?: string;
        game?: string;
    }[];
    sessions: string[];
    friend_requests: string[];
    last_seen: Date;
    static onCreating(user: UserDocument): Promise<never> | undefined;
    readonly API: {
        username: string;
        fullname: string;
        email: string;
        banned: boolean;
        statistics: {
            won: number;
            drawn: number;
            lost: number;
            incomplete: number;
        };
        skill: {
            level: number;
            xp: number;
        };
        friends: string[];
        pending_messages: {
            from: string;
            time: Date;
            message: string;
            group?: string | undefined;
            game?: string | undefined;
        }[];
        last_seen: Date;
    };
    setPassword(newPassword: string, callback: (err: Error, user?: User) => void): void;
    checkPassword(password: string): boolean;
    addFriend(friend: string, callback: (err: Error, user?: User) => void): void;
    updateLevel(): void;
}
