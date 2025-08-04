import { Link, useLocation } from "react-router";
import { useState, useEffect, useRef } from "react";

import CartOverlay from "../../cart/CartOverlay/CartOverlay";
import { useCartOverlay } from "../../../features/cart/hooks/useCartOverlay";
import { categoryService } from "../../../features/categories/services/categoryService";

import styles from "./Header.module.css";

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
        const data = await categoryService.getAllCategories();
        setCategories(data);
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
          <div className={styles.orderSuccessMessage}>
            Order placed successfully!
          </div>
        )}
      <nav className="navbar navbar-expand-lg">
        <div className={`container d-flex ${styles.flexContainer}`}>
          <div className={`collapse navbar-collapse flex-grow-0 ${styles.navbarCollapse}`} id="navMenu">
            <ul className="navbar-nav">
                <li className="nav-item">
                    <Link
                        className={`${styles.headerLink} ${activeLink === '/all' ? styles.active : ''} ${transitioningLink === '/all' ? styles.transitioning : ''}`}
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
                            className={`${styles.headerLink} ${isActive ? styles.active : ''} ${isTransitioning ? styles.transitioning : ''}`}
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

          <Link className={`navbar-brand ${styles.navbarBrand}`} to="/">
            <img src="/images/brand.png" alt="brand-logo" />
          </Link>

          <CartOverlay isMobile={isMobile} className={styles.cart} />

          <button ref={mobileMenuRef} type="button" className={`navbar-toggler ${styles.navbarButton}`} data-bs-toggle="collapse" data-bs-target="#navMenu">
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
