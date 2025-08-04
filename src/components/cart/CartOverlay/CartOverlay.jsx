import { useRef, useEffect } from "react";
import { useCartOverlay } from "../../../features/cart/hooks/useCartOverlay";
import CartItem from "../CartItem/CartItem";
import styles from "./CartOverlay.module.css";

const CartOverlay = () => {
  const cartOverlayRef = useRef(null);
  const containerRef = useRef(null);

  const{
    isCartOpen,
    cartItems,
    totalItems,
    totalPrice,
    currencySymbol,
    toggleCart,
    closeCart,
    updateQuantity,
    removeFromCart,
    handlePlaceOrder,
    isPlacingOrder,
    orderError,
    
  } = useCartOverlay();

  // CLOSE CART ON CLICK OUTSIDE
  useEffect(() => {
    if (!isCartOpen) return;

    const handleClickOutside = (event) => {
      const isInsideCartContainer = containerRef.current && containerRef.current.contains(event.target);
      const isInsideCartOverlay = cartOverlayRef.current && cartOverlayRef.current.contains(event.target);
      
      if (!isInsideCartContainer && !isInsideCartOverlay) {
        closeCart();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    
  }, [isCartOpen, closeCart]);

  // HANDLE ESC KEY TO CLOSE CART
  useEffect(() => {
    const handleEscapeKey = (event) =>{
      if (event.key === "Escape"){
        closeCart();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [isCartOpen, closeCart]);

  return (
    <div className={styles.cartContainer} ref={containerRef} data-testid='cart-item-attribute-${cart-container}'>
      {/* CART ICON */}
      <button 
        className={styles.cartIcon} 
        onClick={toggleCart} 
        data-testid="cart-btn"
      >
        <img src="/images/cart-icon.png" alt="cart-icon" />
        {totalItems > 0 && (
            <span className={styles.cartBadge}>
                {totalItems}
            </span>
        )}      
      </button>

      {isCartOpen && (
        <div className={styles.cartOverlay} ref={cartOverlayRef} data-testid='cart-overlay'>
          <p className={styles.title}>
            <span>My Bag,</span> {totalItems} {totalItems === 1 ? "item" : "items"}
          </p>

          {cartItems.length > 0 ? (
            <>
              {cartItems.map((item) => (
                <CartItem
                    key={`${item.id}-${JSON.stringify(item.selectedAttributes)}`}
                    item={item}
                    updateQuantity={updateQuantity}
                    removeFromCart={removeFromCart}
                />
              ))}

                {/* CART TOTAL */}
              <div className={styles.cartTotal} data-testid='cart-total'>
                <p className={styles.totalName}>Total:</p>
                <p className={styles.totalAmount} data-testid='cart-total'>{currencySymbol}{totalPrice}</p>
              </div>

                {/* PLACE ORDER BUTTON */}
              <button
                className={styles.placeOrderBtn}
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || cartItems.length === 0}
              >
                {isPlacingOrder ? "PLACING ORDER..." : "PLACE ORDER"}
              </button>

               {/* ERROR ORDER MESSAGE */}
              {orderError && <div className={styles.orderErrorMessage}>{orderError}</div>}
            </>
          ) : (
            <div>
              <p>Your cart is empty</p>

              <div className={styles.cartTotal}>
                <p className={styles.totalName}>Total:</p>
                <p className={styles.totalAmount}>
                  {currencySymbol}
                  {totalPrice}
                </p>
              </div>

              <button disabled={true} className={styles.placeOrderBtnEmptyCart}>
                PLACE ORDER
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CartOverlay;
