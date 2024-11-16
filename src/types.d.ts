import { RESTPostAPIChatInputApplicationCommandsJSONBody, CommandInteraction, SlashCommandBuilder } from "discord.js";

/**
 * @description It's the transpiled veriant that contains the command file and it's loadied into the Discordbot class
*/
export interface CommandObj {
    data: RESTPostAPIChatInputApplicationCommandsJSONBody
    guild?: string[]
    execute(interaction: CommandInteraction): Promise<void>
}

export interface Commandfile {
    data: Command
    guild?: string[]
    execute(interaction: CommandInteraction): Promise<void>;
}

export interface Commandfile_Old {
    data: SlashCommandBuilder;
    guild?: string[]
    execute(interaction: CommandInteraction): Promise<void>;
}

export class Commandfile {
    constructor(data: Commandfile) {
        this.data = data.data
        this.guild = data.guild
        this.execute = data.execute
    }
}


export class Commandfile_Old {
    constructor(data: Commandfile_Old) {
        this.data = data.data
        this.guild = data.guild
        this.execute = data.execute
    }
}

export interface SharedProp {
    name: string
    description?: string
}

export interface Command extends SharedProp, Option {
    subcommands?: Subcommand[]
    subcommandgroups?: Subcommandgroup[]
}


interface Subcommand extends SharedProp, Option { }

interface Subcommandgroup extends SharedProp {
    subcommands: Subcommand[]
}

interface OptionShared<T> extends SharedProp {
    required?: boolean
    autocomplete?: boolean
    choises?: Choises<T>[]
}

interface Choises<T> {
    name: string
    value: T
}
export interface Option {
    text_input?: Text_Option[]
    integer_input?: Integer_Option[]
    boolean_input?: Basic_Option[]
    user_input?: Basic_Option[]
    channel_input?: Channel_Option[]
    role_input?: Basic_Option[]
    mentionable_input?: Basic_Option[]
    number_input?: Integer_Option[]
    attachment_input?: Basic_Option[]
}

interface Text_Option extends OptionShared<string> {
    max_length?: number
    min_length?: number
}

interface Integer_Option extends OptionShared<number> {
    max_value?: number
    min_value?: number
}

interface Channel_Option extends SharedProp {
    required?: boolean
    channel_types?: ApplicationCommandOptionAllowedChannelTypes[]
}

interface Basic_Option extends SharedProp {
    required?: boolean
}

