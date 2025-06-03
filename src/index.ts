import { Client, ClientEvents, ClientOptions, Collection, GatewayIntentBits, REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes } from "discord.js"
import * as fs from "fs"
import * as path from "path"
import { EventFile } from "./classes"
import DefaultEvent from "./event"
import { CommandFile, CommandFile_Clasic, CommandObj } from "./parsers/commandjson"
import { CommandHashService } from "./parsers/ShaService"
export * from "./parsers/buttonbuilder"
export * from "./parsers/commandjson"
export * from "./parsers/modalbuilder"
export * from "./classes"

export interface DiscordBotArgs {
    token: string,
    clientid: string
    config?: ClientOptions
    disabledefault?: boolean
    NoDefaultEvents?: boolean
    refreshAll?: boolean
}

declare module "discord.js" {
    export interface Client {
        commands: Collection<string, CommandObj>;
    }
}

export class DiscordBot {
    private readonly token: string
    private readonly clientid: string
    private readonly shaService;
    readonly client: Client<true>
    constructor(data: DiscordBotArgs) {
        if (!data.token) {
            throw new Error("The bot token was not provided");
        }
        this.token = data.token;
        if (!data.clientid) {
            throw new Error("The aplication id was not provided");
        }
        this.clientid = data.clientid;
        if (!data.config) {
            console.warn("Bot config not detected. Using default configuration");
            this.client = new Client({
                intents: [GatewayIntentBits.Guilds]
            });
        } else {
            this.client = new Client(data.config);
        }
        this.client.login(this.token)
        if (!data.disabledefault)
            this.client.once("ready", client => {
                if (!client.user) return;
                console.info(`Ready! Logged in as ${client.user.tag}`);
            });
        if (!data.NoDefaultEvents) {
            this.loadevent(DefaultEvent);
        }
        this.client.commands = new Collection<string, CommandObj>();
        this.shaService = new CommandHashService(data.refreshAll);
    }
    /**
     * Loads a command into the bot's command registry.
     *
     * This method takes a command of type `Commandfile`, validates the required properties (`data` and `execute`).
     * The processed command is then added to the bot's internal command collection.
     *
     * The `command` parameter should conform to the `Commandfile` interface. It must contain:
     * - `data`: The actual command data, which is expected to include a `name` property and additional command-related properties. 
     *   This `data` will be transpiled into a `RESTPostAPIChatInputApplicationCommandsJSONBody` format using the `transpiledata` function.
     * - `execute`: A function that defines what the command does when executed. This should be a `Promise` returning function 
     *   that accepts a `ChatInputCommandInteraction` parameter.
     *
     * @param {Commandfile} command - The command object that contains:
     *    - `data`: The command's data, which must include the `name` and optionally other properties like `description`, 
     *      `subcommands`, `options`, etc. 
     *      This `data` will be transpiled into a format compatible with Discord's Slash Commands API.
     *    - `execute`: A function that is executed when the command is triggered. It should accept a `ChatInputCommandInteraction` object 
     *      and return a `Promise<void>`.
     *
     * @throws {Error} If the `command` object is missing the required `data` or `execute` properties, an error will be logged.
     * @throws {Error} If the `command.data` does not have a valid `name`, it may cause issues in registering the command.
     */
    loadcommand(command: CommandFile): void {
        if (!command.data.data) {
            throw new Error(`You are missing the data propriety`)
        }
        if (!command.data.execute) {
            throw new Error(`You are missing the execute function in the command /${command.data.data.name}`)
        }
        console.log(`Loaded the command /${command.data.data.name}`)
        this.shaService.check(command.data.data);
        this.client.commands.set(command.data.data.name, command.transpile())
    }
    /**
     * @param command Should contain a SlashCommandBuilder
     * The same as loadcommand_old
     * @deprecated use the loadcommand method
    */
    loadcommand_old(command: CommandFile_Clasic) {
        if (!command.data.data) {
            throw new Error(`You are missing the data propriety`)
        }
        if (!command.data.execute) {
            throw new Error(`You are missing the execute function in the command /${command.data.data.name}`)
        }
        console.log(`Loaded the command /${command.data.data.name}`)
        this.shaService.check(command.data.data)
        this.client.commands.set(command.data.data.name, command.transpile())
    }
    /**
     * Loads multiple commands into the bot's command registry from the specified directories.
     *
     * This method iterates over the provided paths, reads the files in each directory, and loads commands that conform to the 
     * expected structure. Each file is validated to ensure that it contains a valid command format and the necessary 
     * `data` and `execute` properties. If any file is missing the required properties, errors are thrown.
     * 
     * The `data` of each command is then processed, and any necessary transpiling is done to make it compatible with 
     * the bot's command registry. Once validated, each command is added to the bot's internal command collection.
     * That can be accesed in the client.commands propriety from the main class (DiscordBot)
     *
     * The files must be placed in a 2 dimentional directory like: commands/utility/ping.ts or commands/utility/ping.js.
     * Where the path to commands gets passed to the method like:
     * @example
     * ```
     * loadcommands('./commands');
     * ```
     * Asuming that the main file is in the same directory as the commands directory
     * 
     * @param {string[]} paths - An array of paths to directories that contain command files.
     * 
     * @throws {Error} If any file is found that does not conform to the expected format (missing `data` or `execute`).
     * 
     * @example
     * ```
     * loadcommands('path/to/commands', 'path/to/another/commands');
     * ```
     * 
     * In this example, the method will load all command files from the provided directories. Each file must export a valid command 
     * object with `data` and `execute` properties.
     */
    loadcommands(paths: string[], beforeload?: (command: CommandFile) => void | CommandFile | undefined) {
        for (const pathz of paths) {
            const dirs = fs.readdirSync(pathz);
            for (const dir of dirs) {
                const dirpath = path.join(pathz, dir);
                const files = fs.readdirSync(dirpath);
                for (const file of files) {
                    const filepath = path.join(dirpath, file);
                    const stats = fs.statSync(filepath);
                    if (stats.isFile() && !(file.endsWith(".ts") || file.endsWith(".js"))) continue;
                    const data = require(filepath);
                    let command = data.default || data;
                    if (beforeload) {
                        const result = beforeload(command);
                        if (result === undefined) continue;
                        if (result instanceof CommandFile) command = result;
                    }
                    this.loadcommand(command);
                }
            }
        }
    }
    loadevent<T extends keyof ClientEvents>(event: EventFile<T>) {
        if (!event.name) throw new Error("The event name was not provided");
        if (!event.execute) throw new Error("The event execute function was not provided");

        if (event.once) {
            this.client.once(event.name, (...args) => event.execute(...args));
        } else {
            this.client.on(event.name, (...args) => event.execute(...args));
        }
    }
    /**
     * @param paths The path to the folder that contains the events files
     * It loads the events into the discord bot as liseners
     * You use this for telling the bot what do do when a user runs a command
     */
    loadevents(...paths: string[]) {
        for (const eventpath of paths) {
            const filenames = fs.readdirSync(eventpath)
            for (const file of filenames) {
                const filepath = path.join(eventpath, file)
                const event = require(filepath)
                this.loadevent(event.default || event)
            }
        }
    }
    /**
     * It registers the commands to discord meaning that from the moment you run this all the commands that you loaded using loadcommand(_old) and loadcommands 
     * are going to be updated on discord
     */
    async registercommands() {
        await new Promise(resolve => this.client.once("ready", resolve));
        const commands = []
        for (const [commandName] of this.shaService.staleCommands) {
            const command = this.client.commands.get(commandName);
            if (!command) {
                console.error(`Command ${commandName} not found in the client commands collection.`);
                continue;
            }
            if (command.guild) continue
            commands.push(command.data);
        }
        const rest = new REST().setToken(this.token);


        try {
            console.log(`Started refreshing ${commands.length} application (/) commands.`);
            const data = await rest.put(
                Routes.applicationCommands(this.clientid),
                { body: commands },
            );
            commands.forEach(command => this.shaService.updateSha(command.name));
            try {
                //@ts-ignore
                console.log(`Successfully reloaded ${data.length} application (/) commands.`);
            } catch (error) { }
        } catch (error) {
            console.error(error);
        }

        const guildscomm = new Collection<string, RESTPostAPIChatInputApplicationCommandsJSONBody[]>()

        for (const command of this.shaService.staleCommands.entries()) {
            const commandObj = this.client.commands.get(command[0]);
            if (!commandObj) {
                console.error(`Command ${command[0]} not found in the client commands collection.`);
                continue;
            }
            if (!commandObj.guild) continue

            for (const guild of commandObj.guild) {
                if (guildscomm.has(guild)) {
                    const temp = guildscomm.get(guild)
                    if (!temp) {
                        console.error("An error ocured")
                        continue
                    }
                    temp.push(commandObj.data)
                    guildscomm.set(guild, temp)
                } else {
                    guildscomm.set(guild, [commandObj.data])
                }
            }

        }

        try {
            for (const [key, value] of guildscomm.entries()) {
                console.log(`Started refreshing ${value.length} application (/) commands of guild ${key}`);
                const data = await rest.put(
                    Routes.applicationGuildCommands(this.clientid, key),
                    { body: value },
                );
                value.forEach(command => this.shaService.updateSha(command.name));
                //@ts-ignore
                console.log(`Successfully reloaded ${data.length} application (/) commands of guild ${key}.`);
            }
        } catch (error) {
            console.error(error);
        }

        this.shaService.cleanup();
        this.shaService.save();
        console.log("All commands have been registered and updated successfully.");
    }
}

export default DiscordBot