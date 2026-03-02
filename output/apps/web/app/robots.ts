import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/report/", "/success"],
    },
    sitemap: "https://offerintegrity.io/sitemap.xml",
  };
}
