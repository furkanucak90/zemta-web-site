'use client'; // Bu direktif dosyanın en üstünde olmalı

export default function Error({ error, reset }) {
  // Bu hata bileşeni, Next.js'in hata sınırları özelliği için kullanılır.
  // Bir bileşende veya alt bileşenlerinde bir hata oluştuğunda bu bileşen render edilir.
  // `error` objesi hatanın detaylarını içerir.
  // `reset` fonksiyonu, hata sınırını sıfırlayarak uygulamanın tekrar denemesini sağlar.
  console.error("Uygulama genelinde bir hata yakalandı:", error);

  return (
    <html lang="tr"> {/* HTML dilini Türkçe olarak ayarla */}
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Hata Oluştu - Zemta İnşaat</title>
        {/* Tailwind CSS CDN'i buraya eklenmez, globals.css tarafından yönetilir */}
      </head>
      <body className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-100 to-red-200 text-gray-800 p-6 font-sans">
        <div className="bg-white p-10 rounded-xl shadow-2xl text-center max-w-md w-full border-t-4 border-red-500">
          <h2 className="text-4xl font-extrabold text-red-700 mb-4">Oops! Bir Hata Oluştu.</h2>
          <p className="text-lg mb-6 text-gray-700">
            Beklenmedik bir sorunla karşılaştık. Lütfen aşağıdaki hata mesajını kontrol edin.
          </p>
          <pre className="bg-gray-100 p-4 rounded-lg text-sm text-left overflow-x-auto whitespace-pre-wrap break-words mb-6 border border-gray-300">
            {error.message || "Bilinmeyen bir hata oluştu."}
          </pre>
          <button
            onClick={() => reset()} // reset() fonksiyonu hata sınırını sıfırlar
            className="px-8 py-4 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 text-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            Tekrar Deneyin
          </button>
          <p className="mt-6 text-sm text-gray-500">
            Sorun devam ederse lütfen yöneticinizle iletişime geçin.
          </p>
        </div>
      </body>
    </html>
  );
}
