/** @type {import('next').NextConfig} */
const nextConfig = {
  // Usar output: 'export' solo para producción
  ...(process.env.NODE_ENV === 'production' && { output: 'export' }),
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  images: { 
    unoptimized: true 
  },
  
  // Optimizaciones para Windows
  experimental: {
    // Desactivar incremental cache que puede causar problemas en Windows
    isrMemoryCacheSize: 0,
  },
  
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
      
      // Configuración adicional para Windows
      config.watchOptions = {
        ...config.watchOptions,
        poll: 1000, // Polling cada 1 segundo en lugar de usar file system events
        aggregateTimeout: 300,
      };
    }
    
    // Ignorar warnings críticos
    config.ignoreWarnings = [
      /Critical dependency: the request of a dependency is an expression/,
    ];
    
    return config;
  },
};

module.exports = nextConfig;
