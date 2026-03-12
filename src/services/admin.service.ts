import { get, post, patch, del, uploadFile } from "./api";
import type {
  DashboardStats,
  RecentOrderSummary,
  UsersStats,
  PaginatedActivityLogs,
  PaginatedUsers,
  AdminUser,
  AvailableRole,
  MaterialResponse,
  FormatResponse,
  CategoryResponse,
  SubcategoryResponse,
  ProductResponse,
  ProductPayload,
  ProductStatus,
  TagResponse,
  ProductVariantResponse,
  ProductVariantPayload,
  ProductImageResponse,
} from "@/types";
//  Stats utilisateurs

export function getUsersStats(): Promise<UsersStats> {
  return get<UsersStats>("/users/stats");
}

//  Commandes admin

export function getAllOrders(): Promise<RecentOrderSummary[]> {
  return get<RecentOrderSummary[]>("/orders/admin/all");
}

//  Logs d'activité

export function getActivityLogs(
  params?: Record<string, string | number>,
): Promise<PaginatedActivityLogs> {
  const query = params
    ? "?" +
      new URLSearchParams(
        Object.entries(params).map(([k, v]) => [k, String(v)]),
      ).toString()
    : "";
  return get<PaginatedActivityLogs>(`/activity-logs${query}`);
}

// Dashboard agrégé

/**
 * Agrège les données de plusieurs endpoints pour construire
 * les stats du dashboard admin.
 *
 * Côté backend, il n'y a pas d'endpoint dédié `/admin/dashboard` :
 * on compose les données côté client à partir des endpoints existants.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const [orders, usersStats] = await Promise.all([
    getAllOrders(),
    getUsersStats(),
  ]);

  // Revenus = somme des commandes payées (CONFIRMED + SHIPPED + DELIVERED)
  const paidStatuses = new Set(["CONFIRMED", "SHIPPED", "DELIVERED"]);
  const paidOrders = orders.filter((o) => paidStatuses.has(o.status));
  const revenue = paidOrders.reduce((sum, o) => sum + o.total, 0);

  // Répartition par statut
  const ordersByStatus: Record<string, number> = {};
  for (const order of orders) {
    ordersByStatus[order.status] = (ordersByStatus[order.status] ?? 0) + 1;
  }

  // Commandes du jour
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayOrdersCount = orders.filter(
    (o) => o.createdAt.slice(0, 10) === todayStr,
  ).length;

  // Clients = total users - guests
  const guestCount = usersStats.byRole["GUEST"] ?? 0;
  const customersCount = usersStats.total - guestCount;

  return {
    revenue,
    ordersCount: orders.length,
    ordersByStatus,
    todayOrdersCount,
    customersCount,
    lowStockCount: 0, // nécessiterait un endpoint dédié — V2
  };
}

// ── Utilisateurs admin ──────────────────────────

export function getUsers(
  params?: Record<string, string | number>,
): Promise<PaginatedUsers> {
  const query = params
    ? "?" +
      new URLSearchParams(
        Object.entries(params).map(([k, v]) => [k, String(v)]),
      ).toString()
    : "";
  return get<PaginatedUsers>(`/users${query}`);
}

export function getUserById(id: string): Promise<AdminUser> {
  return get<AdminUser>(`/users/${id}`);
}

export function getAvailableRoles(): Promise<AvailableRole[]> {
  return get<AvailableRole[]>("/users/roles");
}

export function updateUser(
  id: string,
  data: Record<string, unknown>,
): Promise<AdminUser> {
  return patch<AdminUser>(`/users/${id}`, data);
}

export function updateUserStatus(
  id: string,
  status: string,
  reason?: string,
): Promise<AdminUser> {
  return patch<AdminUser>(`/users/${id}/status`, { status, reason });
}

export function deleteUser(id: string): Promise<void> {
  return del<void>(`/users/${id}`);
}

//  Matériaux admin

interface MaterialPayload {
  name: string;
  description?: string;
  isActive?: boolean;
}

export function getMaterials(): Promise<MaterialResponse[]> {
  return get<MaterialResponse[]>("/materials");
}

export function createMaterial(
  data: MaterialPayload,
): Promise<MaterialResponse> {
  return post<MaterialResponse>("/materials", data);
}

export function updateMaterial(
  id: string,
  data: Partial<MaterialPayload>,
): Promise<MaterialResponse> {
  return patch<MaterialResponse>(`/materials/${id}`, data);
}

export function deleteMaterial(id: string): Promise<void> {
  return del<void>(`/materials/${id}`);
}

//  Formats admin

interface FormatPayload {
  name: string;
  widthMm: number;
  heightMm: number;
  isCustom?: boolean;
}

export function getFormats(): Promise<FormatResponse[]> {
  return get<FormatResponse[]>("/formats");
}

export function createFormat(data: FormatPayload): Promise<FormatResponse> {
  return post<FormatResponse>("/formats", data);
}

export function updateFormat(
  id: string,
  data: Partial<FormatPayload>,
): Promise<FormatResponse> {
  return patch<FormatResponse>(`/formats/${id}`, data);
}

export function deleteFormat(id: string): Promise<void> {
  return del<void>(`/formats/${id}`);
}

// --- Catégories admin ---

export interface CategoryPayload {
  name: string;
  position?: number;
}

export function getCategories(): Promise<CategoryResponse[]> {
  // On ajoute le paramètre pour inclure les sous-catégories selon ton contrôleur
  return get<CategoryResponse[]>("/categories?includeSubcategories=true");
}

export function createCategory(
  data: CategoryPayload,
): Promise<CategoryResponse> {
  return post<CategoryResponse>("/categories", data);
}

export function updateCategory(
  id: string,
  data: Partial<CategoryPayload>,
): Promise<CategoryResponse> {
  return patch<CategoryResponse>(`/categories/${id}`, data);
}

export function deleteCategory(id: string): Promise<void> {
  return del<void>(`/categories/${id}`);
}

// --- Sous-catégories admin ---

export interface SubcategoryPayload {
  name: string;
  categoryId: string;
  position?: number;
}

export function createSubcategory(
  data: SubcategoryPayload,
): Promise<SubcategoryResponse> {
  // On extrait le categoryId pour l'URL, et on envoie le reste dans le body
  const { categoryId, ...payload } = data;
  return post<SubcategoryResponse>(
    `/categories/${categoryId}/subcategories`,
    payload,
  );
}

export function updateSubcategory(
  id: string,
  data: Partial<SubcategoryPayload>,
): Promise<SubcategoryResponse> {
  return patch<SubcategoryResponse>(`/subcategories/${id}`, data);
}

export function deleteSubcategory(id: string): Promise<void> {
  return del<void>(`/subcategories/${id}`);
}

// --- Produits admin ---

export function getProducts(
  status?: ProductStatus | "ALL",
): Promise<ProductResponse[]> {
  const query = status && status !== "ALL" ? `?status=${status}` : "";
  return get<ProductResponse[]>(`/products${query}`);
}

export function createProduct(data: ProductPayload): Promise<ProductResponse> {
  return post<ProductResponse>("/products", data);
}

export function updateProduct(
  id: string,
  data: Partial<ProductPayload>,
): Promise<ProductResponse> {
  return patch<ProductResponse>(`/products/${id}`, data);
}

export function archiveProduct(id: string): Promise<ProductResponse> {
  return patch<ProductResponse>(`/products/${id}/archive`, {});
}

export function deleteProduct(id: string): Promise<void> {
  return del<void>(`/products/${id}`);
}

// --- Produits admin (Ajout du getById) ---
export function getProductById(id: string): Promise<ProductResponse> {
  return get<ProductResponse>(`/products/${id}`);
}

// --- Variantes admin ---

export function getProductVariants(
  productId: string,
): Promise<ProductVariantResponse[]> {
  return get<ProductVariantResponse[]>(`/products/${productId}/variants`);
}

export function createProductVariant(
  productId: string,
  data: ProductVariantPayload,
): Promise<ProductVariantResponse> {
  return post<ProductVariantResponse>(`/products/${productId}/variants`, data);
}

export function updateProductVariant(
  productId: string,
  variantId: string,
  data: Partial<ProductVariantPayload>,
): Promise<ProductVariantResponse> {
  return patch<ProductVariantResponse>(
    `/products/${productId}/variants/${variantId}`,
    data,
  );
}

export function updateVariantStock(
  productId: string,
  variantId: string,
  quantityChange: number,
): Promise<ProductVariantResponse> {
  return patch<ProductVariantResponse>(
    `/products/${productId}/variants/${variantId}/stock`,
    { quantityChange },
  );
}

export function archiveProductVariant(
  productId: string,
  variantId: string,
): Promise<ProductVariantResponse> {
  return patch<ProductVariantResponse>(
    `/products/${productId}/variants/${variantId}/archive`,
    {},
  );
}

export function deleteProductVariant(
  productId: string,
  variantId: string,
): Promise<void> {
  return del<void>(`/products/${productId}/variants/${variantId}`);
}

// --- Images produit admin ---

interface UploadProductImageParams {
  altText?: string;
  position?: number;
  isPrimary?: boolean;
}

export function getProductImages(
  productId: string,
): Promise<ProductImageResponse[]> {
  return get<ProductImageResponse[]>(`/products/${productId}/images`);
}

export function uploadProductImage(
  productId: string,
  file: File,
  params?: UploadProductImageParams,
): Promise<ProductImageResponse> {
  const formData = new FormData();
  formData.append("file", file);
  if (params?.altText) formData.append("altText", params.altText);
  if (params?.position !== undefined)
    formData.append("position", String(params.position));
  if (params?.isPrimary !== undefined)
    formData.append("isPrimary", String(params.isPrimary));
  return uploadFile<ProductImageResponse>(
    `/products/${productId}/images`,
    formData,
  );
}

export function updateProductImage(
  productId: string,
  imageId: string,
  data: { altText?: string; position?: number; isPrimary?: boolean },
): Promise<ProductImageResponse> {
  return patch<ProductImageResponse>(
    `/products/${productId}/images/${imageId}`,
    data,
  );
}

export function deleteProductImage(
  productId: string,
  imageId: string,
): Promise<void> {
  return del<void>(`/products/${productId}/images/${imageId}`);
}

export function setProductImagePrimary(
  productId: string,
  imageId: string,
): Promise<ProductImageResponse> {
  return patch<ProductImageResponse>(
    `/products/${productId}/images/${imageId}/primary`,
    {},
  );
}

// --- Tags admin (CRUD complet) ---

interface TagPayload {
  name: string;
}

export function getTags(): Promise<TagResponse[]> {
  return get<TagResponse[]>("/tags");
}

export function createTag(data: TagPayload): Promise<TagResponse> {
  return post<TagResponse>("/tags", data);
}

export function updateTag(
  id: string,
  data: Partial<TagPayload>,
): Promise<TagResponse> {
  return patch<TagResponse>(`/tags/${id}`, data);
}

// Le controller utilise POST au lieu de DELETE
export function deleteTag(id: string): Promise<void> {
  return post<void>(`/tags/${id}/delete`, {});
}
