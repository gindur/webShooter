import React, { useState } from 'react';
import BallGame from './components/BallGame';
import EcsGame from './components/EcsGame';
import styled from 'styled-components';

const SelectorContainer = styled.div`
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 10px;
  border-radius: 5px;
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  background-color: ${props => props.$active === 'true' ? '#4caf50' : '#2c3e50'};
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: ${props => props.$active === 'true' ? '#45a049' : '#34495e'};
  }
`;

function App() {
  const [gameType, setGameType] = useState('original');
  
  return (
    <div className="App">
      <SelectorContainer>
        <Button 
          $active={(gameType === 'original').toString()} 
          onClick={() => setGameType('original')}
        >
          Original Game
        </Button>
        <Button 
          $active={(gameType === 'ecs').toString()} 
          onClick={() => setGameType('ecs')}
        >
          ECS Game
        </Button>
      </SelectorContainer>
      
      {gameType === 'original' ? <BallGame /> : <EcsGame />}
    </div>
  );
}

export default App; 