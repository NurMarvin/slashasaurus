import { ContextMenuInteraction, MessageApplicationCommandData, UserApplicationCommandData } from 'discord.js';
import { InteractionsClient } from './InteractionsClient';
export declare abstract class ContextMenuBase {
    abstract commandInfo: UserApplicationCommandData | MessageApplicationCommandData;
    abstract run(interaction: ContextMenuInteraction, client: InteractionsClient<any, any>): void;
}
