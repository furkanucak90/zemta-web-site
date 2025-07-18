# Dockerfile
# Node.js tabanlı bir imaj kullan (Next.js için önerilen)
FROM node:20-alpine AS base

# Bağımlılıkları yüklemek için çalışma dizinini ayarla
WORKDIR /app

# package.json ve package-lock.json dosyalarını kopyala
COPY package.json package-lock.json ./

# Bağımlılıkları yükle
RUN npm install

# Geliştirme ortamı için
FROM base AS development
COPY . .
CMD ["npm", "run", "dev"]

# Üretim ortamı için (build aşaması)
FROM base AS build
COPY . .
RUN npm run build

# Üretim ortamı için (çalıştırma aşaması)
FROM node:20-alpine AS runner
WORKDIR /app

# Üretim bağımlılıklarını yükle (sadece gerekli olanlar)
ENV NODE_ENV production
RUN npm install --omit=dev

# Build aşamasından .next klasörünü ve public klasörünü kopyala
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public

# package.json dosyasını kopyala (sadece start komutu için)
COPY package.json ./

# Sunucuyu başlat
CMD ["npm", "start"]
