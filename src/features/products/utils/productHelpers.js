export const generateDefaultAttributes = (attributes) => {
  const defaultSelectedAttributes = {};

  if (attributes && attributes.length > 0) {
    attributes.forEach(attr => {
      if (attr.items && attr.items.length > 0) {
        defaultSelectedAttributes[attr.id] = attr.items[0].id;
      }
    });
  }

  return defaultSelectedAttributes;
};

export const formatPrice = (price, currency) => {
  return `${currency?.symbol || '$'}${price || 0}`;
};

export const isProductInStock = (product) => {
  return product.inStock !== false;
};