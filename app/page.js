"use client"; // Bu satır, React Hook'larını kullanmak için gerekli!

// app/page.js
import Link from "next/link"; // Next.js Link bileşenini içeri aktarıyoruz.
import Image from "next/image"; // Görsel kullanacağımız için Image bileşenini içeri aktarıyoruz.
import { useState } from "react"; // Form adımlarını yönetmek için useState hook'u
import { Phone, Mail, ChevronRight } from "lucide-react"; // Telefon ve E-posta ikonları için

export default function Home() {
  // Form durumu yönetimi
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedMainService, setSelectedMainService] = useState(null);
  const [selectedSubService, setSelectedSubService] = useState(null);
  const [answers, setAnswers] = useState({});
  const [contactInfo, setContactInfo] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  // Hizmet verileri
  const servicesData = {
    "Çevre Düzenleme": {
      subCategories: [
        { name: "Peyzaj", questions: ["Kaç metrekare?", "Mevcut durum nedir?", "Özel istekleriniz var mı?"] },
        { name: "Drenaj", questions: ["Kaç metrekare?", "Sorunlu alanın genişliği nedir?", "Mevcut drenaj sistemi var mı?"] },
        { name: "Sulama Sistemleri", questions: ["Kaç metrekare?", "Ne tür bir sulama sistemi düşünüyorsunuz?", "Su kaynağı mevcut mu?"] },
        { name: "İzolasyon", questions: ["Kaç metrekare?", "Hangi tür izolasyona ihtiyacınız var?", "Mevcut yalıtım durumu nedir?"] },
      ],
    },
    "Elektrik Tesisatı": {
      subCategories: [
        { name: "İç Tesisat", questions: ["Kaç metrekare?", "Ne tür bir yapı için?", "Ek özel talepleriniz var mı?"] },
        { name: "Dış Tesisat", questions: ["Proje alanı kaç metrekare?", "Hangi amaçla kullanılacak?", "Mevcut altyapı durumu nedir?"] },
        { name: "Aydınlatma Sistemleri", questions: ["Hangi alanlar için aydınlatma gerekiyor?", "Ne tür bir atmosfer arıyorsunuz?", "Enerji verimliliği önceliğiniz mi?"] },
      ],
    },
    "Karakalem Sanatı": {
      subCategories: [
        { name: "Portre Çizimi", questions: ["Kaç kişi çizilecek?", "Fotoğraf kalitesi nasıl?", "Özel detaylar (aksesuar, arka plan) var mı?"] },
        { name: "Duvar Resmi", questions: ["Duvarın boyutu nedir?", "Hangi tema veya konsept düşünülüyor?", "Uygulama alanı (iç/dış mekan) nedir?"] },
      ],
    },
    "Parke Döşeme": {
      subCategories: [
        { name: "Laminat Parke", questions: ["Kaç metrekare?", "Hangi oda/alan için?", "Mevcut zemin durumu nedir?"] },
        { name: "Masif Parke", questions: ["Kaç metrekare?", "Hangi ağaç türünü tercih edersiniz?", "Uygulama alanı (ev/ofis) nedir?"] },
      ],
    },
    "E-Ticaret": {
      subCategories: [
        { name: "Dekoratif Yastıklar", questions: ["Kaç adet?", "Hangi desen veya renkler?", "Özel tasarım talebi var mı?"] },
        { name: "Erkek Gömlekleri", questions: ["Kaç adet?", "Hangi bedenler?", "Özel tasarım talebi var mı?"] },
      ],
    },
  };

  const handleMainServiceSelect = (serviceName) => {
    setSelectedMainService(serviceName);
    setSelectedSubService(null); // Alt hizmeti sıfırla
    setAnswers({}); // Cevapları sıfırla
    setCurrentStep(2);
  };

  const handleSubServiceSelect = (subService) => {
    setSelectedSubService(subService);
    setAnswers({}); // Cevapları sıfırla
    setCurrentStep(3);
  };

  const handleAnswerChange = (questionIndex, value) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: value }));
  };

  const handleContactInfoChange = (e) => {
    setContactInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Burada form verilerini gönderme işlemi yapılabilir (örneğin bir API'ye)
    console.log("Form Gönderildi:", {
      mainService: selectedMainService,
      subService: selectedSubService,
      answers: answers,
      contactInfo: contactInfo,
    });
    // alert yerine daha profesyonel bir mesaj kutusu kullanılabilir (örneğin bir modal)
    alert("Talebiniz başarıyla alınmıştır. En kısa sürede sizinle iletişime geçeceğiz.");
    // Formu sıfırla
    setCurrentStep(1);
    setSelectedMainService(null);
    setSelectedSubService(null);
    setAnswers({});
    setContactInfo({ name: "", email: "", phone: "", message: "" });
  };

  const currentQuestions = selectedSubService
    ? servicesData[selectedMainService]?.subCategories.find(
        (sub) => sub.name === selectedSubService
      )?.questions || []
    : [];

  const isStep1Complete = selectedMainService !== null;
  const isStep2Complete = selectedSubService !== null;
  const isStep3Complete = currentQuestions.every(
    (_, index) => answers[index] && answers[index].trim() !== ""
  );
  const isStep4Complete =
    contactInfo.name.trim() !== "" &&
    contactInfo.email.trim() !== "" &&
    contactInfo.phone.trim() !== "" &&
    contactInfo.message.trim() !== "";

  return (
    <main className="min-h-screen bg-white text-gray-900 flex flex-col items-center"> {/* Arkaplanı beyaz, varsayılan metni koyu gri yaptık, flex ile dikeyde ortalama */}

      {/* Hero Bölümü (En Üst Kısım) */}
      <section className="relative h-screen w-full flex items-center justify-center bg-blue-600 text-white overflow-hidden p-8">
        {/* Arka plan görseli - Placeholder, gerçek görsel yolu buraya gelecek */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-500 opacity-90"></div>

        <div className="relative text-center z-10 p-4"> {/* İç boşluk ekledim */}
          {/* Ana Başlık */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold mb-4 leading-tight">
            Zemta İnşaat &amp; Hafriyat
          </h1>
          {/* Slogan */}
          <p className="text-xl md:text-2xl lg:text-3xl font-medium mt-4 max-w-3xl mx-auto"> {/* Max genişlik ve ortalama */}
            Toprağa değer, geleceğe yön verir.
          </p>
        </div>
      </section>

      {/* HİZMETLER BÖLÜMÜ - İSTEDİĞİN GÖRSELLİ KUTUCUKLAR VE METİN HİZALAMALARI DÜZELTİLMİŞ HALİ */}
      <section className="w-full max-w-6xl mx-auto py-16 px-8"> {/* mx-auto ile ortalama, py ve px ile boşluk */}
        <h2 className="text-5xl font-extrabold text-center text-gray-900 mb-12 relative pb-4">
          Hizmetlerimiz
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-blue-600 rounded-full"></span> {/* Alt çizgi */}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* Hizmet Kartı 1: Çevre Düzenleme */}
          <div className="group relative w-full h-80 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/hizmet-cevre.jpg')" }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
            <div className="absolute inset-0 flex flex-col justify-end p-6 text-white text-center"> {/* text-center eklendi */}
              <h3 className="text-3xl font-bold mb-2">Çevre Düzenleme</h3>
              <p className="text-lg mb-4 leading-tight">Doğal dokularla modern yaşam alanları tasarlıyoruz. Peyzajdan izolasyona kadar kapsamlı çevre çözümleri.</p>
              <Link href="/cevre-duzenleme" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300">
                Detaylı Bilgi
              </Link>
            </div>
          </div>

          {/* Hizmet Kartı 2: Elektrik Tesisatı */}
          <div className="group relative w-full h-80 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/hizmet-elektrik.jpg')" }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
            <div className="absolute inset-0 flex flex-col justify-end p-6 text-white text-center"> {/* text-center eklendi */}
              <h3 className="text-3xl font-bold mb-2">Elektrik Tesisatı</h3>
              <p className="text-lg mb-4 leading-tight">Bahçe aydınlatmadan mekanik tava pano sistemlerine kadar modern elektrik tesisat çözümleri.</p>
              <Link href="/elektrik-tesisati" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300">
                Detaylı Bilgi
              </Link>
            </div>
          </div>

          {/* Hizmet Kartı 3: Karakalem Sanatı */}
          <div className="group relative w-full h-80 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/hizmet-karakalem.jpg')" }}></div> {/* Görsel yolu düzeltildi */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
            <div className="absolute inset-0 flex flex-col justify-end p-6 text-white text-center"> {/* text-center eklendi */}
              <h3 className="text-3xl font-bold mb-2">Karakalem Sanatı</h3>
              <p className="text-lg mb-4 leading-tight">Duvarlara değer katan özel portre çizimleri. Yaşlı, kadın, çocuk figürleriyle sanatı yaşam alanına taşı.</p>
              <Link href="/karakalem-sanati" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300">
                Detaylı Bilgi
              </Link>
            </div>
          </div>

          {/* Hizmet Kartı 4: Parke Döşeme */}
          <div className="group relative w-full h-80 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/hizmet-parke.jpg')" }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
            <div className="absolute inset-0 flex flex-col justify-end p-6 text-white text-center"> {/* text-center eklendi */}
              <h3 className="text-3xl font-bold mb-2">Parke Döşeme</h3>
              <p className="text-lg mb-4 leading-tight">Modern parke çözümleri, renk uyumu, teknik uygulama ve örnek çalışmalar.</p>
              <Link href="/parke-doseme" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300">
                Detaylı Bilgi
              </Link>
            </div>
          </div>

          {/* Hizmet Kartı 5: E-Ticaret */}
          <div className="group relative w-full h-80 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/hizmet-eticaret.jpg')" }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
            <div className="absolute inset-0 flex flex-col justify-end p-6 text-white text-center"> {/* text-center eklendi */}
              <h3 className="text-3xl font-bold mb-2">E-Ticaret</h3>
              <p className="text-lg mb-4 leading-tight">Dekoratif kare yastıklar ve erkek gömlek koleksiyonu.</p>
              <Link href="/e-ticaret" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300">
                Detaylı Bilgi
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Hakkımızda Bölümü */}
      <section className="py-16 px-8 bg-blue-50 w-full">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8 text-gray-800">Hakkımızda</h2>
          <p className="mb-4 text-lg text-gray-700 leading-relaxed">
            Zemta İnşaat ve Hafriyat, köklü bir geçmişe ve yenilikçi bir vizyona sahip olan güçlü bir inşaat firmasıdır.
          </p>
          <p className="mb-4 text-lg text-gray-700 leading-relaxed">
            Temelleri 2000 yılında atılan Çınar İnşaat ve Hafriyat, 2019 yılında faaliyetlerine son vermiştir. Ancak, onun birikimi ve tecrübesi şimdi Zemta İnşaat ve Hafriyat çatısı altında çok daha büyük hedeflerle devam etmektedir.
          </p>
          <p className="mb-4 text-lg text-gray-700 leading-relaxed">
            20 yılı aşkın süredir Bursa ve çevresinde 1000&apos;in üzerinde başarılı çevre düzenleme projesine imza atan firmamız, kaliteyi ve güveni merkezine alarak her geçen gün daha da büyümektedir.
          </p>
          <p className="mb-4 text-lg text-gray-70ed leading-relaxed">
            Özellikle Podyum Park, Misi Köyü ve birçok büyük ölçekli projede çevre düzenlemesi, altyapı ve kazı çalışmalarını başarıyla tamamlayan eski firmamız Çınar İnşaat&apos;ın mirası, bugün Zemta ile daha ileri taşınmaktadır.
          </p>
          <p className="mb-4 text-lg text-gray-700 leading-relaxed">
            Zemta, sadece geçmişin değil, geleceğin inşaat firmasıdır.
          </p>
          <p className="mb-4 text-lg text-gray-700 leading-relaxed">
            Kara kalem duvar sanatından e-ticaret çözümlerine, elektrik tesisatından modern parke döşemeye kadar geniş hizmet yelpazesiyle bireysel ve kurumsal müşterilere profesyonel çözümler sunmaktadır.
          </p>
          <p className="mb-4 text-lg text-gray-700 font-semibold leading-relaxed">
            &quot;Toprağa değer, geleceğe yön verir.&quot; ilkesini benimseyerek;
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

      {/* BİZE ULAŞIN BÖLÜMÜ - YENİ İKONLAR VE ÇOK ADIMLI FORM */}
      <section className="py-16 px-8 bg-gray-100 w-full">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8 text-gray-800">Bize Ulaşın</h2>

          {/* İletişim Bilgileri - İkonlarla */}
          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8 text-lg text-gray-700 mb-12">
            <p className="flex items-center">
              <Phone className="mr-2 text-blue-600" size={24} /> Telefon:{" "}
              <a href="tel:+905373235900" className="text-blue-600 hover:underline ml-1">0537 323 5900</a>
            </p>
            <p className="flex items-center">
              <Mail className="mr-2 text-blue-600" size={24} /> E-posta:{" "}
              <a href="mailto:zamtainsaat@gmail.com" className="text-blue-600 hover:underline ml-1">zamtainsaat@gmail.com</a>
            </p>
          </div>

          {/* Sosyal Medya Hesapları (Metin olarak, ikonlar için Font Awesome CDN eklenmeli) */}
          <div className="mt-8 mb-12">
            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Sosyal Medya Hesaplarımız</h3>
            <div className="flex justify-center space-x-6 text-blue-600">
              <a href="https://www.instagram.com/zemtainsaat" target="_blank" rel="noopener noreferrer" className="hover:text-blue-800 transition duration-300 text-lg">
                Instagram
              </a>
              <a href="https://twitter.com/zemtainsaatt" target="_blank" rel="noopener noreferrer" className="hover:text-blue-800 transition duration-300 text-lg">
                X (Twitter)
              </a>
              <a href="https://www.facebook.com/ZamtaInsaat" target="_blank" rel="noopener noreferrer" className="hover:text-blue-800 transition duration-300 text-lg">
                Facebook
              </a>
              <a href="https://www.youtube.com/results?search_query=Zamta+Insaat" target="_blank" rel="noopener noreferrer" className="hover:text-blue-800 transition duration-300 text-lg">
                YouTube
              </a>
              <a href="https://vsco.co/zamtainsaat" target="_blank" rel="noopener noreferrer" className="hover:text-blue-800 transition duration-300 text-lg">
                VSCO
              </a>
            </div>
          </div>

          {/* Çok Adımlı Hizmet Talep Formu */}
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl mx-auto">
            <h3 className="text-3xl font-bold text-gray-800 mb-6">Hizmet Talep Formu</h3>

            <form onSubmit={handleSubmit}>
              {/* Adım 1: Ana Hizmet Seçimi */}
              {currentStep === 1 && (
                <div>
                  <p className="text-xl font-semibold mb-4 text-gray-700">1. Hangi ana hizmetimizle ilgileniyorsunuz?</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.keys(servicesData).map((serviceName) => (
                      <button
                        key={serviceName}
                        type="button"
                        onClick={() => handleMainServiceSelect(serviceName)}
                        className={`py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                          selectedMainService === serviceName
                            ? "bg-blue-700 text-white shadow-md"
                            : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                        }`}
                      >
                        {serviceName}
                        <ChevronRight className="inline-block ml-2" size={18} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Adım 2: Alt Hizmet Seçimi (Ana hizmet seçildiyse görünür) */}
              {currentStep === 2 && selectedMainService && (
                <div className="mt-8">
                  <p className="text-xl font-semibold mb-4 text-gray-700">2. {selectedMainService} kapsamında hangi alt hizmeti seçmek istersiniz?</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {servicesData[selectedMainService]?.subCategories.map((sub) => (
                      <button
                        key={sub.name}
                        type="button"
                        onClick={() => handleSubServiceSelect(sub.name)}
                        className={`py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                          selectedSubService === sub.name
                            ? "bg-blue-700 text-white shadow-md"
                            : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                        }`}
                      >
                        {sub.name}
                        <ChevronRight className="inline-block ml-2" size={18} />
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="mt-6 bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400 transition duration-300"
                  >
                    Geri
                  </button>
                </div>
              )}

              {/* Adım 3: Hizmete Özel Sorular (Alt hizmet seçildiyse görünür) */}
              {currentStep === 3 && selectedSubService && (
                <div className="mt-8">
                  <p className="text-xl font-semibold mb-4 text-gray-700">3. Lütfen aşağıdaki soruları yanıtlayın:</p>
                  {currentQuestions.map((question, index) => (
                    <div key={index} className="mb-4">
                      <label htmlFor={`question-${index}`} className="block text-gray-700 text-lg font-medium mb-2">
                        {question}
                      </label>
                      <input
                        type="text"
                        id={`question-${index}`}
                        name={`question-${index}`}
                        value={answers[index] || ""}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  ))}
                  <div className="flex justify-between mt-6">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400 transition duration-300"
                    >
                      Geri
                    </button>
                    <button
                      type="button"
                      onClick={() => isStep3Complete && setCurrentStep(4)}
                      disabled={!isStep3Complete}
                      className={`px-6 py-3 rounded-lg font-semibold transition duration-300 ${
                        isStep3Complete ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-300 text-gray-600 cursor-not-allowed"
                      }`}
                    >
                      Devam <ChevronRight className="inline-block ml-2" size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* Adım 4: İletişim Bilgileri ve Mesaj */}
              {currentStep === 4 && (
                <div className="mt-8">
                  <p className="text-xl font-semibold mb-4 text-gray-700">4. İletişim Bilgileriniz ve Mesajınız:</p>
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-gray-700 text-lg font-medium mb-2">
                      İsim Soyisim
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={contactInfo.name}
                      onChange={handleContactInfoChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 text-lg font-medium mb-2">
                      E-posta
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={contactInfo.email}
                      onChange={handleContactInfoChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="phone" className="block text-gray-700 text-lg font-medium mb-2">
                      Telefon Numarası
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={contactInfo.phone}
                      onChange={handleContactInfoChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="message" className="block text-gray-700 text-lg font-medium mb-2">
                      Mesajınız / İş Detayları
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={contactInfo.message}
                      onChange={handleContactInfoChange}
                      rows="5"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    ></textarea>
                  </div>
                  <div className="flex justify-between mt-6">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400 transition duration-300"
                    >
                      Geri
                    </button>
                    <button
                      type="submit"
                      disabled={!isStep4Complete}
                      className={`px-6 py-3 rounded-lg font-semibold transition duration-300 ${
                        isStep4Complete ? "bg-green-600 text-white hover:bg-green-700" : "bg-gray-300 text-gray-600 cursor-not-allowed"
                      }`}
                    >
                      Talebi Gönder
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Alt Kısım (Footer) */}
      <footer className="py-8 bg-gray-800 text-white text-center text-sm w-full">
        <p>&copy; {new Date().getFullYear()} Zemta İnşaat ve Hafriyat. Tüm Hakları Saklıdır.</p>
      </footer>

    </main>
  );
}
