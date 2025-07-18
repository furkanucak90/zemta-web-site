// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Bu satır, Image bileşeninin harici domainlerden görsel yüklemesine izin verir.
  // Kendi domainlerinizi buraya eklemelisiniz.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co', // placeholder resimler için
        port: '',
        pathname: '/**',
      },
      // Eğer başka harici resim kaynakları kullanıyorsanız buraya ekleyin
      // {
      //   protocol: 'https',
      //   hostname: 'example.com',
      // },
    ],
  },
  // Bu ayar, Next.js'in dosya uzantılarını nasıl işleyeceğini belirtir.
  // Eğer .mjs kullanıyorsanız, bu ayar önemlidir.
  experimental: {
    esmExternals: true,
  },
};

export default nextConfig;
