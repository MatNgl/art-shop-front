import { get } from "./api";
import type {
  Category,
  CategoryWithSubcategories,
  Subcategory,
  SubcategoryWithCategory,
} from "@/types";

/**
 * Récupère toutes les catégories
 * GET /categories
 */
export async function getCategories(): Promise<Category[]> {
  return get<Category[]>("/categories");
}

/**
 * Récupère toutes les catégories avec leurs sous-catégories
 * GET /categories?includeSubcategories=true
 */
export async function getCategoriesWithSubcategories(): Promise<
  CategoryWithSubcategories[]
> {
  return get<CategoryWithSubcategories[]>(
    "/categories?includeSubcategories=true",
  );
}

/**
 * Récupère une catégorie par son ID
 * GET /categories/:id
 */
export async function getCategoryById(id: string): Promise<Category> {
  return get<Category>(`/categories/${id}`);
}

/**
 * Récupère une catégorie par son ID avec ses sous-catégories
 * GET /categories/:id?includeSubcategories=true
 */
export async function getCategoryByIdWithSubcategories(
  id: string,
): Promise<CategoryWithSubcategories> {
  return get<CategoryWithSubcategories>(
    `/categories/${id}?includeSubcategories=true`,
  );
}

/**
 * Récupère une catégorie par son slug
 * GET /categories/slug/:slug
 */
export async function getCategoryBySlug(slug: string): Promise<Category> {
  return get<Category>(`/categories/slug/${slug}`);
}

/**
 * Récupère les sous-catégories d'une catégorie
 * GET /categories/:categoryId/subcategories
 */
export async function getSubcategoriesByCategory(
  categoryId: string,
): Promise<Subcategory[]> {
  return get<Subcategory[]>(`/categories/${categoryId}/subcategories`);
}

/**
 * Récupère toutes les sous-catégories
 * GET /subcategories
 */
export async function getAllSubcategories(): Promise<
  SubcategoryWithCategory[]
> {
  return get<SubcategoryWithCategory[]>("/subcategories");
}

/**
 * Récupère une sous-catégorie par son slug
 * GET /subcategories/slug/:slug
 */
export async function getSubcategoryBySlug(
  slug: string,
): Promise<SubcategoryWithCategory> {
  return get<SubcategoryWithCategory>(`/subcategories/slug/${slug}`);
}
