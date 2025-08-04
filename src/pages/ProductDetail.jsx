import { useState } from "react";
import { useParams } from "react-router";
import ReactMarkdown from "react-markdown";
import rehypeRaw from 'rehype-raw'
import { useProduct } from "../features/products/hooks/useProducts";
import { useCartOverlay } from '../features/cart/hooks/useCartOverlay';

import Loading from "../components/common/Loading/Loading";
import ErrorPage from "../components/common/Error/ErrorPage";

import style from '../shared/styles/product.module.css';

const ProductDetail = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedAttributes, setSelectedAttributes] = useState({});
    const [hasInteractedWithAttributes, setHasInteractedWithAttributes] = useState(false);
    const { productId } = useParams();
    const { product, loading, error } = useProduct(productId);
    const { addToCartWithOverlay } = useCartOverlay();

    // ADD TO CART HANDLER
    const handleAddToCart = () => {
        if (!areAllAttributesSelected() || !product.inStock) return;

        const productToAdd = {
            ...product,
            selectedAttributes: {...selectedAttributes}
        };
        
        addToCartWithOverlay(productToAdd);
    };
    
    // NEXT IMAGE HANDLER
    const nextImage = () =>{
        if (product && product.gallery){
            setCurrentImageIndex((prevIndex) =>
              prevIndex === product.gallery.length - 1 ? 0 : prevIndex + 1  
            );
        }
    }

    // PREVIOUS IMAGE HANDLER
    const prevImage = () => {
        if (product && product.gallery){
            setCurrentImageIndex((prevIndex) =>
              prevIndex === 0 ? product.gallery.length - 1 : prevIndex - 1  
            );
        }
    }
    
    // SELECT IMAGE HANDLER
    const selectImage = (index) => {
        setCurrentImageIndex(index);
    }

    // ATTRIBUTE CHANGE HANDLER
    const handleAttributeChange = (attributeId, itemId) => {
        if (!product.attributes || product.attributes.length === 0) {
            return;
        }
        setSelectedAttributes(prev => ({
            ...prev,
            [attributeId]: itemId
        }));

        setHasInteractedWithAttributes(true);
    };

    // CHECK IF ALL REQUIRED ATTRIBUTES ARE SELECTED
    const areAllAttributesSelected = () => {

        if (!product) return false;

        if (!product.attributes || product.attributes.length === 0) {
            return true;
        }

        if (!hasInteractedWithAttributes) {
            return false; 
        }

        const requiredAttributeIds = product.attributes.map(attr => attr.id);
        
        return requiredAttributeIds.every(attrId => 
            selectedAttributes[attrId] !== undefined
        );
    };

    // LOADING
    if (loading) { 
        return <Loading />;
    }

    // ERROR
    if (error){
        return <ErrorPage />;
    } 

    return (
        <div className={`container ${style.productDetail}`}>
            <div className="row">
                <div className="col-md-2 col-lg-1">
                    <div className={`${style.imageThumbnails} mt-3`}>
                        {/* IMAGE GALLERY */}
                        {product.gallery && product.gallery.map((img, index) => (
                            <img 
                                key={index}
                                src={img} 
                                alt={`${product.name} thumbnail ${index}`}
                                className={`${style.thumbnailImage} mb-2 ${index === currentImageIndex ? 'active' : ''}`}
                                onClick={() => selectImage(index)}
                            />
                        ))}
                    </div>
                </div>

                <div className="col-md-6">
                    <div className={`${style.productImages}`} data-testid="product-gallery">
                        {product.gallery && product.gallery.length > 0 && (
                            <>  
                                {/* MAIN IMAGE */}
                                <img
                                    src={product.gallery[currentImageIndex]} 
                                    alt={product.name} 
                                    className={`img-fluid ${style.mainProductImage}`}
                                />
                                
                                {/* CAROUSEL BUTTONS */}
                                {product.gallery.length > 1 && (
                                    <>
                                        <button 
                                            className={`${style.carouselControl} ${style.prev}`} 
                                            onClick={prevImage}
                                        >
                                            &lt;
                                        </button>

                                        <button 
                                            className={`${style.carouselControl} ${style.next}`} 
                                            onClick={nextImage}
                                        >
                                            &gt;
                                        </button>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
                
                <div className="col-md-4 offset-lg-1">
                    <h1 className={style.productName}>{product.name}</h1>

                    {/* ATTRIBUTES */}
                    {product.attributes && product.attributes.map(attr => {
                        const attrNameKebab = attr.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

                        return(
                            <div key={attr.id} className={`${style.productAttribute} mt-4`} data-testid={`product-attribute-${attrNameKebab}`}>

                                <h4 className={style.attributeName}>{attr.name}:</h4>

                                <div className={`${style.attributeValues} d-flex flex-wrap`}>
                                    {attr.items.map(item => {
                                        const isSelected = selectedAttributes[attr.id] === item.id;

                                        return (
                                            <button 
                                                key={item.id} 
                                                className={`${style.attributeBtn} ${attr.type === 'swatch' ? style.swatch : ''} ${isSelected ? style.selected : ''}`}
                                                style={attr.type === 'swatch' ? { backgroundColor: item.value } : {}}
                                                onClick={() => handleAttributeChange(attr.id, item.id)}
                                                data-testid={`product-attribute-${attrNameKebab}-${attr.type === 'swatch' ? item.value : item.displayValue}`}
                                            >
                                                {attr.type !== 'swatch' ? item.displayValue : ''}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )
                    })}
          
                    {/* PRICE */}
                    <div className={`${style.productPrice} mt-4`}>
                        <h4>PRICE:</h4>
                        
                        {product.prices && product.prices.length > 0 && (
                            <p className={`${style.priceAmount}`}>
                                {product.prices[0].currency.symbol}{product.prices[0].amount}
                            </p>
                        )}
                    </div>
                    
                    {/* ADD TO CART BUTTON */}
                    <button 
                        className={`${style.addToCartBtn} ${!areAllAttributesSelected() || !product.inStock ? style.disabled : ''}`}
                        disabled={!areAllAttributesSelected() || !product.inStock}
                        onClick={handleAddToCart}
                        data-testid="add-to-cart"
                    >
                        {!product.inStock ? 'OUT OF STOCK' 
                            : (product.attributes && product.attributes.length > 0 && !areAllAttributesSelected()) 
                            ? 'SELECT OPTIONS' : 'ADD TO CART'
                        }
                    </button>
                    
                    {/* DESCRIPTION */}
                    <div className={`${style.productDescription} mt-4`} data-testid="product-description"> 
                        <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                            {product.description}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDetail;