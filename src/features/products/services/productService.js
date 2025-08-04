import { graphqlClient } from '../../../shared/api/client';
import { GET_ALL_PRODUCTS_QUERY, GET_PRODUCT_BY_ID_QUERY, getProductsByCategoryQuery } from '../../../shared/api/graphql/queries';

export const productService = {
  async getAllProducts() {
    const data = await graphqlClient.query(GET_ALL_PRODUCTS_QUERY);
    return data.products || [];
  },

  async getProductById(id) {
    const data = await graphqlClient.query(GET_PRODUCT_BY_ID_QUERY(id));
    const products = data.products || [];
    
    const product = products.find(p => p.id === id);
    
    if (!product) {
      throw new Error(`Product with ID ${id} not found`);
    }
    
    return product;
  },

  async getProductsByCategory(category) {
    const data = await graphqlClient.query(getProductsByCategoryQuery(category));
    return data.products || [];
  }
};