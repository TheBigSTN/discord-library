import { RESTPostAPIChatInputApplicationCommandsJSONBody, SlashCommandBuilder, SlashCommandSubcommandGroupBuilder, SlashCommandSubcommandBuilder } from "discord.js"
import { Command, Subcommandgroup, Subcommand, Option } from "./types"


export function transpiledata(data: Command): RESTPostAPIChatInputApplicationCommandsJSONBody {
    let transformed: SlashCommandBuilder = new SlashCommandBuilder()
    transformed.setName(data.name)
    if (data.description) transformed.setDescription(data.description)
    if (data.subcommandgroups) {
        transformed = format_subcommandGroup(transformed, data.subcommandgroups)
    } else if (data.subcommands) {
        transformed = format_subcommand(transformed, data.subcommands)
    } else {
        transformed = format_options(transformed, data)
    }
    const items = [data.text_input, data.integer_input, data.boolean_input, data.user_input, data.channel_input, data.role_input, data.mentionable_input, data.number_input, data.attachment_input]
    if (data.subcommandgroups && data.subcommands) {
        console.error("You canot have both subcommand groups and subcommands on the same command \n Subcommand Goups are prioritized over Subcommands \n  So your command won't have any Subcommands because of this")
    }
    if (data.subcommandgroups && items.some(s => s && s.length > 0)) {
        console.error("You canot have both Subcommand groups and options on the same command \n Subcommand Goups are prioritized over Options \n  So your command won't have any Options because of this")
    }
    if (data.subcommands && items.some(s => s && s.length > 0)) {
        console.error("You canot have both Subcommands and options on the same command \n Subcommands are prioritized over Options \n  So your command won't have any Options because of this")
    }
    return transformed.toJSON()
}

function format_subcommandGroup(command: SlashCommandBuilder, subcommand: Subcommandgroup[]): SlashCommandBuilder {
    for (const item of subcommand) {
        command.addSubcommandGroup(s => {
            s.setName(item.name)
            if (item.description) s.setDescription(item.description)
            s = format_subcommand(s, item.subcommands)
            return s
        })
    }
    return command
}

function format_subcommand<T extends SlashCommandBuilder | SlashCommandSubcommandGroupBuilder>(command: T, subcommand: Subcommand[]): T {
    for (const item of subcommand) {
        command.addSubcommand(s => {
            s.setName(item.name)
            if (item.description) { s.setDescription(item.description) }
            s = format_options(s, item)
            return s
        })
    }
    return command
}

function format_options<T extends SlashCommandBuilder | SlashCommandSubcommandBuilder>(command: T, subcommand: Option): T {
    if (subcommand.text_input) {
        for (const item of subcommand.text_input) {
            command.addStringOption(s => {
                s.setName(item.name)
                if (item.description) s.setDescription(item.description)
                if (item.required) s.setRequired(item.required)
                if (item.autocomplete) s.setAutocomplete(item.autocomplete)
                if (item.choises) s.addChoices(...item.choises)
                if (item.max_length) s.setMaxLength(item.max_length)
                if (item.min_length) s.setMinLength(item.min_length)
                return s
            })
        }
    }
    if (subcommand.integer_input) {
        for (const item of subcommand.integer_input) {
            command.addIntegerOption(s => {
                s.setName(item.name)
                if (item.description) s.setDescription(item.description)
                if (item.required) s.setRequired(item.required)
                if (item.autocomplete) s.setAutocomplete(item.autocomplete)
                if (item.choises) s.addChoices(...item.choises)
                if (item.max_value) s.setMaxValue(item.max_value)
                if (item.min_value) s.setMinValue(item.min_value)
                return s
            })
        }
    }
    if (subcommand.boolean_input) {
        for (const item of subcommand.boolean_input) {
            command.addBooleanOption(s => {
                s.setName(item.name)
                if (item.description) s.setDescription(item.description)
                if (item.required) s.setRequired(item.required)
                return s
            })
        }
    }
    if (subcommand.user_input) {
        for (const item of subcommand.user_input) {
            command.addUserOption(s => {
                s.setName(item.name)
                if (item.description) s.setDescription(item.description)
                if (item.required) s.setRequired(item.required)
                return s
            })
        }
    }
    if (subcommand.channel_input) {
        for (const item of subcommand.channel_input) {
            command.addChannelOption(s => {
                s.setName(item.name)
                if (item.description) s.setDescription(item.description)
                if (item.required) s.setRequired(item.required)
                if (item.channel_types) s.addChannelTypes(...item.channel_types)
                return s
            })
        }
    }
    if (subcommand.role_input) {
        for (const item of subcommand.role_input) {
            command.addRoleOption(s => {
                s.setName(item.name)
                if (item.description) s.setDescription(item.description)
                if (item.required) s.setRequired(item.required)
                return s
            })
        }
    }
    if (subcommand.mentionable_input) {
        for (const item of subcommand.mentionable_input) {
            command.addMentionableOption(s => {
                s.setName(item.name)
                if (item.description) s.setDescription(item.description)
                if (item.required) s.setRequired(item.required)
                return s
            })
        }
    }
    if (subcommand.number_input) {
        for (const item of subcommand.number_input) {
            command.addNumberOption(s => {
                s.setName(item.name)
                if (item.description) s.setDescription(item.description)
                if (item.required) s.setRequired(item.required)
                if (item.autocomplete) s.setAutocomplete(item.autocomplete)
                if (item.choises) s.addChoices(...item.choises)
                if (item.max_value) s.setMaxValue(item.max_value)
                if (item.min_value) s.setMinValue(item.min_value)
                return s
            })
        }
    }
    if (subcommand.attachment_input) {
        for (const item of subcommand.attachment_input) {
            command.addAttachmentOption(s => {
                s.setName(item.name)
                if (item.description) s.setDescription(item.description)
                if (item.required) s.setRequired(item.required)
                return s
            })
        }
    }
    return command
}