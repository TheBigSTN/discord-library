---
title: Starting
parent: Getting Started.md
---

# Main file

Most of this library functionaliy gets exposed trought the default export of this library or the Discordbot export.

This class defines the discord bot.
You can import the class via:

```javascript
import Discordbot from ("discord-library");
// The default export you can give it any name yout whant
import { Discordbot } from ("discord-library")
// The named export both are the same thing.

// And if you use javascript and not typescript
const { Discordbot } = require("discord-library")
```

After importint the class you need to create an instance of the class with

```ts
const bot = new DiscordBot();
```

Keep in mind that the above code is not complete and should not be used.
More info in tbe section [here](#configuration)

## Configuration

Most configuration is more explained [here](https://discordjs.guide/preparations) and it's recomended that you folow that tutorial as it's more in depth and this library wraps that guide coding style.

When declaring the bot you need to give it the configuration.

The configuration format is:

```json
{
  "token": "your token goes here",
  "clientid": "your aplication id goes here",
  "config": {}, // This is the config that gets passed to discord more on that later
  "disabledefault": true // default false
}
```

You can pass the configuration directly or write it inside a json file.

If you use git place the token in a git ignored file

The bot **needs** the token.
The aplication id is used if you need to update commands.

### Config

This propriety is the bot configuration. If not specified then the bot gets the defuult configuration

```ts
new Client({
  intents: [GatewayIntentBits.Guilds],
});
```

Otherwise it gets what you give it with the config propriety.
