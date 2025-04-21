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

const RangedMinion = styled.div.attrs(props => ({
  style: {
    left: `${props.$x}px`,
    top: `${props.$y}px`,
  },
  'data-testid': 'ranged-minion'
}))`
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background: linear-gradient(145deg, #9b59b6, #8e44ad);
  position: absolute;
  box-shadow: 0 0 15px #9b59b6;
  animation: ${pulse} 2s ease-in-out infinite;
  z-index: 1;
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: white;
    transform: translate(-50%, -50%);
  }
`;

const EnemyProjectile = styled.div.attrs(props => ({
  style: {
    left: `${props.$x}px`,
    top: `${props.$y}px`,
  },
  'data-testid': 'enemy-projectile'
}))`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: radial-gradient(circle at center, #fff 0%, #9b59b6 100%);
  position: absolute;
  box-shadow: 0 0 10px #fff, 0 0 20px #9b59b6;
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

const DebugPanel = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 100;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 10px;
  border-radius: 10px;
  color: white;
`;

const DebugButton = styled.button`
  padding: 8px 16px;
  font-size: 14px;
  background: linear-gradient(145deg, #3498db, #2980b9);
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(1px);
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
  const [rangedMinions, setRangedMinions] = useState([]);
  const [enemyProjectiles, setEnemyProjectiles] = useState([]);
  const [isAutoShooting, setIsAutoShooting] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('pregame'); // 'pregame', 'playing', 'gameover'
  const [lastShotTime, setLastShotTime] = useState(0); // Track the last time a shot was fired
  const [coins, setCoins] = useState(0);
  const [shopOpen, setShopOpen] = useState(false);
  const [round, setRound] = useState(1);
  const [roundComplete, setRoundComplete] = useState(false);
  const [roundShopOpen, setRoundShopOpen] = useState(true);
  const [debugPanelVisible, setDebugPanelVisible] = useState(true);
  const [playerStats, setPlayerStats] = useState({
    speed: 5,
    projectileSpeed: 15,
    fireRate: 1000,
    damage: 1
  });
  
  const ballSize = 30;
  const baseZombieSpeed = 2;
  const baseRangedMinionSpeed = 1.5;
  const enemyProjectileSpeed = 3.25; // 65% of 5 (reduced from 5)
  const shootIntervalRef = useRef(null);
  const zombieSpawnIntervalRef = useRef(null);
  const rangedMinionSpawnIntervalRef = useRef(null);
  const positionRef = useRef(position);
  const mousePosRef = useRef(mousePos);
  const projectilesRef = useRef(projectiles);
  const zombiesRef = useRef(zombies);
  const rangedMinionsRef = useRef(rangedMinions);
  const enemyProjectilesRef = useRef(enemyProjectiles);
  const arenaSizeRef = useRef(arenaSize);
  const lastUpdateRef = useRef(0);
  const FRAME_RATE = 1000 / 60; // 60 FPS
  const SHOT_COOLDOWN = 500; // Cooldown between shots in milliseconds
  const playerStatsRef = useRef(playerStats);
  const scoreRef = useRef(score);
  const roundRef = useRef(round);
  const roundCompleteRef = useRef(roundComplete);
  
  // Enemy type configuration
  const enemyTypes = {
    zombie: {
      speed: baseZombieSpeed,
      size: 25,
      shootsProjectiles: false,
      scoreValue: 10,
      coinValue: 1
    },
    rangedMinion: {
      speed: baseRangedMinionSpeed,
      size: 25,
      shootsProjectiles: true,
      projectileSpeed: enemyProjectileSpeed,
      shootRange: 400, // Maximum distance to shoot from
      shootInterval: 2000, // Time between shots in ms
      scoreValue: 15,
      coinValue: 2
    }
  };

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
    rangedMinionsRef.current = rangedMinions;
  }, [rangedMinions]);
  
  useEffect(() => {
    enemyProjectilesRef.current = enemyProjectiles;
  }, [enemyProjectiles]);

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
  
  useEffect(() => {
    roundCompleteRef.current = roundComplete;
  }, [roundComplete]);
  
  // Create an enemy projectile directed at the player
  const createEnemyProjectile = useCallback((enemyPosition) => {
    const playerCenter = { 
      x: positionRef.current.x + ballSize/2, 
      y: positionRef.current.y + ballSize/2 
    };
    
    // Calculate direction to player
    const direction = calculateDirection(
      { x: enemyPosition.x, y: enemyPosition.y },
      playerCenter
    );
    
    const newProjectile = {
      id: Date.now() + Math.random(),
      x: enemyPosition.x,
      y: enemyPosition.y,
      dx: direction.dx * enemyProjectileSpeed,
      dy: direction.dy * enemyProjectileSpeed,
      size: 10
    };
    
    setEnemyProjectiles(prev => [...prev, newProjectile]);
  }, []);

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

  // Create a normal zombie
  const createZombie = useCallback(() => {
    const currentArenaSize = arenaSizeRef.current;
    const zombieSize = enemyTypes.zombie.size;
    
    const { x, y } = generateRandomEdgePosition(currentArenaSize, zombieSize);
    
    const newZombie = {
      id: Date.now() + Math.random(),
      x,
      y,
      size: zombieSize,
      type: 'zombie'
    };
    
    setZombies(prev => [...prev, newZombie]);
  }, []);
  
  // Create a ranged minion
  const createRangedMinion = useCallback(() => {
    const currentArenaSize = arenaSizeRef.current;
    const minionSize = enemyTypes.rangedMinion.size;
    
    const { x, y } = generateRandomEdgePosition(currentArenaSize, minionSize);
    
    const newMinion = {
      id: Date.now() + Math.random(),
      x,
      y,
      size: minionSize,
      type: 'rangedMinion',
      lastShotTime: Date.now() - enemyTypes.rangedMinion.shootInterval // Make them shoot immediately
    };
    
    setRangedMinions(prev => [...prev, newMinion]);
  }, []);

  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setCoins(0);
    setRound(1);
    setRoundComplete(false);
    setRoundShopOpen(true);
    setZombies([]);
    setRangedMinions([]);
    setProjectiles([]);
    setEnemyProjectiles([]);
    
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

  // Handle proceeding to the next round
  const continueToNextRound = useCallback(() => {
    // Increment the round
    setRound(prevRound => prevRound + 1);
    setRoundComplete(false);
    roundCompleteRef.current = false; // Update ref immediately
    setRoundShopOpen(true); // Reset shop visibility for next round
    
    // Reset score to 0 for the new round
    setScore(0);
    
    setZombies([]);
    setRangedMinions([]);
    setProjectiles([]);
    setEnemyProjectiles([]);
    
    // Place player back in the center
    setPosition({ 
      x: arenaSize.width / 2 - ballSize / 2, 
      y: arenaSize.height / 2 - ballSize / 2 
    });
    
    // Ensure game state is 'playing' to trigger zombie spawning
    setGameState('playing');
    
    // Give the player a short grace period before enemies start spawning
    if (zombieSpawnIntervalRef.current) {
      clearInterval(zombieSpawnIntervalRef.current);
      zombieSpawnIntervalRef.current = null;
    }
    
    if (rangedMinionSpawnIntervalRef.current) {
      clearInterval(rangedMinionSpawnIntervalRef.current);
      rangedMinionSpawnIntervalRef.current = null;
    }
    
    // Start spawning zombies after a 2 second delay
    setTimeout(() => {
      if (!roundCompleteRef.current) {
        zombieSpawnIntervalRef.current = setInterval(() => {
          if (!roundCompleteRef.current) {
            createZombie();
          }
        }, 1500);
        
        // Start spawning ranged minions at a slower rate after round 1
        if (roundRef.current > 1) {
          rangedMinionSpawnIntervalRef.current = setInterval(() => {
            if (!roundCompleteRef.current) {
              createRangedMinion();
            }
          }, 3000);
        }
      }
    }, 2000);
  }, [arenaSize, createZombie, createRangedMinion]);

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
        } else if (key === 'v') {
          setDebugPanelVisible(prev => !prev);
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
    zombieSpawnIntervalRef.current = setInterval(() => {
      if (!roundCompleteRef.current) {
        createZombie();
      }
    }, 1500);
    
    // Start spawning ranged minions starting from round 2
    if (round > 1) {
      rangedMinionSpawnIntervalRef.current = setInterval(() => {
        if (!roundCompleteRef.current) {
          createRangedMinion();
        }
      }, 3000);
    }
    
    return () => {
      if (zombieSpawnIntervalRef.current) {
        clearInterval(zombieSpawnIntervalRef.current);
        zombieSpawnIntervalRef.current = null;
      }
      
      if (rangedMinionSpawnIntervalRef.current) {
        clearInterval(rangedMinionSpawnIntervalRef.current);
        rangedMinionSpawnIntervalRef.current = null;
      }
    };
  }, [createZombie, createRangedMinion, gameState, round]);

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
  
  // Calculate ranged minion speed based on score (scales up to 250% at 1000 points)
  const calculateRangedMinionSpeed = useCallback((currentScore) => {
    if (currentScore <= 0) return baseRangedMinionSpeed;
    
    // Calculate the speed multiplier (1.0 to 2.5) based on score
    // Score 0 = 1.0x speed, Score 1000 = 2.5x speed
    const maxMultiplier = 2.5;
    const scoreThreshold = 1000;
    const multiplier = Math.min(1.0 + (currentScore / scoreThreshold) * 1.5, maxMultiplier);
    
    return baseRangedMinionSpeed * multiplier;
  }, []);

  useEffect(() => {
    if (gameState !== 'playing') return;
    
    let animationFrameId;
    
    const updateProjectiles = (timestamp) => {
      // Exit immediately if round is complete
      if (roundCompleteRef.current) {
        animationFrameId = requestAnimationFrame(updateProjectiles);
        return;
      }
      
      if (timestamp - lastUpdateRef.current >= FRAME_RATE) {
        // Track zombies hit in this update cycle to prevent multiple hits on the same zombie
        const hitZombieIds = new Set();
        const hitMinionIds = new Set();
        const now = Date.now();
        
        // Update player projectiles
        setProjectiles(prev => {
          const currentArenaSize = arenaSizeRef.current;
          const currentZombies = zombiesRef.current;
          const currentMinions = rangedMinionsRef.current;
          
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
                setScore(prevScore => prevScore + enemyTypes.zombie.scoreValue);
                setCoins(prevCoins => prevCoins + enemyTypes.zombie.coinValue);
                
                return false;
              }
            }
            
            // Check for ranged minion collisions
            for (let i = 0; i < currentMinions.length; i++) {
              const minion = currentMinions[i];
              
              // Skip minions already hit in this frame
              if (hitMinionIds.has(minion.id)) continue;
              
              if (checkCollision(
                { ...newPosition, size: projectile.size || 15 },
                minion
              )) {
                // Mark this minion as hit
                hitMinionIds.add(minion.id);
                
                // Remove minion directly from the reference to avoid collision detection race conditions
                const updatedMinions = rangedMinionsRef.current.filter(m => m.id !== minion.id);
                rangedMinionsRef.current = updatedMinions;
                
                // Update minion state and add points
                setRangedMinions(prevMinions => prevMinions.filter(m => m.id !== minion.id));
                setScore(prevScore => prevScore + enemyTypes.rangedMinion.scoreValue);
                setCoins(prevCoins => prevCoins + enemyTypes.rangedMinion.coinValue);
                
                return false;
              }
            }
            
            // Update position if no collision
            projectile.x = newPosition.x;
            projectile.y = newPosition.y;
            return true;
          }).filter(p => {
            const age = now - p.id;
            return age < 5000; // Remove projectiles after 5 seconds
          });
        });
        
        // Update enemy projectiles
        setEnemyProjectiles(prev => {
          const currentArenaSize = arenaSizeRef.current;
          const playerCenter = { 
            x: positionRef.current.x + ballSize/2, 
            y: positionRef.current.y + ballSize/2 
          };
          
          return prev.filter(projectile => {
            // Calculate new position
            const newPosition = calculateNewPosition(projectile, projectile);
            
            // Remove projectile if it hits a wall
            if (!isWithinBounds(newPosition, currentArenaSize, projectile.size)) {
              return false;
            }
            
            // Check for player collision
            if (checkCollision(
              { ...newPosition, size: projectile.size },
              { ...playerCenter, size: ballSize }
            )) {
              // Game over if player is hit by enemy projectile and round is not complete
              if (!roundCompleteRef.current) {
                setGameState('gameover');
              }
              return false;
            }
            
            // Update position if no collision
            projectile.x = newPosition.x;
            projectile.y = newPosition.y;
            return true;
          }).filter(p => {
            const age = now - p.id;
            return age < 7000; // Remove enemy projectiles after 7 seconds
          });
        });
        
        // Update zombies movement without re-filtering
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
              // Game over if zombie touches player and round is not complete
              if (!roundCompleteRef.current) {
                setGameState('gameover');
              }
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
        
        // Update ranged minions
        setRangedMinions(prev => {
          const currentPos = positionRef.current;
          const currentScore = scoreRef.current;
          
          // Calculate current minion speed based on score
          const currentMinionSpeed = calculateRangedMinionSpeed(currentScore);
          
          // Check for player collision
          for (let i = 0; i < prev.length; i++) {
            const minion = prev[i];
            
            if (checkCollision(
              { x: currentPos.x + ballSize/2, y: currentPos.y + ballSize/2, size: ballSize },
              minion
            )) {
              // Game over if minion touches player and round is not complete
              if (!roundCompleteRef.current) {
                setGameState('gameover');
              }
              return prev;
            }
          }
          
          return prev.map(minion => {
            // Calculate direction to player
            const playerCenter = { 
              x: currentPos.x + ballSize/2, 
              y: currentPos.y + ballSize/2 
            };
            
            // Calculate distance to player
            const distanceToPlayer = calculateDistance(
              { x: minion.x, y: minion.y },
              playerCenter
            );
            
            // Check if minion should shoot
            const shootInterval = enemyTypes.rangedMinion.shootInterval;
            const shootRange = enemyTypes.rangedMinion.shootRange;
            const timeSinceLastShot = now - (minion.lastShotTime || 0);
            
            if (distanceToPlayer <= shootRange && timeSinceLastShot >= shootInterval && !roundCompleteRef.current) {
              createEnemyProjectile({ x: minion.x, y: minion.y });
              minion.lastShotTime = now;
            }
            
            // Ranged minions try to maintain distance from the player
            let direction;
            const idealDistance = shootRange * 0.8; // They'll try to stay at 80% of their shooting range
            
            if (distanceToPlayer < idealDistance - 50) {
              // Too close, move away
              direction = calculateDirection(playerCenter, minion);
            } else if (distanceToPlayer > idealDistance + 50) {
              // Too far, move closer
              direction = calculateDirection(minion, playerCenter);
            } else {
              // Ideal range, stop moving or move sideways
              return { ...minion, lastShotTime: minion.lastShotTime };
            }
            
            // Move minion with dynamic speed
            return {
              ...minion,
              x: minion.x + direction.dx * currentMinionSpeed,
              y: minion.y + direction.dy * currentMinionSpeed,
              lastShotTime: minion.lastShotTime // Preserve the last shot time
            };
          });
        });
        
        lastUpdateRef.current = timestamp;
      }
      animationFrameId = requestAnimationFrame(updateProjectiles);
    };

    animationFrameId = requestAnimationFrame(updateProjectiles);
    return () => cancelAnimationFrame(animationFrameId);
  }, [FRAME_RATE, gameState, calculateZombieSpeed, calculateRangedMinionSpeed, createEnemyProjectile]);

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
    // But cap the increase at round 5 to prevent excessive requirements
    const baseIncrease = 50;
    const maxRound = 5;
    const cappedRound = Math.min(roundNumber, maxRound);
    
    return 100 + (cappedRound - 1) * baseIncrease;
  }, []);
  
  // Get the round progress as a percentage
  const getRoundProgress = useCallback(() => {
    const targetScore = getRoundTargetScore(round);
    return Math.min((score / targetScore) * 100, 100);
  }, [score, round, getRoundTargetScore]);

  // Calculate the direction from source to target
  const calculateDirection = (source, target) => {
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const magnitude = Math.sqrt(dx * dx + dy * dy);
    
    if (magnitude === 0) return { dx: 0, dy: 0 };
    
    return {
      dx: dx / magnitude,
      dy: dy / magnitude
    };
  };

  // Calculate the distance between two points
  const calculateDistance = (point1, point2) => {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  };
  
  // Check if a position is within the bounds of the arena
  const isWithinBounds = (position, arenaSize, size) => {
    return (
      position.x >= 0 &&
      position.x + size <= arenaSize.width &&
      position.y >= 0 &&
      position.y + size <= arenaSize.height
    );
  };

  // Check if the round is complete based on score
  useEffect(() => {
    const targetScore = getRoundTargetScore(round);
    if (score >= targetScore && gameState === 'playing') {
      setRoundComplete(true);
      roundCompleteRef.current = true; // Update ref immediately
      
      // Immediately clear enemies and projectiles when round completes
      setZombies([]);
      setProjectiles([]);
      setRangedMinions([]); // Clear ranged minions too
      setEnemyProjectiles([]); // Clear enemy projectiles
      
      // Clear any active zombie spawning
      if (zombieSpawnIntervalRef.current) {
        clearInterval(zombieSpawnIntervalRef.current);
        zombieSpawnIntervalRef.current = null;
      }
      
      // Clear ranged minion spawning
      if (rangedMinionSpawnIntervalRef.current) {
        clearInterval(rangedMinionSpawnIntervalRef.current);
        rangedMinionSpawnIntervalRef.current = null;
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
            {rangedMinions.map(minion => (
              <RangedMinion
                key={minion.id}
                $x={minion.x}
                $y={minion.y}
                data-testid="ranged-minion"
              />
            ))}
            {enemyProjectiles.map(projectile => (
              <EnemyProjectile
                key={projectile.id}
                $x={projectile.x}
                $y={projectile.y}
                data-testid="enemy-projectile"
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
            
            {/* Debug Panel */}
            {debugPanelVisible && (
              <DebugPanel>
                <DebugButton onClick={continueToNextRound}>
                  Next Round
                </DebugButton>
                <DebugButton onClick={() => setCoins(prev => prev + 100)}>
                  +100 Coins
                </DebugButton>
                <DebugButton onClick={() => setScore(prev => prev + 100)}>
                  +100 Score
                </DebugButton>
              </DebugPanel>
            )}
            
            {roundComplete && (
              <RoundCompleteOverlay>
                <RoundCompleteMessage>Round {round} Complete!</RoundCompleteMessage>
                <RoundCompleteDetails>
                  Score: {score} / {getRoundTargetScore(round)}
                </RoundCompleteDetails>
                <RoundContinueButton onClick={continueToNextRound}>
                  Continue to Round {round + 1}
                </RoundContinueButton>
                
                {roundShopOpen && (
                  <>
                    <RoundCompleteDetails style={{ marginTop: '20px' }}>
                      Shop for Upgrades
                    </RoundCompleteDetails>
                    
                    <Shop 
                      coins={coins}
                      onPurchase={handlePurchase}
                      onClose={() => setRoundShopOpen(false)}
                      shopItems={shopItems}
                    />
                  </>
                )}
                
                {!roundShopOpen && (
                  <RoundContinueButton onClick={() => setRoundShopOpen(true)}>
                    Open Shop
                  </RoundContinueButton>
                )}
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