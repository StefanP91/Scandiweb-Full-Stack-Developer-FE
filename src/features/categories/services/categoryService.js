import { graphqlClient } from '../../../shared/api/client';
import { GET_CATEGORIES_QUERY } from '../../../shared/api/graphql/queries';

export const categoryService = {
  async getAllCategories() {
    const data = await graphqlClient.query(GET_CATEGORIES_QUERY);
    return data.categories || [];
  }
};