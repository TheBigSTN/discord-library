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

export interface SharedProp {
    /**
     * The name of the command, subcommand, subcommand group, option.
     * This should be a lowercase string with no spaces.
     * It can only contain alphanumeric characters, underscores, and dashes.
     */
    name: string
    /**
     * The localizations for the command name.
     * This should be an object where the keys are locale codes and the values are the localized names.
     * @example { "en-US": "My Command" }
    */
    name_localizations?: LocalizationMap
    /**
     * The description of the command, subcommand, subcommand group.
     * Required if it's an option.
     * This should be a string that describes what the command does.
     * It can be localized using the `description_localizations` property.
     */
    description?: string
    /**
     * The localizations for the command description.
     * This should be an object where the keys are locale codes and the values are the localized descriptions.
     * @example { "en-US": "This is my command" }
     */
    description_localizations?: LocalizationMap
}

export interface Subcommand extends SharedProp {
    /**
     * The options of the subcommand.
     * This should be an array of Option objects.
     */
    options?: Option[]
}

export interface Subcommandgroup extends SharedProp {
    /**
     * The subcommands of the subcommand group.
     * This should be an array of Subcommand objects.
     */
    subcommands: Subcommand[]
}

export interface Command extends SharedProp {
    /**
     * Whether the command is NSFW (Not Safe For Work).
     * If true, the command can only be used in NSFW channels.
     */
    nsfw?: boolean
    /**
     * The context in which the command can be used.
     * If not specified, the command can be used in both guild and DM contexts.
     */
    context?: InteractionContextType
    /**
     * The permissions required to use the command.
     * This should be an array of permission flags from PermissionFlagsBits.
     */
    permisions?: (keyof typeof PermissionFlagsBits)[]
    /**
     * The subcommands of the command.
     * If specified, this command will be a subcommand command.
     * It specified you can't have subcommand groups or options.
     */
    subcommands?: Subcommand[]
    /**
     * The subcommand groups of the command.
     * If specified, this command will be a subcommand group command.
     * It specified you can't have subcommands or options.
     */
    subcommandgroups?: Subcommandgroup[]
    /**
     * The options of the command.
     * If specified, this command will be a simple command with options.
     * It specified you can't have subcommands or subcommand groups.
     */
    options?: Option[]
}

export interface CommandFileProps {
    /**
     * The command data obiect.
     */
    data: Command
    /**
     * If not specified, the command will be registered globally.
     * If specified, the command will be registered only in the specified guilds.
     */
    guild?: string[]
    /**
     * This should run when the command is executed by a user.
     */
    execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

export interface OptionBase<T> extends SharedProp {

    /**
     * The description of the option.
     * This should be a string that describes what the option does.
     */
    description: string
    /**
     * Whether the option is required.
     * If true, the user must provide a value for this option.
     * If false, the user can skip this option.
     */
    required?: boolean
    /**
     * Whether the option supports autocomplete.
     * If true, the user can type in the option and get suggestions.
     * If false, the user must provide a value for this option.
     */
    autocomplete?: boolean
    /**
     * The choices for the option.
     * This should be an array of objects with a name and value.
     * The name is what the user sees, and the value is what is sent to the server.
     */
    choises?: {
        name: string
        value: T
    }[]
}

export type Option = ChannelOption | TextOption | UtilityOption | NumberOption
export interface ChannelOption extends SharedProp {
    /**
     * The type of the option.
     * This should be one of the following:
     * - "channel": A channel option
     */
    type: "channel",
    /**
     * The description of the option.
     * This should be a string that describes what the option does.
     */
    description: string
    /**
     * Whether the option is required.
     * If true, the user must provide a value for this option.
     * If false, the user can skip this option.
     */
    required?: boolean
    /**
     * The allowed channel types for this option.
     * This should be an array of ApplicationCommandOptionAllowedChannelTypes.
     * If not specified, all channel types are allowed.
     */
    channel_types?: ApplicationCommandOptionAllowedChannelTypes[]
}

export interface TextOption extends OptionBase<string> {
    /**
     * The type of the option.
     * This should be one of the following:
     * - "text": A string option
     */
    type: "text",
    /**
     * The maximum length of the string.
     * If not specified, the default maximum length is 100 characters.
     */
    max_length?: number
    /**
     * The minimum length of the string.
     * If not specified, the default minimum length is 0 characters.
     */
    min_length?: number
}
export interface UtilityOption extends SharedProp {
    /**
     * The type of the option.
     * This should be one of the following:
     * - "boolean": A boolean option
     * - "user": A user option
     * - "mentionable": A mentionable option (user or role)
     * - "attachment": An attachment option
     * - "role": A role option
     */
    type: "boolean" | "user" | "mentionable" | "attachment" | "role",
    /**
     * The description of the option.
     * This should be a string that describes what the option does.
     */
    description: string
    /**
     * Whether the option is required.
     * If true, the user must provide a value for this option.
     * If false, the user can skip this option.
     */
    required?: boolean
}

export interface NumberOption extends OptionBase<number> {

    /**
     * The type of the option.
     * This should be one of the following:
     * - "integer": An integer option
     * - "number": A number option
     */
    type: "integer" | "number",
    /**
     * The maximum value of the integer or number.
     * If not specified, there is no maximum value.
     */
    max_value?: number
    /**
     * The minimum value of the integer or number.
     * If not specified, there is no minimum value.
     */
    min_value?: number
}


export interface CommandObj extends Omit<CommandFileProps, "data"> {
    /**
     * The transpiled command data.
     * This is returned by the internal transpile method.
     * 
     */
    data: RESTPostAPIChatInputApplicationCommandsJSONBody
}

export class CommandFile {
    /**
     * The transpiled command data.
     * This is an instance of SlashCommandBuilder that is used to build the command.
     */
    transpiled: SlashCommandBuilder = new SlashCommandBuilder()
    /**
     * The original command data.
     */
    command: Command;
    /**
     * The original command file properties.
     */
    data: CommandFileProps

    constructor(data: CommandFileProps) {
        this.command = data.data;
        this.data = data;
    }

    /**
     * 
     * @returns The transpiled command object.
     * @throws Will throw an error if the command has both subcommand groups and subcommands, or if it has both subcommands and options.
     * @throws Will throw an error if the command has both subcommand groups and options, or if it has both subcommands and options.
     */
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