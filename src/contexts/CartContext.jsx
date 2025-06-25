import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
        try {
            const savedCart = localStorage.getItem('cartItems');
            return savedCart ? JSON.parse(savedCart) : [];
        } 
        
        catch (error) {
            console.error('Error loading cart from localStorage:', error);
            return [];
        }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {

      const uniqueCartId = generateProductAttributeId(product);
      
      const existingItemIndex = prevItems.findIndex(item => 
        generateProductAttributeId(item) === uniqueCartId
      );
      
      if (existingItemIndex > -1) {
          const updatedItems = [...prevItems];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: (updatedItems[existingItemIndex].quantity || 1) + quantity
          };

        return updatedItems;

      } 
      
      else {
        return [...prevItems, { 
          ...product, 
          quantity,
          cartItemId: uniqueCartId 
        }];
      }
    });
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      return;
    } 
    
    setCartItems(prevItems => prevItems.map(item => {

      const itemIdentifier = item.cartItemId || item.id;

      return itemIdentifier === itemId 
      
      ? { ...item, quantity: newQuantity } 
      : item;
    }));
  };

  const generateProductAttributeId = (product) => {
    if (!product.selectedAttributes || Object.keys(product.selectedAttributes).length === 0) {
      return product.id;
    }

    const attributeString = Object.entries(product.selectedAttributes)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([attrId, valueId]) => `${attrId}:${valueId}`)
      .join('|');

    return `${product.id}_${attributeString}`;
  };

  const removeFromCart = (cartItemId) => {
    setCartItems(prevItems => prevItems.filter(item => 
      (item.cartItemId || item.id) !== cartItemId
    ));
  };
  
  const toggleCart = () => {
      setIsCartOpen(prev => !prev); 
  };

  useEffect(() => {
        try {
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
        } 
        
        catch (error) {
            console.error('Error saving cart to localStorage:', error);
        }
  }, [cartItems]); 
  
  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart,
      updateQuantity, 
      removeFromCart,
      isCartOpen, 
      toggleCart,
      setIsCartOpen,
      setCartItems 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);