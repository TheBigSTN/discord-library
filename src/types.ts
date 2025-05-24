import {
    ApplicationCommandOptionAllowedChannelTypes,
    Collection,
    InteractionContextType,
    LocalizationMap,
    PermissionFlagsBits,
    RESTPostAPIChatInputApplicationCommandsJSONBody
} from "discord.js";
import { Base } from "./classes";

declare module "discord.js" {
    export interface Client {
        commands: Collection<string, CommandObj>;
    }
}

/**
 * It's the transpiled variant that contains the command file and it's loaded into the Discordbot class
*/
export interface CommandObj extends Base {
    data: RESTPostAPIChatInputApplicationCommandsJSONBody
}
export interface SharedProp {
    name: string
    name_localizations?: LocalizationMap
    description?: string
    description_localizations?: LocalizationMap
}

export interface Command extends SharedProp, Option {
    nsfw?: boolean
    context?: InteractionContextType
    permisions?: (keyof typeof PermissionFlagsBits)[]
    subcommands?: Subcommand[]
    subcommandgroups?: Subcommandgroup[]
}

export interface Subcommand extends SharedProp, Option { }

export interface Subcommandgroup extends SharedProp {
    subcommands: Subcommand[]
}

interface OptionShared<T> extends SharedProp {
    required?: boolean
    autocomplete?: boolean
    choises?: {
        name: string
        value: T
    }[]
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

/**
 * Self explanatory
 */
export interface Text_Option extends OptionShared<string> {
    max_length?: number
    min_length?: number
}

/**
 * Self explanatory
 */
export interface Integer_Option extends OptionShared<number> {
    max_value?: number
    min_value?: number
}

/**
 * Self explanatory
 */
export interface Channel_Option extends SharedProp {
    required?: boolean
    channel_types?: ApplicationCommandOptionAllowedChannelTypes[]
}

/**
 * Self explanatory
 */
export interface Basic_Option extends SharedProp {
    required?: boolean
}