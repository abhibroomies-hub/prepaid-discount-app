/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*"],
  serverModuleFormat: "esm",
  future: {
    v3_fetcherPersist: true,
    v3_relativeSplats: true,
    v3_throwAbortReason: true,
    v3_lazyRouteDiscovery: true,
  },
};
