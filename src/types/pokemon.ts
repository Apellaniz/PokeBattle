export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  'special-attack': number;
  'special-defense': number;
  speed: number;
}

export interface PokemonType {
  name: string;
  url: string;
}

export interface PokemonAbility {
  name: string;
  url: string;
  is_hidden: boolean;
}

export interface PokemonMove {
  name: string;
  url: string;
  power: number;
  accuracy: number;
  type: PokemonType;
}

export interface Pokemon {
  id: number;
  name: string;
  types: PokemonType[];
  abilities: PokemonAbility[];
  stats: PokemonStats;
  moves: PokemonMove[];
  sprites: {
    front_default: string;
    back_default: string;
  };
}

export interface BattleState {
  playerPokemon: Pokemon | null;
  opponentPokemon: Pokemon | null;
  currentTurn: 'player' | 'opponent';
  battleLog: string[];
  isGameOver: boolean;
  winner: 'player' | 'opponent' | null;
}

export interface GameMode {
  type: 'pvp' | 'pve';
  player1Name: string;
  player2Name?: string;
} 