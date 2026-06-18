import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Float",
    short_name: "Float",
    description: "Know your daily float, what you can actually spend after rent, cards, goals, and quiet renewals.",
    start_url: "/app",
    display: "standalone",
    background_color: "#c7e5ef",
    theme_color: "#87dcfb",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
