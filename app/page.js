// app/page.js
import Link from "next/link"; // Next.js Link bileşenini içeri aktarıyoruz.
// Eğer logo veya başka görseller kullanacaksanız Next.js Image bileşenini içeri aktarabilirsiniz.
// import Image from "next/image"; 

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900"> {/* Arkaplanı beyaz, varsayılan metni koyu gri yaptık */}

      {/* Hero Bölümü (En Üst Kısım) */}
      <section className="relative h-screen flex items-center justify-center bg-blue-600 text-white overflow-hidden p-8">
        {/* Arka plan görseli için degrade veya placeholder */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-500 opacity-90"></div>
        {/* Eğer logo görseli kullanacaksanız Image bileşenini buraya ekleyebilirsiniz */}
        {/* <Image src="/path/to/your/logo.png" alt="Zemta İnşaat Logo" width={150} height={150} className="absolute top-8 left-8" /> */}

        <div className="relative text-center z-10">
          {/* Ana Başlık */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold mb-4 leading-tight">
            Zemta İnşaat & Hafriyat
          </h1>
          {/* Slogan */}
          <p className="text-xl md:text-2xl lg:text-3xl font-medium mt-4">
            Toprağa değer, geleceğe yön verir.
          </p>
        </div>
      </section>

      {/* Hizmetler Bölümü */}
      <section className="w-full max-w-6xl mx-auto py-16 px-8 bg-gray-50"> {/* max-w-6xl merkezi hizalama için */}
        <h2 className="text-5xl font-extrabold text-center text-gray-900 mb-12 relative pb-4">
          Hizmetlerimiz
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-blue-600 rounded-full"></span> {/* Alt çizgi */}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* Hizmet Kartı 1: Çevre Düzenleme */}
          <div className="group relative w-full h-80 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer">
            {/* Arka plan görseli: public/images/hizmet-cevre.jpg olarak ayarlanmalı */}
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/hizmet-cevre.jpg')" }}></div>
            {/* Görselin üzerine metni okunur kılmak için şeffaf bir katman */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
            <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
              <h3 className="text-3xl font-bold mb-2">Çevre Düzenleme</h3>
              <p className="text-lg mb-4 leading-tight">Doğal dokularla modern yaşam alanları tasarlıyoruz. Peyzajdan izolasyona kadar kapsamlı çevre çözümleri.</p>
              <Link href="/detayli-bilgi/cevre-duzenleme" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300">
                Detaylı Bilgi
              </Link>
            </div>
          </div>

          {/* Hizmet Kartı 2: Elektrik Tesisatı */}
          <div className="group relative w-full h-80 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/hizmet-elektrik.jpg')" }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
            <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
              <h3 className="text-3xl font-bold mb-2">Elektrik Tesisatı</h3>
              <p className="text-lg mb-4 leading-tight">Bahçe aydınlatmadan mekanik tava pano sistemlerine kadar modern elektrik tesisat çözümleri.</p>
              <Link href="/detayli-bilgi/elektrik-tesisati" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300">
                Detaylı Bilgi
              </Link>
            </div>
          </div>

          {/* Hizmet Kartı 3: Karakalem Sanatı */}
          <div className="group relative w-full h-80 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/hizmet-karakale.jpg')" }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
            <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
              <h3 className="text-3xl font-bold mb-2">Karakalem Sanatı</h3>
              <p className="text-lg mb-4 leading-tight">Duvarlara değer katan özel portre çizimleri. Yaşlı, kadın, çocuk figürleriyle sanatı yaşam alanına taşı.</p>
              <Link href="/detayli-bilgi/karakale-sanati" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300">
                Detaylı Bilgi
              </Link>
            </div>
          </div>

          {/* Hizmet Kartı 4: Parke Döşeme */}
          <div className="group relative w-full h-80 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/hizmet-parke.jpg')" }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
            <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
              <h3 className="text-3xl font-bold mb-2">Parke Döşeme</h3>
              <p className="text-lg mb-4 leading-tight">Modern parke çözümleri, renk uyumu, teknik uygulama ve örnek çalışmalar.</p>
              <Link href="/detayli-bilgi/parke-doseme" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300">
                Detaylı Bilgi
              </Link>
            </div>
          </div>

          {/* Hizmet Kartı 5: E-Ticaret */}
          <div className="group relative w-full h-80 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/hizmet-eticaret.jpg')" }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
            <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
              <h3 className="text-3xl font-bold mb-2">E-Ticaret</h3>
              <p className="text-lg mb-4 leading-tight">Dekoratif kare yastıklar ve erkek gömlek koleksiyonu.</p>
              <Link href="/detayli-bilgi/e-ticaret" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300">
                Detaylı Bilgi
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Hakkımızda Bölümü */}
      <section className="py-16 px-8 bg-blue-50"> {/* Açık mavi arka plan */}
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8 text-gray-800">Hakkımızda</h2>
          <p className="mb-4 text-lg text-gray-700 leading-relaxed">
            Zemta İnşaat ve Hafriyat, köklü bir geçmişe ve yenilikçi bir vizyona sahip olan güçlü bir inşaat firmasıdır.
          </p>
          <p className="mb-4 text-lg text-gray-700 leading-relaxed">
            Temelleri 2000 yılında atılan Çınar İnşaat ve Hafriyat, 2019 yılında faaliyetlerine son vermiştir. Ancak, onun birikimi ve tecrübesi şimdi Zemta İnşaat ve Hafriyat çatısı altında çok daha büyük hedeflerle devam etmektedir.
          </p>
          <p className="mb-4 text-lg text-gray-700 leading-relaxed">
            20 yılı aşkın süredir Bursa ve çevresinde 1000’in üzerinde başarılı çevre düzenleme projesine imza atan firmamız, kaliteyi ve güveni merkezine alarak her geçen gün daha da büyümektedir.
          </p>
          <p className="mb-4 text-lg text-gray-700 leading-relaxed">
            Özellikle Podyum Park, Misi Köyü ve birçok büyük ölçekli projede çevre düzenlemesi, altyapı ve kazı çalışmalarını başarıyla tamamlayan eski firmamız Çınar İnşaat'ın mirası, bugün Zemta ile daha ileri taşınmaktadır.
          </p>
          <p className="mb-4 text-lg text-gray-700 leading-relaxed">
            Zemta, sadece geçmişin değil, geleceğin inşaat firmasıdır.
          </p>
          <p className="mb-4 text-lg text-gray-700 leading-relaxed">
            Kara kalem duvar sanatından e-ticaret çözümlerine, elektrik tesisatından modern parke döşemeye kadar geniş hizmet yelpazesiyle bireysel ve kurumsal müşterilere profesyonel çözümler sunmaktadır.
          </p>
          <p className="mb-4 text-lg text-gray-700 leading-relaxed font-semibold">
            "Toprağa değer, geleceğe yön verir." ilkesini benimseyerek;
          </p>
          <ul className="list-disc list-inside text-lg text-gray-700 mb-4 leading-relaxed mx-auto max-w-md">
            <li>Güvenilir</li>
            <li>Disiplinli</li>
            <li>Şeffaf</li>
            <li>Estetik odaklı</li>
          </ul>
          <p className="text-lg text-gray-700 font-bold mt-8">
            bir hizmet anlayışı sunarız.
          </p>
          <p className="text-xl text-gray-800 font-extrabold mt-8">
            Zemta: Temelden geleceğe.
          </p>
        </div>
      </section>

      {/* İletişim Bölümü */}
      <section className="py-16 px-8 bg-gray-100"> {/* Gri arka plan */}
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8 text-gray-800">Bize Ulaşın</h2>
          <div className="flex flex-col items-center justify-center space-y-4 text-lg text-gray-700">
            <p className="flex items-center">
              {/* İkonlar kaldırıldı, sadece metin bırakıldı */}
              <span className="mr-2">📞</span> Telefon:{" "}
              <a href="tel:+905373235900" className="text-blue-600 hover:underline ml-1">0537 323 5900</a>
            </p>
            <p className="flex items-center">
              {/* İkonlar kaldırıldı, sadece metin bırakıldı */}
              <span className="mr-2">📧</span> E-posta:{" "}
              <a href="mailto:zamtainsaat@gmail.com" className="text-blue-600 hover:underline ml-1">zamtainsaat@gmail.com</a>
            </p>
            <div className="mt-8">
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">Sosyal Medya Hesaplarımız</h3>
              <div className="flex justify-center space-x-6 text-blue-600">
                {/* Instagram (Sadece metin) */}
                <a href="https://www.instagram.com/zemtainsaat" target="_blank" rel="noopener noreferrer" className="hover:text-blue-800 transition duration-300 text-lg">
                  Instagram
                </a>
                {/* X (Twitter) (Sadece metin) */}
                <a href="https://twitter.com/zemtainsaatt" target="_blank" rel="noopener noreferrer" className="hover:text-blue-800 transition duration-300 text-lg">
                  X (Twitter)
                </a>
                {/* Facebook (Sadece metin) */}
                <a href="https://www.facebook.com/ZamtaInsaat" target="_blank" rel="noopener noreferrer" className="hover:text-blue-800 transition duration-300 text-lg">
                  Facebook
                </a>
                {/* YouTube (Sadece metin) */}
                <a href="https://www.youtube.com/results?search_query=Zamta+Insaat" target="_blank" rel="noopener noreferrer" className="hover:text-blue-800 transition duration-300 text-lg">
                  YouTube
                </a>
                {/* VSCO (Sadece metin) */}
                <a href="https://vsco.co/zamtainsaat" target="_blank" rel="noopener noreferrer" className="hover:text-blue-800 transition duration-300 text-lg">
                  VSCO
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Alt Kısım (Footer) */}
      <footer className="py-8 bg-gray-800 text-white text-center text-sm">
        <p>&copy; {new Date().getFullYear()} Zemta İnşaat ve Hafriyat. Tüm Hakları Saklıdır.</p>
      </footer>

    </main>
  );
}