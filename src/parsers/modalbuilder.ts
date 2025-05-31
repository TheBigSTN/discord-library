import { ActionRowBuilder, ModalBuilder as ModalBD, TextInputBuilder, TextInputStyle } from 'discord.js';

export interface ModalBuilderProps {
    title: string;
    customId: string;
    components?: Component[];
}

export interface Component {
    customId: string;
    label: string;
    style: TextInputStyle;
    maxLength?: number;
    minLength?: number;
    placeholder?: string;
    required?: boolean;
    value?: string;
}

export class ModalBuilder {
    private readonly modal: ModalBD = new ModalBD();
    public readonly data: ModalBuilderProps;

    constructor(props: ModalBuilderProps) {
        this.data = props;
    }

    public build(): ModalBD {
        if (!this.data.title)
            throw new Error('Title is required for ModalBuilder');
        this.modal.setTitle(this.data.title)
        if (!this.data.customId)
            throw new Error('Custom ID is required for ModalBuilder');
        this.modal.setCustomId(this.data.customId);
        if (!this.data.components || this.data.components.length === 0)
            throw new Error('Components are required for ModalBuilder');
        if (this.data.components.length > 5)
            throw new Error('A modal can only have a maximum of 5 components');
        this.data.components.forEach(component =>
            this.addComponent(component)
        );

        return this.modal
    }

    private addComponent(data: Component) {
        const component = new TextInputBuilder();
        if (!data.customId)
            throw new Error('Custom ID is required for a component');
        component.setCustomId(data.customId)
        if (!data.label)
            throw new Error('Label is required for a component');
        component.setLabel(data.label)
        if (!data.style)
            throw new Error('Style is required for a component');
        component.setStyle(data.style)
        if (data.maxLength) component.setMaxLength(data.maxLength);
        if (data.minLength) component.setMinLength(data.minLength);
        if (data.placeholder) component.setPlaceholder(data.placeholder);
        if (data.required) component.setRequired(data.required);
        if (data.value) component.setValue(data.value);
        const row = new ActionRowBuilder<TextInputBuilder>().addComponents(component);
        this.modal.addComponents(row)
    }

}