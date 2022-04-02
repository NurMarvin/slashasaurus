import {
  ButtonInteraction,
  EmojiIdentifierResolvable,
  ExcludeEnum,
  MessageButton,
  MessageComponent,
  MessageComponentInteraction,
  MessageSelectMenu,
  MessageSelectOptionData,
  SelectMenuInteraction,
  Util,
} from 'discord.js';
import { MessageButtonStyles } from 'discord.js/typings/enums';

type NonLinkStyles = ExcludeEnum<typeof MessageButtonStyles, 'LINK'>;

type PageButtonLabelOptions =
  | {
      label: string;
      emoji?: EmojiIdentifierResolvable;
    }
  | {
      label?: string;
      emoji: EmojiIdentifierResolvable;
    };

type PotentialDjsComponent = NonNullable<
  MessageComponentInteraction['message']['components']
>[number]['components'][number];

interface ExportableToDjsComponent {
  toDjsComponent(id: string): MessageComponent;
}

export function createInteractable<P>(
  component: new (props: P) => any | ((props: P) => any) | null,
  props: P,
  ...children: P extends { children: any } ? P['children'][] : never
) {
  if (!component) return children;
  return new component({ ...props, children });
}

type PageActionRowChild = PageButton | PageSelect;

interface PageActionRowProps {
  children?: (PageActionRowChild | false) | (PageActionRowChild | false)[];
}

export class PageActionRow {
  children: PageActionRowChild[];

  constructor({ children }: PageActionRowProps) {
    if (Array.isArray(children))
      this.children = children
        .flat()
        .filter((c): c is PageActionRowChild => c !== false);
    else if (children) this.children = [children];
  }
}

export type PageInteractableButtonOptions = {
  handler: (interaction: ButtonInteraction) => void;
  style?: NonLinkStyles;
  disabled?: boolean;
} & PageButtonLabelOptions;

export type PageLinkButtonOptions = {
  url: string;
  disabled?: boolean;
} & PageButtonLabelOptions;

export class PageInteractableButton implements ExportableToDjsComponent {
  type = 'BUTTON';
  handler: (interaction: ButtonInteraction) => void;
  style: NonLinkStyles = 'SECONDARY';
  disabled: boolean = false;
  label?: string;
  emoji?: EmojiIdentifierResolvable;

  constructor(options: PageInteractableButtonOptions) {
    this.handler = options.handler;
    if (options.style) this.style = options.style;
    if (options.disabled) this.disabled = options.disabled;
    if (options.label) this.label = options.label;
    if (options.emoji) this.emoji = options.emoji;
  }

  toDjsComponent(id: string): MessageButton {
    return new MessageButton({
      customId: id,
      style: this.style,
      disabled: this.disabled,
      emoji: this.emoji,
      label: this.label,
      type: 'BUTTON',
    });
  }

  compareToComponent(component: PotentialDjsComponent) {
    if (!(component.type === 'BUTTON' || component.type === 2)) return false;
    if ((this.emoji && !component.emoji) || (!this.emoji && component.emoji))
      return false;
    if (this.emoji && component.emoji) {
      if (Util.resolvePartialEmoji(this.emoji)?.id !== component.emoji?.id)
        return false;
    }
    return (
      // @ts-expect-error this is private but we need to use it
      MessageButton.resolveStyle(this.style) ===
        // @ts-expect-error this is private but we need to use it
        MessageButton.resolveStyle(component.style as any) &&
      this.disabled === component.disabled &&
      (this.label ?? null) === component.label
    );
  }
}

export class PageLinkButton implements ExportableToDjsComponent {
  type = 'BUTTON';
  url: string;
  disabled: boolean = false;
  label?: string;
  emoji?: EmojiIdentifierResolvable;

  constructor(options: PageLinkButtonOptions) {
    this.url = options.url;
    if (options.disabled) this.disabled = options.disabled;
    if (options.label) this.label = options.label;
    if (options.emoji) this.emoji = options.emoji;
  }

  toDjsComponent(): MessageButton {
    return new MessageButton({
      style: 'LINK',
      url: this.url,
      disabled: this.disabled,
      emoji: this.emoji,
      label: this.label,
      type: 'BUTTON',
    });
  }

  compareToComponent(component: PotentialDjsComponent) {
    if (!(component.type === 'BUTTON' || component.type === 2)) return false;
    if ((this.emoji && !component.emoji) || (!this.emoji && component.emoji))
      return false;
    if (this.emoji && component.emoji) {
      const id = typeof this.emoji === 'string' ? this.emoji : this.emoji.id;
      if (component.emoji.id !== id) return false;
    }
    return (
      ('LINK' === component.style || 5 === component.style) &&
      this.disabled === component.disabled &&
      (this.label ?? null) === component.label &&
      this.url === component.url
    );
  }
}

export type PageButton = PageInteractableButton | PageLinkButton;

export interface PageSelectOptions {
  handler: (interaction: SelectMenuInteraction) => void;
  options: MessageSelectOptionData[];
  placeholder?: string;
  minValues?: number;
  maxValues?: number;
  disabled?: boolean;
}

export class PageSelect implements ExportableToDjsComponent {
  type = 'SELECT_MENU';
  handler: (interaction: SelectMenuInteraction) => void;
  options: MessageSelectOptionData[];
  placeholder: string | null = null;
  minValues: number = 1;
  maxValues: number = 1;
  disabled: boolean = false;

  constructor(options: PageSelectOptions) {
    this.handler = options.handler;
    this.options = options.options;
    if (options.placeholder) this.placeholder = options.placeholder;
    if (options.minValues) this.minValues = options.minValues;
    if (options.maxValues) this.maxValues = options.maxValues;
    if (options.disabled) this.disabled = options.disabled;
  }

  toDjsComponent(id: string) {
    return new MessageSelectMenu({
      type: 'SELECT_MENU',
      customId: id,
      disabled: this.disabled,
      maxValues: this.maxValues,
      minValues: this.minValues,
      options: this.options,
      placeholder: this.placeholder ?? undefined,
    });
  }

  compareToComponent(component: PotentialDjsComponent) {
    if (!(component.type === 'SELECT_MENU')) return false;
    if (
      this.disabled !== component.disabled ||
      this.maxValues !== component.maxValues ||
      this.minValues !== component.minValues ||
      this.placeholder !== component.placeholder
    )
      return false;
    if (this.options.length !== component.options.length) return false;
    return this.options.every((option, index) => {
      const other = component.options[index];

      if (
        other.default !== (option.default ?? false) ||
        other.description !== (option.description ?? null) ||
        other.label !== option.label ||
        other.value !== option.value
      )
        return false;
      if ((option.emoji && !other.emoji) || (!option.emoji && other.emoji))
        return false;
      if (option.emoji && other.emoji) {
        if (Util.resolvePartialEmoji(option.emoji)?.id !== other.emoji?.id)
          return false;
      }
      return true;
    });
  }
}
