import { memo } from 'react';
import styles from './CartItem.module.css';

const CartItem = memo(({ item, updateQuantity, removeFromCart }) => {
    return (
        <div key={item.id} className={styles.cartItem}>
            <div className="row">
                <div className="col-5 col-md-5">
                    {/* PRODUCT NAME */}
                    <p className={styles.productName}>{item.name}</p>

                    {/* PRODUCT PRICE */}
                    <p className={styles.productPrice}>
                        {item.prices[0].currency.symbol}
                        {item.prices[0].amount}
                    </p>

                    {/* ATTRIBUTES */}
                    {item.attributes && item.attributes.length > 0 && (
                        <div className={styles.cartItemAttributes}>
                            {item.attributes.map((attribute) => (
                                <div key={attribute.id} className={styles.cartAttributeGroup}>
                                    <p className={styles.cartAttributeName}>{attribute.name}:</p>

                                    <div className={styles.cartAttributeOptions}>
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
                                                    className={`${styles.cartColorOption} ${isSelected ? styles.selectedColor : styles.unselectedColor}`}
                                                    style={{ backgroundColor: attrItem.value }}
                                                    data-testid={isSelected 
                                                        ? `cart-item-attribute-${attributeNameKebab}-${itemValueKebab}-selected` 
                                                        : `cart-item-attribute-${attributeNameKebab}-${itemValueKebab}`}
                                                />
                                            ) : (
                                                // Text option (size, etc)
                                                <div
                                                    key={attrItem.id}
                                                    className={`${styles.cartTextOption} ${isSelected ? styles.selectedText : styles.unselectedText}`}
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
                    <div className={styles.cartQuantityControl}>
                        <button
                            className={styles.cartQuantityBtn}
                            onClick={() => updateQuantity(item.cartItemId || item.id, (item.quantity || 1) + 1)}
                            data-testid='cart-item-amount-increase'
                        >
                            +
                        </button>

                        <span className={styles.cartQuantity} data-testid='cart-item-amount'>{item.quantity || 1}</span>

                        <button
                            className={styles.cartQuantityBtn}
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
                    <div className={styles.cartItemImage}>
                        <img src={item.gallery?.[0] || ""} alt={item.name} />
                    </div>
                </div>
            </div>
        </div>
    );
});

export default CartItem;