import {
    ChatInputCommandInteraction,
    ClientEvents,
    Interaction,
    SlashCommandBuilder
} from "discord.js";
import { transpiledata } from "./commandjson";
import { Command, CommandObj } from "./types";

export interface Base {
    guild?: string[]
    execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

export interface Commandfile extends Base {
    data: Command
}

export interface Commandfile_Clasic extends Base {
    data: SlashCommandBuilder;
}

export interface EventFile<T extends keyof ClientEvents> {
    once?: boolean;
    name: T;  // Event name should be one of the keys of ClientEvents
    execute(...args: ClientEvents[T]): Promise<void>;  // Args will be inferred from the event name
}

export class Commandfile {
    constructor(data: Omit<Commandfile, "transpile">) {
        this.data = data.data
        this.guild = data.guild
        this.execute = data.execute
    }
    /** @internal */
    transpile(): CommandObj {
        const { transpile, ...rest } = this;
        return {
            ...rest,
            data: transpiledata(this.data)
        }
    }
}
/**
 * @deprecated The Commandfile class should be used. And is recomended to be used
 * this still exists because there are still proprieties that are not added (and need to get added)
 */
export class Commandfile_Clasic {
    constructor(data: Omit<Commandfile_Clasic, "transpile">) {
        this.data = data.data
        this.guild = data.guild
        this.execute = data.execute
    }
    /** @internal */
    transpile(): CommandObj {
        const { transpile, ...rest } = this;
        return {
            ...rest,
            data: this.data.toJSON()
        }
    }
}
export class EventFile<T extends keyof ClientEvents> {
    constructor(data: EventFile<T>) {
        this.name = data.name
        this.execute = data.execute
    }
}