// Types pour l'API Géoplateforme (geocodage IGN)
// https://data.geopf.fr/geocodage/search/
// Réponse au format GeoJSON FeatureCollection

/** Propriétés d'un résultat d'adresse retourné par l'API */
export interface GeocodingProperties {
  /** Label complet affiché (ex: "12 Rue de la Paix 75002 Paris") */
  label: string;
  /** Score de pertinence (0 à 1) */
  score: number;
  /** Numéro de voie */
  housenumber: string;
  /** Identifiant unique BAN */
  id: string;
  /** Type de résultat : housenumber, street, municipality, locality */
  type: string;
  /** Nom de la voie (ex: "Rue de la Paix") */
  street: string;
  /** Nom complet du résultat */
  name: string;
  /** Code postal */
  postcode: string;
  /** Code INSEE de la commune */
  citycode: string;
  /** Nom de la commune */
  city: string;
  /** Contexte géographique (ex: "75, Paris, Île-de-France") */
  context: string;
  /** Importance relative du lieu */
  importance: number;
}

/** Feature GeoJSON individuelle (un résultat d'adresse) */
export interface GeocodingFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [longitude: number, latitude: number];
  };
  properties: GeocodingProperties;
}

/** Réponse complète de l'API (FeatureCollection GeoJSON) */
export interface GeocodingResponse {
  type: "FeatureCollection";
  version: string;
  features: GeocodingFeature[];
  attribution: string;
  licence: string;
  query: string;
  limit: number;
}

/** Adresse structurée extraite d'une suggestion */
export interface ParsedAddress {
  /** Numéro + rue (ex: "12 Rue de la Paix") */
  line1: string;
  /** Code postal */
  postalCode: string;
  /** Ville */
  city: string;
}
