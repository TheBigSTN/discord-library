import { Client, ClientOptions, Collection, GatewayIntentBits, REST, Routes } from "discord.js"
import { Commandfile, Commandfile_Old, CommandObj } from "./types"
import * as fs from "fs"
import * as path from "path"
import { transpiledata } from "./commandjson"

export interface DiscordBotArgs {
    token: string,
    config?: ClientOptions
}

export class DiscordBot {
    private readonly token: string
    readonly client: Client
    readonly commands: Collection<string, CommandObj>
    constructor(data: DiscordBotArgs) {
        if (!data.token) {
            throw new Error("The bot token was not provided")
        }
        this.token = data.token
        if (!data.config) {
            console.warn("Bot config was not provided. Using default config")
            this.client = new Client({
                intents: [GatewayIntentBits.Guilds]
            })
        } else {
            this.client = new Client(data.config)
        }
        this.client.login(this.token)
        this.client.once("ready", client => {
            if (!client.user) return 1
            console.info(`Ready! Logged in as ${client.user.tag}`)
        })
        this.commands = new Collection<string, CommandObj>()
    }
    /**
     * @param command should contain an obj that contains an execute function and a data propriety
     * @deprecated use the loadcommand method
    */
    loadcommand_old(command: Commandfile_Old) {
        if (!command.data) {
            console.error("You are missing the data propriety")
            return
        }
        if (!command.execute) {
            console.error("You are missing the execute function")
            return
        }
        command.data.toJSON()
        this.commands.set(command.data.name, command as unknown as CommandObj)
    }
    /**
     * @param command should contain an obj that contains an execute function and a data propriety
    */
    loadcommand(command: Commandfile) {
        if (!command.data) {
            console.error("You are missing the data propriety")
            return
        }
        if (!command.execute) {
            console.error("You are missing the execute function")
            return
        }
        command.data = transpiledata(command.data)
        this.commands.set(command.data.name, command as unknown as CommandObj)
    }
    /**
     * 
     * @param paths The path where this function should load commands
     */
    loadcommands(...paths: string[]) {
        for (const pathz of paths) {
            const dirs = fs.readdirSync(pathz)
            for (const dir of dirs) {
                const dirpath = path.join(pathz, dir)
                const files = fs.readdirSync(dirpath)
                for (const file of files) {
                    const filepath = path.join(dirpath, file)
                    const stats = fs.statSync(filepath)
                    if (stats.isDirectory() && !(fs.existsSync(path.join(filepath, "index.ts")) || fs.existsSync(path.join(filepath, "index.js")))) {
                        console.error("You are missing an index file at ", filepath)
                        continue
                    }
                    if (stats.isFile() && !(file.endsWith(".ts") || file.endsWith(".js"))) {
                        continue
                    }
                    const filedata = require(filepath)
                    console.log(`Loaded the command /${file}`)
                    if (filedata.data && filedata.execute) {
                        if (filedata.data.toJSON) {
                            filedata.data.toJSON()
                        } else {
                            filedata.data = transpiledata(filedata.data)
                        }

                    } else {
                        console.warn(`[Warning] The command at ${filepath} does not have the required Data or execute Propriety`)
                    }
                }
            }
        }
    }
    /**
     * @param paths The path to the folder that contains the events files
     * @description It loads the events into the discord bot as liseners
     * @usage You use this for telling the bot what do do when a user runs a command
     */
    loadevents(...paths: string[]) {
        for (const eventpath of paths) {
            const filenames = fs.readdirSync(eventpath)
            for (const file of filenames) {
                const filepath = path.join(eventpath, file)
                const event = require(filepath)
                if (event.once) {
                    this.client.once(event.name, (...args) => event.execute(...args))
                } else {
                    this.client.on(event.name, (...args) => event.execute(...args))
                }
            }
        }
    }
    /**
     * 
     * @param clientid The id of the application on discord gotten from the developer portal
     * @description It registers the commands to discord meaning that from the moment you run this all the commands that you loaded using loadcommand(_old) and loadcommands 
     * are going to be updated on discord
     */
    registercommands(clientid: string) {
        const commands = []
        for (const eventpath of this.commands.values()) {
            if (!eventpath.guild) {
                commands.push(eventpath.data)
            }
        }
        const rest = new REST().setToken(this.token);

        (async () => {
            try {
                console.log(`Started refreshing ${commands.length} application (/) commands.`);
                const data = await rest.put(
                    Routes.applicationCommands(clientid),
                    { body: commands },
                );
                //@ts-ignore
                console.log(`Successfully reloaded ${data.length} application (/) commands.`);
            } catch (error) {
                console.error(error);
            }
        })()

        const guildscomm = new Collection<string, object[]>()

        for (const eventvalue of this.commands.values()) {
            if (!eventvalue.guild) continue
            for (const guild of eventvalue.guild) {
                if (guildscomm.has(guild)) {
                    let temp = guildscomm.get(guild)
                    if (!temp) {
                        console.error("An error ocured")
                        continue
                    }
                    temp.push(eventvalue.data)
                    guildscomm.set(guild, temp)
                } else {
                    guildscomm.set(guild, [eventvalue.data])
                }
            }
        }

        (async () => {
            try {
                for (const [key, value] of guildscomm.entries()) {
                    console.log(`Started refreshing ${value.length} application (/) commands of guild ${key}`);
                    const data = await rest.put(
                        Routes.applicationGuildCommands(clientid, key),
                        { body: value },
                    );
                    //@ts-ignore
                    console.log(`Successfully reloaded ${data.length} application (/) commands of guild ${key}.`);
                }
            } catch (error) {
                console.error(error);
            }
        })()
    }
}

export default DiscordBot