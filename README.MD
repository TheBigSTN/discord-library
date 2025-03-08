# This is my discord bot project

This is kinda outdated the new docs are [here](./docs-source/Getting_Started.md)

## ● Description

This library gives you an easy way to start and make a discord bot.

It gives you as a default export usefull functions for loading event and commands.
By loading i mean that you tell the what to do when.

Use the [discord.js](https://discordjs.guide) documentation for more in depth discord js functions.

## Usage

To start you need to first get your bot token and application id
you get both of those from [here](https://discord.com/developers/applications) where you select or make your application.

You then need to store this data somewere you can place it in a json file but be carefull if you use github make sure you git ignore that file.

<!-- If you use typescript this is the tsconfig of this pakage
```json
{
  "compilerOptions": {
      "target": "ES2022",
      "module": "CommonJS",
      "moduleResolution": "Node",
      "allowJs": true,
      "strict": true,
      "noImplicitAny": true,
      "declaration": false,
      "skipLibCheck": true,
      "strictNullChecks": true,
      "resolveJsonModule": true,
      "outDir": "dist",
      "sourceMap": true
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
``` -->

This project was made for typescript but it supports javascript as whel but without the types

In your main file you need to first import the DiscordBot class from this pakage

```js
import DiscordBot from "discord-library";
```

Then you need to create an object using the DiscordBot class
It accepts 2 arguments one is the bot token and the other one is an array with intents if you provide none the default is used `GatewayIntentBits.Guilds`

You then need to create the bot using the class you imported

```js
const bot = DiscordBot({
  token:"Your token",
  config: {
    "Your config"
  }
})
```

From now on i am going to add to this example so i dont need to repeat myself

After all of this you can begin with event handling more importantly the command event because otherwise the bot wont know what to do.

### Events

---

The event file must export a object with a name and an execute function.

An example file using TS is

```ts
import { ChatInputCommandInteraction, Events } from "discord.js";
import { commands } from "..";

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.isChatInputCommand()) return;

    const command = commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`
      );
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      }
    }
  },
};
```

For JS users you need t oremove the types and replace import with const ... = require("...")

The bot class has a default on login event so you dont need to add one.

You need to place the file from above in any folder you whant along with other event files.
To load said events you need to call the loadevents function from the newly created bot object as an argument you need to pass the full path to the folder the events are located in so you have this file structure

- **events**/
  - commandinteraction.ts
  - other files

Example usage:

```ts
bot.loadevents("D:/discord-bot/events");
```

You can call the events folder wathever you whant.
You can add as many events folders paths to the function as you whant.

### Commands

---

With commands its mostly the same thing you can load singular commands using the loadcommand and loadcommand_old functions.
And commands with loadcommands

I will first cover the loadcommands

Your commands directory should look like:

- **commands**/
  - **utility**/
    - info.ts
    - ping.ts

On top of all of that you can also use folders with index files for command definition so you can also have

- **commands**/
  - **utility**/
    - **info**/
      - index.ts

You can use the folder with index thing if you have a command with multiple subcommands and functions that are only used there

To use the loadcommands function you need to give it the full path to the commands file.

```ts
bot.loadcommands("D:/discord-bot/commands");
```

You can add as many commands paths to the function as you whant.

To create a valid command file and you use typescript you can use the Commandfile & Commandfile_Old classes to get intelisense when making the file otherwize its not required.

```ts
import { ChatInputCommandInteraction } from "discord.js"

export new CommandFile({
  data:{
    name:"ping",
    description:"Pings you"
  },
  execute(interaction: ChatInputCommandInteraction) {
    interaction.reply("Pong")
  }
})
```

This is a basic ping command that uses that class for intelisense

The diference between the CommandFile & Commandfile_Old is that in the old variant you use a new SlashCommandBuilder() to create the data propriety
Example:

```ts
import { ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js"

export new CommandFile({
  data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Pings you!"),
  execute(interaction: ChatInputCommandInteraction) {
    interaction.reply("Pong")
  }
})
```

The Commandfile_Old is still included because some of the features of SlashCommandBuilder are not yet in the obj definition way of CommandFile

They go thow a slight different process but in the end are the same thing.
You chose what way to use.

The difference between is that to use loadcommand and loadcommand_old
you directly pass the command obj to the function.
Example:

```ts
bot.loadcommand({
  data: {
    name: "ping",
    description: "Pings you",
  },
  execute(interaction: ChatInputCommandInteraction) {
    interaction.reply("Pong");
  },
});
// And
bot.loadcommand_old({
  data: new SlashCommandBuilder().setName("ping").setDescription("Pings you!"),
  execute(interaction: ChatInputCommandInteraction) {
    interaction.reply("Pong");
  },
});
```

Witch could be useful for some commands.

### Registering Commands

---

You need to first load all the commands then try to register
To register you need the call the registercommands function.

The function need the application id you got at the start

```ts
bot.registercommands("You'r id here");
```

If you whant to register guild only commands you can add the optional guild array to the command.
Without it it registers to all the servers.

You need the exact server/guild id to make this to work
It works on all the loading commands functions the pakage has so far

```js
import { ChatInputCommandInteraction } from "discord.js"

export new CommandFile({
  data:{
    name:"ping",
    description:"Pings you"
  },
  guild: ["809820980285276210"],
  execute(interaction: ChatInputCommandInteraction) {
    interaction.reply("Pong")
  }
})
```

You just need to add the servers you whant that comand to get registered in.

You can add as many proprieties you whant by extending the main class and adding the new obj to it.
