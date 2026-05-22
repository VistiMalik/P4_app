// bleConfig.ts

// Service + Characteristics UUIDs
export const SERVICE_UUID = 'ab49b033-1163-48db-931c-9c2a3002ee1d';

export const USER_INFO_CHAR_UUID   = 'ab49b033-1163-48db-931c-9c2a3002ee1f';
export const COMMAND_CHAR_UUID     = 'ab49b033-1163-48db-931c-9c2a3002ee1e';
export const WEIGHT_DATA_CHAR_UUID = 'ab49b033-1163-48db-931c-9c2a3002ee20';

// Evt. type hvis du vil være stram med 1|2|3
export type WeightNumber = 1 | 2 | 3;

// Skift disse værdier til dine rigtige vægte (navn eller id fra scan)
export const WEIGHT_TARGETS: Record<WeightNumber, string> = {
  1: 'ESP32_Weigh_1', // overvej at erstatte med ID
  2: 'ESP32_Weigh_2',
  3: 'ESP32_Weigh_3',
};