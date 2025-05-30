import {
    ClientEvents,
} from "discord.js";
import { CommandObj } from "./parsers/commandjson";

export interface EventFile<T extends keyof ClientEvents> {
    once?: boolean;
    name: T;  // Event name should be one of the keys of ClientEvents
    execute(...args: ClientEvents[T]): Promise<void>;  // Args will be inferred from the event name
}

export class EventFile<T extends keyof ClientEvents> {
    constructor(data: EventFile<T>) {
        this.name = data.name
        this.execute = data.execute
    }
}