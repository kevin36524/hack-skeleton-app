/**
 * Word pool for Codenames game
 * Contains 80 common, family-friendly words suitable for the game
 */
export const WORD_POOL: string[] = [
  // Animals
  'CAT',
  'DOG',
  'LION',
  'BEAR',
  'EAGLE',
  'SHARK',
  'HORSE',
  'WHALE',
  'TIGER',
  'RABBIT',

  // Nature
  'TREE',
  'OCEAN',
  'MOUNTAIN',
  'RIVER',
  'CLOUD',
  'MOON',
  'STAR',
  'SUN',
  'RAIN',
  'SNOW',

  // Objects
  'PHONE',
  'BOOK',
  'KEY',
  'RING',
  'WATCH',
  'CROWN',
  'SWORD',
  'SHIELD',
  'HAMMER',
  'NAIL',

  // Places
  'PARK',
  'SCHOOL',
  'HOSPITAL',
  'BANK',
  'HOTEL',
  'CASTLE',
  'BRIDGE',
  'TOWER',
  'TEMPLE',
  'MARKET',

  // Food
  'PIZZA',
  'BREAD',
  'APPLE',
  'ORANGE',
  'CHEESE',
  'HONEY',
  'SALT',
  'SUGAR',
  'WATER',
  'COFFEE',

  // Actions/Concepts
  'JUMP',
  'DANCE',
  'SING',
  'DREAM',
  'SLEEP',
  'FIGHT',
  'LOVE',
  'PEACE',
  'TIME',
  'SPACE',

  // Body
  'HAND',
  'FOOT',
  'HEAD',
  'HEART',
  'EYE',
  'EAR',
  'MOUTH',
  'TOOTH',

  // Colors/Descriptors
  'GOLD',
  'SILVER',
  'DIAMOND',
  'CRYSTAL',
  'SHADOW',
  'LIGHT',
  'DARK',
  'BRIGHT',
  'COLD',
  'HOT'
];

/**
 * Get the total number of words in the pool
 */
export const getWordPoolSize = (): number => WORD_POOL.length;

/**
 * Validate that we have enough words in the pool
 */
export const hasEnoughWords = (required: number): boolean => {
  return WORD_POOL.length >= required;
};
