import { useCart } from '../contexts/CartContext';
import { useOverlay } from '../contexts/OverlayContext';
import { useCallback } from 'react';

export const useCartOverlay = () => {

  const {
    cartItems,
    totalItems,
    totalPrice,
    currencySymbol,
    addToCart,
    updateQuantity,
    removeFromCart,
    setCartItems,
    isCartOpen,
    setIsCartOpen,
    isPlacingOrder,
    orderError,
    orderSuccess,
    handlePlaceOrder
  } = useCart();

  const { setIsOverlayActive, setIsBodyScrollDisabled } = useOverlay();

  const toggleCart = useCallback(() => {
    const newState = !isCartOpen;
    setIsCartOpen(newState);
    setIsOverlayActive(newState);
    setIsBodyScrollDisabled(newState);
  }, [isCartOpen, setIsCartOpen, setIsOverlayActive, setIsBodyScrollDisabled]);

  const closeCart = useCallback(() => {
    setIsCartOpen(false);
    setIsOverlayActive(false);
    setIsBodyScrollDisabled(false);
  }, [setIsCartOpen, setIsOverlayActive, setIsBodyScrollDisabled]);

  const addToCartWithOverlay = useCallback((product, quantity = 1) => {
    addToCart(product, quantity);
    setIsCartOpen(true);
    setIsOverlayActive(true);
    setIsBodyScrollDisabled(true);
  }, [addToCart, setIsCartOpen, setIsOverlayActive, setIsBodyScrollDisabled]);

  const openCart = useCallback(() => {
    setIsCartOpen(true);
    setIsOverlayActive(true);
    setIsBodyScrollDisabled(true);
  }, [setIsCartOpen, setIsOverlayActive, setIsBodyScrollDisabled]);

  return {
    // Cart Data
    cartItems,
    totalItems,
    totalPrice,
    currencySymbol,
    
    // Cart State
    isCartOpen,
    
    // Basic Cart Actions
    addToCart,
    updateQuantity,
    removeFromCart,
    setCartItems,
    
    // Cart Actions with Overlay
    addToCartWithOverlay,
    toggleCart,
    closeCart,
    openCart,
    
    // Order State & Actions
    isPlacingOrder,
    orderError,
    orderSuccess,
    handlePlaceOrder,
    
    // Direct State Setters 
    setIsCartOpen,
    setIsOverlayActive,
    setIsBodyScrollDisabled
  };
};