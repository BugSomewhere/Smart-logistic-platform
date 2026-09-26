import { api } from './client';
import {
  Category,
  CreateProductDto,
  Product,
  QueryProductDto,
  UpdateProductDto,
} from './types';

export const productApi = {
  async getProducts(query?: QueryProductDto): Promise<Product[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return api.get<Product[]>('/product', { params: query as any });
  },

  async getProductById(id: string): Promise<Product> {
    return api.get<Product>(`/product/${id}`);
  },

  async createProduct(dto: CreateProductDto): Promise<Product> {
    return api.post<Product>('/product', dto);
  },

  async updateProduct(id: string, dto: UpdateProductDto): Promise<Product> {
    return api.patch<Product>(`/product/${id}`, dto);
  },

  async deleteProduct(id: string): Promise<void> {
    return api.delete(`/product/${id}`);
  },

  async getCategories(): Promise<Category[]> {
    return api.get<Category[]>('/category');
  },
};
