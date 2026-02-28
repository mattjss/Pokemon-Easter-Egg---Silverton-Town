/**
 * All dialog strings. Keyed by ID — no hardcoded strings in scenes.
 */
export const DIALOG: Record<string, string | string[]> = {
  welcome: 'Welcome to Silvertown!',
  npc_professor: "The town has a rich history. Explore and talk to everyone!",
  npc_grandmother: "I've lived here my whole life. So many memories.",
  npc_rival: "Hey! Ready for our next challenge?",
  npc_kid: "Wow, you have so many cool things!",
  BOOKSHELF_MCCULLOUGH: "Books by David McCullough — history and biography.",
  WATCH_RGM: "A fine RGM watch. American made.",
  RECORD_PLAYER_INSPECT: "Vintage record player. Jazz and classic rock on the shelf.",
  GOLF_BAG: "Golf clubs. Always ready for a round.",
  STUDIO_MAKERSPLACE: "PC running Makersplace — digital art and collectibles.",
  STUDIO_WHITEBOARD: "Sketches and project notes for client work.",
  CARD_BINDER_INTRO: "Trading card binder — Pokémon and more.",
  HOCKEY_NET: "Hockey net. Street hockey season never ends.",
  default: "Nothing interesting here.",
};

export type DialogId = keyof typeof DIALOG;
