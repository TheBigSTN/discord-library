import { ButtonBuilder as ButtonBD, ActionRowBuilder, ButtonStyle } from "discord.js";

export interface ButtonBuilderProps {
    customId: string;
    label: string;
    style: keyof typeof ButtonStyle;
    url?: string;
    disabled?: boolean;
    emoji?: string;
}

export class ButtonBuilder {
    private readonly buttonrow: ActionRowBuilder<ButtonBD> = new ActionRowBuilder<ButtonBD>();
    public readonly data: ButtonBuilderProps[];

    constructor(props: ButtonBuilderProps[]) {
        this.data = props;
        if (!props || props.length === 0)
            throw new Error("ButtonBuilder requires at least one button property");
        if (props.length > 25)
            throw new Error("ButtonBuilder can only have a maximum of 5 buttons in a row");
    }

    public build(): ActionRowBuilder<ButtonBD> {
        for (const prop of this.data) {
            const button = new ButtonBD();
            if (!prop.customId && prop.style !== "Link")
                throw new Error("Each non-Link button requires a customId");
            if (prop.customId) button.setCustomId(prop.customId);
            if (!prop.label)
                throw new Error("Each button requires a label");
            button.setLabel(prop.label);
            if (!prop.style)
                throw new Error("Each button requires a style");
            const style = ButtonStyle[prop.style];
            if (style === undefined)
                throw new Error(`Invalid button style: ${prop.style}`);
            button.setStyle(style);
            if (prop.url && prop.style !== "Link")
                throw new Error("Only Link style buttons can have a URL");
            if (!prop.url && prop.style === "Link")
                throw new Error("Link style buttons require a URL");
            if (prop.url) button.setURL(prop.url);
            button.setDisabled(prop.disabled ?? false);
            if (prop.emoji)
                button.setEmoji(prop.emoji);

            this.buttonrow.addComponents(button);
        }

        return this.buttonrow;
    }
}