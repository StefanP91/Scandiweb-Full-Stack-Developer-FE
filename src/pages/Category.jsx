import { useParams, useNavigate } from 'react-router';
import { useProductsByCategory } from '../features/products/hooks/useProducts';
import { useCartOverlay } from '../features/cart/hooks/useCartOverlay';
import { generateDefaultAttributes, isProductInStock } from '../features/products/utils/productHelpers';

import Loading from '../components/common/Loading/Loading';
import ErrorPage from '../components/common/Error/ErrorPage';

import style from '../shared/styles/products.module.css';
import layoutStyles from '../shared/styles/layout.module.css';

const Category = () => {
    const { category } = useParams();
    const navigate = useNavigate();
    const { products, loading, error } = useProductsByCategory(category);
    const { addToCartWithOverlay } = useCartOverlay();

    const handleAddToCart = (event, product) => {
        event.stopPropagation();
        
        const productToAdd = {
            ...product,
            selectedAttributes: generateDefaultAttributes(product.attributes)
        };
        
        addToCartWithOverlay(productToAdd);
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
            <h1 className={layoutStyles.pageTitle}>{category?.toUpperCase()}</h1>

            <div className="row g-4">
                {products.map(product => (
                    <div className="col-12 col-md-4" key={product.id}>
                        <div 
                            className={style.card}
                            onClick={() => navigate(`/product/${product.id}`)} 
                            data-testid={`product-${product.name ? product.name.toLowerCase().split(' ').join('-') : product.id}`}
                        >
                            {/* IMAGE, QUICK SHOP ICON AND OUT OF STOCK TEXT */}
                            <div className={style.imgContainer}>
                                <img
                                    src={product.gallery && product.gallery.length > 0 ? product.gallery[0] : ''}
                                    alt={product.name}
                                    className={style.productImage}
                                />
                                {/* QUICK SHOP ICON */}
                                {!isProductInStock(product) ? (
                                    <img src="../images/quick-shop-icon.png" alt="quick-shop-icon" className={`${style.quickShopIcon} d-none`} />
                                ) : (
                                    <img src="../images/quick-shop-icon.png" alt="quick-shop-icon" className={style.quickShopIcon} onClick={(event) => handleAddToCart(event, product)} />
                                )}
                                
                                {/* OUT OF STOCK TEXT */}
                                {!isProductInStock(product) ? (
                                    <p className={style.cardStock}>OUT OF STOCK</p>
                                ) : (
                                    <p className="d-none">OUT OF STOCK</p>
                                )}
                            </div>

                            {/* PRODUCT NAME AND PRICE */}    
                            <div className={style.cardBody}>
                                <h5 className={style.cardTitle}>{product.name}</h5>
                                {product.prices && product.prices.length > 0 && (
                                    <p className={!isProductInStock(product) ? style.cardPriceStock0 : style.cardPrice}>
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