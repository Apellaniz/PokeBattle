import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { Pokemon } from '../types/pokemon';

interface PokemonCardProps {
  pokemon: Pokemon;
  isSelected?: boolean;
  onClick?: () => void;
  showStats?: boolean;
}

export const PokemonCard: React.FC<PokemonCardProps> = ({
  pokemon,
  isSelected = false,
  onClick,
  showStats = false,
}) => {
  return (
    <Box
      p={4}
      bg="white"
      borderRadius="lg"
      borderWidth="2px"
      borderColor={isSelected ? 'blue.500' : 'gray.200'}
      cursor={onClick ? 'pointer' : 'default'}
      onClick={onClick}
      _hover={onClick ? { transform: 'scale(1.02)' } : {}}
    >
      <Box display="flex" flexDirection="column" gap="3">
        <img
          src={pokemon.sprites.front_default}
          alt={pokemon.name}
          style={{ width: '150px', height: '150px', objectFit: 'contain' }}
        />
        <Text fontSize="xl" fontWeight="bold" textTransform="capitalize">
          {pokemon.name}
        </Text>
        <Box display="flex" flexWrap="wrap" gap="2">
          {pokemon.types.map((type) => (
            <Box
              key={type.name}
              px="2"
              py="1"
              bg={`${getTypeColor(type.name)}.100`}
              color={`${getTypeColor(type.name)}.700`}
              borderRadius="md"
              fontSize="sm"
              textTransform="capitalize"
            >
              {type.name}
            </Box>
          ))}
        </Box>
        {showStats && (
          <Box display="flex" flexDirection="column" width="100%" gap="2">
            {Object.entries(pokemon.stats).map(([stat, value]) => (
              <Box key={stat} width="100%">
                <Text fontSize="sm" textTransform="capitalize">
                  {stat.replace('-', ' ')}: {value}
                </Text>
                <Box
                  width="100%"
                  height="8px"
                  bg="gray.100"
                  borderRadius="full"
                  overflow="hidden"
                >
                  <Box
                    width={`${(value / 255) * 100}%`}
                    height="100%"
                    bg={`${getStatColor(stat)}.500`}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

const getTypeColor = (type: string): string => {
  const typeColors: { [key: string]: string } = {
    normal: 'gray',
    fire: 'red',
    water: 'blue',
    electric: 'yellow',
    grass: 'green',
    ice: 'cyan',
    fighting: 'orange',
    poison: 'purple',
    ground: 'orange',
    flying: 'teal',
    psychic: 'pink',
    bug: 'green',
    rock: 'gray',
    ghost: 'purple',
    dragon: 'purple',
    dark: 'gray',
    steel: 'gray',
  };
  return typeColors[type] || 'gray';
};

const getStatColor = (stat: string): string => {
  const statColors: { [key: string]: string } = {
    hp: 'red',
    attack: 'orange',
    defense: 'yellow',
    'special-attack': 'purple',
    'special-defense': 'blue',
    speed: 'green',
  };
  return statColors[stat] || 'gray';
}; 