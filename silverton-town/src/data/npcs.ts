/**
 * NPC definitions: id, grid position, sprite key, dialogId, facing.
 */

export type Facing = 'up' | 'down' | 'left' | 'right';

export interface NPCDefinition {
  id: string;
  x: number;
  y: number;
  sprite: string;
  dialogId: string;
  facing?: Facing;
  patrol?: Array<{ x: number; y: number }>;
}

export const npcDefinitions: NPCDefinition[] = [
  { id: 'npc_1', x: 10, y: 6, sprite: 'npc', dialogId: 'npc_old_man', facing: 'down' },
  { id: 'npc_2', x: 6, y: 9, sprite: 'npc', dialogId: 'npc_lass', facing: 'up' },
  { id: 'npc_3', x: 12, y: 8, sprite: 'npc', dialogId: 'npc_youngster', facing: 'left' },
];
