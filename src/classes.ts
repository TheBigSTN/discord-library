import {
    ChatInputCommandInteraction,
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

export class Commandfile {
    constructor(data: Omit<Commandfile, "transpile">) {
        this.data = data.data
        this.guild = data.guild
        this.execute = data.execute
    }
    /** @internal */
    transpile(): CommandObj {
        return {
            ...this,
            data: transpiledata(this.data)
        }
    }
}
/**
 * @deprecated The Commandfile class should be used. And is recomended to be used
 * this still exists because there are still proprieties that are not added (and need to get added)
 */
export class Commandfile_Clasic {
    constructor(data: Commandfile_Clasic) {
        this.data = data.data
        this.guild = data.guild
        this.execute = data.execute
    }
    /** @internal */
    transpile(): CommandObj {
        return {
            ...this,
            data: this.data.toJSON()
        }
    }
}