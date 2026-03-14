import { useEffect } from "react";

const DEFAULT_SITE_NAME = "JustRentIt";
const DEFAULT_BASE_URL =
  import.meta.env.VITE_SITE_URL?.trim().replace(/\/$/, "") ||
  "https://justrentit-major.vercel.app";
const DEFAULT_OG_IMAGE = `${DEFAULT_BASE_URL}/jri-logo%20(3).svg`;

const ensureMetaTag = (selector, attributes) => {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });

  return element;
};

const ensureLinkTag = (selector, attributes) => {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("link");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });

  return element;
};

const absoluteUrl = (path = "/") => {
  if (!path) return DEFAULT_BASE_URL;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${DEFAULT_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

const Seo = ({
  title,
  description,
  path = "/",
  image = DEFAULT_OG_IMAGE,
  robots = "index,follow",
  keywords = [],
  type = "website",
  jsonLd,
}) => {
  useEffect(() => {
    const canonicalUrl = absoluteUrl(path);
    const resolvedTitle = title ? `${title} | ${DEFAULT_SITE_NAME}` : DEFAULT_SITE_NAME;
    const resolvedKeywords = Array.isArray(keywords) ? keywords.join(", ") : keywords;
    const resolvedImage = absoluteUrl(image);

    document.title = resolvedTitle;

    ensureMetaTag('meta[name="description"]', {
      name: "description",
      content: description,
    });
    ensureMetaTag('meta[name="robots"]', {
      name: "robots",
      content: robots,
    });
    ensureMetaTag('meta[name="keywords"]', {
      name: "keywords",
      content: resolvedKeywords,
    });
    ensureMetaTag('meta[property="og:title"]', {
      property: "og:title",
      content: resolvedTitle,
    });
    ensureMetaTag('meta[property="og:description"]', {
      property: "og:description",
      content: description,
    });
    ensureMetaTag('meta[property="og:type"]', {
      property: "og:type",
      content: type,
    });
    ensureMetaTag('meta[property="og:url"]', {
      property: "og:url",
      content: canonicalUrl,
    });
    ensureMetaTag('meta[property="og:image"]', {
      property: "og:image",
      content: resolvedImage,
    });
    ensureMetaTag('meta[property="og:site_name"]', {
      property: "og:site_name",
      content: DEFAULT_SITE_NAME,
    });
    ensureMetaTag('meta[name="twitter:card"]', {
      name: "twitter:card",
      content: "summary_large_image",
    });
    ensureMetaTag('meta[name="twitter:title"]', {
      name: "twitter:title",
      content: resolvedTitle,
    });
    ensureMetaTag('meta[name="twitter:description"]', {
      name: "twitter:description",
      content: description,
    });
    ensureMetaTag('meta[name="twitter:image"]', {
      name: "twitter:image",
      content: resolvedImage,
    });

    ensureLinkTag('link[rel="canonical"]', {
      rel: "canonical",
      href: canonicalUrl,
    });

    let structuredDataTag = document.head.querySelector('script[data-seo="json-ld"]');
    if (jsonLd) {
      if (!structuredDataTag) {
        structuredDataTag = document.createElement("script");
        structuredDataTag.type = "application/ld+json";
        structuredDataTag.setAttribute("data-seo", "json-ld");
        document.head.appendChild(structuredDataTag);
      }
      structuredDataTag.textContent = JSON.stringify(jsonLd);
    } else if (structuredDataTag) {
      structuredDataTag.remove();
    }
  }, [description, image, jsonLd, keywords, path, robots, title, type]);

  return null;
};

export default Seo;
export { absoluteUrl, DEFAULT_BASE_URL, DEFAULT_SITE_NAME };
