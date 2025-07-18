# 1️⃣ Temel imaj
FROM node:20-alpine

# 2️⃣ Çalışma dizini
WORKDIR /app

# 3️⃣ package.json ve lock dosyasını kopyala
COPY package.json package-lock.json* ./

# 4️⃣ Bağımlılıkları yükle
RUN npm install

# 5️⃣ .env.local dosyasını da kopyala
COPY .env.local .env.local

# 6️⃣ Kalan tüm dosyaları kopyala
COPY . .

# 7️⃣ Portu aç
EXPOSE 3000

# 8️⃣ Uygulamayı başlat
CMD ["npm", "run", "dev"]
