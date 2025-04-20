import React from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const ShopContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  background-color: rgba(0, 0, 0, 0.85);
  border: 2px solid #ff6b6b;
  border-radius: 10px;
  padding: 20px;
  color: white;
  z-index: 100;
  animation: ${fadeIn} 0.3s ease-in-out;
  box-shadow: 0 0 20px rgba(255, 107, 107, 0.6);
`;

const ShopHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 2px solid #ff6b6b;
  padding-bottom: 10px;
`;

const ShopTitle = styled.h2`
  font-size: 24px;
  margin: 0;
  color: #ff6b6b;
  text-shadow: 0 0 10px rgba(255, 107, 107, 0.6);
`;

const CoinDisplay = styled.div`
  font-size: 18px;
  display: flex;
  align-items: center;
`;

const CoinIcon = styled.div`
  width: 20px;
  height: 20px;
  background: linear-gradient(145deg, #ffd700, #ffaa00);
  border-radius: 50%;
  margin-right: 8px;
  box-shadow: 0 0 5px #ffd700;
`;

const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
`;

const ShopItem = styled.div`
  background-color: rgba(40, 40, 40, 0.8);
  border: 1px solid ${props => props.$affordable ? '#5cb85c' : '#d9534f'};
  border-radius: 8px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.2s, box-shadow 0.2s;
  
  ${props => props.$affordable && `
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(92, 184, 92, 0.3);
      cursor: pointer;
    }
  `}
`;

const ItemIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 8px;
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  background: ${props => props.$color || '#333'};
`;

const ItemName = styled.h3`
  margin: 5px 0;
  font-size: 18px;
  color: #fff;
`;

const ItemDescription = styled.p`
  margin: 0 0 10px;
  font-size: 14px;
  color: #aaa;
  text-align: center;
`;

const ItemPrice = styled.div`
  display: flex;
  align-items: center;
  font-size: 16px;
  color: ${props => props.$affordable ? '#5cb85c' : '#d9534f'};
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  
  &:hover {
    color: #ff6b6b;
  }
`;

const Shop = ({ coins, onPurchase, onClose, shopItems }) => {
  return (
    <ShopContainer>
      <CloseButton onClick={onClose}>×</CloseButton>
      <ShopHeader>
        <ShopTitle>Upgrade Shop</ShopTitle>
        <CoinDisplay>
          <CoinIcon /> {coins} coins
        </CoinDisplay>
      </ShopHeader>
      
      <ItemsGrid>
        {shopItems.map(item => {
          const affordable = coins >= item.price;
          
          return (
            <ShopItem 
              key={item.id} 
              $affordable={affordable}
              onClick={() => affordable && onPurchase(item.id)}
            >
              <ItemIcon $color={item.iconColor}>{item.icon}</ItemIcon>
              <ItemName>{item.name}</ItemName>
              <ItemDescription>{item.description}</ItemDescription>
              <ItemPrice $affordable={affordable}>
                <CoinIcon /> {item.price}
              </ItemPrice>
            </ShopItem>
          );
        })}
      </ItemsGrid>
    </ShopContainer>
  );
};

export default Shop; 