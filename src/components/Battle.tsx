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

  const playerMaxHp = playerPokemon.stats.hp;
  const opponentMaxHp = opponentPokemon.stats.hp;

  // Effect to handle CPU turns
  useEffect(() => {
    if (gameMode === 'pve' && battleState.currentTurn === 'opponent' && !battleState.isGameOver) {
      const timer = setTimeout(() => {
        const opponent = battleState.opponentPokemon;
        if (opponent) {
          const opponentMove = opponent.moves[
            Math.floor(Math.random() * opponent.moves.length)
          ];
          handleAttack(opponent.moves.indexOf(opponentMove), 'opponent');
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [battleState.currentTurn, gameMode, battleState.isGameOver]);

  const addToBattleLog = (message: string) => {
    setBattleState((prev) => ({
      ...prev,
      battleLog: [...prev.battleLog, message],
    }));
  };

  const handleAttack = async (moveIndex: number, attacker: 'player' | 'opponent') => {
    if (battleState.isGameOver) return;

    const isPlayerTurn = attacker === 'player';
    const currentPokemon = isPlayerTurn ? battleState.playerPokemon : battleState.opponentPokemon;
    const targetPokemon = isPlayerTurn ? battleState.opponentPokemon : battleState.playerPokemon;

    if (!currentPokemon || !targetPokemon) return;

    const move = currentPokemon.moves[moveIndex];
    const damage = pokemonService.calculateDamage(
      currentPokemon,
      targetPokemon,
      move
    );

    setBattleState((prev) => {
      const targetKey = isPlayerTurn ? 'opponentPokemon' : 'playerPokemon';
      const target = prev[targetKey];
      
      if (!target) return prev;

      const newHp = Math.max(0, target.stats.hp - damage);
      const isDefeated = newHp <= 0;

      return {
        ...prev,
        [targetKey]: {
          ...target,
          stats: {
            ...target.stats,
            hp: newHp,
          },
        },
        battleLog: [
          ...prev.battleLog,
          `${currentPokemon.name} used ${move.name}!`,
          `It dealt ${damage} damage to ${targetPokemon.name}!`,
        ],
        currentTurn: isPlayerTurn ? 'opponent' : 'player',
        isGameOver: isDefeated,
        winner: isDefeated ? (isPlayerTurn ? 'player' : 'opponent') : null,
      };
    });

    // Check if target is defeated
    if (targetPokemon.stats.hp - damage <= 0) {
      onBattleEnd(isPlayerTurn ? 'player' : 'opponent');
    }
  };

  const renderBattleLog = () => (
    <Box className="battle-log">
      {[...battleState.battleLog].reverse().map((message, index) => (
        <Text 
          key={index} 
          className={`battle-message ${message.includes('damage') ? 'damage' : message.includes('used') ? 'attack' : ''}`}
        >
          {message}
        </Text>
      ))}
    </Box>
  );

  const renderMoves = (pokemon: Pokemon, isPlayer: boolean) => {
    if (!pokemon) return null;
    const isCurrentTurn = (isPlayer && battleState.currentTurn === 'player') || 
                         (!isPlayer && battleState.currentTurn === 'opponent');

    // Don't render moves for CPU in PvE mode
    if (!isPlayer && gameMode === 'pve') return null;

    return (
      <Grid templateColumns="repeat(2, 1fr)" gap={3}>
        {pokemon.moves.map((move, index) => (
          <GridItem key={index}>
            <Button
              className="pixel-button"
              onClick={() => handleAttack(index, isPlayer ? 'player' : 'opponent')}
              isDisabled={battleState.isGameOver || !isCurrentTurn}
              width="100%"
              size="sm"
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
    <Box className="battle-field">
      <VStack spacing={6} width="100%">
        <Grid templateColumns="repeat(2, 1fr)" gap={6} width="100%">
          <GridItem>
            <Card className="pokemon-card">
              <CardBody>
                <VStack spacing={3}>
                  <PokemonCard
                    pokemon={battleState.playerPokemon}
                    showStats
                  />
                  <Box width="100%">
                    <Text mb={1} fontSize="xs" fontWeight="medium">HP</Text>
                    <Box className="hp-bar">
                      <Box 
                        className="hp-bar-fill"
                        width={`${(battleState.playerPokemon.stats.hp / playerMaxHp) * 100}%`}
                      />
                    </Box>
                  </Box>
                  {renderMoves(battleState.playerPokemon, true)}
                </VStack>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem>
            <Card className="pokemon-card">
              <CardBody>
                <VStack spacing={3}>
                  <PokemonCard
                    pokemon={battleState.opponentPokemon}
                    showStats
                  />
                  <Box width="100%">
                    <Text mb={1} fontSize="xs" fontWeight="medium">HP</Text>
                    <Box className="hp-bar">
                      <Box 
                        className="hp-bar-fill"
                        width={`${(battleState.opponentPokemon.stats.hp / opponentMaxHp) * 100}%`}
                      />
                    </Box>
                  </Box>
                  {renderMoves(battleState.opponentPokemon, false)}
                </VStack>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        <Divider borderColor="var(--pokemon-dark)" borderWidth="2px" />

        {renderBattleLog()}
      </VStack>
    </Box>
  );
}; 