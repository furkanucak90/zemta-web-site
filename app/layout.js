// app/layout.js
import './globals.css'; // Global CSS dosyanızı import ediyoruz

export const metadata = {
  title: 'Zemta İnşaat ve Hafriyat', // Web sitenizin başlığı
  description: 'Toprağa değer, geleceğe yön verir.', // Web sitenizin açıklaması
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        {/* Buraya artık Font Awesome CDN linki eklenmeyecek */}
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}