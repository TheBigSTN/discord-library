---
title: Starting
parent: Getting Started.md
---

# Main file

This library supports js and js. This tutorial is going to be în ts.

In order to start you have to import the Discordbot class.

```typescript
import { Discordbot } from ("discord-library")
// Keep in mind that js uses this sintax
const { Discordbot } = require("discord-library")
```

You then need to create the bot by calling new with the just imported class

```ts
const bot = new DiscordBot(/* ... */);
```

## Configuration

In order to get the token, create the discord bot, or get the client id folow this tutorial [here](https://discordjs.guide/preparations).

When creating the bot you need to give it the configuration.

The configuration format is:

```js
const bot = new Discordbot({
  token: "your token goes here",
  clientid: "your aplication id goes here",
  config: {}, // This is the config that gets passed to discord more on that later
  disabledefault: true, // default false
});
```

If you use git store the token inside an env variable or a .env file.

The bot **needs** the token.
The aplication id is used if you need to update commands.
But it is required.

### Config

This propriety is the bot configuration discord side. If config not specified the default value is:

```ts
new Client({
  intents: [GatewayIntentBits.Guilds],
});
```

More information about GatewayIntentBits [here](https://discordjs.guide/popular-topics/intents.html)
