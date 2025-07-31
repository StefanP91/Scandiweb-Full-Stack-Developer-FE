import { useState, useEffect } from "react";
import { useParams } from "react-router";
import ReactMarkdown from "react-markdown";
import rehypeRaw from 'rehype-raw'
import { useCart } from "../contexts/CartContext";
import { useOverlay } from "../contexts/OverlayContext";

import Loading from "../components/Loading";
import ErrorPage from "./ErrorPage";

const GET_PRODUCT_DETAILS_QUERY = `
    query {
        products {
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

const ProductDetail = () => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedAttributes, setSelectedAttributes] = useState({});
    const [hasInteractedWithAttributes, setHasInteractedWithAttributes] = useState(false);
    const { productId } = useParams();
    const { addToCart, setIsCartOpen } = useCart();
    const { setIsOverlayActive, setIsBodyScrollDisabled } = useOverlay();

    // FETCH PRODUCT DETAILS
    useEffect(() => {
        const fetchProductDetails = async () => {
            setLoading(true); 
            setError(null);

            try {
                const response = await fetch('/backend/public/graphql', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: GET_PRODUCT_DETAILS_QUERY })
                });
                
                const result = await response.json();
                
                if (result.errors) {
                    throw new Error(result.errors[0].message);
                }

                const foundProduct = result.data.products.find(prod => prod.id === productId);
                
                if (!foundProduct) {
                    throw new Error("Product not found");
                }
                
                setProduct(foundProduct);
                setLoading(false);
                setCurrentImageIndex(0);
            } 
            
            catch (error) {
                console.error('Error fetching product:', error);
                setError(error.message);
                setLoading(false);
            }

            finally{
                setLoading(false);
            }
        };

        fetchProductDetails();
    }, [productId]);

    // ADD TO CART HANDLER
    const handleAddToCart = () => {
        if (!areAllAttributesSelected() || !product.inStock) return;

        const productToAdd = {
            ...product,
            selectedAttributes: {...selectedAttributes}
        };
        
        addToCart(productToAdd);
        setIsCartOpen(true);
        setIsOverlayActive(true);
        setIsBodyScrollDisabled(true);
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
        <div className="container py-6 product-detail">
            <div className="row">
                <div className="col-md-2 col-lg-1">
                    <div className="image-thumbnails mt-3">
                        {/* IMAGE GALLERY */}
                        {product.gallery && product.gallery.map((img, index) => (
                            <img 
                                key={index}
                                src={img} 
                                alt={`${product.name} thumbnail ${index}`}
                                className={`thumbnail-image mb-2 ${index === currentImageIndex ? 'active' : ''}`}
                                onClick={() => selectImage(index)}
                            />
                        ))}
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="product-images position-relative" data-testid="product-gallery">
                        {product.gallery && product.gallery.length > 0 && (
                            <>  
                                {/* MAIN IMAGE */}
                                <img
                                    src={product.gallery[currentImageIndex]} 
                                    alt={product.name} 
                                    className="img-fluid main-product-image"
                                />
                                
                                {/* CAROUSEL BUTTONS */}
                                {product.gallery.length > 1 && (
                                    <>
                                        <button 
                                            className="carousel-control prev" 
                                            onClick={prevImage}
                                            
                                        >
                                            &lt;
                                        </button>

                                        <button 
                                            className="carousel-control next" 
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
                    <h1 className="product-name">{product.name}</h1>
                    
                    {/* ATTRIBUTES */}
                    {product.attributes && product.attributes.map(attr => {
                        const attrNameKebab = attr.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

                        return(
                            <div key={attr.id} className="product-attribute mt-4" data-testid={`product-attribute-${attrNameKebab}`}>

                                <h4 className="attribute-name">{attr.name}:</h4>

                                <div className="attribute-values d-flex flex-wrap">
                                    {attr.items.map(item => {
                                        const isSelected = selectedAttributes[attr.id] === item.id;

                                        return (
                                            <button 
                                                key={item.id} 
                                                className={`attribute-btn ${attr.type === 'swatch' ? 'swatch' : ''} ${isSelected ? 'selected' : ''}`}
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
                    <div className="product-price mt-4">
                        <h4>PRICE:</h4>
                        
                        {product.prices && product.prices.length > 0 && (
                            <p className="price-amount">
                                {product.prices[0].currency.symbol}{product.prices[0].amount}
                            </p>
                        )}
                    </div>
                    
                    {/* ADD TO CART BUTTON */}
                    <button 
                        className={`add-to-cart-btn ${!areAllAttributesSelected() || !product.inStock ? 'disabled' : ''}`}
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
                    <div className="product-description mt-4" data-testid="product-description"> 
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