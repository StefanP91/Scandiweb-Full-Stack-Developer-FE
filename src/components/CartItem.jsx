import { memo } from 'react';

const CartItem = memo(({ item, updateQuantity, removeFromCart }) => {
    return (
        <div key={item.id} className="cart-item">
            <div className="row">
                <div className="col-5 col-md-5">
                    {/* PRODUCT NAME */}
                    <p className="product-name">{item.name}</p>
                    
                    {/* PRODUCT PRICE */}
                    <p className="product-price">
                        {item.prices[0].currency.symbol}
                        {item.prices[0].amount}
                    </p>

                    {/* ATTRIBUTES */}
                    {item.attributes && item.attributes.length > 0 && (
                        <div className="cart-item-attributes">
                            {item.attributes.map((attribute) => (
                                <div key={attribute.id} className="cart-attribute-group">
                                    <p className="cart-attribute-name">{attribute.name}:</p>

                                    <div className="cart-attribute-options">
                                        {attribute.items.map((attrItem) => {
                                            const itemValueKebab = attrItem.displayValue.toLowerCase().replace(/\s+/g, "-");
                                            const attributeNameKebab = attribute.name.toLowerCase().replace(/\s+/g, "-");
                                            const isSelected =
                                                item.selectedAttributes &&
                                                item.selectedAttributes[attribute.id] === attrItem.id;

                                            return attribute.type === "swatch" ? (
                                                // Color swatch
                                                <div
                                                    key={attrItem.id}
                                                    className={`cart-color-option ${isSelected ? "selectedColor" : "unselectedColor"}`}
                                                    style={{ backgroundColor: attrItem.value }}
                                                    data-testid={isSelected 
                                                        ? `cart-item-attribute-${attributeNameKebab}-${itemValueKebab}-selected` 
                                                        : `cart-item-attribute-${attributeNameKebab}-${itemValueKebab}`}
                                                />
                                            ) : (
                                                // Text option (size, etc)
                                                <div
                                                    key={attrItem.id}
                                                    className={`cart-text-option ${isSelected ? "selectedText" : "unselectedText"}`}
                                                    data-testid={isSelected 
                                                        ? `cart-item-attribute-${attributeNameKebab}-${itemValueKebab}-selected` 
                                                        : `cart-item-attribute-${attributeNameKebab}-${itemValueKebab}`}
                                                >
                                                    {attrItem.displayValue}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="col-2 col-md-2">
                    {/* QUANTITY BUTTONS */}
                    <div className="cart-quantity-control">
                        <button
                            className="cart-quantity-btn"
                            onClick={() => updateQuantity(item.cartItemId || item.id, (item.quantity || 1) + 1)}
                            data-testid='cart-item-amount-increase'
                        >
                            +
                        </button>

                        <span className="cart-quantity" data-testid='cart-item-amount'>{item.quantity || 1}</span>

                        <button
                            className="cart-quantity-btn"
                            onClick={() => {
                                const currentQty = item.quantity || 1;
                                if (currentQty === 1) {
                                    const itemIdentifier = item.cartItemId || item.id;
                                    removeFromCart(itemIdentifier);
                                } else {
                                    updateQuantity(item.cartItemId || item.id, currentQty - 1);
                                }
                            }}
                            data-testid='cart-item-amount-decrease'  
                        >
                            -
                        </button>
                    </div>
                </div>

                {/* PRODUCT IMAGE */}
                <div className="col-5 col-md-5">
                    <div className="cart-item-image">
                        <img src={item.gallery?.[0] || ""} alt={item.name} />
                    </div>
                </div>
            </div>
        </div>
    );
});

CartItem.displayName = 'CartItem';
export default CartItem;