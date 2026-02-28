import { DIALOG } from '../data/dialog';

const TYPEWRITER_MS_PER_CHAR = 28;

export class DialogManager {
  private visible = false;
  private queue: string[] = [];
  private currentLine = '';
  private displayedLength = 0;
  private typewriterAccum = 0;
  private speakerName: string | null = null;
  private onTypewriterTick: ((str: string) => void) | null = null;
  private onVisibility: ((visible: boolean) => void) | null = null;
  private onSpeaker: ((name: string | null) => void) | null = null;
  private onClosed: (() => void) | null = null;

  setOnTypewriterTick(fn: (str: string) => void): void {
    this.onTypewriterTick = fn;
  }

  setOnVisibility(fn: (visible: boolean) => void): void {
    this.onVisibility = fn;
  }

  setOnSpeaker(fn: (name: string | null) => void): void {
    this.onSpeaker = fn;
  }

  setOnClosed(fn: () => void): void {
    this.onClosed = fn;
  }

  show(dialogId: string, speakerName?: string): void {
    const content = DIALOG[dialogId];
    if (content == null) return;

    const lines = Array.isArray(content) ? content : [content];
    this.queue = lines.flatMap((line) => (typeof line === 'string' ? line.split('\n') : [String(line)]));
    this.speakerName = speakerName ?? null;
    this.visible = true;
    this.onVisibility?.(true);
    this.onSpeaker?.(this.speakerName);
    this.startNextLine();
  }

  private startNextLine(): void {
    if (this.queue.length === 0) {
      this.visible = false;
      this.onVisibility?.(false);
      this.onClosed?.();
      return;
    }
    const next = this.queue.shift();
    this.currentLine = next ?? '';
    this.displayedLength = 0;
    this.typewriterAccum = 0;
    this.onTypewriterTick?.('');
  }

  advance(): void {
    if (!this.visible) return;
    if (this.displayedLength < this.currentLine.length) {
      this.displayedLength = this.currentLine.length;
      this.onTypewriterTick?.(this.currentLine);
      return;
    }
    this.startNextLine();
  }

  update(delta: number): void {
    if (!this.visible) return;
    if (this.displayedLength >= this.currentLine.length) return;
    this.typewriterAccum += delta;
    while (this.typewriterAccum >= TYPEWRITER_MS_PER_CHAR && this.displayedLength < this.currentLine.length) {
      this.typewriterAccum -= TYPEWRITER_MS_PER_CHAR;
      this.displayedLength++;
      this.onTypewriterTick?.(this.currentLine.slice(0, this.displayedLength));
    }
  }

  isVisible(): boolean {
    return this.visible;
  }

  isCurrentLineComplete(): boolean {
    return this.displayedLength >= this.currentLine.length;
  }

  close(): void {
    this.queue = [];
    this.visible = false;
    this.onVisibility?.(false);
  }
}
