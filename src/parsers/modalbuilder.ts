import { ActionRowBuilder, ModalBuilder as ModalBD } from 'discord.js';

interface ModalBuilderProps {
    title: string;
    customId: string;
    components?: ActionRowBuilder[];
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
        if (!props.components)
            throw new Error('Components are required for ModalBuilder');
        props.components.forEach(component => this.addComponent(component));
    }

    private addComponent(component: ActionRowBuilder<any>) {
        this.modal.addComponents(component)
    }

}