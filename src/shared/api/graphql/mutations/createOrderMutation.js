export const CREATE_ORDER_MUTATION = `
  mutation CreateOrder($input: OrderInput!) {
    createOrder(input: $input) {
      id
      orderNumber
      createdAt
      total
    }
  }
`;