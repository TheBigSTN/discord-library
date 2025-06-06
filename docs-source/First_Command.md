---
title: First command
parent: Getting Started.md
---

If you got here then in your main file you should have something similar with this

```ts
import { Discordbot } from ("discord-library")

const bot = new Discordbot({
  "token": "your token goes here",
  "clientid": "your aplication id goes here"
})
```

While you could add the commands here in this file it's not recomended.
As of v1.6 you have 3 methods to add commands: loadcommand, loadcommand_old, loadcommands

### loadcommand

This method takes a CommandFile class as an argument.

```ts
//Called with
bot.loadcommand(/**/);
//And the command declare with
const command = new CommandFile({
  data: {
    /* props */
  },
  async execute(interaction) {
    //The command logic
  },
  guilds: ["guild Id"], // This registesc the command only în the specified guilds
});
```

### loadcommand_old

The only diference between this one and the first one is that data is a new SlashCommandBuilder from discord js. More information [here](https://discordjs.guide/creating-your-bot/slash-commands.html#before-you-continue).

### loadcommands

This is a special method as this can take 2 arguments.
The first argument is required and it's a list of paths to the commands directory.
It has to be a full path and you should create it with:

```ts
import path from "path";

bot.loadcommands([path.join(__dirname, "commands")]);
```

Were commands is the directory that contains subcategorie (subfolders), in there you place your command files. They can have any names. As long that they are în the format.
MainFolder(in this case named commands):

- Category1:
  - ping.ts(.js)
- Category2:
  - config.ts(.js)

Each command file must contain with typescript a default export of a CommandFile or in js a module.export of CommanfFile.

```ts
import { CommandFile } from "discord-library/dist";

export default new CommandFile({
  // Config ...
});

// Or with js

module.export = new CommandFile({
  // Config
});
```

About all the proprieties of a CommandFile you can check [here](../docs/classes/index.CommandFile.html)
