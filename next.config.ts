import type { NextConfig } from "next";
import { withEve } from "eve/next";

const nextConfig: NextConfig = {
  reactCompiler: true,
};

export default withEve(nextConfig);
