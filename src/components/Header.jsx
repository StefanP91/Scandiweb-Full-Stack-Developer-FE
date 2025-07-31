import { Link, useLocation } from "react-router";
import { useState, useEffect, useRef } from "react";
import CartOverlay from "./CartOverlay";
import { useCartOverlay } from "../hooks/useCartOverlay";

import '../index.css';

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
  const [categories, setCategories] = useState([]);
  const { orderSuccess, closeCart, setOrderSuccess } = useCartOverlay();
  const location = useLocation();
  const mobileMenuRef = useRef(null);

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

  // AUTO CLOSE CART AFTER ORDER SUCCESS
  useEffect(() => {
    if (orderSuccess) {
      const timer = setTimeout(() => {
        if (setOrderSuccess) {
          setOrderSuccess(false);
        }
        closeCart();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [orderSuccess, closeCart, setOrderSuccess]);

  // HANDLE LINK CLICK
  const handleLinkClick = (link) => {
    if (activeLink !== link) {
      setTransitioningLink(activeLink);
      setActiveLink(link);
      setTimeout(() => setTransitioningLink(null), 300);
    }
    if (mobileMenuRef.current?.getAttribute('aria-expanded') === 'true') {
      mobileMenuRef.current.click();
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
                <CartOverlay isMobile={isMobile} />
          </div>

          <button ref={mobileMenuRef} type="button" className="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#navMenu">
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
