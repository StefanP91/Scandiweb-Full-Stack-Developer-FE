import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useCart } from '../contexts/CartContext';
import { useOverlay } from '../contexts/OverlayContext';

import Loading from '../components/Loading';
import ErrorPage from './ErrorPage';

const getProductsByCategoryQuery = (category) => `
    query {
        products(category: "${category}") {
            id
            name
            brand
            inStock
            gallery
            description
            category
            attributes {
                id
                name
                type
                items {
                    id
                    value
                    displayValue
                }
            }
            prices {
                amount
                currency {
                    label
                    symbol
                }
            }
        }
    }
`;

const Category = () => {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { addToCart, toggleCart } = useCart();
    const { setIsOverlayActive, setIsBodyScrollDisabled } = useOverlay();

    const { category } = useParams();
    const categoryName = category;

    // FETCH PRODUCTS BY CATEGORY
    useEffect(() => {
        const fetchProductsByCategory = async () => {
            if (!categoryName) return;
            
            setLoading(true);
            try {
                const response = await fetch('/backend/public/graphql', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: getProductsByCategoryQuery(categoryName) })
                });
                
                const result = await response.json();
                
                if (result.errors) {
                    throw new Error(result.errors[0].message);
                }
                
                setProducts(result.data.products || []);
            } catch (error) {
                console.error('Error fetching products:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProductsByCategory();
    }, [categoryName]);

    // HANDLE ADD TO CART
    const handleAddToCart = (event, product) => {
        event.stopPropagation();

        const defaultSelectedAttributes = {};

        if (product.attributes && product.attributes.length > 0) {
            product.attributes.forEach(attr => {
                if (attr.items && attr.items.length > 0) {
                    defaultSelectedAttributes[attr.id] = attr.items[0].id;
                }
            });
        }
        
        const productToAdd = {
            ...product,
            selectedAttributes: defaultSelectedAttributes
        };
        
        addToCart(productToAdd);
        toggleCart(); 

        setIsOverlayActive(true);
        setIsBodyScrollDisabled(true);
    };

    // LOADING
    if (loading) {
        return <Loading />;
    }

    // ERROR
    if (error) {
        return <ErrorPage />;
    }

    return (
        <div className="container">
            <h1 className="page-title">{categoryName?.toUpperCase()}</h1>
            
            <div className="row g-4">
                {products.map(product => (
                    <div className="col-12 col-md-4" key={product.id}>
                        <div 
                            className="card"
                            onClick={() => navigate(`/product/${product.id}`)} 
                            data-testid={`product-${product.name ? product.name.toLowerCase().split(' ').join('-') : product.id}`}
                        >
                            {/* IMAGE, QUICK SHOP ICON AND OUT OF STOCK TEXT */}
                            <div className="img-container">
                                <img
                                    src={product.gallery && product.gallery.length > 0 ? product.gallery[0] : ''}
                                    alt={product.name}
                                    className="product-image"
                                />
                                {product.inStock === false ? (
                                    <img src="../images/quick-shop-icon.png" alt="quick-shop-icon" className="quick-shop-icon d-none" />
                                ) : (
                                    <img src="../images/quick-shop-icon.png" alt="quick-shop-icon" className="quick-shop-icon" onClick={(event) => handleAddToCart(event, product)} />
                                )}
                                {product.inStock === false ? (
                                    <p className="card-stock">OUT OF STOCK</p>
                                ) : (
                                    <p className="d-none">OUT OF STOCK</p>
                                )}
                            </div>

                            {/* PRODUCT NAME AND PRICE */}    
                            <div className="card-body">
                                <h5 className="card-title">{product.name}</h5>
                                {product.prices && product.prices.length > 0 && (
                                    <p className={product.inStock === false ? "card-price-stock-0" : "card-price"}>
                                        {product.prices[0].currency.symbol}{product.prices[0].amount}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Category;