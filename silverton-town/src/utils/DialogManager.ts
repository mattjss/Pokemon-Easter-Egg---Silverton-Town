import { DIALOG } from '../data/dialog';

const TYPEWRITER_MS = 25;
const LINES_PER_PAGE = 2;

export class DialogManager {
  private visible = false;
  private pages: string[][] = [];
  private pageIndex = 0;
  private currentText = '';
  private displayedLength = 0;
  private typewriterAccum = 0;
  private speakerName: string | null = null;
  private skipTypewriter = false;
  private onPageText: ((text: string) => void) | null = null;
  private onVisibility: ((visible: boolean) => void) | null = null;
  private onSpeaker: ((name: string | null) => void) | null = null;
  private onClosed: (() => void) | null = null;

  setOnPageText(fn: (text: string) => void): void {
    this.onPageText = fn;
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

    const lines = (Array.isArray(content) ? content : [content]).flatMap((l) =>
      (typeof l === 'string' ? l : String(l)).split('\n')
    );
    this.pages = [];
    for (let i = 0; i < lines.length; i += LINES_PER_PAGE) {
      this.pages.push(lines.slice(i, i + LINES_PER_PAGE));
    }
    if (this.pages.length === 0) this.pages.push(['']);
    this.pageIndex = 0;
    this.speakerName = speakerName ?? null;
    this.visible = true;
    this.onVisibility?.(true);
    this.onSpeaker?.(this.speakerName);
    this.startPage();
  }

  private startPage(): void {
    this.currentText = this.pages[this.pageIndex].join('\n');
    this.displayedLength = 0;
    this.typewriterAccum = 0;
    this.skipTypewriter = false;
    this.onPageText?.('');
  }

  advance(): void {
    if (!this.visible) return;
    if (this.displayedLength < this.currentText.length) {
      this.displayedLength = this.currentText.length;
      this.onPageText?.(this.currentText);
      return;
    }
    this.pageIndex++;
    if (this.pageIndex >= this.pages.length) {
      this.visible = false;
      this.onVisibility?.(false);
      this.onClosed?.();
      return;
    }
    this.startPage();
  }

  setSkipTypewriter(skip: boolean): void {
    this.skipTypewriter = skip;
  }

  update(delta: number): void {
    if (!this.visible || this.skipTypewriter || this.displayedLength >= this.currentText.length) return;
    this.typewriterAccum += delta;
    while (this.typewriterAccum >= TYPEWRITER_MS && this.displayedLength < this.currentText.length) {
      this.typewriterAccum -= TYPEWRITER_MS;
      this.displayedLength++;
      this.onPageText?.(this.currentText.slice(0, this.displayedLength));
    }
  }

  isVisible(): boolean {
    return this.visible;
  }

  isCurrentPageComplete(): boolean {
    return this.displayedLength >= this.currentText.length;
  }

  close(): void {
    this.pages = [];
    this.visible = false;
    this.onVisibility?.(false);
  }
}
