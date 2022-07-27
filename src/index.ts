import * as path from "path";

const cron = require('node-cron');
const fs = require('fs');
const EventEmitter = require('events');
const events = new EventEmitter ();
import { Client, Guild, GuildMember, NonThreadGuildBasedChannel, TextChannel, User } from "discord.js";
import { Options, BirthdayData, userBirthdayData, memberBirthdayData, Data, Timezone } from "./struct/types";
export { Timezone };

export class Birthday {
    private readonly client: Client;
    public options: Options;
    private birthdays: BirthdayData;

    constructor(Client: Client, Options?: Options) {
        this.client = Client;
        this.options = Options || {
            timezone: Timezone.UTC,
            hour: 10,
            minute: 0
        };
        if (this.options.timezone === undefined) this.options.timezone = Timezone.UTC;
        if (this.options.hour === undefined) this.options.hour = 10;
        if (this.options.minute === undefined) this.options.minute = 0;

        if (this.options.hour < 0 || this.options.hour > 23) throw new Error("Invalid hour.");
        if (this.options.minute < 0 || this.options.minute > 59) throw new Error("Invalid minute.");

        try {
            this.birthdays = require(path.join(__dirname + "../../birthday.json"));
        } catch (err) {
            this.birthdays = {
                guilds: {},
                birthdays: {}
            };
            this.save();
        }

        cron.schedule(`${this.options.minute} ${this.options.hour} * * *`, () => {
            this.checkBirthdays();
        }, {timezone: this.options.timezone});
    }

    public on: Function = (event: string, listener: Function): void => {
        events.on(event, listener);
    }
    public emit: Function = (event: string, ...args: any[]): void => {
        events.emit(event, ...args);
    }

    private save: Function = (): Promise<Error | void> => {
        return new Promise((resolve, reject) => {
            fs.writeFile(path.join(__dirname + "../../birthday.json"), JSON.stringify(this.birthdays, null, 4), (err: NodeJS.ErrnoException) => {
                if (err) return reject(err);
                else return resolve();
            });
        })
    }

    private checkBirthdays: Function = (): void => {
        let now: Date = new Date();

        let guilds: Guild[] = [];

        for (let userId in this.birthdays.birthdays) {
            const birthday: Data = this.birthdays.birthdays[userId];
            let date: Date = new Date(birthday.date);
            if (date.getDate() == now.getDate() && date.getMonth() == now.getMonth()) {
                this.client.users.fetch(userId).then(async (user: User) => {
                    await birthday.guilds.forEach((guildId: string) => {
                        this.client.guilds.fetch(guildId).then((guild: Guild) => {
                            guilds.push(guild);
                        });
                    });
                    if (guilds.length > 0) this.emit("isBirthday", user, guilds);
                }).catch((err: Error) => {
                    throw err;
                });
            }
        }
    }

    public setUserBirthday: Function = (user: User, date: Date, seeAge: boolean = true): Birthday => {

        if (isNaN(date.getTime())) throw new Error("Invalid date");

        date.setHours(23, 59, 59, 999);

        this.birthdays.birthdays[user.id] = {
            userId: user.id,
            seeAge: seeAge,
            date: date,
            guilds: this.birthdays.birthdays[user.id] ? this.birthdays.birthdays[user.id].guilds : []
        };

        this.save().then(() => {
            this.emit("birthdayUserSet", user, date);
        }).catch((err: Error) => { throw err; });

        return this;
    };

    public getUserBirthday: Function = async (user: User): Promise<userBirthdayData | undefined> => {
        return new Promise(async (resolve) => {
            let guilds: Guild[] = [];
            if (!this.birthdays.birthdays[user.id]) return resolve(undefined);

            const date: Date = new Date(this.birthdays.birthdays[user.id].date);
            date.setFullYear(new Date().getFullYear());
            if (date.getTime() < Date.now()) {
                date.setFullYear(new Date().getFullYear()+1);
            }
            let daysBeforeNext: number = Math.floor((Date.now() - date.getTime()) / (60 * 60 * 24 * 1000)) < 0 ? Math.floor((Date.now() - date.getTime()) / (60 * 60 * 24 * 1000))*-1 : Math.floor((Date.now() - date.getTime()) / (60 * 60 * 24 * 1000));

            await this.birthdays.birthdays[user.id].guilds.forEach((guildId: string) => {
                this.client.guilds.fetch(guildId).then((guild: Guild) => {
                    guilds.push(guild);
                });
            });

            const data: userBirthdayData = {
                user: user,
                seeAge: this.birthdays.birthdays[user.id].seeAge,
                date: new Date(this.birthdays.birthdays[user.id].date),
                age: Math.floor((Date.now() - new Date(this.birthdays.birthdays[user.id].date).getTime()) / (60 * 60 * 24 * 365.25 * 1000)),
                nextBirthday: date,
                daysBeforeNext: daysBeforeNext-1,
                guilds: guilds
            }

            return resolve(data);
        });
    };

    public deleteUserBirthday: Function = (user: User): Birthday => {
        if (!this.birthdays.birthdays[user.id]) return this;

        this.birthdays.birthdays[user.id].guilds.forEach((guildId: string) => {
            this.birthdays.guilds[guildId].birthdays.splice(this.birthdays.guilds[guildId].birthdays.indexOf(user.id), 1);
        });

        delete this.birthdays.birthdays[user.id];

        this.save().then(() => {
            this.emit("birthdayUserDelete", user);
        }).catch((err: Error) => { throw err; });

        return this;
    };

    public getGuildBirthdays: Function = async (guild: Guild): Promise<memberBirthdayData[] | undefined> => {
        return new Promise(async (resolve, reject) => {
            if (!this.birthdays.guilds[guild.id]) return resolve(undefined);

            guild.members.fetch({user: this.birthdays.guilds[guild.id].birthdays}).then(async guildMembers => {
                let birthdays: memberBirthdayData[] = [];
                await guildMembers.forEach(guildMember => {
                    this.getUserBirthday(guildMember.user).then((userData: userBirthdayData | undefined) => {
                        if (!userData) return;
                        const data: memberBirthdayData = {
                            member: guildMember,
                            seeAge: userData.seeAge,
                            date: new Date(userData.date),
                            age: userData.age,
                            nextBirthday: userData.nextBirthday,
                            daysBeforeNext: userData.daysBeforeNext,
                            guild: guild
                        }
                        birthdays.push(data);
                    })
                });
                return resolve(birthdays);
            }).catch((err: Error) => { return reject(err); });
        });
    };

    public activateMemberBirthday: Function = (member: GuildMember): Birthday => {
        if (!this.birthdays.birthdays[member.id]) throw new Error("Birthday not defined for this user.");

        if (!this.birthdays.guilds[member.guild.id]) {
            this.birthdays.guilds[member.guild.id] = {
                channels: "",
                birthdays: []
            };
        }

        if (this.birthdays.guilds[member.guild.id].birthdays.indexOf(member.id) !== -1) throw new Error("Birthday already activated for this user.");

        this.birthdays.guilds[member.guild.id].birthdays.push(member.id);
        this.birthdays.birthdays[member.id].guilds.push(member.guild.id);

        this.save().then(() => {
            this.emit("birthdayMemberActivate", member);
        }).catch((err: Error) => { throw err; });

        return this;
    };

    public deactivateMemberBirthday: Function = (member: GuildMember): Birthday => {
        if (!this.birthdays.birthdays[member.id]) throw new Error("Birthday not defined for this user.");

        if (!this.birthdays.guilds[member.guild.id]) throw new Error("Birthday not activated for this user.");
        if (this.birthdays.guilds[member.guild.id].birthdays.indexOf(member.id) === -1) throw new Error("Birthday not activated for this user.");

        this.birthdays.guilds[member.guild.id].birthdays.splice(this.birthdays.guilds[member.guild.id].birthdays.indexOf(member.id), 1);
        this.birthdays.birthdays[member.id].guilds.splice(this.birthdays.birthdays[member.id].guilds.indexOf(member.guild.id), 1);

        this.save().then(() => {
            this.emit("birthdayMemberDeactivate", member);
        }).catch((err: Error) => { throw err; });

        return this;
    };

    public checkMemberGuildBirthdaysStatus: Function = (member: GuildMember): boolean => {
        if (!this.birthdays.guilds[member.guild.id]) return false;
        return this.birthdays.guilds[member.guild.id].birthdays.indexOf(member.id) !== -1;

    };

    public setGuildBirthdayChannel: Function = (channel: TextChannel): Birthday => {
        if (!this.birthdays.guilds[channel.guild.id]) {
            this.birthdays.guilds[channel.guild.id] = {
                channels: "",
                birthdays: []
            };
        }
        this.birthdays.guilds[channel.guild.id].channels = channel.id;

        this.save().then(() => {
            this.emit("birthdayGuildChannelSet", channel);
        }).catch((err: Error) => { throw err; });

        return this;
    };

    public getGuildBirthdayChannel: Function = async (guild: Guild): Promise<NonThreadGuildBasedChannel | undefined | null> => {
        return new Promise(async (resolve, reject) => {
            if (!this.birthdays.guilds[guild.id]) return resolve(undefined);
            if (!this.birthdays.guilds[guild.id].channels.length) return resolve(undefined);

            guild.channels.fetch(this.birthdays.guilds[guild.id].channels).then(channel => {
                return resolve(channel);
            }).catch((err: Error) => { return reject(err); });
        });
    }

    public deleteGuildBirthdayChannel: Function = (guild: Guild): Birthday => {
        if (!this.birthdays.guilds[guild.id]) return this;

        if (this.birthdays.guilds[guild.id].channels.length === 0) return this;

        this.birthdays.guilds[guild.id].channels = "";

        this.save().then(() => {
            this.emit("birthdayGuildChannelDelete", guild);
        }).catch((err: Error) => { throw err; });

        return this;
    }
}