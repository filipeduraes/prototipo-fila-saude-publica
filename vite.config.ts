import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
    router: { basepath: "/prototipo-fila-saude-publica" },
    prerender: {
      enabled: true,
      crawlLinks: true,
      failOnError: false,
    },
    pages: [{ path: "/" }],
  },
  vite: {
    base: "/prototipo-fila-saude-publica/",
  },
  nitro: false,
});
