import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  Button,
  Input,
  Heading,
  Container,
  SimpleGrid,
  HStack,
  VStack,
  Badge,
  useColorModeValue,
  Card,
  CardBody,
  Divider,
} from '@chakra-ui/react';
import { Pokemon } from '../types/pokemon';
import { PlayerStats } from '../types/player';
import { pokemonService } from '../services/pokemonService';
import { PokemonCard } from './PokemonCard';
import { Battle } from './Battle';

type GameMode = 'pvp' | 'pve';

export const Game: React.FC = () => {
  const [pokemonList, setPokemonList] = useState<{ name: string; url: string }[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [opponentPokemon, setOpponentPokemon] = useState<Pokemon | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('pve');
  const [playerName, setPlayerName] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [isBattleStarted, setIsBattleStarted] = useState(false);
  const [player1Stats, setPlayer1Stats] = useState<PlayerStats>({ wins: 0, losses: 0, name: '' });
  const [player2Stats, setPlayer2Stats] = useState<PlayerStats>({ wins: 0, losses: 0, name: '' });

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    const fetchPokemonList = async () => {
      try {
        const list = await pokemonService.getPokemonList();
        setPokemonList(list);
      } catch (error) {
        console.error('Failed to fetch Pokémon list:', error);
      }
    };

    fetchPokemonList();
  }, []);

  const handlePokemonSelect = async (pokemonName: string) => {
    try {
      const pokemon = await pokemonService.getPokemonById(
        pokemonList.findIndex((p) => p.name === pokemonName) + 1
      );
      setSelectedPokemon(pokemon);
    } catch (error) {
      console.error('Failed to fetch Pokémon details:', error);
    }
  };

  const handleStartBattle = async () => {
    if (!selectedPokemon || !playerName) {
      alert('Please select a Pokémon and enter your name');
      return;
    }

    if (gameMode === 'pvp' && !player2Name) {
      alert('Please enter Player 2 name for PvP mode');
      return;
    }

    try {
      const opponent = await pokemonService.getRandomPokemon();
      setOpponentPokemon(opponent);
      setIsBattleStarted(true);
      setPlayer1Stats(prev => ({ ...prev, name: playerName }));
      setPlayer2Stats(prev => ({ ...prev, name: gameMode === 'pvp' ? player2Name : 'CPU' }));
    } catch (error) {
      console.error('Failed to start battle:', error);
    }
  };

  const handleBattleEnd = (winner: 'player' | 'opponent') => {
    setIsBattleStarted(false);
    if (winner === 'player') {
      setPlayer1Stats(prev => ({ ...prev, wins: prev.wins + 1 }));
      setPlayer2Stats(prev => ({ ...prev, losses: prev.losses + 1 }));
    } else {
      setPlayer1Stats(prev => ({ ...prev, losses: prev.losses + 1 }));
      setPlayer2Stats(prev => ({ ...prev, wins: prev.wins + 1 }));
    }
    setSelectedPokemon(null);
    setOpponentPokemon(null);
    alert(winner === 'player' ? 'Congratulations! You won!' : 'Better luck next time!');
  };

  const handleResetStats = () => {
    setPlayer1Stats({ wins: 0, losses: 0, name: player1Stats.name });
    setPlayer2Stats({ wins: 0, losses: 0, name: player2Stats.name });
  };

  const renderPlayerStats = (stats: PlayerStats) => (
    <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
      <CardBody>
        <VStack spacing={3} align="start">
          <Text fontSize="xl" fontWeight="bold">{stats.name || 'Player'}</Text>
          <Divider />
          <HStack spacing={4}>
            <Badge colorScheme="green" fontSize="md" p={2} borderRadius="md">
              Wins: {stats.wins}
            </Badge>
            <Badge colorScheme="red" fontSize="md" p={2} borderRadius="md">
              Losses: {stats.losses}
            </Badge>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );

  if (isBattleStarted && selectedPokemon && opponentPokemon) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8}>
          <SimpleGrid columns={2} spacing={8} width="100%">
            {renderPlayerStats(player1Stats)}
            {renderPlayerStats(player2Stats)}
          </SimpleGrid>
          <Battle
            playerPokemon={selectedPokemon}
            opponentPokemon={opponentPokemon}
            onBattleEnd={handleBattleEnd}
            gameMode={gameMode}
          />
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8}>
        <Heading>Pokémon Battle Game</Heading>
        
        <Card bg={bgColor} borderWidth="1px" borderColor={borderColor} width="100%" maxW="md">
          <CardBody>
            <VStack spacing={6}>
              <Box width="100%">
                <Text mb={2} fontWeight="medium">Game Mode</Text>
                <select
                  value={gameMode}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setGameMode(e.target.value as GameMode)}
                  className="chakra-select"
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <option value="">Select game mode</option>
                  <option value="pve">Player vs CPU</option>
                  <option value="pvp">Player vs Player</option>
                </select>
              </Box>

              <Box width="100%">
                <Text mb={2} fontWeight="medium">Player 1 Name</Text>
                <Input
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlayerName(e.target.value)}
                />
              </Box>

              {gameMode === 'pvp' && (
                <Box width="100%">
                  <Text mb={2} fontWeight="medium">Player 2 Name</Text>
                  <Input
                    placeholder="Enter Player 2 name"
                    value={player2Name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlayer2Name(e.target.value)}
                  />
                </Box>
              )}

              <Box width="100%">
                <Text mb={2} fontWeight="medium">Select Your Pokémon</Text>
                <select
                  value={selectedPokemon?.name || ''}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handlePokemonSelect(e.target.value)}
                  className="chakra-select"
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <option value="">Select your Pokémon</option>
                  {pokemonList.map((pokemon) => (
                    <option key={pokemon.name} value={pokemon.name}>
                      {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
                    </option>
                  ))}
                </select>
              </Box>

              {selectedPokemon && (
                <Box width="100%">
                  <PokemonCard
                    pokemon={selectedPokemon}
                    showStats
                  />
                </Box>
              )}

              <Button
                colorScheme="blue"
                onClick={handleStartBattle}
                disabled={!selectedPokemon || !playerName || (gameMode === 'pvp' && !player2Name)}
                width="100%"
                size="lg"
              >
                Start Battle
              </Button>
            </VStack>
          </CardBody>
        </Card>

        <SimpleGrid columns={2} spacing={8} width="100%">
          {renderPlayerStats(player1Stats)}
          {renderPlayerStats(player2Stats)}
        </SimpleGrid>

        <Button
          colorScheme="red"
          onClick={handleResetStats}
          size="md"
          variant="outline"
        >
          Reset Statistics
        </Button>
      </VStack>
    </Container>
  );
}; 