export const GET_ALL_PRODUCTS_QUERY = `
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
                    typename
                }
                typename
            }
            prices {
                amount
                currency {
                    label
                    symbol
                    typename
                }
                typename
            }
            typename
        }
    }
`;

export const GET_CATEGORIES_QUERY = `
    query {
        categories {
            name
        }
    }
`;

export const GET_PRODUCT_BY_ID_QUERY = (id) => `
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
                    typename
                }
                typename
            }
            prices {
                amount
                currency {
                    label
                    symbol
                    typename
                }
                typename
            }
            typename
        }
    }
`;

export const getProductsByCategoryQuery = (category) => `
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