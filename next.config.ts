import type {NextConfig} from "next";

const path = require('path');
const nextConfig: NextConfig = {
    /* config options here */
    reactCompiler: true,
    reactStrictMode: true,
    sassOptions: {
        includePaths: [path.join(__dirname, 'styles')],
        // This prepends the @use statement to every SCSS file
        // Use the appropriate path alias for your project
        prependData: `@use "@/styles/_mixins.scss" as m;`,
    },
};

export default nextConfig;
