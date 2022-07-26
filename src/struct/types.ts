import {Guild, GuildMember, User} from "discord.js";
import Timezone from "./timezone";
export { Timezone };

export type Options = {
    dirname: string;
    timezone?: Timezone;
    hour?: number;
    minute?: number;
}

export type Data = {
    userId: string,
    seeAge: boolean,
    date: Date | string,
    guilds: string[]
}

export type guildsData = {
    channels: string;
    birthdays: string[];
}

export type BirthdayData = {
    guilds: { [key: string]: guildsData };
    birthdays: { [key: string]: Data }
}

export type userBirthdayData = {
    user: User,
    seeAge: boolean,
    date: Date,
    age: number,
    daysBeforeNext: number,
    guilds: Guild[]
}

export type memberBirthdayData = {
    member: GuildMember,
    seeAge: boolean,
    date: Date,
    age: number,
    daysBeforeNext: number,
    guild: Guild,
}