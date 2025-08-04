import { graphqlClient } from '../../../shared/api/client';
import { CREATE_ORDER_MUTATION } from '../../../shared/api/graphql/mutations/createOrderMutation';

export const cartService = {
  async createOrder(cartItems) {
    const orderItems = cartItems.map(item => ({
      productId: item.id,
      quantity: item.quantity || 1,
      price: item.prices?.[0]?.amount || 0,
      selectedAttributes: item.selectedAttributes ?
        Object.entries(item.selectedAttributes).map(([name, value]) => ({ name, value })) : []
    }));

    const variables = {
      input: {
        items: orderItems,
        currency: cartItems[0]?.prices[0]?.currency?.symbol || 'USD'
      }
    };

    const data = await graphqlClient.query(CREATE_ORDER_MUTATION, variables);
    return data.createOrder;
  }
};