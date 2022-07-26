# Discord Birthday
![](https://img.shields.io/github/workflow/status/ayrozdzn/discord-birthday/Node.js%20CI?style=for-the-badge)
![](https://img.shields.io/npm/v/discord-birthday?style=for-the-badge&color=success)
![](https://img.shields.io/npm/dt/discord-birthday?style=for-the-badge)

discord-birthday is a powerful package that allows you to create a **birthday system** on your **discord bot** _easily and quickly_.


# Installation

## Download package

```sh-session
npm install discord-birthday
npm install @ayrozdzn/discord-birthday
yarn add discord-birthday
```


## Connect to your discord bot

```js
const { Birthday, Timezone } = require("discord-birthday"); // or @ayrozdzn/discord-birthday
const { Client } = require("discord.js");

const client = new Client({ ... });

client.birthday = new Birthday(client, {
    timezone: Timezone.UTC,
    hour: 10,
    minute: 0,
});
```

| Parameter | Type | Optional | Default | Description |
|--|--|--|--|--|
| client | [Client](https://discord.js.org/#/docs/discord.js/main/class/Client) |  |  | The discord client |
| timezone | [Timezone](https://github.com/AyrozDZN/discord-birthday/blob/master/src/struct/timezone.ts) | ✓ | Timezone.UTC | Your timezone |
| hour | [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | ✓ | 10 | A number between 0 and 23 |
| minute | [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) | ✓ | 0 | A number between 0 and 59 |

#  Methods

## setUserBirthday

```js
client.birthday.setUserBirthday(user, date, seeAge).catch(err => {
    console.error(err);
});
```

| Parameter | Type | Description |
|--|--|--|
| user | [User](https://discord.js.org/#/docs/discord.js/main/class/User) | The user whose birthday is to be set |
| date | [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) | The birthday date |
| seeAge | [Boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean) | Set the visibility variable accessible after |

returns : [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)

## getUserBirthday

```js
client.birthday.getUserBirthday(user).then((birthday) => {
    console.log(birthday)
    /*
    {
        user: <User>,
        seeAge: <Boolean>,
        date: <Date>,
        age: <Number>,
        daysBeforeNext: <Number>,
        guilds: <Array<Guild>>,
    }
    */
}).catch((err) => console.error(err));
```

| Parameter | Type | Description |
|--|--|--|
| user | [User](https://discord.js.org/#/docs/discord.js/main/class/User) | The user whose birthday is to be collected |

returns : [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) <[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)>

## deleteUserBirthday

```js
client.birthday.deleteUserBirthday(user).catch(err => {
    console.error(err);
});
```

| Parameter | Type | Description |
|--|--|--|
| user | [User](https://discord.js.org/#/docs/discord.js/main/class/User) | The user whose birthday is to be delete |

returns : [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)



## getGuildBirthdays

```js
client.birthday.getGuildBirthdays(guild).then((birthdays) => {
    console.log(birthdays)
    /*
    [
        {
            member: <GuildMember>,
            seeAge: <Boolean>,
            date: <Date>,
            age: <Number>,
            daysBeforeNext: <Number>,
            guild: <Guild>
        },
        ...
    ]
    */
}).catch((err) => console.error(err));
```

| Parameter | Type | Description |
|--|--|--|
| guild | [Guild](https://discord.js.org/#/docs/discord.js/main/class/Guild) | The guild in which the birthdays are to be collected |

returns : [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) <[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)\[[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)\]>

## activateMemberBirthday

```js
client.birthday.activateMemberBirthday(member).catch(err => {
    console.error(err);
});
```

| Parameter | Type | Description |
|--|--|--|
| member | [GuildMember](https://discord.js.org/#/docs/discord.js/main/class/GuildMember) | The member whose birthday is to be activated |

returns : [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)

## deactivateMemberBirthday

```js
client.birthday.deactivateMemberBirthday(member).catch(err => {
    console.error(err);
});
```

| Parameter | Type | Description |
|--|--|--|
| member | [GuildMember](https://discord.js.org/#/docs/discord.js/main/class/GuildMember) | The member whose birthday is to be deactivated |

returns : [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)

## checkMemberGuildBirthdaysStatus

```js
const status = client.birthday.checkMemberGuildBirthdaysStatus(member) // returns true or false
```

| Parameter | Type | Description |
|--|--|--|
| member | [GuildMember](https://discord.js.org/#/docs/discord.js/main/class/GuildMember) | The member whose birthday is checked |

returns : [boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/boolean)

## setGuildBirthdayChannel

```js
client.birthday.setGuildBirthdayChannel(channel).catch(err => {
    console.error(err);
});
```

| Parameter | Type | Description |
|--|--|--|
| channel | [TextChannel](https://discord.js.org/#/docs/discord.js/main/class/TextChannel) | The channel in which the birthdays will be wished |

returns : [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)

## getGuildBirthdayChannel

```js
client.birthday.getGuildBirthdayChannel(guild).then((channel) => {
    console.log(channel) /* <NonThreadGuildBasedChannel> */
}).catch((err) => console.error(err));
```

| Parameter | Type | Description |
|--|--|--|
| guild | [Guild](https://discord.js.org/#/docs/discord.js/main/class/Guild) | The guild in which the channel is to be collected |

returns : [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) <[GuildChannel](https://discord.js.org/#/docs/discord.js/main/class/GuildChannel)>

## deleteGuildBirthdayChannel

```js
client.birthday.deleteGuildBirthdayChannel(guild).catch(err => {
    console.error(err);
});
```

| Parameter | Type | Description |
|--|--|--|
| guild | [Guild](https://discord.js.org/#/docs/discord.js/main/class/Guild) | The guild in which the birthdays channel will be delete |

returns : [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)

# Events

## isBirthday

```js
client.birthday.on("isBirthday", (user, guilds) => {
    console.log(`The birthday of ${user.tag} has been wished in ${guilds.length}`);
    guilds.forEach(guild => {
        guild.channels.get("...").send({content: `It's the birthday of ${member.user.tag}`})
    })
});
```

| Parameter | Type | Description |
|--|--|--|
| user | [User](https://discord.js.org/#/docs/discord.js/main/class/User) | The user whose birthday has been wished |
| guilds | [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) \<[Guild](https://discord.js.org/#/docs/discord.js/main/class/Guild)> | Array of all guild where the birthday has been wished |

## birthdayUserSet

```js
client.birthday.on("birthdayUserSet", (user, date) => {
    console.log(`The birthday of ${user.tag} is ${date.toDateString()}`);
});
```

| Parameter | Type | Description |
|--|--|--|
| user | [User](https://discord.js.org/#/docs/discord.js/main/class/User) | The user whose birthday has been set up |
| date | [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) | The birthday date |

## birthdayUserDelete

```js
client.birthday.on("birthdayUserDelete", (user) => {
    console.log(`The birthday of ${user.tag} has been delete`);
});
```

| Parameter | Type | Description |
|--|--|--|
| user | [User](https://discord.js.org/#/docs/discord.js/main/class/User) | The user whose birthday has been deleted |

## birthdayMemberActivate

```js
client.birthday.on("birthdayMemberActivate", (member) => {
    console.log(`The birthday of ${member.user.tag} has been activated in ${member.guild.name}`);
});
```

| Parameter | Type | Description |
|--|--|--|
| member | [GuildMember](https://discord.js.org/#/docs/discord.js/main/class/GuildMember) | The member whose birthday has been activated |

## birthdayMemberDeactivate

```js
client.birthday.on("birthdayMemberDeactivate", (member) => {
    console.log(`The birthday of ${member.user.tag} has been deactivated in ${member.guild.name}`);
});
```

| Parameter | Type | Description |
|--|--|--|
| member | [GuildMember](https://discord.js.org/#/docs/discord.js/main/class/GuildMember) | The member whose birthday has been deactivated |

## birthdayGuildChannelSet

```js
client.birthday.on("birthdayGuildChannelSet", (channel) => {
    console.log(`The birthday channel ${channel.name} has been set for the guild ${channel.guild.name}`);
});
```

| Parameter | Type | Description |
|--|--|--|
| channel | [GuildChannel](https://discord.js.org/#/docs/discord.js/main/class/GuildChannel) | The channel whose birthday channel has been set up |

## birthdayGuildChannelDelete

```js
client.birthday.on("birthdayGuildChannelSet", (guild) => {
    console.log(`The birthday channel of ${guild.name} has been delete`);
});
```

| Parameter | Type | Description |
|--|--|--|
| guild | [Guild](https://discord.js.org/#/docs/discord.js/main/class/Guild) | The Guild whose birthday channel has been delete |