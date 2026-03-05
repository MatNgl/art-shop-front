import { useMemo } from "react";
import type { BreadcrumbItem } from "@/components/navigation/Breadcrumb";
import type { CategoryWithSubcategories, Product } from "@/types";

//  Breadcrumb pour la page Catalogue

interface CatalogueBreadcrumbParams {
  categories: CategoryWithSubcategories[];
  activeCategory: string | null;
  activeSubcategory: string | null;
}

/**
 * Construit le fil d'Ariane pour la page Galerie.
 *
 * - /galerie → Accueil › Galerie
 * - /galerie?categorie=illustrations → Accueil › Galerie › Illustrations
 * - /galerie?categorie=illustrations&sous-categorie=bleu → Accueil › Galerie › Illustrations › Bleu
 */
export function useCatalogueBreadcrumb({
  categories,
  activeCategory,
  activeSubcategory,
}: CatalogueBreadcrumbParams): BreadcrumbItem[] {
  return useMemo(() => {
    const items: BreadcrumbItem[] = [{ label: "Accueil", href: "/" }];

    // Pas de filtre actif → Galerie est la page courante
    if (!activeCategory && !activeSubcategory) {
      items.push({ label: "Galerie" });
      return items;
    }

    // Un filtre actif → Galerie devient cliquable
    items.push({ label: "Galerie", href: "/galerie" });

    // Recherche de la catégorie active
    const category = activeCategory
      ? categories.find((c) => c.slug === activeCategory)
      : null;

    if (activeSubcategory) {
      // Sous-catégorie active → on cherche sa catégorie parente
      let parentCategory: CategoryWithSubcategories | undefined;
      let subcategoryName: string | undefined;

      for (const cat of categories) {
        const sub = cat.subcategories.find((s) => s.slug === activeSubcategory);
        if (sub) {
          parentCategory = cat;
          subcategoryName = sub.name;
          break;
        }
      }

      if (parentCategory) {
        items.push({
          label: parentCategory.name,
          href: `/galerie?categorie=${parentCategory.slug}`,
        });
      }

      items.push({ label: subcategoryName ?? activeSubcategory });
    } else if (category) {
      // Catégorie seule
      items.push({ label: category.name });
    }

    return items;
  }, [categories, activeCategory, activeSubcategory]);
}

//  Breadcrumb pour la page détail produit 

interface ProductDetailBreadcrumbParams {
  product: Product | null;
}

/**
 * Construit le fil d'Ariane pour la page détail d'une œuvre.
 *
 * - /oeuvre/coucher-de-soleil → Accueil › Galerie › Coucher de soleil sur Tokyo
 * - Avec catégorie → Accueil › Galerie › Illustrations › Coucher de soleil sur Tokyo
 */
export function useProductDetailBreadcrumb({
  product,
}: ProductDetailBreadcrumbParams): BreadcrumbItem[] {
  return useMemo(() => {
    if (!product) return [];

    const items: BreadcrumbItem[] = [
      { label: "Accueil", href: "/" },
      { label: "Galerie", href: "/galerie" },
    ];

    // Si le produit a une catégorie, on l'insère
    const firstCategory = product.categories?.[0];
    if (firstCategory) {
      items.push({
        label: firstCategory.name,
        href: `/galerie?categorie=${firstCategory.slug}`,
      });
    }

    // Nom de l'œuvre (page courante)
    items.push({ label: product.name });

    return items;
  }, [product]);
}
