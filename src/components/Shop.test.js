import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Shop from './Shop';

describe('Shop Component', () => {
  const mockShopItems = [
    {
      id: 'item1',
      name: 'Test Item 1',
      description: 'This is test item 1',
      price: 30,
      icon: '🔰',
      iconColor: '#ff0000',
      apply: jest.fn()
    },
    {
      id: 'item2',
      name: 'Test Item 2',
      description: 'This is test item 2',
      price: 100,
      icon: '⚔️',
      iconColor: '#00ff00',
      apply: jest.fn()
    }
  ];

  const mockOnPurchase = jest.fn();
  const mockOnClose = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders shop with correct title and coins', () => {
    render(
      <Shop 
        coins={50}
        onPurchase={mockOnPurchase}
        onClose={mockOnClose}
        shopItems={mockShopItems}
      />
    );
    
    expect(screen.getByText('Upgrade Shop')).toBeInTheDocument();
    expect(screen.getByText('50 coins')).toBeInTheDocument();
  });

  test('renders all shop items', () => {
    render(
      <Shop 
        coins={50}
        onPurchase={mockOnPurchase}
        onClose={mockOnClose}
        shopItems={mockShopItems}
      />
    );
    
    expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    expect(screen.getByText('This is test item 1')).toBeInTheDocument();
    expect(screen.getByText('Test Item 2')).toBeInTheDocument();
    expect(screen.getByText('This is test item 2')).toBeInTheDocument();
  });

  test('allows purchasing affordable items', () => {
    render(
      <Shop 
        coins={50}
        onPurchase={mockOnPurchase}
        onClose={mockOnClose}
        shopItems={mockShopItems}
      />
    );
    
    // First item should be affordable (price 30, coins 50)
    const affordableItem = screen.getByText('Test Item 1').closest('div');
    fireEvent.click(affordableItem);
    
    expect(mockOnPurchase).toHaveBeenCalledWith('item1');
  });

  test('does not allow purchasing unaffordable items', () => {
    render(
      <Shop 
        coins={50}
        onPurchase={mockOnPurchase}
        onClose={mockOnClose}
        shopItems={mockShopItems}
      />
    );
    
    // Second item should not be affordable (price 100, coins 50)
    const unaffordableItem = screen.getByText('Test Item 2').closest('div');
    fireEvent.click(unaffordableItem);
    
    expect(mockOnPurchase).not.toHaveBeenCalled();
  });

  test('closes shop when close button is clicked', () => {
    render(
      <Shop 
        coins={50}
        onPurchase={mockOnPurchase}
        onClose={mockOnClose}
        shopItems={mockShopItems}
      />
    );
    
    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });
}); 