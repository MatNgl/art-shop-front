import { get } from "./api";
import type { Product, ProductVariant, ProductImage } from "@/types";

/**
 * Récupère tous les produits publiés (endpoint public)
 * GET /products/published
 */
export async function getPublishedProducts(): Promise<Product[]> {
  return get<Product[]>("/products/published");
}

/**
 * Récupère les produits mis en avant (featured)
 * GET /products/featured
 */
export async function getFeaturedProducts(): Promise<Product[]> {
  return get<Product[]>("/products/featured");
}

/**
 * Récupère un produit par son slug (endpoint public)
 * GET /products/slug/:slug
 */
export async function getProductBySlug(slug: string): Promise<Product> {
  return get<Product>(`/products/slug/${slug}`);
}

/**
 * Récupère les variantes d'un produit
 * GET /products/:productId/variants
 */
export async function getProductVariants(
  productId: string,
): Promise<ProductVariant[]> {
  return get<ProductVariant[]>(`/products/${productId}/variants`);
}

/**
 * Récupère une variante par son ID
 * GET /products/:productId/variants/:variantId
 */
export async function getProductVariant(
  productId: string,
  variantId: string,
): Promise<ProductVariant> {
  return get<ProductVariant>(`/products/${productId}/variants/${variantId}`);
}

/**
 * Récupère les images d'un produit
 * GET /products/:productId/images
 */
export async function getProductImages(
  productId: string,
): Promise<ProductImage[]> {
  return get<ProductImage[]>(`/products/${productId}/images`);
}

/**
 * Récupère un produit complet avec ses variantes et images
 * Combine plusieurs appels API
 */
export async function getProductWithDetails(slug: string): Promise<{
  product: Product;
  variants: ProductVariant[];
  images: ProductImage[];
}> {
  const product = await getProductBySlug(slug);
  const [variants, images] = await Promise.all([
    getProductVariants(product.id),
    getProductImages(product.id),
  ]);

  return { product, variants, images };
}
