import axiosInstance from './axios';

// Interfaces for API responses
export interface CategoryResponse {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  attributes?: CategoryAttribute[];
}

export interface CategoryAttribute {
  id: string;
  attribute_name: string;
  is_required: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
  attributes: CategoryAttribute[];
}

export interface ProductResponse {
  category_name: string;
  image_url: string;
  sku: string;
  id: string;
  code: string;
  name: string;
  description: string;
  price: number;
  weight: number;
  stock: number;
  colors: string[];
  material: string;
  image: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  weight: number;
  stock: number;
  colors: string[];
  material: string;
  image: string;
  category: string;
  id_category?: string;
}

// Category API functions
export const categoryService = {
  // Fetch all categories
  async getCategories(): Promise<CategoryResponse[]> {
    try {
      const response = await axiosInstance.get<CategoryResponse[]>('/v1/categories');
      console.log('Categories fetched:', response.data);
      
      // Handle different response formats
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && (response.data as any).items && Array.isArray((response.data as any).items)) {
        return (response.data as any).items;
      }
      return [];
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      console.error('Error response:', error.response?.data);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch categories');
    }
  },

  // Create new category
  async createCategory(categoryData: CreateCategoryRequest): Promise<CategoryResponse> {
    try {
      console.log('Creating category with data:', categoryData);
      
      const response = await axiosInstance.post<CategoryResponse>('/v1/categories', categoryData);
      
      console.log('Created category response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating category:', error);
      console.error('Error response:', error.response?.data);
      throw new Error(error.response?.data?.message || error.message || 'Failed to create category');
    }
  },

  // Delete category
  async deleteCategory(categoryId: string): Promise<void> {
    try {
      await axiosInstance.delete(`/v1/categories/${categoryId}`);
      console.log(`Category ${categoryId} deleted successfully`);
    } catch (error: any) {
      console.error('Error deleting category:', error);
      console.error('Error response:', error.response?.data);
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete category');
    }
  },

  // Update category (for future use)
  async updateCategory(categoryId: string, categoryData: Partial<CreateCategoryRequest>): Promise<CategoryResponse> {
    try {
      const response = await axiosInstance.put<CategoryResponse>(`/v1/categories/${categoryId}`, categoryData);
      console.log('Updated category response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating category:', error);
      console.error('Error response:', error.response?.data);
      throw new Error(error.response?.data?.message || error.message || 'Failed to update category');
    }
  },

  // Fetch category by ID (with attributes)
  async getCategoryById(categoryId: string): Promise<CategoryResponse> {
    try {
      const response = await axiosInstance.get<CategoryResponse>(`/v1/categories/${categoryId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching category by ID:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch category by ID');
    }
  }
};

// Product API functions  
export const productService = {
  // Fetch all products
  async getProducts(): Promise<ProductResponse[]> {
    try {
      const response = await axiosInstance.get<ProductResponse[]>('/v1/products');
      console.log('Products fetched:', response.data);
      
      // Handle different response formats
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && (response.data as any).items && Array.isArray((response.data as any).items)) {
        return (response.data as any).items;
      }
      return [];
    } catch (error: any) {
      console.error('Error fetching products:', error);
      console.error('Error response:', error.response?.data);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch products');
    }
  },

  // Create new product
  async createProduct(productData: CreateProductRequest): Promise<ProductResponse> {
    try {
      console.log('Creating product with data:', productData);
      
      const response = await axiosInstance.post<ProductResponse>('/v1/products', productData);
      
      console.log('Created product response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating product:', error);
      console.error('Error response:', error.response?.data);
      throw new Error(error.response?.data?.message || error.message || 'Failed to create product');
    }
  },

  // Delete product
  async deleteProduct(productId: string): Promise<void> {
    try {
      await axiosInstance.delete(`/v1/products/${productId}`);
      console.log(`Product ${productId} deleted successfully`);
    } catch (error: any) {
      console.error('Error deleting product:', error);
      console.error('Error response:', error.response?.data);
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete product');
    }
  },

  // Update product (for future use)
  async updateProduct(productId: string, productData: Partial<CreateProductRequest>): Promise<ProductResponse> {
    try {
      const response = await axiosInstance.put<ProductResponse>(`/v1/products/${productId}`, productData);
      console.log('Updated product response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating product:', error);
      console.error('Error response:', error.response?.data);
      throw new Error(error.response?.data?.message || error.message || 'Failed to update product');
    }
  }
};

/**
 * Upload an image to /v1/s3/upload-image
 * @param imageFile File atau Blob yang akan diupload
 * @returns Response data dari server
 */
export async function uploadImageToS3(imageFile: File | Blob): Promise<any> {
  const formData = new FormData();
  formData.append('image', imageFile); // HARUS 'image' sesuai backend
  const response = await axiosInstance.post('/v1/s3/upload-image', formData);
  return response.data;
}

// Combined export for convenience
export default {
  category: categoryService,
  product: productService
};
