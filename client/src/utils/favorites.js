const FAVORITES_STORAGE_KEY = "favoriteProductIds";

const readFavorites = () => {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const writeFavorites = (favorites) => {
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  window.dispatchEvent(new Event("favorites:changed"));
};

export const getFavoriteProductIds = () => readFavorites();

export const isFavoriteProduct = (productId) =>
  readFavorites().includes(String(productId));

export const toggleFavoriteProduct = (productId) => {
  const normalizedId = String(productId);
  const favorites = readFavorites();
  const nextFavorites = favorites.includes(normalizedId)
    ? favorites.filter((id) => id !== normalizedId)
    : [normalizedId, ...favorites];

  writeFavorites(nextFavorites);
  return nextFavorites;
};
