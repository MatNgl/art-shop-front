// Types frontend — alignés sur les DTOs backend

//  Images (Cloudinary)

/** URLs générées par Cloudinary pour toutes les tailles */
export interface ImageUrls {
  thumbnail: string; // 150×150
  small: string; // 300×300
  medium: string; // 600×600
  large: string; // 1200×1200
  original: string; // qualité auto
}

export type ProductImageStatus = "ACTIVE" | "INACTIVE";

export interface ProductImage {
  id: string;
  productId: string;
  publicId: string;
  url: string;
  urls: ImageUrls;
  altText?: string;
  position: number;
  status: ProductImageStatus;
  isPrimary: boolean;
  createdAt: string;
  createdById: string;
}

export type ProductVariantImageStatus = "ACTIVE" | "INACTIVE";

export interface ProductVariantImage {
  id: string;
  variantId: string;
  publicId: string;
  url: string;
  urls: ImageUrls;
  altText?: string;
  position: number;
  status: ProductVariantImageStatus;
  isPrimary: boolean;
  createdAt: string;
  createdById: string;
}

//  Tags

/**
 * ⚠️ Le TagResponseDto backend retourne : id, slug, createdAt, updatedAt
 *    mais PAS `name`. C'est un bug backend à corriger.
 *    On garde `name` optionnel ici en attendant le fix.
 */
export interface Tag {
  id: string;
  name?: string;
  slug: string;
  createdAt: string;
  updatedAt?: string;
}

//  Formats

export interface Format {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
}

//  Matériaux

export interface Material {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

//  Variantes

export type ProductVariantStatus =
  | "AVAILABLE"
  | "OUT_OF_STOCK"
  | "DISCONTINUED";

export interface ProductVariant {
  id: string;
  productId: string;
  format: Format;
  material: Material;
  price: number;
  stockQty: number;
  status: ProductVariantStatus;
  createdAt: string;
  updatedAt: string;
}

//  Produits

export type ProductStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  status: ProductStatus;
  featured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
  // Relations chargées par le backend (findAllPublished inclut ces relations)
  categories?: Category[];
  subcategories?: Subcategory[];
}

//  Catégories

export interface Category {
  id: string;
  name: string;
  slug: string;
  position: number;
  subcategoriesCount?: number;
  productsCount?: number;
  createdBy: string;
  createdAt: string;
  modifiedBy?: string;
  updatedAt: string;
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  position: number;
  categoryId: string;
  productsCount?: number;
  createdBy: string;
  createdAt: string;
  modifiedBy?: string;
  updatedAt: string;
}

export interface CategoryWithSubcategories extends Category {
  subcategories: Subcategory[];
}

export interface SubcategoryWithCategory extends Subcategory {
  category: {
    id: string;
    name: string;
    slug: string;
  };
}
