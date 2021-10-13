import { ApplicationCommandOptionData, AutocompleteInteraction, CommandInteraction } from 'discord.js';
import { InteractionsClient } from './InteractionsClient';
import { CommandOptionsObject, MapOptionsToAutocompleteNames, ReadonlyCommandOptionsObject } from './utilityTypes';
declare type ChatCommandOptions<T> = {
    name: string;
    description: string;
    type: 'CHAT_INPUT';
    options: T;
    defaultPermission?: boolean;
};
export declare abstract class SlashCommandBase<T extends Array<ApplicationCommandOptionData>> {
    commandInfo: ChatCommandOptions<T>;
    constructor(commandInfo: ChatCommandOptions<T>);
    abstract run(interaction: CommandInteraction, client: InteractionsClient, options: CommandOptionsObject<T>): void;
    abstract autocomplete(interaction: AutocompleteInteraction, focusedName: MapOptionsToAutocompleteNames<T>, focusedValue: string | number, client: InteractionsClient, options: CommandOptionsObject<T>): void;
}
declare type HandlersType<T extends ReadonlyArray<ApplicationCommandOptionData>, U extends InteractionsClient> = MapOptionsToAutocompleteNames<T> extends never ? {
    run: (interaction: CommandInteraction, client: U, options: ReadonlyCommandOptionsObject<T>) => void;
} : HandlersWithAutoComplete<T, U>;
declare type HandlersWithAutoComplete<T extends ReadonlyArray<ApplicationCommandOptionData>, U extends InteractionsClient> = {
    run: (interaction: CommandInteraction, client: U, options: ReadonlyCommandOptionsObject<T>) => void;
    autocomplete: (interaction: AutocompleteInteraction, focusedName: MapOptionsToAutocompleteNames<T>, focusedValue: string | number, client: U, options: Partial<ReadonlyCommandOptionsObject<T>>) => void;
};
export declare class SlashCommand<T extends ReadonlyArray<ApplicationCommandOptionData>, U extends InteractionsClient> {
    commandInfo: ChatCommandOptions<T>;
    constructor(client: U, commandInfo: Omit<ChatCommandOptions<T>, 'type'>, handlers: HandlersType<T, U>);
    run(interaction: CommandInteraction, client: InteractionsClient, options: ReadonlyCommandOptionsObject<T>): void;
    autocomplete(interaction: AutocompleteInteraction, focusedName: MapOptionsToAutocompleteNames<T>, focusedValue: string | number, client: InteractionsClient, options: Partial<ReadonlyCommandOptionsObject<T>>): void;
}
export {};