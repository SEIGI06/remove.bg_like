/** @type {import('next').NextConfig} */
const nextConfig = {
    // Sharp and onnxruntime are server components.
    // Since we removed Sharp from direct usage, strict conflict config might be less critical 
    // but onnxruntime still needs to be handled.
    serverExternalPackages: ['onnxruntime-node'], 
    webpack: (config) => {
        config.resolve.alias = {
            ...config.resolve.alias,
            "onnxruntime-node$": "onnxruntime-node",
        }
        return config;
    },
};

export default nextConfig;
