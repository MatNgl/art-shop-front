// ============================================
// ENUMS
// ============================================

export const ProductStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
} as const;
export type ProductStatus = typeof ProductStatus[keyof typeof ProductStatus];

export const ProductVariantStatus = {
  AVAILABLE: 'AVAILABLE',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
  DISCONTINUED: 'DISCONTINUED',
} as const;
export type ProductVariantStatus = typeof ProductVariantStatus[keyof typeof ProductVariantStatus];

export const ProductImageStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;
export type ProductImageStatus = typeof ProductImageStatus[keyof typeof ProductImageStatus];


// ============================================
// FORMAT
// ============================================

export interface Format {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// MATERIAL
// ============================================

export interface Material {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// TAG
// ============================================

export interface Tag {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt?: string;
}

// ============================================
// CATEGORY
// ============================================

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

export interface CategoryWithSubcategories extends Category {
  subcategories: Subcategory[];
}

// ============================================
// SUBCATEGORY
// ============================================

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

export interface SubcategoryWithCategory extends Subcategory {
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

// ============================================
// PRODUCT IMAGE
// ============================================

export interface ImageUrls {
  thumbnail: string;
  small: string;
  medium: string;
  large: string;
  original: string;
}

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

// ============================================
// PRODUCT VARIANT
// ============================================

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

export interface ProductVariantImage {
  id: string;
  variantId: string;
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

// ============================================
// PRODUCT
// ============================================

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
  images?: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

/** Produit avec toutes ses relations (pour la page détail) */
export interface ProductWithDetails extends Product {
  images: ProductImage[];
  variants: ProductVariant[];
  categories?: Category[];
  subcategories?: Subcategory[];
}

/** Produit pour les listes/grilles (données minimales + calculs) */
export interface ProductListItem extends Product {
  /** Image principale */
  primaryImage?: ProductImage;
  /** Prix minimum parmi les variantes */
  minPrice?: number;
  /** Prix maximum parmi les variantes */
  maxPrice?: number;
}
