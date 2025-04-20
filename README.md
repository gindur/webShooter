# Web Shooter Game

A web-based top-down shooting game with smooth animations built with React.

## Features

- Interactive ball controlled by WASD keys
- Shoot projectiles by clicking
- Auto-shooting toggle
- Round-based gameplay progression
- Zombies that follow the player
- Dynamic difficulty scaling
- Game state management (pregame, playing, game over)
- Score tracking
- In-game currency and shop system
- Character upgrades
- Collision detection
- Smooth animations

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

## Game Controls

- **W, A, S, D**: Move the ball
- **Click**: Shoot a projectile
- **Click and hold**: Toggle auto-shooting
- **P**: Open/close the shop
- **Space**: Continue to next round when a round is complete

## Round System

The game is now round-based with increasing difficulty:

- **Round 1**: Target score of 100 points (10 zombie kills)
- **Round 2**: Target score of 150 points (15 zombie kills)
- **Round 3**: Target score of 200 points (20 zombie kills)
- Each subsequent round increases the target by 50 points

A progress bar shows how close you are to completing the current round. Once you reach the target score, a round completion screen appears, and you can press Space to continue to the next round.

## Shop System

Kill zombies to earn coins, then spend them on upgrades in the shop:

- **Speed Boost (50 coins)**: Move 30% faster
- **Rapid Fire (50 coins)**: Shoot 40% faster
- **Bullet Velocity (50 coins)**: Projectiles move 25% faster

Open the shop by pressing **P** during gameplay.

## Difficulty Scaling

The game features a dynamic difficulty system:

- Zombies start at base speed (100%)
- Speed increases gradually as your score increases
- Every 100 points increases zombie speed
- At 1000 points, zombies reach maximum speed (300% of base)
- Speed remains at maximum from 1000 to 10,000 points
- The current difficulty level is displayed during gameplay

## Testing

This project has a comprehensive testing suite to ensure core functionality remains intact as development progresses.

### Testing Structure

- **Component Tests**: Tests for React components and their behavior
- **Utility Tests**: Tests for standalone game logic functions

### Running Tests

To run all tests:
```
npm test
```

To run tests without watch mode:
```
npm test -- --watchAll=false
```

Or use the provided test script:
```
./scripts/runTests.sh
```

### Test Coverage

- Game state transitions
- Player movement
- Projectile creation and movement
- Round system
- Shop functionality
- Difficulty scaling
- Collision detection
- Math utilities
- Random position generation

## Project Structure

- `src/components/`: React components
- `src/utils/`: Utility functions and game logic
- `src/tests/`: Test files

## Development Guidelines

1. Always run tests before making significant changes
2. Add tests for new features
3. Keep game logic separated from rendering logic when possible
4. Use utility functions for reusable calculations 