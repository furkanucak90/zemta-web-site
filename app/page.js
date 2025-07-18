'use client'; // Bu satır ÇOK ÖNEMLİ! Bu dosyayı istemci tarafı bileşeni yapar.

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

// Firebase importları utils/firebase.js dosyasından geliyor
import { auth, db } from '../utils/firebase'; // Düzeltilmiş yol: app klasöründen root'a (..), sonra utils'a

// Firebase fonksiyonlarını içe aktar
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, addDoc, onSnapshot, deleteDoc, doc } from 'firebase/firestore';

// Lucide-react ikonları dinamik olarak içeri aktarılıyor
const Phone = dynamic(() => import("lucide-react").then(mod => mod.Phone), { ssr: false });
const Mail = dynamic(() => import("lucide-react").then(mod => mod.Mail), { ssr: false });
const ChevronRight = dynamic(() => import("lucide-react").then(mod => mod.ChevronRight), { ssr: false });
const CheckCircle = dynamic(() => import("lucide-react").then(mod => mod.CheckCircle), { ssr: false });
const XCircle = dynamic(() => import("lucide-react").then(mod => mod.XCircle), { ssr: false });
const Loader = dynamic(() => import("lucide-react").then(mod => mod.Loader), { ssr: false });
const AlertCircle = dynamic(() => import("lucide-react").then(mod => mod.AlertCircle), { ssr: false });
const Trash2 = dynamic(() => import("lucide-react").then(mod => mod.Trash2), { ssr: false });
const Eye = dynamic(() => import("lucide-react").then(mod => mod.Eye), { ssr: false });
const LogOut = dynamic(() => import("lucide-react").then(mod => mod.LogOut), { ssr: false });


// Ana Uygulama Bileşeni (Routing'i yönetir)
export default function App() {
  const router = useRouter();
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    // Client tarafında path'i al
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
    }
  }, [router]);

  // Firebase global değişkenlerini tanımla (Canvas ortamı için)
  // Eğer Canvas ortamında çalışmıyorsa 'default-app-id' kullanır
  const __app_id = typeof window !== 'undefined' && window.__app_id ? window.__app_id : 'default-app-id';

  // Basit yönlendirme mantığı
  if (currentPath === '/admin/login') {
    return <AdminLoginPage auth={auth} router={router} />;
  }
  if (currentPath === '/admin') {
    return <AdminPage auth={auth} db={db} router={router} __app_id={__app_id} />;
  }

  // Varsayılan olarak ana sayfayı render et
  return <HomePage auth={auth} db={db} __app_id={__app_id} />;
}


// --- HomePage Bileşeni ---
function HomePage({ auth, db, __app_id }) {
  const [userId, setUserId] = useState(null);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedMainService, setSelectedMainService] = useState(null);
  const [selectedSubService, setSelectedSubService] = useState(null); // Hata burada düzeltildi!
  const [answers, setAnswers] = useState({});
  const [contactInfo, setContactInfo] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  useEffect(() => {
    if (db && auth) {
      setIsFirebaseReady(true);
      console.log("[HomePage Firebase Init] Firebase (db ve auth) hazır.");
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setUserId(user.uid);
          console.log("[HomePage Auth State] Kullanıcı oturum açtı:", user.uid);
        } else {
          setUserId(null);
          console.log("[HomePage Auth State] Kullanıcı oturum açmadı (anonim veya çıkış yapıldı).");
        }
      });
      return () => unsubscribe();
    } else {
      console.warn("[HomePage Firebase Init] Firebase (db veya auth) henüz başlatılmadı. Bekleniyor...");
    }
  }, [db, auth]);

  const servicesData = {
    "Çevre Düzenleme": {
      subCategories: [
        { name: "Peyzaj", questions: ["Kaç metrekarelik bir alan için peyzaj düzenlemesi düşünüyorsunuz?", "Mevcut arazi durumu nedir (eğim, bitki örtüsü vb.)?", "Özel istekleriniz veya ilham aldığınız bir tasarım var mı?"] },
        { name: "Drenaj", questions: ["Sorunlu alanın yaklaşık genişliği nedir?", "Su birikintisi ne zamanlar oluşuyor (yağmur sonrası, sürekli vb.)?", "Mevcut bir drenaj sistemi var mıydı?"] },
        { name: "Sulama Sistemleri", questions: ["Kaç metrekarelik bir alanı sulamak istiyorsunuz?", "Ne tür bir sulama sistemi düşünüyorsunuz (damla, sprey, otomatik vb.)?", "Su kaynağı (şebeke, kuyu vb.) mevcut mu?"] },
        { name: "İzolasyon", questions: ["Kaç metrekarelik bir alanda izolasyona ihtiyacınız var?", "Hangi tür izolasyona ihtiyacınız var (su, ısı, ses)?", "Mevcut yalıtım durumu nedir ve sorun ne zaman başladı?"] },
      ],
    },
    "Elektrik Tesisatı": {
      subCategories: [
        { name: "İç Tesisat", questions: ["Kaç metrekarelik bir yapı için iç tesisat gerekiyor?", "Ne tür bir yapı (ev, ofis, dükkan) için?", "Ek özel talepleriniz (akıllı ev sistemi, özel aydınlatma) var mı?"] },
        { name: "Dış Tesisat", questions: ["Proje alanı kaç metrekare?", "Hangi amaçla kullanılacak (bahçe, otopark, yol)?", "Mevcut altyapı durumu nedir ve topraklama var mı?"] },
        { name: "Aydınlatma Sistemleri", questions: ["Hangi alanlar için aydınlatma gerekiyor (iç/dış mekan, bahçe, salon)?", "Ne tür bir atmosfer arıyorsunuz (parlak, loş, renkli)?", "Enerji verimliliği sizin için bir öncelik mi?"] },
      ],
    },
    "Karakalem Sanatı": {
      subCategories: [
        { name: "Portre Çizimi", questions: ["Kaç kişi çizilecek?", "Çizim için kullanacağınız fotoğrafın kalitesi nasıl?", "Özel detaylar (aksesuar, arka plan, kıyafet) var mı?"] },
        { name: "Duvar Resmi", questions: ["Duvarın boyutu nedir (genişlik x yükseklik)?", "Hangi tema veya konsept düşünülüyor (doğa, soyut, figüratif)?", "Uygulama alanı (iç mekan/dış mekan) ve duvarın malzemesi nedir?"] },
      ],
    },
    "Parke Döşeme": {
      subCategories: [
        { name: "Laminat Parke", questions: ["Kaç metrekarelik bir alana laminat parke döşenecek?", "Hangi oda/alan için (salon, yatak odası, ofis)?", "Mevcut zemin durumu nedir (düz, eğimli, eski parke var mı)?"] },
        { name: "Masif Parke", questions: ["Kaç metrekarelik bir alana masif parke döşenecek?", "Hangi ağaç türünü tercih edersiniz (meşe, çam, ceviz)?", "Uygulama alanı (ev/ofis) ve nem durumu nedir?"] },
      ],
    },
    "E-Ticaret": {
      subCategories: [
        { name: "Dekoratif Yastıklar", questions: ["Kaç adet yastık sipariş etmek istiyorsunuz?", "Hangi desen veya renkleri tercih edersiniz?", "Özel tasarım talebi veya logo ekleme gibi istekleriniz var mı?"] },
        { name: "Erkek Gömlekleri", questions: ["Kaç adet gömlek sipariş etmek istiyorsunuz?", "Hangi bedenler ve kesimler (slim fit, regular fit) gerekiyor?", "Özel tasarım talebi veya marka logosu ekleme gibi istekleriniz var mı?"] },
      ],
    },
  };

  const handleMainServiceSelect = (serviceName) => {
    setSelectedMainService(serviceName);
    setSelectedSubService(null);
    setAnswers({});
    setCurrentStep(2);
    setFormErrors({});
    setShowErrorMessage(false);
  };

  const handleSubServiceSelect = (subService) => {
    setSelectedSubService(subService);
    setAnswers({});
    setCurrentStep(3);
    setFormErrors({});
    setShowErrorMessage(false);
  };

  const handleAnswerChange = (questionIndex, value) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: value }));
    setFormErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`question-${questionIndex}`];
      return newErrors;
    });
    setShowErrorMessage(false);
  };

  const handleContactInfoChange = (e) => {
    setContactInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[e.target.name];
      return newErrors;
    });
    setShowErrorMessage(false);
  };

  const validateForm = () => {
    let errors = {};
    let isValid = true;

    if (currentStep === 3) {
      currentQuestions.forEach((_, index) => {
        if (!answers[index] || answers[index].trim() === "") {
          errors[`question-${index}`] = "Bu alan zorunludur.";
          isValid = false;
        }
      });
    }

    if (currentStep === 4) {
      if (!contactInfo.name.trim()) {
        errors.name = "İsim soyisim zorunludur.";
        isValid = false;
      }
      if (!contactInfo.email.trim()) {
        errors.email = "E-posta zorunludur.";
        isValid = false;
      } else if (!/\S+@\S+\.\S+/.test(contactInfo.email)) {
        errors.email = "Geçerli bir e-posta adresi giriniz.";
        isValid = false;
      }
      if (!contactInfo.phone.trim()) {
        errors.phone = "Telefon numarası zorunludur.";
        isValid = false;
      } else if (!/^\d{10,}$/.test(contactInfo.phone.replace(/\D/g, ''))) {
        errors.phone = "Geçerli bir telefon numarası giriniz (min 10 hane).";
        isValid = false;
      }
      if (!contactInfo.message.trim()) {
        errors.message = "Mesaj alanı zorunludur.";
        isValid = false;
      }
    }

    setFormErrors(errors);
    console.log(`[Validation] validateForm çağrıldı. currentStep: ${currentStep}, isValid: ${isValid}, errors:`, errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("[Submit Flow] handleSubmit çağrıldı. currentStep:", currentStep);

    if (currentStep === 5) {
      console.log("[Submit Flow] Adım 5: Onay ve Gönderim aşaması.");

      const formIsValid = validateForm();
      console.log("[Submit Flow] Form gönderimi öncesi doğrulama sonucu (formIsValid):", formIsValid);
      if (!formIsValid) {
        setShowErrorMessage(true);
        console.error("[Submit Flow] HATA: Form gönderimi öncesi doğrulama başarısız. Hatalar:", formErrors);
        setIsSubmitting(false);
        return;
      }
      console.log("[Submit Flow] Form doğrulaması başarılı.");

      if (!isFirebaseReady || !db) {
        setShowErrorMessage(true);
        console.error("[Submit Flow] KRİTİK HATA: Firebase veritabanı (db) henüz başlatılmadı veya hazır değil. Lütfen bekleyin ve tekrar deneyin.");
        console.log("[Submit Flow] db nesnesi:", db);
        setIsSubmitting(false);
        return;
      }
      console.log("[Submit Flow] Firebase veritabanı (db) hazır ve kullanıma uygun.");

      setIsSubmitting(true);
      setShowErrorMessage(false);
      setShowSuccessMessage(false);
      console.log("[Submit State] isSubmitting true olarak ayarlandı.");

      const currentSubmitterId = userId || 'anonymous';
      console.log("[Submit Data] Form gönderiliyor. Gönderen ID:", currentSubmitterId);

      const currentAppId = typeof __app_id !== 'undefined' ? String(__app_id) : 'default-app-id';
      console.log("[Submit Data] Uygulama ID (currentAppId):", currentAppId);

      const formData = {
        mainService: selectedMainService,
        subService: selectedSubService,
        answers: answers,
        contactInfo: contactInfo,
        timestamp: new Date().toISOString(),
        submitterUserId: currentSubmitterId
      };

      console.log("[Submit Data] Firestore'a gönderilecek veri (formData):", formData);
      const targetCollectionPath = `artifacts/${currentAppId}/requests`;
      console.log("[Submit Data] Hedef koleksiyon yolu (targetCollectionPath):", targetCollectionPath);

      try {
        console.log("[Firestore Call] addDoc çağrılıyor...");
        const docRef = await addDoc(collection(db, targetCollectionPath), formData);
        console.log("[Firestore Call] addDoc başarıyla tamamlandı. Belge ID:", docRef.id);

        setShowSuccessMessage(true);
        console.log("[Success] Talep başarıyla Firestore'a gönderildi. Başarı mesajı gösteriliyor.");

        setTimeout(() => {
          setCurrentStep(1);
          setSelectedMainService(null);
          setSelectedSubService(null);
          setAnswers({});
          setContactInfo({ name: "", email: "", phone: "", message: "" });
          setFormErrors({});
          setShowSuccessMessage(false);
          console.log("[Reset] Form sıfırlandı ve başlangıç adımına döndü.");
        }, 10000);

      } catch (error) {
        console.error("[Firestore Error] Talep gönderilirken HATA oluştu:", error);
        console.error("[Firestore Error] Hata kodu (error.code):", error.code);
        console.error("[Firestore Error] Hata mesajı (error.message):", error.message);
        setShowErrorMessage(true);
      } finally {
        setIsSubmitting(false);
        console.log("[Submit State] isSubmitting durumu sıfırlandı (finally bloğu).");
      }

    } else {
      console.log(`[Navigation] Geçerli adım: ${currentStep}. Doğrulama yapılıyor...`);
      const formIsValid = validateForm();
      console.log(`[Navigation] Adım ${currentStep} doğrulama sonucu:`, formIsValid);

      if (formIsValid) {
        console.log("[Navigation] Doğrulama başarılı. Sonraki adıma geçiliyor.");
        setCurrentStep(currentStep + 1);
        setShowErrorMessage(false);
      } else {
        console.log("[Navigation] Doğrulama başarısız. Hatalar:", formErrors);
        setShowErrorMessage(true);
        setShowSuccessMessage(false);
      }
    }
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
  ) && Object.keys(formErrors).filter(key => key.startsWith('question-')).length === 0;

  const isStep4Complete =
    contactInfo.name.trim() !== "" &&
    contactInfo.email.trim() !== "" &&
    contactInfo.phone.trim() !== "" &&
    contactInfo.message.trim() !== "" &&
    Object.keys(formErrors).filter(key => ['name', 'email', 'phone', 'message'].includes(key)).length === 0;

  const totalSteps = 5;

  useEffect(() => {
    if (currentStep === 3) {
      console.log("[UI State] Adım 3 için isStep3Complete:", isStep3Complete, "Form Hataları:", formErrors);
    }
    if (currentStep === 4) {
      console.log("[UI State] Adım 4 için isStep4Complete:", isStep4Complete, "Form Hataları:", formErrors);
    }
  }, [currentStep, isStep3Complete, isStep4Complete, formErrors]);


  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 flex flex-col items-center">

      {/* Hero Bölümü */}
      <section className="relative h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-700 to-blue-500 text-white overflow-hidden p-8 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-800 to-blue-600 opacity-80"></div>

        <div className="relative text-center z-10 p-6 max-w-4xl mx-auto animate-fadeInUp">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight">
            Zemta İnşaat &amp; Hafriyat
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl font-light mt-4 max-w-3xl mx-auto opacity-90">
            Toprağa değer, geleceğe yön verir.
          </p>
          <Link href="#hizmetlerimiz" scroll={true} className="inline-block mt-10 px-8 py-4 bg-white text-blue-700 font-bold rounded-full shadow-lg hover:bg-blue-100 hover:scale-105 transition-all duration-300 text-lg">
            Hizmetlerimizi Keşfet
          </Link>
        </div>
      </section>

      {/* Hizmetler Bölümü */}
      <section id="hizmetlerimiz" className="w-full max-w-7xl mx-auto py-20 px-8 bg-white shadow-lg rounded-xl -mt-16 z-20 relative">
        <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-10 relative pb-3">
          Hizmetlerimiz
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-1.5 bg-blue-600 rounded-full"></span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <div className="group relative w-full h-96 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-200">
            <Image
              src="/images/hizmet-cevre.jpg"
              alt="Çevre Düzenleme"
              fill={true}
              style={{ objectFit: 'cover' }}
              className="transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-300 flex flex-col justify-end p-8 text-white">
              <h3 className="text-3xl font-bold mb-3">Çevre Düzenleme</h3>
              <p className="text-lg mb-6 leading-relaxed opacity-90">Doğal dokularla modern yaşam alanları tasarlıyoruz. Peyzajdan izolasyona kadar kapsamlı çevre çözümleri.</p>
              <Link href="/cevre-duzenleme" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-7 rounded-full shadow-md transition-colors duration-300">
                Detaylı Bilgi
              </Link>
            </div>
          </div>

          <div className="group relative w-full h-96 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-200">
            <Image
              src="/images/hizmet-elektrik.jpg"
              alt="Elektrik Tesisatı"
              fill={true}
              style={{ objectFit: 'cover' }}
              className="transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-300 flex flex-col justify-end p-8 text-white">
              <h3 className="text-3xl font-bold mb-3">Elektrik Tesisatı</h3>
              <p className="text-lg mb-6 leading-relaxed opacity-90">Bahçe aydınlatmadan mekanik tava pano sistemlerine kadar modern elektrik tesisat çözümleri.</p>
              <Link href="/elektrik-tesisati" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-7 rounded-full shadow-md transition-colors duration-300">
                Detaylı Bilgi
              </Link>
            </div>
          </div>

          <div className="group relative w-full h-96 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-200">
            <Image
              src="/images/hizmet-karakale.jpg"
              alt="Karakalem Sanatı"
              fill={true}
              style={{ objectFit: 'cover' }}
              className="transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-300 flex flex-col justify-end p-8 text-white">
              <h3 className="text-3xl font-bold mb-3">Karakalem Sanatı</h3>
              <p className="text-lg mb-6 leading-relaxed opacity-90">Duvarlara değer katan özel portre çizimleri. Yaşlı, kadın, çocuk figürleriyle sanatı yaşam alanına taşı.</p>
              <Link href="/karakalem-sanati" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-7 rounded-full shadow-md transition-colors duration-300">
                Detaylı Bilgi
              </Link>
            </div>
          </div>

          <div className="group relative w-full h-96 rounded-2xl overflow-hidden shadow-xl hover:hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-200">
            <Image
              src="/images/hizmet-parke.jpg"
              alt="Parke Döşeme"
              fill={true}
              style={{ objectFit: 'cover' }}
              className="transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-300 flex flex-col justify-end p-8 text-white">
              <h3 className="text-3xl font-bold mb-3">Parke Döşeme</h3>
              <p className="text-lg mb-6 leading-relaxed opacity-90">Modern parke çözümleri, renk uyumu, teknik uygulama ve örnek çalışmalar.</p>
              <Link href="/parke-doseme" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-7 rounded-full shadow-md transition-colors duration-300">
                Detaylı Bilgi
              </Link>
            </div>
          </div>

          <div className="group relative w-full h-96 rounded-2xl overflow-hidden shadow-xl hover:hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-200">
            <Image
              src="/images/hizmet-eticaret.jpg"
              alt="E-Ticaret"
              fill={true}
              style={{ objectFit: 'cover' }}
              className="transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-300 flex flex-col justify-end p-8 text-white">
              <h3 className="text-3xl font-bold mb-3">E-Ticaret</h3>
              <p className="text-lg mb-6 leading-relaxed opacity-90">Dekoratif kare yastıklar ve erkek gömlek koleksiyonu.</p>
              <a href="https://vsco.co/zamtainsaat" target="_blank" rel="noopener noreferrer" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-7 rounded-full shadow-md transition-colors duration-300">
                Detaylı Bilgi
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Hakkımızda Bölümü */}
      <section className="py-20 px-8 bg-blue-50 w-full">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold mb-12 text-gray-900 relative pb-6">
            Hakkımızda
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-1.5 bg-blue-600 rounded-full"></span>
          </h2>
          <p className="mb-6 text-xl text-gray-700 leading-relaxed">
            Zemta İnşaat ve Hafriyat, köklü bir geçmişe ve yenilikçi bir vizyona sahip olan güçlü bir inşaat firmasıdır.
          </p>
          <p className="mb-6 text-lg text-gray-700 leading-relaxed">
            Temelleri 2000 yılında atılan Çınar İnşaat ve Hafriyat, 2019 yılında faaliyetlerine son vermiştir. Ancak, onun birikimi ve tecrübesi şimdi Zemta İnşaat ve Hafriyat çatısı altında çok daha büyük hedeflerle devam etmektedir.
          </p>
          <p className="mb-6 text-lg text-gray-700 leading-relaxed">
            20 yılı aşkın süredir Bursa ve çevresinde 1000&apos;in üzerinde başarılı çevre düzenleme projesine imza atan firmamız, kaliteyi ve güveni merkezine alarak her geçen gün daha da büyümektedir.
          </p>
          <p className="mb-6 text-lg text-gray-700 leading-relaxed">
            Özellikle Podyum Park, Misi Köyü ve birçok büyük ölçekli projede çevre düzenlemesi, altyapı ve kazı çalışmalarını başarıyla tamamlayan eski firmamız Çınar İnşaat&apos;ın mirası, bugün Zemta ile daha ileri taşınmaktadır.
          </p>
          <p className="mb-6 text-lg text-gray-700 leading-relaxed">
            Zemta, sadece geçmişin değil, geleceğin inşaat firmasıdır.
          </p>
          <p className="mb-6 text-lg text-gray-700 leading-relaxed">
            Kara kalem duvar sanatından e-ticaret çözümlerine, elektrik tesisatından modern parke döşemeye kadar geniş hizmet yelpazesiyle bireysel ve kurumsal müşterilere profesyonel çözümler sunmaktadır.
          </p>
          <p className="mb-6 text-lg text-gray-700 font-semibold leading-relaxed">
            &quot;Toprağa değer, geleceğe yön verir.&quot; ilkesini benimseyerek;
          </p>
          <ul className="list-disc list-inside text-lg text-gray-700 mb-8 leading-relaxed mx-auto max-w-md">
            <li>Güvenilir</li>
            <li>Disiplinli</li>
            <li>Şeffaf</li>
            <li>Estetik odaklı</li>
          </ul>
          <p className="text-xl text-gray-800 font-extrabold mt-8">
            Zemta: Temelden geleceğe.
          </p>
        </div>
      </section>

      {/* Bize Ulaşın Bölümü */}
      <section className="py-20 px-8 bg-blue-700 w-full text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold mb-12 relative pb-6">
            Bize Ulaşın
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-1.5 bg-white rounded-full"></span>
          </h2>

          {/* İletişim Bilgileri (Telefon ve E-posta ikonlarla) */}
          <div className="flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0 md:space-x-12 text-xl mb-16">
            <p className="flex items-center">
              <Phone className="mr-3 text-white" size={28} /> Telefon:{" "}
              <a href="tel:+905373235900" className="text-blue-200 hover:underline ml-2 font-semibold">0537 323 5900</a>
            </p>
            <p className="flex items-center">
              <Mail className="mr-3 text-white" size={28} /> E-posta:{" "}
              <a href="mailto:zamtainsaat@gmail.com" className="text-blue-200 hover:underline ml-2 font-semibold">zamtainsaat@gmail.com</a>
            </p>
          </div>

          {/* Sosyal Medya Hesapları */}
          <div className="mt-12 mb-16">
            <h3 className="text-3xl font-bold mb-6">Sosyal Medya Hesaplarımız</h3>
            <div className="flex justify-center space-x-8 text-blue-200">
              <a href="https://www.instagram.com/zemtainsaat" target="_blank" rel="noopener noreferrer" className="hover:text-white transition duration-300 text-xl font-medium">
                Instagram
              </a>
              <a href="https://twitter.com/zemtainsaatt" target="_blank" rel="noopener noreferrer" className="hover:text-white transition duration-300 text-xl font-medium">
                X (Twitter)
              </a>
              <a href="https://www.facebook.com/ZamtaInsaat" target="_blank" rel="noopener noreferrer" className="hover:text-white transition duration-300 text-xl font-medium">
                Facebook
              </a>
              <a href="https://www.youtube.com/results?search_query=Zamta+Insaat" target="_blank" rel="noopener noreferrer" className="hover:text-white transition duration-300 text-xl font-medium">
                YouTube
              </a>
              <a href="https://vsco.co/zamtainsaat" target="_blank" rel="noopener noreferrer" className="hover:text-white transition duration-300 text-xl font-medium">
                VSCO
              </a>
            </div>
          </div>

          {/* Çok Adımlı Hizmet Talep Formu */}
          <div className="bg-white p-10 rounded-2xl shadow-2xl max-w-3xl mx-auto border border-gray-200">
            <h3 className="text-4xl font-bold text-gray-800 mb-8">Hizmet Talep Formu</h3>

            {/* Adım Göstergesi */}
            <div className="text-center text-gray-600 text-lg mb-6">
              Adım {currentStep} / {totalSteps}
            </div>

            {/* Başarı Mesajı */}
            {showSuccessMessage && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-lg flex items-center animate-fadeInOut">
                <CheckCircle className="mr-3" size={24} />
                <span>Talebiniz başarıyla iletilmiştir.</span>
              </div>
            )}

            {/* Hata Mesajı (Genel) */}
            {showErrorMessage && Object.keys(formErrors).length > 0 && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg flex items-center">
                <XCircle className="mr-3" size={24} />
                <span>Lütfen tüm gerekli alanları doldurunuz ve hataları düzeltiniz.</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Adım 1: Ana Hizmet Seçimi */}
              {currentStep === 1 && (
                <div>
                  <p className="text-2xl font-semibold mb-6 text-gray-700">1. Hangi ana hizmetimizle ilgileniyorsunuz?</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.keys(servicesData).map((serviceName) => (
                      <button
                        key={serviceName}
                        type="button"
                        onClick={() => handleMainServiceSelect(serviceName)}
                        className={`py-4 px-8 rounded-xl font-bold text-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md ${
                          selectedMainService === serviceName
                            ? "bg-blue-700 text-white shadow-lg"
                            : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                        }`}
                      >
                        {serviceName}
                        <ChevronRight className="inline-block ml-3" size={22} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Adım 2: Alt Hizmet Seçimi (Ana hizmet seçildiyse görünür) */}
              {currentStep === 2 && selectedMainService && (
                <div className="mt-10">
                  <p className="text-2xl font-semibold mb-6 text-gray-700">2. {selectedMainService} kapsamında hangi alt hizmeti seçmek istersiniz?</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {servicesData[selectedMainService]?.subCategories.map((sub) => (
                      <button
                        key={sub.name}
                        type="button"
                        onClick={() => handleSubServiceSelect(sub.name)}
                        className={`py-4 px-8 rounded-xl font-bold text-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md ${
                          selectedSubService === sub.name
                            ? "bg-blue-700 text-white shadow-lg"
                            : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                        }`}
                      >
                        {sub.name}
                        <ChevronRight className="inline-block ml-3" size={22} />
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="mt-8 bg-gray-300 text-gray-800 px-8 py-4 rounded-xl hover:bg-gray-400 transition duration-300 font-semibold text-lg"
                  >
                    Geri
                  </button>
                </div>
              )}

              {/* Adım 3: Hizmete Özel Sorular (Alt hizmet seçildiyse görünür) */}
              {currentStep === 3 && selectedSubService && (
                <div className="mt-10">
                  <p className="text-2xl font-semibold mb-6 text-gray-700">3. Lütfen aşağıdaki soruları yanıtlayın:</p>
                  {currentQuestions.map((question, index) => (
                    <div key={index} className="mb-6">
                      <label htmlFor={`question-${index}`} className="block text-gray-700 text-xl font-medium mb-3">
                        {question}
                      </label>
                      <input
                        type="text"
                        id={`question-${index}`}
                        name={`question-${index}`}
                        value={answers[index] || ""}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-500 text-lg text-gray-900 placeholder-gray-700"
                        placeholder="Cevabınızı buraya yazın..."
                        required
                      />
                      {formErrors[`question-${index}`] && (
                          <p className="text-red-500 text-sm mt-1">{formErrors[`question-${index}`]}</p>
                      )}
                    </div>
                  ))}
                  <div className="flex justify-between mt-8">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="bg-gray-300 text-gray-800 px-8 py-4 rounded-xl hover:bg-gray-400 transition duration-300 font-semibold text-lg"
                    >
                      Geri
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className={`px-8 py-4 rounded-xl font-bold text-lg transition duration-300 ${
                        isStep3Complete ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md" : "bg-gray-300 text-gray-600 cursor-not-allowed"
                      }`}
                      disabled={!isStep3Complete || isSubmitting}
                    >
                      Devam <ChevronRight className="inline-block ml-3" size={22} />
                    </button>
                  </div>
                </div>
              )}

              {/* Adım 4: İletişim Bilgileri ve Mesaj */}
              {currentStep === 4 && (
                <div className="mt-10">
                  <p className="text-2xl font-semibold mb-6 text-gray-700">4. İletişim Bilgileriniz ve Mesajınız:</p>
                  <div className="mb-6">
                    <label htmlFor="name" className="block text-gray-700 text-xl font-medium mb-3">
                      İsim Soyisim
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={contactInfo.name}
                      onChange={handleContactInfoChange}
                      className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-500 text-lg text-gray-900 placeholder-gray-700"
                      placeholder="Adınız Soyadınız"
                      required
                    />
                    {formErrors.name && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                    )}
                  </div>
                  <div className="mb-6">
                    <label htmlFor="email" className="block text-gray-700 text-xl font-medium mb-3">
                      E-posta
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={contactInfo.email}
                      onChange={handleContactInfoChange}
                      className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-500 text-lg text-gray-900 placeholder-gray-700"
                      placeholder="ornek@email.com"
                      required
                    />
                    {formErrors.email && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                    )}
                  </div>
                  <div className="mb-6">
                    <label htmlFor="phone" className="block text-gray-700 text-xl font-medium mb-3">
                      Telefon Numarası
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={contactInfo.phone}
                      onChange={handleContactInfoChange}
                      className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-500 text-lg text-gray-900 placeholder-gray-700"
                      placeholder="5xx xxx xx xx"
                      required
                    />
                    {formErrors.phone && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                    )}
                  </div>
                  <div className="mb-6">
                    <label htmlFor="message" className="block text-gray-700 text-xl font-medium mb-3">
                      Mesajınız / İş Detayları
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={contactInfo.message}
                      onChange={handleContactInfoChange}
                      rows="6"
                      className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-500 text-lg text-gray-900 placeholder-gray-700"
                      placeholder="Projeniz hakkında detayları buraya yazın..."
                      required
                    ></textarea>
                    {formErrors.message && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.message}</p>
                    )}
                  </div>
                  <div className="flex justify-between mt-8">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="bg-gray-300 text-gray-800 px-8 py-4 rounded-xl hover:bg-gray-400 transition duration-300 font-semibold text-lg"
                    >
                      Geri
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className={`px-8 py-4 rounded-xl font-bold text-lg transition duration-300 ${
                        isStep4Complete ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md" : "bg-gray-300 text-gray-600 cursor-not-allowed"
                      }`}
                      disabled={!isStep4Complete || isSubmitting}
                    >
                      Devam <ChevronRight className="inline-block ml-3" size={22} />
                    </button>
                  </div>
                </div>
              )}

              {/* Adım 5: Onay/Özet */}
              {currentStep === 5 && (
                <div className="mt-10 text-left">
                  <p className="text-2xl font-semibold mb-6 text-gray-700">5. Talebinizi Onaylayın:</p>

                  <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-xl font-bold text-blue-800 mb-4">Seçilen Hizmetler:</h4>
                    <p className="text-lg text-gray-900 mb-2">
                      <span className="font-semibold">Ana Hizmet:</span> {selectedMainService}
                    </p>
                    <p className="text-lg text-gray-900 mb-4">
                      <span className="font-semibold">Alt Hizmet:</span> {selectedSubService}
                    </p>

                    <h4 className="text-xl font-bold text-blue-800 mt-6 mb-3">Hizmete Özel Cevaplar:</h4>
                    {currentQuestions.map((question, index) => (
                      <p key={index} className="text-md text-gray-700">
                        <span className="font-semibold">Soru {parseInt(index) + 1}:</span> {answers[index]}
                      </p>
                    ))}

                    <h4 className="text-xl font-bold text-blue-800 mt-6 mb-3">İletişim Bilgileri:</h4>
                    <p className="text-lg"><span className="font-semibold">İsim Soyisim:</span> {contactInfo.name}</p>
                    <p className="text-lg"><span className="font-semibold">E-posta:</span> {contactInfo.email}</p>
                    <p className="text-lg"><span className="font-semibold">Telefon:</span> {contactInfo.phone}</p>
                    <p className="text-lg"><span className="font-semibold">Mesaj:</span> {contactInfo.message}</p>
                  </div>

                  <div className="flex justify-between mt-8">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="bg-gray-300 text-gray-800 px-8 py-4 rounded-xl hover:bg-gray-400 transition duration-300 font-semibold text-lg"
                    >
                      Geri Dön &amp; Düzenle
                    </button>
                    <button
                      type="submit" // Bu butonun type'ı submit olmalı
                      className="px-8 py-4 rounded-xl font-bold text-lg transition duration-300 bg-green-600 text-white hover:bg-green-700 shadow-md"
                      disabled={!isStep4Complete || isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Gönderiliyor...
                        </span>
                      ) : (
                        "Talebi Onayla ve Gönder"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Alt Kısım (Footer) */}
      <footer className="py-10 bg-blue-800 text-white text-center text-md w-full">
        <p>&copy; {new Date().getFullYear()} Zemta İnşaat ve Hafriyat. Tüm Hakları Saklıdır.</p>
        <p className="mt-2 text-sm opacity-80">Modern Web Tasarımı ile güçlendirilmiştir.</p>
        {/* GEÇİCİ YÖNETİCİ PANELİ LİNKİ - Hata ayıklama için eklenmiştir. */}
        {/* <div className="mt-4">
          <Link href="/admin" className="text-blue-300 hover:underline">
            Yönetici Paneline Git (Geçici)
          </Link>
        </div> */}
      </footer>

      {/* CSS for fadeInOut animation */}
      <style jsx>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(-10px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
        .animate-fadeInOut {
          animation: fadeInOut 10s ease-in-out forwards;
        }

        /* Hero bölümü için fadeInUp animasyonu */
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
      `}</style>
    </main>
  );
}


// --- AdminLoginPage Bileşeni ---
function AdminLoginPage({ auth, router }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("[Admin Login] Kullanıcı zaten giriş yapmış, admin paneline yönlendiriliyor.");
        router.push("/admin");
      }
    });
    return () => unsubscribe();
  }, [router, auth]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!auth) {
        throw new Error("Firebase Auth başlatılamadı. Lütfen konsolu kontrol edin.");
      }
      console.log(`[Admin Login] Giriş denemesi: ${email}`);
      await signInWithEmailAndPassword(auth, email, password);
      console.log("[Admin Login] Giriş başarılı!");
    } catch (err) {
      console.error("[Admin Login ERROR] Giriş hatası:", err);
      let errorMessage = "Giriş başarısız oldu. Lütfen e-posta ve şifrenizi kontrol edin.";
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        errorMessage = "Geçersiz e-posta veya şifre.";
      } else if (err.code === "auth/too-many-requests") {
        errorMessage = "Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin.";
      } else if (err.code === "auth/network-request-failed") {
        errorMessage = "Ağ hatası. Lütfen internet bağlantınızı kontrol edin.";
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 to-blue-500 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md text-center border-t-4 border-blue-600">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-6">Yönetici Girişi</h1>
        <p className="text-gray-600 mb-8">Lütfen yönetici hesabınızla giriş yapın.</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="sr-only">E-posta</label>
            <input
              type="email"
              id="email"
              placeholder="E-posta Adresi"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-500 text-lg text-gray-900 placeholder-gray-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Şifre</label>
            <input
              type="password"
              id="password"
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-500 text-lg text-gray-900 placeholder-gray-500"
              required
            />
          </div>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex items-center">
              <AlertCircle className="mr-3" size={24} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 text-lg flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <Loader className="animate-spin mr-3" size={24} />
            ) : (
              "Giriş Yap"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}


// --- AdminPage Bileşeni ---
function AdminPage({ auth, db, router, __app_id }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [user, setUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);

  useEffect(() => {
    console.log("[Admin Auth Init] Auth durumu dinleniyor...");
    if (!auth) {
      console.error("[Admin Auth Init ERROR] Firebase Auth nesnesi (auth) başlatılamadı veya tanımsız. Lütfen kontrol edin.");
      setError("Firebase kimlik doğrulama servisi başlatılamadı. Lütfen konsolu kontrol edin.");
      setIsAuthReady(true);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        console.log("[Admin Auth] Kullanıcı oturum açtı:", currentUser.uid);
      } else {
        setUser(null);
        console.log("[Admin Auth] Kullanıcı oturum açmadı, giriş sayfasına yönlendiriliyor.");
        router.push("/admin/login");
      }
      setIsAuthReady(true);
      console.log("[Admin Auth] isAuthReady true olarak ayarlandı.");
    });

    return () => unsubscribeAuth();
  }, [router, auth]);

  useEffect(() => {
    console.log("[Admin Data Fetch Effect] isAuthReady:", isAuthReady, "user:", user, "db:", db);
    if (!isAuthReady || !user) {
      console.log("[Admin Data Fetch] Firebase Auth henüz hazır değil veya kullanıcı giriş yapmadı. Veri çekme bekleniyor.");
      setLoading(false);
      return;
    }
    if (!db) {
      console.error("[Admin Data Fetch ERROR] Firebase Firestore nesnesi (db) başlatılamadı veya tanımsız. Lütfen kontrol edin.");
      setError("Firebase veritabanı servisi başlatılamadı. Lütfen konsolu kontrol edin.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const currentAppId = typeof __app_id !== 'undefined' ? String(__app_id) : 'default-app-id';
    const collectionPath = `artifacts/${currentAppId}/requests`;
    console.log(`[Admin Data Fetch] Firestore koleksiyon yolu: ${collectionPath}`);

    const q = collection(db, collectionPath);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log("[Admin Data Fetch] onSnapshot tetiklendi.");
      const fetchedRequests = [];
      snapshot.forEach((doc) => {
        fetchedRequests.push({ id: doc.id, ...doc.data() });
      });

      fetchedRequests.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setRequests(fetchedRequests);
      setLoading(false);
      console.log(`[Admin Data Fetch] ${fetchedRequests.length} talep başarıyla çekildi.`);
    }, (err) => {
      console.error("[Admin Data Fetch ERROR] Firestore'dan veri çekilirken hata:", err);
      setError("Talepler yüklenirken bir hata oluştu: " + err.message);
      setLoading(false);
    });

    return () => {
      console.log("[Admin Data Fetch] onSnapshot listener temizlendi.");
      unsubscribe();
    };
  }, [isAuthReady, user, db, __app_id]);

  const handleRefresh = () => {
    setLoading(true);
    setRequests([]);
    console.log("[Admin Refresh] Talepler yenileniyor...");
  };

  const handleDeleteClick = (request) => {
    setRequestToDelete(request);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!requestToDelete) return;

    setShowDeleteConfirm(false);
    setLoading(true);
    setError(null);

    const currentAppId = typeof __app_id !== 'undefined' ? String(__app_id) : 'default-app-id';
    const docPath = `artifacts/${currentAppId}/requests/${requestToDelete.id}`;
    console.log(`[Admin Delete] Belge siliniyor: ${docPath}`);

    try {
      if (!db) {
        throw new Error("Firestore veritabanı başlatılmamış.");
      }
      await deleteDoc(doc(db, docPath));
      console.log(`[Admin Delete] Belge başarıyla silindi: ${requestToDelete.id}`);
    } catch (err) {
      console.error("[Admin Delete ERROR] Belge silinirken hata:", err);
      setError("Talep silinirken bir hata oluştu: " + err.message);
    } finally {
      setLoading(false);
      setRequestToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setRequestToDelete(null);
  };

  const handleLogout = async () => {
    try {
      if (!auth) {
        throw new Error("Firebase Auth başlatılamadı. Çıkış yapılamıyor.");
      }
      await signOut(auth);
      console.log("[Admin Logout] Başarıyla çıkış yapıldı.");
      router.push("/admin/login");
    } catch (err) {
      console.error("[Admin Logout ERROR] Çıkış yapılırken hata:", err);
      setError("Çıkış yapılırken bir hata oluştu: " + err.message);
    }
  };

  if (!isAuthReady || (isAuthReady && !user && !error)) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center text-blue-600 text-2xl flex items-center">
          <Loader className="animate-spin mr-3" size={32} />
          Yönetici Paneli Yükleniyor veya Kimlik Doğrulanıyor...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-md max-w-md text-center">
          <p className="font-bold text-xl mb-3">Yükleme Hatası!</p>
          <p className="mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-full"
          >
            Yeniden Dene
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-xl">
        <h1 className="text-4xl font-extrabold text-center text-blue-700 mb-8">Yönetici Paneli</h1>

        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleRefresh}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full flex items-center"
            disabled={loading}
          >
            {loading ? (
              <Loader className="animate-spin mr-2" size={20} />
            ) : (
              "Talepleri Yenile"
            )}
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full flex items-center"
          >
            <LogOut className="mr-2" size={20} /> Çıkış Yap
          </button>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">Gönderilen Talepler</h2>

        {!loading && requests.length === 0 && (
          <div className="text-center text-gray-500 text-lg mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            Henüz gönderilmiş bir talep bulunmamaktadır.
          </div>
        )}

        {!loading && requests.length > 0 && (
          <div className="space-y-6">
            {requests.map((request) => (
              <div key={request.id} className="bg-blue-50 p-6 rounded-lg shadow-md border border-blue-200">
                <h3 className="text-xl font-bold text-blue-800 mb-2">Ana Hizmet: {request.mainService}</h3>
                <p className="text-lg text-gray-800 mb-3">Alt Hizmet: {request.subService}</p>
                <p className="text-sm text-gray-600 mb-4">
                  Gönderilme Tarihi: {new Date(request.timestamp).toLocaleString('tr-TR')}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Gönderen Kullanıcı ID: <span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded">{request.submitterUserId}</span>
                </p>

                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={() => setSelectedRequest(request)}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-full flex items-center transition duration-300"
                  >
                    <Eye className="mr-2" size={18} /> Detayları Gör
                  </button>
                  <button
                    onClick={() => handleDeleteClick(request)}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-full flex items-center transition duration-300"
                  >
                    <Trash2 className="mr-2" size={18} /> Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Talep Detay Modalı */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Talep Detayları</h3>
              <div className="space-y-4">
                <p className="text-lg"><span className="font-semibold">Ana Hizmet:</span> {selectedRequest.mainService}</p>
                <p className="text-lg"><span className="font-semibold">Alt Hizmet:</span> {selectedRequest.subService}</p>
                <p className="text-lg"><span className="font-semibold">Gönderilme Tarihi:</span> {new Date(selectedRequest.timestamp).toLocaleString('tr-TR')}</p>
                <p className="text-lg"><span className="font-semibold">Gönderen Kullanıcı ID:</span> <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{selectedRequest.submitterUserId}</span></p>

                <h4 className="text-xl font-bold text-gray-700 mt-6 mb-3">Hizmete Özel Cevaplar:</h4>
                {selectedRequest.answers && Object.keys(selectedRequest.answers).map((key) => (
                  <p key={key} className="text-md text-gray-700">
                    <span className="font-semibold">Soru {parseInt(key) + 1}:</span> {selectedRequest.answers[key]}
                  </p>
                ))}

                <h4 className="text-xl font-bold text-gray-700 mt-6 mb-3">İletişim Bilgileri:</h4>
                <p className="text-lg"><span className="font-semibold">İsim Soyisim:</span> {selectedRequest.contactInfo.name}</p>
                <p className="text-lg"><span className="font-semibold">E-posta:</span> {selectedRequest.contactInfo.email}</p>
                <p className="text-lg"><span className="font-semibold">Telefon:</span> {selectedRequest.contactInfo.phone}</p>
                <p className="text-lg"><span className="font-semibold">Mesaj:</span> {selectedRequest.contactInfo.message}</p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300"
              >
                Kapat
              </button>
            </div>
          </div>
        )}

        {/* Silme Onayı Modalı */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full text-center">
              <h3 className="text-xl font-bold text-red-700 mb-4">Talebi Sil Onayı</h3>
              <p className="text-gray-700 mb-6">
                Bu talebi kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={cancelDelete}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-5 rounded-full transition duration-300"
                >
                  İptal
                </button>
                <button
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-5 rounded-full transition duration-300"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
