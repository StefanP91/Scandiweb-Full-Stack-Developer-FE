import { Link, useLocation } from "react-router";
import { useState, useEffect, useRef } from "react";
import { useCart } from "../contexts/CartContext";
import CartOverlay from "./CartOverlay";
import '../index.css';

// GraphQL query to get all categories
const GET_CATEGORIES_QUERY = `
    query {
        categories {
            name
        }
    }
`;

const Header = () => {
  const [activeLink, setActiveLink] = useState(null);
  const [transitioningLink, setTransitioningLink] = useState(null);
  const location = useLocation();
  const { cartItems, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, setCartItems } = useCart();
  const mobileCartRef = useRef(null);
  const desktopCartRef = useRef(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [categories, setCategories] = useState([]);

  // FETCH CATEGORIES
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/backend/public/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: GET_CATEGORIES_QUERY })
        });
        
        const result = await response.json();
        setCategories(result.data.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // SET ACTIVE LINK
  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath === '/') {
      setActiveLink('/all');
    } else if (currentPath.startsWith('/category/')) {
      setActiveLink(currentPath);
    } else {
      setActiveLink(currentPath);
    }
  }, [location.pathname]);

  // CLOSE CART ON OUTSIDE CLICK
  useEffect(() => {
    if (!isCartOpen) return;
    const handleClickOutside = (event) => {
      if (
        (!mobileCartRef.current || !mobileCartRef.current.contains(event.target)) &&
        (!desktopCartRef.current || !desktopCartRef.current.contains(event.target))
      ) {
        setIsCartOpen(false);
        document.querySelector('main').classList.remove('overlay-active');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCartOpen, setIsCartOpen]);

  // AUTO CLOSE CART AFTER ORDER SUCCESS
  useEffect(() => {
    if (orderSuccess) {
      const timer = setTimeout(() => {
        setOrderSuccess(false);
        setIsCartOpen(false);
        document.querySelector('main').classList.remove('overlay-active');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [orderSuccess]);

  // HANDLE LINK CLICK
  const handleLinkClick = (link) => {
    if (activeLink !== link) {
      setTransitioningLink(activeLink);
      setActiveLink(link);
      setTimeout(() => setTransitioningLink(null), 300);
    }
    const mobileMenuToggle = document.querySelector('.navbar-toggler');
    if (mobileMenuToggle?.getAttribute('aria-expanded') === 'true') {
      mobileMenuToggle.click();
    }
  };

  // TOGGLE CART
  const toggleCart = () => {
    const newState = !isCartOpen;
    setIsCartOpen(newState);
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.classList.toggle('overlay-active', newState);
    }
  };

  // DISABLE BODY SCROLL WHEN CART IS OPEN
  useEffect(() => {
    document.body.style.overflow = isCartOpen ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isCartOpen]);

  // CALCULATE TOTAL PRICE
  const totalPrice = cartItems.reduce((sum, item) => {
    const itemPrice = item.prices[0].amount;
    const quantity = item.quantity || 1;
    return sum + (itemPrice * quantity);
  }, 0).toFixed(2);

  const currencySymbol = cartItems.length > 0 ? cartItems[0].prices[0].currency.symbol : '$';

  // PLACE ORDER FUNCTION
  const handlePlaceOrder = async () => {
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
    } catch (error) {
      console.error('Order error:', error);
      setOrderError(error.message || 'Failed to place order. Please try again.');
      setTimeout(() => setOrderError(null), 3000);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // CHECK IF MOBILE
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <header className="header">
        {orderSuccess && (
          <div className="order-success-message">
            Order placed successfully!
          </div>
        )}
      <nav className="navbar navbar-expand-lg">
        <div className="container d-flex justify-content-between flex-row-reverse flex-lg-row">
          <div className="collapse navbar-collapse flex-grow-0" id="navMenu">
            <ul className="navbar-nav">
                <li className="nav-item">
                    <Link
                        className={`header-link ${activeLink === '/all' ? 'active' : ''} ${transitioningLink === '/all' ? 'transitioning' : ''}`}
                        to="/"
                        data-testid={activeLink === '/all' ? 'active-category-link' : 'category-link'}
                        onClick={() => handleLinkClick('/all')}
                    >
                    ALL
                    </Link>
                </li>
                
                {categories.map(category => {
                  const categoryPath = `/category/${category.name.toLowerCase()}`;
                  const isActive = activeLink === categoryPath;
                  const isTransitioning = transitioningLink === categoryPath;
                  
                  return (
                    <li className="nav-item" key={category.name}>
                        <Link
                            className={`header-link ${isActive ? 'active' : ''} ${isTransitioning ? 'transitioning' : ''}`}
                            to={categoryPath}
                            data-testid={isActive ? 'active-category-link' : 'category-link'}
                            onClick={() => handleLinkClick(categoryPath)}
                        >
                        {category.name.toUpperCase()}
                        </Link>
                    </li>
                  );
                })}
            </ul>
          </div>

          <Link className="navbar-brand" to="/">
            <img src="/images/brand.png" alt="brand-logo" />
          </Link>

          <div className="cart"> 
                <CartOverlay
                isMobile={isMobile}
                cartItems={cartItems}
                isCartOpen={isCartOpen}
                mobileCartRef={mobileCartRef}
                desktopCartRef={desktopCartRef}
                toggleCart={toggleCart}
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
                handlePlaceOrder={handlePlaceOrder}
                isPlacingOrder={isPlacingOrder}
                orderError={orderError}
                orderSuccess={orderSuccess}
                totalPrice={totalPrice}
                currencySymbol={currencySymbol}
            />
          </div>

          <button type="button" className="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#navMenu">
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
