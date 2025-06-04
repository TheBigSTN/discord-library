import {
    RESTPostAPIChatInputApplicationCommandsJSONBody,
    SlashCommandBuilder,
    SlashCommandSubcommandGroupBuilder,
    SlashCommandSubcommandBuilder,
    PermissionFlagsBits,
    LocalizationMap,
    ChatInputCommandInteraction,
    InteractionContextType,
    ApplicationCommandOptionAllowedChannelTypes
} from "discord.js"
import { CommandHashService } from "./ShaService"

export interface SharedProp {
    name: string
    name_localizations?: LocalizationMap
    description?: string
    description_localizations?: LocalizationMap
}

export interface Subcommand extends SharedProp {
    options?: Option[]
}

export interface Subcommandgroup extends SharedProp {
    subcommands: Subcommand[]
}

export interface Command extends SharedProp {
    nsfw?: boolean
    context?: InteractionContextType
    permisions?: (keyof typeof PermissionFlagsBits)[]
    subcommands?: Subcommand[]
    subcommandgroups?: Subcommandgroup[]
    options?: Option[]
}

export interface CommandFileProps {
    data: Command
    guild?: string[]
    execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

export interface OptionBase<T> extends SharedProp {
    description: string
    required?: boolean
    autocomplete?: boolean
    choises?: {
        name: string
        value: T
    }[]
}

export type Option = {
    type: "channel",
    description: string
    required?: boolean
    channel_types?: ApplicationCommandOptionAllowedChannelTypes[]
} & SharedProp | {
    type: "text",
    max_length?: number
    min_length?: number
} & OptionBase<string> | {
    type: "boolean" | "user" | "mentionable" | "attachment" | "role",
    description: string
    required?: boolean
} & SharedProp | {
    type: "integer" | "number",
    max_value?: number
    min_value?: number
} & OptionBase<number>

export interface CommandObj extends Omit<CommandFileProps, "data"> {
    data: RESTPostAPIChatInputApplicationCommandsJSONBody
}

export class CommandFile {
    transpiled: SlashCommandBuilder = new SlashCommandBuilder()
    command;
    data: CommandFileProps

    constructor(data: CommandFileProps) {
        this.command = data.data;
        this.data = data;
    }

    public transpile(): CommandObj {
        this.transpiled.setName(this.command.name)
        if (this.command.description) this.transpiled.setDescription(this.command.description)
        // Localizations
        if (this.command.name_localizations) this.transpiled.setNameLocalizations(this.command.name_localizations)
        if (this.command.description_localizations) this.transpiled.setDescriptionLocalizations(this.command.description_localizations)
        // Other
        if (this.command.permisions) {
            const validPermissions = this.command.permisions
                .map(permission => PermissionFlagsBits[permission])
                .filter(Boolean);

            if (validPermissions.length > 0) {
                this.transpiled.setDefaultMemberPermissions(validPermissions.reduce((acc, curr) => acc | curr, 0n));
            } else {
                throw new Error(`Invalid permissions provided for command: ${this.command.name}`);
            }
        }
        if (this.command.context) this.transpiled.setContexts(this.command.context)
        if (this.command.nsfw) this.transpiled.setNSFW(this.command.nsfw)
        if (this.command.subcommandgroups && this.command.subcommands)
            throw new Error(`You cannot have both subcommand groups and subcommands on the same command (${this.command.name})`);
        if (this.command.subcommandgroups && this.command.options)
            throw new Error(`You cannot have both Subcommand groups and options on the same command (${this.command.name})`);
        if (this.command.subcommands && this.command.options)
            throw new Error(`You cannot have both Subcommands and options on the same command (${this.command.name})`);

        if (this.command.subcommandgroups) {
            this.handleSubcommandGroups(this.command.subcommandgroups);
        } else if (this.command.subcommands) {
            this.handleSubcommands(this.command.subcommands, this.transpiled);
        } else {
            this.transpileOptions(this.command.options, this.transpiled)
        }

        return {
            ...this.data,
            data: this.transpiled.toJSON()
        }
    }

    private handleSubcommandGroups(groups: Subcommandgroup[]) {
        for (const group of groups) {
            this.transpiled.addSubcommandGroup(g => {
                g.setName(group.name)
                if (group.description) g.setDescription(group.description)
                if (group.name_localizations) g.setNameLocalizations(group.name_localizations)
                if (group.description_localizations) g.setDescriptionLocalizations(group.description_localizations)
                this.handleSubcommands(group.subcommands, g)
                return g
            })
        }
    }

    private handleSubcommands(subcommands: Subcommand[], builder: SlashCommandSubcommandGroupBuilder | SlashCommandBuilder) {
        for (const sub of subcommands) {
            builder.addSubcommand(sc => {
                sc.setName(sub.name)
                if (sub.description) sc.setDescription(sub.description)
                if (sub.name_localizations) sc.setNameLocalizations(sub.name_localizations)
                if (sub.description_localizations) sc.setDescriptionLocalizations(sub.description_localizations)
                this.transpileOptions(sub.options, sc)
                return sc
            })
        }
    }

    private transpileOptions(options: Option[] | undefined, builder: SlashCommandBuilder | SlashCommandSubcommandBuilder) {
        if (!options || options.length === 0) return;

        const optionMap: Record<string, (cb: (s: any) => any) => any> = {
            channel: builder.addChannelOption.bind(builder),
            text: builder.addStringOption.bind(builder),
            boolean: builder.addBooleanOption.bind(builder),
            user: builder.addUserOption.bind(builder),
            mentionable: builder.addMentionableOption.bind(builder),
            attachment: builder.addAttachmentOption.bind(builder),
            role: builder.addRoleOption.bind(builder),
            integer: builder.addIntegerOption.bind(builder),
            number: builder.addNumberOption.bind(builder),
        };

        for (const option of options) {
            const addOption = optionMap[option.type];
            if (!addOption) continue;
            addOption((s: any) => {
                s.setName(option.name);
                if (option.description) s.setDescription(option.description);
                if (option.required !== undefined) s.setRequired(option.required);
                if (option.name_localizations) s.setNameLocalizations(option.name_localizations);
                if (option.description_localizations) s.setDescriptionLocalizations(option.description_localizations);

                if ("channel_types" in option && option.channel_types) s.addChannelTypes(...option.channel_types);
                if ("max_length" in option && option.max_length !== undefined) s.setMaxLength(option.max_length);
                if ("min_length" in option && option.min_length !== undefined) s.setMinLength(option.min_length);
                if ("max_value" in option && option.max_value !== undefined) s.setMaxValue(option.max_value);
                if ("min_value" in option && option.min_value !== undefined) s.setMinValue(option.min_value);
                if ("autocomplete" in option && option.autocomplete !== undefined) s.setAutocomplete(option.autocomplete);
                if ("choises" in option && option.choises && option.choises.length > 0) s.addChoices(...option.choises);

                return s;
            });
        }
    }
}

export interface CommandFileProps_Clasic extends Omit<CommandFileProps, "data"> {
    data: SlashCommandBuilder;
}

/**
 * @deprecated The CommandFile class should be used instead.
 * This class is kept for compatibility reasons, but it is recommended to use the new CommandFile class.
 */
export class CommandFile_Clasic {
    data: CommandFileProps_Clasic
    constructor(data: CommandFileProps_Clasic) {
        this.data = data;
    }

    /** @internal */
    public transpile(): CommandObj {
        return {
            ...this.data,
            data: this.data.data.toJSON()
        }
    }

}