import axios from 'axios';
import { Pokemon, PokemonMove } from '../types/pokemon';

const POKE_API_BASE_URL = 'https://pokeapi.co/api/v2';

export const pokemonService = {
  async getPokemonList(limit: number = 151): Promise<{ name: string; url: string }[]> {
    const response = await axios.get(`${POKE_API_BASE_URL}/pokemon?limit=${limit}`);
    return response.data.results;
  },

  async getPokemonById(id: number): Promise<Pokemon> {
    const response = await axios.get(`${POKE_API_BASE_URL}/pokemon/${id}`);
    const data = response.data;

    // Transform the API response into our Pokemon type
    const pokemon: Pokemon = {
      id: data.id,
      name: data.name,
      types: data.types.map((type: any) => ({
        name: type.type.name,
        url: type.type.url,
      })),
      abilities: data.abilities.map((ability: any) => ({
        name: ability.ability.name,
        url: ability.ability.url,
        is_hidden: ability.is_hidden,
      })),
      stats: data.stats.reduce((acc: any, stat: any) => {
        acc[stat.stat.name] = stat.base_stat;
        return acc;
      }, {}),
      moves: await Promise.all(
        data.moves.slice(0, 4).map(async (move: any) => {
          const moveResponse = await axios.get(move.move.url);
          return {
            name: move.move.name,
            url: move.move.url,
            power: moveResponse.data.power || 0,
            accuracy: moveResponse.data.accuracy || 0,
            type: {
              name: moveResponse.data.type.name,
              url: moveResponse.data.type.url,
            },
          };
        })
      ),
      sprites: {
        front_default: data.sprites.front_default,
        back_default: data.sprites.back_default,
      },
    };

    return pokemon;
  },

  async getRandomPokemon(): Promise<Pokemon> {
    const randomId = Math.floor(Math.random() * 151) + 1;
    return this.getPokemonById(randomId);
  },

  calculateDamage(attacker: Pokemon, defender: Pokemon, move: PokemonMove): number {
    const attack = attacker.stats.attack;
    const defense = defender.stats.defense;
    const power = move.power;
    const accuracy = move.accuracy / 100;

    // Basic damage calculation formula
    const damage = Math.floor(((2 * 50 + 10) / 250) * (attack / defense) * power + 2);

    // Apply type effectiveness (simplified)
    const typeEffectiveness = this.getTypeEffectiveness(move.type.name, defender.types[0].name);
    
    return Math.floor(damage * typeEffectiveness * accuracy);
  },

  getTypeEffectiveness(attackType: string, defenseType: string): number {
    // Simplified type effectiveness chart
    const typeChart: { [key: string]: { [key: string]: number } } = {
      normal: { rock: 0.5, ghost: 0, steel: 0.5 },
      fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
      water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
      electric: { water: 2, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
      grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, dragon: 0.5, steel: 0.5 },
      ice: { water: 0.5, grass: 2, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
      fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dragon: 1, steel: 2 },
      poison: { grass: 2, poison: 0.5, ground: 0.5, bug: 2, rock: 0.5, ghost: 0.5, dragon: 1, steel: 0 },
      ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
      flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
      psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
      bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5 },
      rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
      ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
      dragon: { dragon: 2, steel: 0.5 },
      dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, steel: 0.5 },
      steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5 },
    };

    return typeChart[attackType]?.[defenseType] || 1;
  },
}; 