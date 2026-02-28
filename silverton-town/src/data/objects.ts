/**
 * Interactive object definitions: signs, items, PCs, binders.
 * Triggers dialog (dialogId) or modal (modal) on Space/Enter.
 */

export interface ObjectDefinition {
  id: string;
  x: number;
  y: number;
  sprite: string;
  frame?: number;
  width?: number;
  height?: number;
  dialogId?: string;
  modal?: string;
}

export const objectDefinitions: ObjectDefinition[] = [
  { id: 'sign_town', x: 8, y: 4, sprite: 'objects', frame: 0, dialogId: 'sign_town' },
  { id: 'sign_route', x: 14, y: 10, sprite: 'objects', frame: 1, dialogId: 'sign_route' },
  { id: 'pc_1', x: 4, y: 5, sprite: 'objects', frame: 2, dialogId: 'pc_usage' },
  { id: 'binder_1', x: 6, y: 5, sprite: 'objects', frame: 3, dialogId: 'binder_1' },
  { id: 'binder_2', x: 7, y: 5, sprite: 'objects', frame: 3, dialogId: 'binder_2' },
];
