import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@cloud/ui", "@cloud/console-runtime"],
};

export default nextConfig;
