import { createHash } from "crypto";
import { existsSync, readFileSync, writeFileSync } from "fs";
import path = require("path");
import { Command } from "./commandjson";
import { SlashCommandBuilder } from "discord.js";
import { ref } from "process";

const HASH_FILE = path.join(process.cwd(), "command-hashes.json");

export class CommandHashService {
    private readonly hashes: Record<string, string> = {};
    private readonly refreshInstance;
    public readonly seenCommands = new Set<string>();
    public readonly staleCommands = new Map<string, string>();

    constructor(refreshAll: boolean = false) {
        try {
            if (!existsSync(HASH_FILE))
                console.log("You can refresh all command by running with the --refresh-all flag or by adding refreshAll: true to the bot configuration.");
            const raw = readFileSync(HASH_FILE, "utf8");
            this.hashes = JSON.parse(raw);
            this.refreshInstance = process.argv.includes("--refresh-all") || refreshAll;
            if (refreshAll)
                console.log("Refreshing all commands because of configuration");
            else if (this.refreshInstance)
                console.log("Refreshing commands because of --refresh-all flag");
        } catch {
            this.hashes = {};
        }
    }

    private computeHash(obj: Command | SlashCommandBuilder): string {
        if (obj instanceof SlashCommandBuilder) {
            obj = obj.toJSON() as Command;
        }
        const json = JSON.stringify(obj, null, 2);
        return createHash("sha256").update(json).digest("hex");
    }

    public check(command: Command | SlashCommandBuilder) {
        const hash = this.computeHash(command);
        const id = command.name;
        this.seenCommands.add(id);

        const oldHash = this.hashes[id];
        if (oldHash !== hash || this.refreshInstance) {
            this.staleCommands.set(id, hash);
        }
    }

    public updateSha(commandName: string) {
        const hash = this.staleCommands.get(commandName);
        if (!hash) {
            console.warn(`No stale hash found for command: ${commandName}`);
            return;
        }

        this.hashes[commandName] = hash;
        this.staleCommands.delete(commandName);
    }

    public cleanup() {
        for (const key of Object.keys(this.hashes)) {
            if (!this.seenCommands.has(key)) {
                delete this.hashes[key];
            }
        }
    }

    public save() {
        writeFileSync(HASH_FILE, JSON.stringify(this.hashes, null, 2), "utf8");
    }
}
