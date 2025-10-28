import Product from "../models/products";

export interface ApiProduct {
  position?: number;
  title: string;
  product_link: string;
  product_id: string;
  serpapi_product_api?: string;
  immersive_product_page_token?: string;
  serpapi_immersive_product_api?: string;
  source: string;
  source_icon?: string;
  multiple_sources?: boolean;
  price: string;
  extracted_price: number;
  old_price?: string;
  extracted_old_price?: number;
  rating: number;
  reviews: number;
  thumbnail?: string;
  serpapi_thumbnail?: string;
  delivery?: string;
  tag?: string;
  extensions?: string[];
  second_hand_condition?: string;
  // Legacy fields for backward compatibility
  product_title?: string;
  original_price?: string;
  product_offer_page_url?: string;
  on_sale?: boolean;
  discount_percent?: string;
  product_photo?: string;
  store_name?: string;
  store_favicon?: string;
  product_rating?: number;
  product_num_reviews?: number;
  shipping?: string;
}

export interface TransformedProduct {
  // Core product identification
  product_id: string;
  position?: number;

  // Product information
  title: string;
  product_title: string; // Keep for backward compatibility
  product_link: string;
  product_offer_page_url: string; // Keep for backward compatibility

  // API endpoints
  serpapi_product_api?: string;
  immersive_product_page_token?: string;
  serpapi_immersive_product_api?: string;

  // Store information
  source: string;
  store_name: string; // Keep for backward compatibility
  source_icon?: string;
  store_favicon?: string; // Keep for backward compatibility
  multiple_sources?: boolean;

  // Pricing information
  price: string;
  extracted_price: number;
  original_price?: string;
  old_price?: string;
  extracted_old_price?: number;
  on_sale: boolean;
  discount_percent?: string;

  // Product details
  product_photo?: string;
  thumbnail?: string;
  serpapi_thumbnail?: string;
  product_rating: number;
  rating: number; // Keep for backward compatibility
  product_num_reviews: number;
  reviews: number; // Keep for backward compatibility

  // Shipping and delivery
  shipping?: string;
  delivery?: string;

  // Additional information
  tag?: string;
  extensions?: string[];
  second_hand_condition?: string;

  // Search context
  search_query?: string;
  search_timestamp: Date;
}

/**
 * Transform API product data to database schema format
 */
export function transformApiProduct(
  apiProduct: ApiProduct,
  searchQuery?: string
): TransformedProduct {
  // Determine if product is on sale
  const isOnSale = !!(
    apiProduct.old_price ||
    apiProduct.extracted_old_price ||
    apiProduct.tag
  );

  // Calculate discount percentage if available
  let discountPercent: string | undefined;
  if (apiProduct.extracted_price && apiProduct.extracted_old_price) {
    const discount =
      ((apiProduct.extracted_old_price - apiProduct.extracted_price) /
        apiProduct.extracted_old_price) *
      100;
    discountPercent = `${Math.round(discount)}% OFF`;
  } else if (apiProduct.tag) {
    discountPercent = apiProduct.tag;
  }

  return {
    // Core product identification
    product_id: apiProduct.product_id,
    position: apiProduct.position,

    // Product information
    title: apiProduct.title,
    product_title: apiProduct.product_title || apiProduct.title, // Fallback to title
    product_link: apiProduct.product_link,
    product_offer_page_url:
      apiProduct.product_offer_page_url || apiProduct.product_link, // Fallback to product_link

    // API endpoints
    serpapi_product_api: apiProduct.serpapi_product_api,
    immersive_product_page_token: apiProduct.immersive_product_page_token,
    serpapi_immersive_product_api: apiProduct.serpapi_immersive_product_api,

    // Store information
    source: apiProduct.source,
    store_name: apiProduct.store_name || apiProduct.source, // Fallback to source
    source_icon: apiProduct.source_icon,
    store_favicon: apiProduct.store_favicon || apiProduct.source_icon, // Fallback to source_icon
    multiple_sources: apiProduct.multiple_sources,

    // Pricing information
    price: apiProduct.price,
    extracted_price: apiProduct.extracted_price,
    original_price: apiProduct.original_price,
    old_price: apiProduct.old_price,
    extracted_old_price: apiProduct.extracted_old_price,
    on_sale: isOnSale,
    discount_percent: discountPercent,

    // Product details
    product_photo: apiProduct.product_photo,
    thumbnail: apiProduct.thumbnail,
    serpapi_thumbnail: apiProduct.serpapi_thumbnail,
    product_rating: apiProduct.product_rating || apiProduct.rating || 0,
    rating: apiProduct.rating || apiProduct.product_rating || 0,
    product_num_reviews:
      apiProduct.product_num_reviews || apiProduct.reviews || 0,
    reviews: apiProduct.reviews || apiProduct.product_num_reviews || 0,

    // Shipping and delivery
    shipping: apiProduct.shipping,
    delivery: apiProduct.delivery,

    // Additional information
    tag: apiProduct.tag,
    extensions: apiProduct.extensions,
    second_hand_condition: apiProduct.second_hand_condition,

    // Search context
    search_query: searchQuery,
    search_timestamp: new Date(),
  };
}

/**
 * Transform multiple API products
 */
export function transformApiProducts(
  apiProducts: ApiProduct[],
  searchQuery?: string
): TransformedProduct[] {
  return apiProducts.map((product) =>
    transformApiProduct(product, searchQuery)
  );
}

/**
 * Extract numeric price from price string
 */
export function extractNumericPrice(priceString: string): number {
  if (!priceString) return 0;
  return parseFloat(priceString.replace(/[^0-9.]/g, ""));
}

/**
 * Extract discount percentage from discount string
 */
export function extractDiscountPercentage(discountString: string): number {
  if (!discountString) return 0;
  return parseFloat(discountString.replace(/[^0-9]/g, ""));
}

/**
 * Validate product data before saving
 */
export function validateProductData(product: TransformedProduct): boolean {
  return !!(
    product.product_id &&
    product.title &&
    product.price &&
    product.extracted_price &&
    product.product_link &&
    product.source
  );
}

/**
 * Create product filters for database queries
 */
export interface ProductFilters {
  search_query?: string;
  source?: string;
  store_name?: string;
  on_sale?: boolean;
  min_rating?: number;
  max_rating?: number;
  price_min?: number;
  price_max?: number;
  limit?: number;
  skip?: number;
  sort_by?: "price" | "rating" | "reviews" | "createdAt" | "position";
  sort_order?: "asc" | "desc";
}

export function buildProductQuery(filters: ProductFilters) {
  const query: any = {};

  if (filters.search_query) {
    query.$text = { $search: filters.search_query };
  }

  if (filters.source) {
    query.source = { $regex: filters.source, $options: "i" };
  }

  if (filters.store_name) {
    query.$or = [
      { store_name: { $regex: filters.store_name, $options: "i" } },
      { source: { $regex: filters.store_name, $options: "i" } },
    ];
  }

  if (filters.on_sale !== undefined) {
    query.on_sale = filters.on_sale;
  }

  if (filters.min_rating || filters.max_rating) {
    query.$or = [{ product_rating: {} }, { rating: {} }];
    if (filters.min_rating) {
      query.$or[0].product_rating.$gte = filters.min_rating;
      query.$or[1].rating.$gte = filters.min_rating;
    }
    if (filters.max_rating) {
      query.$or[0].product_rating.$lte = filters.max_rating;
      query.$or[1].rating.$lte = filters.max_rating;
    }
  }

  if (filters.price_min || filters.price_max) {
    query.extracted_price = {};
    if (filters.price_min) query.extracted_price.$gte = filters.price_min;
    if (filters.price_max) query.extracted_price.$lte = filters.price_max;
  }

  return query;
}

export function buildProductSort(
  sort_by: string = "createdAt",
  sort_order: string = "desc"
) {
  const sortOptions: any = {};

  switch (sort_by) {
    case "price":
      sortOptions.extracted_price = sort_order === "asc" ? 1 : -1;
      break;
    case "rating":
      sortOptions.$or = [
        { product_rating: sort_order === "asc" ? 1 : -1 },
        { rating: sort_order === "asc" ? 1 : -1 },
      ];
      break;
    case "reviews":
      sortOptions.$or = [
        { product_num_reviews: sort_order === "asc" ? 1 : -1 },
        { reviews: sort_order === "asc" ? 1 : -1 },
      ];
      break;
    case "position":
      sortOptions.position = sort_order === "asc" ? 1 : -1;
      break;
    default:
      sortOptions.createdAt = sort_order === "asc" ? 1 : -1;
  }

  return sortOptions;
}
