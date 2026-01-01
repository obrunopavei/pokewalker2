export enum Rarity {
  VeryCommon = "Very Common",
  Common = "Common",
  Rare = "Rare",
  VeryRare = "Very Rare"
}

export interface PokemonEntry {
  id: string; // Unique ID
  dexId: number;
  name: string;
  gender: string;
  route: string; // "Area Found"
  unlockMethod: string;
  steps: string;
  rarity: Rarity;
  item: string;
  points: number;
}

export interface Milestone {
  id: number;
  name: string;
  pointsStandard: number;
  pointsCompletionist: number;
  description: string;
  stopAt: string;
}