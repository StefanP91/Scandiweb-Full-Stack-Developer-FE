import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useOverlay } from './OverlayContext'; 

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
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const { setIsOverlayActive, setIsBodyScrollDisabled } = useOverlay();
  
  const generateProductAttributeId = useCallback((product) => {
  if (!product.selectedAttributes || Object.keys(product.selectedAttributes).length === 0) {
    return product.id;
  }

  const attributeString = Object.entries(product.selectedAttributes)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([attrId, valueId]) => `${attrId}:${valueId}`)
    .join('|');

  return `${product.id}_${attributeString}`;
}, []);

  const addToCart = useCallback((product, quantity = 1) => {
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
    } else {
      return [...prevItems, { 
        ...product, 
        quantity,
        cartItemId: uniqueCartId 
      }];
    }
  });
}, [generateProductAttributeId]);

  const addToCartWithOverlay = useCallback((product, quantity = 1) => {
    addToCart(product, quantity);
    setIsCartOpen(true);
    setIsOverlayActive(true);
    setIsBodyScrollDisabled(true);
  }, [addToCart, setIsOverlayActive, setIsBodyScrollDisabled]);

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

  const removeFromCart = (cartItemId) => {
    setCartItems(prevItems => prevItems.filter(item => 
      (item.cartItemId || item.id) !== cartItemId
    ));
  };

  const toggleCart = useCallback(() => {
    const newState = !isCartOpen;
    setIsCartOpen(newState);
    setIsOverlayActive(newState);
    setIsBodyScrollDisabled(newState);
  }, [isCartOpen, setIsOverlayActive, setIsBodyScrollDisabled]);

  const closeCart = useCallback(() => {
    setIsCartOpen(false);
    setIsOverlayActive(false);
    setIsBodyScrollDisabled(false);
  }, [setIsOverlayActive, setIsBodyScrollDisabled]);

  const handlePlaceOrder = useCallback(async () => {
    if (cartItems.length === 0) return;
    setIsPlacingOrder(true);
    setOrderError(null);
    setOrderSuccess(false);

    try {
      const orderItems = cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity || 1,
        price: item.prices?.[0]?.amount || 0,
        selectedAttributes: item.selectedAttributes ?
          Object.entries(item.selectedAttributes).map(([name, value]) => ({ name, value })) : []
      }));

      const query = `
        mutation CreateOrder($input: OrderInput!) {
          createOrder(input: $input) {
            id
            orderNumber
            createdAt
            total
          }
        }
      `;

      const variables = {
        input: {
          items: orderItems,
          currency: cartItems[0]?.prices[0]?.currency?.symbol || 'USD'
        }
      };

      const response = await fetch('/backend/public/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      if (result.errors) throw new Error(result.errors.map(e => e.message).join(', '));

      setCartItems([]);
      setOrderSuccess(true);
      
      // Auto close cart after 3 seconds
      setTimeout(() => {
        setOrderSuccess(false);
        closeCart();
      }, 3000);

    } catch (error) {
      console.error('Order error:', error);
      setOrderError(error.message || 'Failed to place order. Please try again.');
      setTimeout(() => setOrderError(null), 3000);
    } finally {
      setIsPlacingOrder(false);
    }
  }, [cartItems, closeCart]);

  const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  
  const totalPrice = cartItems.reduce((sum, item) => {
    const itemPrice = item.prices?.[0]?.amount || 0;
    const quantity = item.quantity || 1;
    return sum + (itemPrice * quantity);
  }, 0).toFixed(2);

  const currencySymbol = cartItems.length > 0 ? cartItems[0].prices?.[0]?.currency?.symbol : '$';

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

      // Cart Data
      cartItems, 
      totalItems,
      totalPrice,
      currencySymbol,
      
      // Cart Actions
      addToCart,
      addToCartWithOverlay,
      updateQuantity, 
      removeFromCart,
      setCartItems,
      
      // Cart Overlay State
      isCartOpen, 
      setIsCartOpen,
      toggleCart,
      closeCart,
      
      // Order State & Actions
      isPlacingOrder,
      orderError,
      orderSuccess,
      handlePlaceOrder,
      
      // Overlay Actions
      setIsOverlayActive,
      setIsBodyScrollDisabled
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);