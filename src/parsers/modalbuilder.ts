import { ActionRowBuilder, ModalBuilder as ModalBD, TextInputBuilder, TextInputStyle } from 'discord.js';

interface ModalBuilderProps {
    title: string;
    customId: string;
    components?: Component[];
}

interface Component {
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
    private modal: ModalBD = new ModalBD();

    constructor(props: ModalBuilderProps) {
        if (!props.title)
            throw new Error('Title is required for ModalBuilder');
        this.modal.setTitle(props.title)
        if (!props.customId)
            throw new Error('Custom ID is required for ModalBuilder');
        this.modal.setCustomId(props.customId);
        if (!props.components || props.components.length === 0)
            throw new Error('Components are required for ModalBuilder');
        if (props.components.length > 5)
            throw new Error('A modal can only have a maximum of 5 components');
        props.components.forEach(component =>
            this.addComponent(component)
        );
    }

    public build(): ModalBD {
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