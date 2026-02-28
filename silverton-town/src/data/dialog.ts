/**
 * All dialog strings. Keyed by ID — no hardcoded strings in scenes.
 */
export const DIALOG: Record<string, string | string[]> = {
  welcome: 'Welcome to Silvertown!',
  NPC_PROFESSOR: "The town has a rich history. Explore and talk to everyone!",
  NPC_GRANDMOTHER: "I've lived here my whole life. So many memories.",
  NPC_RIVAL: "Hey! Ready for our next challenge?",
  NPC_KID_BASEBALL: "Wow, you have so many cool things!",
  NPC_ROUTE_EXIT: "The road continues north. Safe travels!",
  BOOKSHELF: "Books by David McCullough — history and biography.",
  WATCH_CASE: "A fine RGM watch. American made.",
  RECORD_PLAYER: "Vintage record player. Jazz and classic rock on the shelf.",
  KITCHEN_FRIDGE: "Fridge full of snacks. Help yourself!",
  GOLF_BAG: "Golf clubs. Always ready for a round.",
  STUDIO_PC: "PC running Makersplace — digital art and collectibles.",
  WHITEBOARD: "Sketches and project notes for client work.",
  CARD_BINDER: "Trading card binder — Pokémon and more.",
  HOCKEY_NET: "Hockey net. Street hockey season never ends.",
  default: "Nothing interesting here.",
};

export type DialogId = keyof typeof DIALOG;
