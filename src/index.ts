const cron = require('node-cron');
const fs = require('fs');
const EventEmitter = require('events');
const events = new EventEmitter ();
import { Client, Guild, GuildMember, NonThreadGuildBasedChannel, TextChannel, User } from "discord.js";
import { Options, BirthdayData, userBirthdayData, memberBirthdayData, Data, Timezone } from "./struct/types";
export { Timezone };

export class Birthday {
    private readonly client: Client;
    private readonly options: Options;

    private birthdays: BirthdayData;

    constructor(Client: Client, Options: Options = {
        timezone: Timezone.UTC,
        hour: 0,
        minute: 0,
    }) {
        this.client = Client;
        this.options = Options;

        if (this.options.hour < 0 || this.options.hour > 23) throw new Error("Invalid hour.");
        if (this.options.minute < 0 || this.options.minute > 59) throw new Error("Invalid minute.");

        try {
            this.birthdays = require(__dirname + "/birthday.json");
        } catch (error) {
            this.init();
            this.birthdays = require(__dirname + "/birthday.json");
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

    private init: Function = (): Promise<Error | void> => {
        return new Promise((resolve, reject) => {
            const data: BirthdayData = {
                guilds: {},
                birthdays: {}
            }
            fs.writeFile(__dirname + "/birthday.json", JSON.stringify(data, null, 4), (err: NodeJS.ErrnoException) => {
                if (err) reject(err);
                else resolve();
            });
        })
    }

    private save: Function = (): Promise<Error | void> => {
        return new Promise((resolve, reject) => {
            fs.writeFile(__dirname + "/birthday.json", JSON.stringify(this.birthdays, null, 4), (err: NodeJS.ErrnoException) => {
                if (err) reject(err);
                else resolve();
            });
        })
    }

    private checkBirthdays: Function = (): void => {
        let now: Date = new Date();
        let guilds: Guild[];

        for (let userId in this.birthdays.birthdays) {
            const birthday: Data = this.birthdays.birthdays[userId];
            if (birthday.date.getDate() == now.getDate() && birthday.date.getMonth() == now.getMonth()) {
                this.client.users.fetch(userId).then(async (user: User) => {
                    await birthday.guilds.forEach((guildId: string) => {
                        this.client.guilds.fetch(guildId).then((guild: Guild) => {
                            guilds.push(guild);
                        });
                    });
                    this.emit("birthday", user, guilds);
                }).catch((err: Error) => {
                    throw err;
                });
            }
        }
    }

    public setUserBirthday: Function = async (user: User, date: Date, seeAge: boolean = true): Promise<Error | void> => {
        return new Promise((resolve, reject) => {

            date.setHours(23, 59, 59, 999)

            this.birthdays.birthdays[user.id] = {
                userId: user.id,
                seeAge: seeAge,
                date: date,
                guilds: this.birthdays.birthdays[user.id] ? this.birthdays.birthdays[user.id].guilds : []
            };

            this.save().then(() => {
                this.emit("birthdayUserSet", user, date);
                resolve();
            }).catch((err: Error) => reject(err));
        });
    };

    public getUserBirthday: Function = (user: User): Promise<userBirthdayData | Error> => {
        return new Promise((resolve, reject) => {
            if (!this.birthdays.birthdays[user.id]) reject(new Error("Birthday not defined for this user."));

            const date: Date = this.birthdays.birthdays[user.id].date;
            date.setFullYear(new Date().getFullYear());
            if (date.getTime() < Date.now()) {
                date.setFullYear(new Date().getFullYear()+1);
            }
            let daysBeforeNext: number = Math.floor((Date.now() - date.getTime()) / (60 * 60 * 24 * 1000)) < 0 ? Math.floor((Date.now() - date.getTime()) / (60 * 60 * 24 * 1000))*-1 : Math.floor((Date.now() - date.getTime()) / (60 * 60 * 24 * 1000));
            if (new Date(Date.now()).getDate() === date.getDate() && new Date(Date.now()).getMonth() === date.getMonth()) {
                daysBeforeNext = 0;
            }

            const data: userBirthdayData = {
                user: user,
                seeAge: this.birthdays.birthdays[user.id].seeAge,
                date: this.birthdays.birthdays[user.id].date,
                age: Math.floor((Date.now() - this.birthdays.birthdays[user.id].date.getTime()) / (60 * 60 * 24 * 365.25 * 1000)),
                daysBeforeNext: daysBeforeNext
            }

            resolve(data);
        });
    };

    public deleteUserBirthday: Function = (user: User): Promise<Error | void> => {
        return new Promise((resolve, reject) => {
            if (!this.birthdays.birthdays[user.id]) reject(new Error("User has no birthday."));

            delete this.birthdays.birthdays[user.id];

            this.save().then(() => {
                this.emit("birthdayUserDelete", user);
                resolve();
            }).catch((err: Error) => reject(err));
        });
    };

    public getGuildBirthdays: Function = (guild: Guild): Promise<memberBirthdayData[] | Error> => {
        return new Promise((resolve, reject) => {
            let birthdays: memberBirthdayData[] = [];

            guild.members.fetch({user: this.birthdays.guilds[guild.id].birthdays}).then(guildMembers => {
                guildMembers.forEach(guildMember => {
                    this.getUserBirthday(guildMember.user).then((userData: userBirthdayData) => {
                        const data: memberBirthdayData = {
                            member: guildMember,
                            seeAge: userData.seeAge,
                            date: userData.date,
                            age: userData.age,
                            daysBeforeNext: userData.daysBeforeNext,
                            guild: guild
                        }

                        birthdays.push(data);
                    })
                });
            }).catch((err: Error) => reject(err));

            resolve(birthdays);
        });
    };

    public activateMemberBirthday: Function = (member: GuildMember): Promise<Error | void> => {
        return new Promise((resolve, reject) => {
            if (!this.birthdays.birthdays[member.id]) reject(new Error("This member has no birthday."));

            this.birthdays.guilds[member.guild.id].birthdays.push(member.id);
            this.birthdays.birthdays[member.id].guilds.push(member.guild.id);

            this.save().then(() => {
                this.emit("birthdayMemberActivate", member);
                resolve();
            }).catch((err: Error) => reject(err));
        });
    };

    public deactivateMemberBirthday: Function = (member: GuildMember): Promise<Error | void> => {
        return new Promise((resolve, reject) => {
            if (!this.birthdays.birthdays[member.id]) reject(new Error("This member has no birthday."));

            this.birthdays.guilds[member.guild.id].birthdays.splice(this.birthdays.guilds[member.guild.id].birthdays.indexOf(member.id), 1);
            this.birthdays.birthdays[member.id].guilds.splice(this.birthdays.birthdays[member.id].guilds.indexOf(member.guild.id), 1);

            this.save().then(() => {
                this.emit("birthdayMemberDeactivate", member);
                resolve();
            }).catch((err: Error) => reject(err));
        });
    };

    public checkGuildBirthdaysState: Function = (member: GuildMember): boolean => {
        return !!this.birthdays.guilds[member.guild.id].birthdays.includes(member.id);
    };

    public setGuildBirthdayChannel: Function = (channel: TextChannel): Promise<Error | void> => {
        return new Promise((resolve, reject) => {
            this.birthdays.guilds[channel.guild.id].channels = channel.id;

            this.save().then(() => {
                this.emit("birthdayGuildChannelSet", channel);
                resolve();
            }).catch((err: Error) => reject(err));
        });
    };

    public deleteGuildBirthdayChannel: Function = (channel: TextChannel): Promise<Error | void> => {
        return new Promise((resolve, reject) => {
            this.birthdays.guilds[channel.guild.id].channels

            this.save().then(() => {
                this.emit("birthdayGuildChannelDelete", channel);
                resolve();
            }).catch((err: Error) => reject(err));
        });
    }

    public getGuildBirthdayChannel: Function = (guild: Guild): Promise<NonThreadGuildBasedChannel | Error | null> => {
        return new Promise((resolve, reject) => {
            if (!this.birthdays.guilds[guild.id].channels) reject(new Error("This guild has no birthday channel."));

            guild.channels.fetch(this.birthdays.guilds[guild.id].channels).then(channel => {
                resolve(channel);
            }).catch((err: Error) => reject(err));
        });
    }
}