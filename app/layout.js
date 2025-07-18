import React from 'react';
import './globals.css'; // Tailwind CSS ve diğer global stiller buradan gelir

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Zemta İnşaat & Hafriyat</title>
        <meta name="description" content="Zemta İnşaat ve Hafriyat: Toprağa değer, geleceğe yön verir. Çevre düzenleme, elektrik tesisatı, karakalem sanatı, parke döşeme ve e-ticaret çözümleri." />
        {/* Tailwind CSS'i burada içe aktarıyoruz (genellikle globals.css'ten gelir) */}
        {/* Eğer globals.css dosyası yoksa veya Tailwind çalışmıyorsa, aşağıdaki style bloğunu kullanabilirsin.
            Ancak en doğrusu Tailwind'in globals.css üzerinden yüklenmesidir. */}
        {/* <style dangerouslySetInnerHTML={{ __html: `
          @tailwind base;
          @tailwind components;
          @tailwind utilities;

          @keyframes fadeInOut {
            0% { opacity: 0; transform: translateY(-10px); }
            10% { opacity: 1; transform: translateY(0); }
            90% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-10px); }
          }
          .animate-fadeInOut {
            animation: fadeInOut 10s ease-in-out forwards;
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fadeInUp {
            animation: fadeInUp 1s ease-out forwards;
          }
        `}} /> */}
      </head>
      <body>{children}</body>
    </html>
  );
}
