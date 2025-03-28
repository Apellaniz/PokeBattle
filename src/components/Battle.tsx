import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Progress,
  Grid,
  GridItem,
  Card,
  CardBody,
  useColorModeValue,
  Divider,
} from '@chakra-ui/react';
import { Pokemon, BattleState } from '../types/pokemon';
import { pokemonService } from '../services/pokemonService';
import { PokemonCard } from './PokemonCard';

interface BattleProps {
  playerPokemon: Pokemon;
  opponentPokemon: Pokemon;
  onBattleEnd: (winner: 'player' | 'opponent') => void;
  gameMode: 'pvp' | 'pve';
}

export const Battle: React.FC<BattleProps> = ({
  playerPokemon,
  opponentPokemon,
  onBattleEnd,
  gameMode,
}) => {
  const [battleState, setBattleState] = useState<BattleState>({
    playerPokemon: { ...playerPokemon, stats: { ...playerPokemon.stats, hp: playerPokemon.stats.hp } },
    opponentPokemon: { ...opponentPokemon, stats: { ...opponentPokemon.stats, hp: opponentPokemon.stats.hp } },
    currentTurn: 'player',
    battleLog: [],
    isGameOver: false,
    winner: null,
  });

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const playerMaxHp = playerPokemon.stats.hp;
  const opponentMaxHp = opponentPokemon.stats.hp;

  const addToBattleLog = (message: string) => {
    setBattleState((prev) => ({
      ...prev,
      battleLog: [...prev.battleLog, message],
    }));
  };

  const handleAttack = async (moveIndex: number) => {
    if (battleState.isGameOver || !battleState.playerPokemon || !battleState.opponentPokemon) return;

    const playerPokemon = battleState.playerPokemon;
    const opponentPokemon = battleState.opponentPokemon;
    const move = playerPokemon.moves[moveIndex];
    const damage = pokemonService.calculateDamage(
      playerPokemon,
      opponentPokemon,
      move
    );

    // Player's turn
    setBattleState((prev) => {
      if (!prev.opponentPokemon) return prev;
      return {
        ...prev,
        opponentPokemon: {
          ...prev.opponentPokemon,
          stats: {
            ...prev.opponentPokemon.stats,
            hp: Math.max(0, prev.opponentPokemon.stats.hp - damage),
          },
        },
        battleLog: [
          ...prev.battleLog,
          `${playerPokemon.name} used ${move.name}!`,
          `It dealt ${damage} damage to ${opponentPokemon.name}!`,
        ],
      };
    });

    // Check if opponent is defeated
    if (opponentPokemon.stats.hp - damage <= 0) {
      setBattleState((prev) => ({
        ...prev,
        isGameOver: true,
        winner: 'player',
      }));
      onBattleEnd('player');
      return;
    }

    // Opponent's turn
    setTimeout(() => {
      if (gameMode === 'pve' && battleState.opponentPokemon && battleState.playerPokemon) {
        const opponentMove = battleState.opponentPokemon.moves[
          Math.floor(Math.random() * battleState.opponentPokemon.moves.length)
        ];
        const opponentDamage = pokemonService.calculateDamage(
          battleState.opponentPokemon,
          battleState.playerPokemon,
          opponentMove
        );

        setBattleState((prev) => {
          if (!prev.playerPokemon || !prev.opponentPokemon) return prev;
          const newHp = Math.max(0, prev.playerPokemon.stats.hp - opponentDamage);
          const battleLogMessage = `${prev.opponentPokemon.name} used ${opponentMove.name}!`;
          const damageMessage = `It dealt ${opponentDamage} damage to ${prev.playerPokemon.name}!`;
          
          return {
            ...prev,
            playerPokemon: {
              ...prev.playerPokemon,
              stats: {
                ...prev.playerPokemon.stats,
                hp: newHp,
              },
            },
            battleLog: [
              ...prev.battleLog,
              battleLogMessage,
              damageMessage,
            ],
            isGameOver: newHp <= 0,
            winner: newHp <= 0 ? 'opponent' : null,
          };
        });

        // Check if player is defeated
        if (battleState.playerPokemon.stats.hp - opponentDamage <= 0) {
          onBattleEnd('opponent');
        }
      }
    }, 1000);
  };

  const renderBattleLog = () => (
    <Card bg={bgColor} borderWidth="1px" borderColor={borderColor} height="200px">
      <CardBody>
        <VStack 
          align="start" 
          spacing={2} 
          height="100%" 
          overflowY="auto"
          css={{
            '&::-webkit-scrollbar': {
              width: '4px',
            },
            '&::-webkit-scrollbar-track': {
              width: '6px',
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#CBD5E0',
              borderRadius: '24px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#A0AEC0',
            },
          }}
        >
          {[...battleState.battleLog].reverse().map((message, index) => (
            <Text 
              key={index} 
              fontSize="sm"
              color={message.includes('damage') ? 'red.500' : 'inherit'}
              fontWeight={message.includes('used') ? 'bold' : 'normal'}
            >
              {message}
            </Text>
          ))}
        </VStack>
      </CardBody>
    </Card>
  );

  const renderMoves = () => {
    if (!battleState.playerPokemon) return null;
    return (
      <Grid templateColumns="repeat(2, 1fr)" gap={4}>
        {battleState.playerPokemon.moves.map((move, index) => (
          <GridItem key={index}>
            <Button
              width="100%"
              onClick={() => handleAttack(index)}
              isDisabled={battleState.isGameOver || battleState.currentTurn !== 'player'}
              colorScheme="blue"
              size="md"
            >
              {move.name}
            </Button>
          </GridItem>
        ))}
      </Grid>
    );
  };

  if (!battleState.playerPokemon || !battleState.opponentPokemon) {
    return null;
  }

  return (
    <VStack spacing={8} width="100%">
      <Grid templateColumns="repeat(2, 1fr)" gap={8} width="100%">
        <GridItem>
          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <VStack spacing={4}>
                <PokemonCard
                  pokemon={battleState.playerPokemon}
                  showStats
                />
                <Box width="100%">
                  <Text mb={2} fontSize="sm" fontWeight="medium">HP</Text>
                  <Progress
                    value={(battleState.playerPokemon.stats.hp / playerMaxHp) * 100}
                    colorScheme="green"
                    size="sm"
                    borderRadius="full"
                  />
                </Box>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem>
          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <VStack spacing={4}>
                <PokemonCard
                  pokemon={battleState.opponentPokemon}
                  showStats
                />
                <Box width="100%">
                  <Text mb={2} fontSize="sm" fontWeight="medium">HP</Text>
                  <Progress
                    value={(battleState.opponentPokemon.stats.hp / opponentMaxHp) * 100}
                    colorScheme="red"
                    size="sm"
                    borderRadius="full"
                  />
                </Box>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      <Divider />

      {renderBattleLog()}
      {renderMoves()}
    </VStack>
  );
}; 