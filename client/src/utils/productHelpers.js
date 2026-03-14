const DEV_API_BASE_URL = "http://localhost:3001";
const INR_FORMATTER = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const getApiBaseUrl = () => {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, "");

  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  if (import.meta.env.DEV) {
    return DEV_API_BASE_URL;
  }

  console.error("Missing VITE_API_BASE_URL in production.");
  return "";
};

export const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  const normalizedValue = String(imagePath).trim();
  if (!normalizedValue) return "";
  if (normalizedValue.startsWith("https//")) return normalizedValue.replace(/^https\/\//, "https://");
  if (normalizedValue.startsWith("http//")) return normalizedValue.replace(/^http\/\//, "http://");
  if (normalizedValue.startsWith("//")) return `https:${normalizedValue}`;
  if (normalizedValue.startsWith("images.unsplash.com/")) return `https://${normalizedValue}`;
  if (normalizedValue.startsWith("photo-") && normalizedValue.includes("?")) {
    return `https://images.unsplash.com/${normalizedValue}`;
  }
  if (normalizedValue.startsWith("http")) return normalizedValue;
  const baseUrl = getApiBaseUrl();
  const normalizedPath = normalizedValue.startsWith("/") ? normalizedValue : `/${normalizedValue}`;
  return `${baseUrl}${normalizedPath}`;
};

export const getLocationLabel = (location) => {
  if (!location) return "Local";
  if (typeof location === "string") return location;

  const parts = [location.area, location.state, location.country].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "Local";
};

export const getCategoryLabel = (category, categoryMap = new Map()) => {
  if (!category) return "General";

  const resolveCategory = (value) => {
    if (!value) return "";
    if (typeof value === "string") return categoryMap.get(value) || value;
    if (typeof value === "object") {
      if (value.name) return value.name;
      if (value._id) return categoryMap.get(value._id) || "";
    }
    return "";
  };

  if (Array.isArray(category)) {
    const labels = category.map(resolveCategory).filter(Boolean);
    return labels.length > 0 ? labels.join(", ") : "General";
  }

  return resolveCategory(category) || "General";
};

export const normalizeListProduct = (product, categoryMap = new Map()) => ({
  _id: product?._id || "",
  name: product?.name || "Untitled Item",
  description: product?.description || "",
  images: Array.isArray(product?.images) ? product.images : [],
  rentalPrice: Number(product?.rentalPrice ?? product?.price ?? 0),
  rentalDuration: product?.rentalDuration || "day",
  rating: Number(product?.ratings?.averageRating ?? product?.rating ?? 0),
  reviews: Number(product?.ratings?.totalRatings ?? product?.reviews ?? 0),
  location: getLocationLabel(product?.location),
  category: getCategoryLabel(product?.category, categoryMap),
  available: product?.available !== false,
  authorDetails: product?.authorDetails || null,
});

export const normalizeDetailProduct = (product, categoryMap = new Map()) => {
  const normalized = normalizeListProduct(product, categoryMap);
  const author = product?.authorDetails || product?.userId || {};
  const chatUserId =
    author?._id?.toString?.() ||
    product?.userId?._id?.toString?.() ||
    (typeof product?.userId === "string" ? product.userId : "");

  return {
    ...normalized,
    securityDeposit: Number(product?.securityDeposit ?? 0),
    userId: {
      _id: chatUserId,
      name: author?.name || "Owner",
      profilePhoto: author?.profilePhoto || "",
      email: author?.email || "",
      phone: author?.phone || "",
    },
    verified: Boolean(product?.verified),
    chatUserId,
    authorDetails: {
      _id: chatUserId,
      name: author?.name || "Owner",
      profilePhoto: author?.profilePhoto || "",
      email: author?.email || "",
      phone: author?.phone || "",
      memberSince: author?.createdAt || "",
      completedRentals: author?.ratings?.count || 0,
    },
  };
};

export const formatINR = (value) => INR_FORMATTER.format(Number(value || 0));
