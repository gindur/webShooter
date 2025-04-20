import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import Shop from './Shop';
import {
  calculateDirection,
  checkCollision,
  createProjectile as createProjectileUtil,
  calculateNewPosition,
  isWithinBounds,
  generateRandomEdgePosition
} from '../utils/gameUtils';

const breathe = keyframes`
  0% { transform: scale(1) translate(0, 0); }
  50% { transform: scale(1.3) translate(0, 0); }
  100% { transform: scale(1) translate(0, 0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const Ball = styled.div.attrs(props => ({
  style: {
    left: `${props.$x}px`,
    top: `${props.$y}px`,
  },
  'data-testid': 'game-ball'
}))`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(145deg, #ff6b6b, #ff8e8e);
  position: absolute;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  animation: ${breathe} 4s ease-in-out infinite;
  z-index: 2;
`;

const Projectile = styled.div.attrs(props => ({
  style: {
    left: `${props.$x}px`,
    top: `${props.$y}px`,
  },
  'data-testid': 'projectile'
}))`
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: radial-gradient(circle at center, #fff 0%, #ff6b6b 100%);
  position: absolute;
  box-shadow: 0 0 20px #fff, 0 0 40px #ff6b6b;
  z-index: 1;
`;

const Zombie = styled.div.attrs(props => ({
  style: {
    left: `${props.$x}px`,
    top: `${props.$y}px`,
  },
  'data-testid': 'zombie'
}))`
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background: linear-gradient(145deg, #2ecc71, #27ae60);
  position: absolute;
  box-shadow: 0 0 15px #2ecc71;
  animation: ${pulse} 2s ease-in-out infinite;
  z-index: 1;
`;

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #1a1a1a;
  overflow: hidden;
`;

const Arena = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  border: 2px solid #333;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  z-index: 10;
  animation: ${fadeIn} 0.5s ease-in-out;
`;

const Title = styled.h1`
  font-size: 48px;
  margin-bottom: 20px;
  text-shadow: 0 0 10px #ff6b6b;
`;

const Subtitle = styled.p`
  font-size: 24px;
  margin-bottom: 40px;
`;

const Button = styled.button`
  padding: 12px 24px;
  font-size: 18px;
  background: linear-gradient(145deg, #ff6b6b, #ff8e8e);
  border: none;
  border-radius: 30px;
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    transform: translateY(1px);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }
`;

const ScoreDisplay = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  color: white;
  font-size: 24px;
  font-family: Arial, sans-serif;
  z-index: 3;
`;

const CoinDisplay = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  color: white;
  font-size: 20px;
  font-family: Arial, sans-serif;
  display: flex;
  align-items: center;
  z-index: 3;
`;

const CoinIcon = styled.div`
  width: 20px;
  height: 20px;
  background: linear-gradient(145deg, #ffd700, #ffaa00);
  border-radius: 50%;
  margin-right: 8px;
  box-shadow: 0 0 5px #ffd700;
`;

const ShopHint = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  color: white;
  font-size: 16px;
  font-family: Arial, sans-serif;
  opacity: 0.7;
  z-index: 3;
`;

const DifficultyDisplay = styled.div`
  position: absolute;
  top: 50px;
  left: 20px;
  color: white;
  font-size: 18px;
  font-family: Arial, sans-serif;
  z-index: 3;
`;

const RoundDisplay = styled.div`
  position: absolute;
  top: 80px;
  left: 20px;
  color: white;
  font-size: 18px;
  font-family: Arial, sans-serif;
  z-index: 3;
`;

const RoundProgressBar = styled.div`
  position: absolute;
  top: 110px;
  left: 20px;
  width: 200px;
  height: 10px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 5px;
  overflow: hidden;
  z-index: 3;
`;

const RoundProgressFill = styled.div`
  height: 100%;
  background-color: #ff6b6b;
  width: ${props => props.$progress}%;
  transition: width 0.3s ease-out;
`;

const RoundCompleteOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding-top: 100px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  z-index: 10;
  animation: ${fadeIn} 0.5s ease-in-out;
  overflow-y: auto;
`;

const RoundCompleteMessage = styled.h2`
  font-size: 36px;
  color: #ff6b6b;
  margin-bottom: 20px;
  text-shadow: 0 0 10px rgba(255, 107, 107, 0.6);
  animation: ${pulse} 1s infinite;
`;

const RoundCompleteDetails = styled.p`
  font-size: 24px;
  margin-bottom: 40px;
`;

const RoundContinueButton = styled.button`
  padding: 12px 24px;
  font-size: 18px;
  background: linear-gradient(145deg, #ff6b6b, #ff8e8e);
  border: none;
  border-radius: 30px;
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    transform: translateY(1px);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }
`;

const BallGame = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [keys, setKeys] = useState({
    w: false,
    a: false,
    s: false,
    d: false
  });
  const [arenaSize, setArenaSize] = useState({ width: 0, height: 0 });
  const [projectiles, setProjectiles] = useState([]);
  const [zombies, setZombies] = useState([]);
  const [isAutoShooting, setIsAutoShooting] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('pregame'); // 'pregame', 'playing', 'gameover'
  const [lastShotTime, setLastShotTime] = useState(0); // Track the last time a shot was fired
  const [coins, setCoins] = useState(0);
  const [shopOpen, setShopOpen] = useState(false);
  const [round, setRound] = useState(1);
  const [roundComplete, setRoundComplete] = useState(false);
  const [playerStats, setPlayerStats] = useState({
    speed: 5,
    projectileSpeed: 15,
    fireRate: 1000,
    damage: 1
  });
  
  const ballSize = 30;
  const baseZombieSpeed = 2;
  const shootIntervalRef = useRef(null);
  const zombieSpawnIntervalRef = useRef(null);
  const positionRef = useRef(position);
  const mousePosRef = useRef(mousePos);
  const projectilesRef = useRef(projectiles);
  const zombiesRef = useRef(zombies);
  const arenaSizeRef = useRef(arenaSize);
  const lastUpdateRef = useRef(0);
  const FRAME_RATE = 1000 / 60; // 60 FPS
  const SHOT_COOLDOWN = 500; // Cooldown between shots in milliseconds
  const playerStatsRef = useRef(playerStats);
  const scoreRef = useRef(score);
  const roundRef = useRef(round);

  // Update refs when values change
  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    mousePosRef.current = mousePos;
  }, [mousePos]);

  useEffect(() => {
    projectilesRef.current = projectiles;
  }, [projectiles]);

  useEffect(() => {
    zombiesRef.current = zombies;
  }, [zombies]);

  useEffect(() => {
    arenaSizeRef.current = arenaSize;
  }, [arenaSize]);

  useEffect(() => {
    playerStatsRef.current = playerStats;
  }, [playerStats]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    roundRef.current = round;
  }, [round]);

  const createProjectile = useCallback(() => {
    const currentPos = positionRef.current;
    const currentMousePos = mousePosRef.current;
    const currentPlayerStats = playerStatsRef.current;
    
    const newProjectile = createProjectileUtil(
      { x: currentPos.x + ballSize/2, y: currentPos.y + ballSize/2 },
      currentMousePos,
      currentPlayerStats.projectileSpeed
    );
    
    setProjectiles(prev => [...prev, newProjectile]);
  }, []);

  const createZombie = useCallback(() => {
    const currentArenaSize = arenaSizeRef.current;
    const zombieSize = 25;
    
    const { x, y } = generateRandomEdgePosition(currentArenaSize, zombieSize);
    
    const newZombie = {
      id: Date.now() + Math.random(),
      x,
      y,
      size: zombieSize
    };
    
    setZombies(prev => [...prev, newZombie]);
  }, []);

  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setCoins(0);
    setRound(1);
    setRoundComplete(false);
    setZombies([]);
    setProjectiles([]);
    setPosition({ 
      x: arenaSize.width / 2 - ballSize / 2, 
      y: arenaSize.height / 2 - ballSize / 2 
    });
    setPlayerStats({
      speed: 5,
      projectileSpeed: 15,
      fireRate: 1000,
      damage: 1
    });
  }, [arenaSize]);

  const resetGame = useCallback(() => {
    setGameState('pregame');
  }, []);

  // Handle proceeding to the next round - MOVED UP to before it's used in the useEffect
  const continueToNextRound = useCallback(() => {
    // Increment the round
    setRound(prevRound => prevRound + 1);
    setRoundComplete(false);
    setZombies([]);
    setProjectiles([]);
    
    // Place player back in the center
    setPosition({ 
      x: arenaSize.width / 2 - ballSize / 2, 
      y: arenaSize.height / 2 - ballSize / 2 
    });
    
    // Ensure game state is 'playing' to trigger zombie spawning
    setGameState('playing');
    
    // Give the player a short grace period before zombies start spawning
    if (zombieSpawnIntervalRef.current) {
      clearInterval(zombieSpawnIntervalRef.current);
    }
    
    // Start spawning zombies after a 2 second delay
    setTimeout(() => {
      zombieSpawnIntervalRef.current = setInterval(createZombie, 1500);
    }, 2000);
  }, [arenaSize, createZombie]);

  useEffect(() => {
    const updateArenaSize = () => {
      setArenaSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateArenaSize();
    window.addEventListener('resize', updateArenaSize);
    return () => window.removeEventListener('resize', updateArenaSize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      
      if (gameState === 'pregame' && e.key === ' ') {
        startGame();
        return;
      }
      
      if (gameState === 'gameover' && e.key === ' ') {
        resetGame();
        return;
      }
      
      if (roundComplete && e.key === ' ') {
        continueToNextRound();
        return;
      }
      
      if (gameState === 'playing' && !roundComplete) {
        if (['w', 'a', 's', 'd'].includes(key)) {
          setKeys(prev => ({ ...prev, [key]: true }));
        } else if (key === 'p') {
          setShopOpen(prev => !prev);
        }
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd'].includes(key)) {
        setKeys(prev => ({ ...prev, [key]: false }));
      }
    };

    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleClick = (e) => {
      e.preventDefault();
      if (gameState === 'playing') {
        const now = Date.now();
        if (now - lastShotTime >= SHOT_COOLDOWN) {
          createProjectile();
          setLastShotTime(now);
        }
        
        setIsAutoShooting(prev => {
          const newState = !prev;
          if (newState) {
            createProjectile();
            setLastShotTime(Date.now());
          }
          return newState;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
    };
  }, [createProjectile, gameState, startGame, resetGame, roundComplete, continueToNextRound, lastShotTime]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const moveSpeed = playerStatsRef.current.speed;
    const moveInterval = setInterval(() => {
      setPosition(prev => {
        const newX = prev.x + (keys.d ? moveSpeed : 0) - (keys.a ? moveSpeed : 0);
        const newY = prev.y + (keys.s ? moveSpeed : 0) - (keys.w ? moveSpeed : 0);
        
        return {
          x: Math.max(0, Math.min(newX, arenaSize.width - ballSize)),
          y: Math.max(0, Math.min(newY, arenaSize.height - ballSize))
        };
      });
    }, 16);

    return () => clearInterval(moveInterval);
  }, [keys, arenaSize, gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    
    if (isAutoShooting) {
      shootIntervalRef.current = setInterval(createProjectile, playerStatsRef.current.fireRate);
    } else {
      if (shootIntervalRef.current) {
        clearInterval(shootIntervalRef.current);
        shootIntervalRef.current = null;
      }
    }

    return () => {
      if (shootIntervalRef.current) {
        clearInterval(shootIntervalRef.current);
        shootIntervalRef.current = null;
      }
    };
  }, [isAutoShooting, createProjectile, gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    
    // Start spawning zombies
    zombieSpawnIntervalRef.current = setInterval(createZombie, 1500);
    
    return () => {
      if (zombieSpawnIntervalRef.current) {
        clearInterval(zombieSpawnIntervalRef.current);
        zombieSpawnIntervalRef.current = null;
      }
    };
  }, [createZombie, gameState]);

  // Calculate zombie speed based on score (scales up to 300% at 1000 points)
  const calculateZombieSpeed = useCallback((currentScore) => {
    if (currentScore <= 0) return baseZombieSpeed;
    
    // Calculate the speed multiplier (1.0 to 3.0) based on score
    // Score 0 = 1.0x speed, Score 1000 = 3.0x speed
    const maxMultiplier = 3.0;
    const scoreThreshold = 1000;
    const multiplier = Math.min(1.0 + (currentScore / scoreThreshold) * 2.0, maxMultiplier);
    
    return baseZombieSpeed * multiplier;
  }, []);

  useEffect(() => {
    if (gameState !== 'playing') return;
    
    let animationFrameId;
    
    const updateProjectiles = (timestamp) => {
      if (timestamp - lastUpdateRef.current >= FRAME_RATE) {
        // Track zombies hit in this update cycle to prevent multiple hits on the same zombie
        const hitZombieIds = new Set();
        
        setProjectiles(prev => {
          const currentArenaSize = arenaSizeRef.current;
          const currentZombies = zombiesRef.current;
          
          return prev.filter(projectile => {
            // Calculate new position
            const newPosition = calculateNewPosition(projectile, projectile);
            
            // Remove projectile if it hits a wall
            if (!isWithinBounds(newPosition, currentArenaSize, projectile.size || 15)) {
              return false;
            }
            
            // Check for zombie collisions
            for (let i = 0; i < currentZombies.length; i++) {
              const zombie = currentZombies[i];
              
              // Skip zombies already hit in this frame
              if (hitZombieIds.has(zombie.id)) continue;
              
              if (checkCollision(
                { ...newPosition, size: projectile.size || 15 },
                zombie
              )) {
                // Mark this zombie as hit
                hitZombieIds.add(zombie.id);
                
                // Remove zombie directly from the reference to avoid collision detection race conditions
                const updatedZombies = zombiesRef.current.filter(z => z.id !== zombie.id);
                zombiesRef.current = updatedZombies;
                
                // Update zombie state and add points
                setZombies(prevZombies => prevZombies.filter(z => z.id !== zombie.id));
                setScore(prevScore => prevScore + 10);
                setCoins(prevCoins => prevCoins + 1);
                
                return false;
              }
            }
            
            // Update position if no collision
            projectile.x = newPosition.x;
            projectile.y = newPosition.y;
            return true;
          }).filter(p => {
            const age = Date.now() - p.id;
            return age < 5000; // Remove projectiles after 5 seconds
          });
        });
        
        // Update zombies - remove hit zombies and move remaining ones
        setZombies(prev => {
          const currentPos = positionRef.current;
          const currentScore = scoreRef.current;
          
          // Calculate current zombie speed based on score
          const currentZombieSpeed = calculateZombieSpeed(currentScore);
          
          // Check for player collision
          for (let i = 0; i < prev.length; i++) {
            const zombie = prev[i];
            
            if (checkCollision(
              { x: currentPos.x + ballSize/2, y: currentPos.y + ballSize/2, size: ballSize },
              zombie
            )) {
              // Game over if zombie touches player
              setGameState('gameover');
              return prev;
            }
          }
          
          return prev.map(zombie => {
            // Calculate direction to player
            const playerCenter = { 
              x: currentPos.x + ballSize/2, 
              y: currentPos.y + ballSize/2 
            };
            
            const direction = calculateDirection(zombie, playerCenter);
            
            // Move zombie towards player with dynamic speed
            return {
              ...zombie,
              x: zombie.x + direction.dx * currentZombieSpeed,
              y: zombie.y + direction.dy * currentZombieSpeed
            };
          });
        });
        
        lastUpdateRef.current = timestamp;
      }
      animationFrameId = requestAnimationFrame(updateProjectiles);
    };

    animationFrameId = requestAnimationFrame(updateProjectiles);
    return () => cancelAnimationFrame(animationFrameId);
  }, [FRAME_RATE, gameState, calculateZombieSpeed]);

  // Add a function to display the current difficulty level
  const getDifficultyText = useCallback(() => {
    const currentSpeed = calculateZombieSpeed(score);
    const speedPercentage = Math.round((currentSpeed / baseZombieSpeed) * 100);
    
    if (score < 1000) {
      return `Difficulty: ${speedPercentage}%`;
    } else if (score >= 1000 && score < 10000) {
      return `Difficulty: MAX (300%)`;
    } else {
      return `Difficulty: NIGHTMARE (300%)`;
    }
  }, [score, calculateZombieSpeed]);

  // Shop items configuration
  const shopItems = [
    {
      id: 'speed',
      name: 'Speed Boost',
      description: 'Move 30% faster',
      price: 50,
      icon: '⚡',
      iconColor: '#ffc107',
      apply: (stats) => ({
        ...stats,
        speed: stats.speed * 1.3
      })
    },
    {
      id: 'fire_rate',
      name: 'Rapid Fire',
      description: 'Shoot 40% faster',
      price: 50,
      icon: '🔥',
      iconColor: '#dc3545',
      apply: (stats) => ({
        ...stats,
        fireRate: stats.fireRate * 0.6 // Lower is faster
      })
    },
    {
      id: 'projectile_speed',
      name: 'Bullet Velocity',
      description: 'Projectiles move 25% faster',
      price: 50,
      icon: '💨',
      iconColor: '#17a2b8',
      apply: (stats) => ({
        ...stats,
        projectileSpeed: stats.projectileSpeed * 1.25
      })
    }
  ];

  // Handle shop purchase
  const handlePurchase = (itemId) => {
    const item = shopItems.find(item => item.id === itemId);
    
    if (item && coins >= item.price) {
      setCoins(prevCoins => prevCoins - item.price);
      setPlayerStats(item.apply);
    }
  };

  // Calculate target score for the current round
  const getRoundTargetScore = useCallback((roundNumber) => {
    // Round 1: 100 points, Round 2: 150 points, increasing by 50 each round
    return 100 + (roundNumber - 1) * 50;
  }, []);
  
  // Get the round progress as a percentage
  const getRoundProgress = useCallback(() => {
    const targetScore = getRoundTargetScore(round);
    return Math.min((score / targetScore) * 100, 100);
  }, [score, round, getRoundTargetScore]);

  // Check if the round is complete based on score
  useEffect(() => {
    const targetScore = getRoundTargetScore(round);
    if (score >= targetScore && gameState === 'playing') {
      setRoundComplete(true);
      // Immediately clear zombies and projectiles when round completes
      setZombies([]);
      setProjectiles([]);
      
      // Clear any active zombie spawning
      if (zombieSpawnIntervalRef.current) {
        clearInterval(zombieSpawnIntervalRef.current);
        zombieSpawnIntervalRef.current = null;
      }
      
      // Clear auto-shooting if active
      if (shootIntervalRef.current) {
        clearInterval(shootIntervalRef.current);
        shootIntervalRef.current = null;
      }
      setIsAutoShooting(false);
    }
  }, [score, round, getRoundTargetScore, gameState]);

  return (
    <Container>
      <Arena>
        {gameState === 'playing' && (
          <>
            <Ball $x={position.x} $y={position.y} data-testid="game-ball" />
            {projectiles.map(projectile => (
              <Projectile
                key={projectile.id}
                $x={projectile.x}
                $y={projectile.y}
                data-testid="projectile"
              />
            ))}
            {zombies.map(zombie => (
              <Zombie
                key={zombie.id}
                $x={zombie.x}
                $y={zombie.y}
                data-testid="zombie"
              />
            ))}
            <ScoreDisplay>Score: {score}</ScoreDisplay>
            <CoinDisplay>
              <CoinIcon /> {coins}
            </CoinDisplay>
            <ShopHint>Press P to open shop</ShopHint>
            
            <DifficultyDisplay>
              {getDifficultyText()}
            </DifficultyDisplay>
            
            <RoundDisplay>
              Round: {round} - Target: {getRoundTargetScore(round)}
            </RoundDisplay>
            
            <RoundProgressBar>
              <RoundProgressFill $progress={getRoundProgress()} />
            </RoundProgressBar>
            
            {roundComplete && (
              <RoundCompleteOverlay>
                <RoundCompleteMessage>Round {round} Complete!</RoundCompleteMessage>
                <RoundCompleteDetails>
                  Score: {score} / {getRoundTargetScore(round)}
                </RoundCompleteDetails>
                <RoundContinueButton onClick={continueToNextRound}>
                  Continue to Round {round + 1}
                </RoundContinueButton>
                
                <RoundCompleteDetails style={{ marginTop: '20px' }}>
                  Shop for Upgrades
                </RoundCompleteDetails>
                
                <Shop 
                  coins={coins}
                  onPurchase={handlePurchase}
                  onClose={() => {}}
                  shopItems={shopItems}
                />
              </RoundCompleteOverlay>
            )}
            
            {shopOpen && !roundComplete && (
              <Shop 
                coins={coins}
                onPurchase={handlePurchase}
                onClose={() => setShopOpen(false)}
                shopItems={shopItems}
              />
            )}
          </>
        )}
        
        {gameState === 'pregame' && (
          <Overlay>
            <Title>Web Shooter</Title>
            <Subtitle>Press SPACE to start</Subtitle>
            <Button onClick={startGame}>Start Game</Button>
          </Overlay>
        )}
        
        {gameState === 'gameover' && (
          <Overlay>
            <Title>Game Over</Title>
            <Subtitle>Your score: {score}</Subtitle>
            <Subtitle>Press SPACE to play again</Subtitle>
            <Button onClick={resetGame}>Play Again</Button>
          </Overlay>
        )}
      </Arena>
    </Container>
  );
};

export default BallGame; 