"use client"; // Bu satır, React Hook'larını (useState gibi) kullanmak için gereklidir.

// app/page.js
import Link from "next/link"; // Next.js Link bileşenini içeri aktarıyoruz.
import Image from "next/image"; // Görsel kullanacağımız için Image bileşenini içeri aktarıyoruz.
import { useState, useEffect } from "react"; // Form adımlarını yönetmek için useState hook'u, useEffect Firebase için
import { format } from 'date-fns'; // Tarih formatlamak için (npm install date-fns)

// Firebase importları
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, onSnapshot, orderBy, deleteDoc, doc } from 'firebase/firestore';

// Lucide-react ikonlarını dinamik olarak içeri aktarıyoruz.
// Bu, sunucu tarafı render (SSR) sırasında oluşabilecek hataları önler.
import dynamic from "next/dynamic";

const Phone = dynamic(() => import("lucide-react").then(mod => mod.Phone), { ssr: false });
const Mail = dynamic(() => import("lucide-react").then(mod => mod.Mail), { ssr: false });
const ChevronRight = dynamic(() => import("lucide-react").then(mod => mod.ChevronRight), { ssr: false });
const CheckCircle = dynamic(() => import("lucide-react").then(mod => mod.CheckCircle), { ssr: false }); // Başarı mesajı için ikon
const XCircle = dynamic(() => import("lucide-react").then(mod => mod.XCircle), { ssr: false }); // Hata mesajı için ikon
const Trash2 = dynamic(() => import("lucide-react").then(mod => mod.Trash2), { ssr: false }); // Silme ikon
const Eye = dynamic(() => import("lucide-react").then(mod => mod.Eye), { ssr: false }); // Detay gör ikon
const LogIn = dynamic(() => import("lucide-react").then(mod => mod.LogIn), { ssr: false }); // Giriş ikon
const LogOut = dynamic(() => import("lucide-react").then(mod => mod.LogOut), { ssr: false }); // Çıkış ikon


export default function Home() {
  // Firebase ve Auth state'leri
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null); // Mevcut kullanıcının UID'si
  const [isAuthReady, setIsAuthReady] = useState(false); // Auth durumunun yüklenip yüklenmediğini kontrol eder
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false); // Yöneticinin giriş yapıp yapmadığını kontrol eder

  // YÖNETİCİ UID'Sİ BURAYA GELECEK - KENDİ YÖNETİCİ HESABININ UID'Sİ İLE DEĞİŞTİR!
  // Firebase Authentication'da oluşturduğun yönetici kullanıcının UID'si olacak.
  const ADMIN_UID = "SENİN_YÖNETİCİ_UID'Nİ_BURAYA_YAPIŞTIR"; // Örn: "abcdef1234567890abcdef1234567890"

  // Admin giriş formu state'leri
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoginError, setAdminLoginError] = useState("");


  // Form adımlarını, seçilen hizmetleri ve kullanıcı cevaplarını yönetmek için React state'leri tanımlıyoruz.
  const [currentStep, setCurrentStep] = useState(1); // Mevcut form adımını tutar (1, 2, 3, 4 veya 5).
  const [selectedMainService, setSelectedMainService] = useState(null); // Seçilen ana hizmeti tutar (örn: "Çevre Düzenleme").
  const [selectedSubService, setSelectedSubService] = useState(null); // Seçilen alt hizmeti tutar (örn: "Peyzaj").
  const [answers, setAnswers] = useState({}); // Alt hizmete özel soruların cevaplarını tutar.
  const [contactInfo, setContactInfo] = useState({ // Kullanıcının iletişim bilgilerini tutar.
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [formErrors, setFormErrors] = useState({}); // Form doğrulama hatalarını tutar.
  const [showSuccessMessage, setShowSuccessMessage] = useState(false); // Başarı mesajını göstermek için state.
  const [showErrorMessage, setShowErrorMessage] = useState(false); // Hata mesajını göstermek için state.
  const [requests, setRequests] = useState([]); // Gönderilen talepleri tutar (Admin Paneli için)
  const [selectedRequestDetails, setSelectedRequestDetails] = useState(null); // Detayları gösterilecek talep


  // Firebase'i başlat ve kimlik doğrulamayı yönet
  useEffect(() => {
    try {
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};

      if (Object.keys(firebaseConfig).length === 0) {
        console.error("Firebase config not found. Cannot initialize Firebase.");
        setIsAuthReady(true);
        return;
      }

      const app = initializeApp(firebaseConfig, appId);
      const firestore = getFirestore(app);
      const authInstance = getAuth(app);

      setDb(firestore);
      setAuth(authInstance);

      // Kimlik doğrulama durumunu dinle
      const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
        if (user) {
          setUserId(user.uid);
          // Eğer giriş yapan kullanıcı admin UID'sine eşitse yönetici olarak işaretle
          if (user.uid === ADMIN_UID) {
            setIsAdminLoggedIn(true);
            console.log("Admin olarak giriş yapıldı. UID:", user.uid); // Admin UID'yi konsolda görmek için
          } else {
            setIsAdminLoggedIn(false);
          }
        } else {
          // Eğer token yoksa veya geçersizse anonim olarak oturum aç (normal kullanıcılar için)
          if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            try {
              await signInWithCustomToken(authInstance, __initial_auth_token);
              setUserId(authInstance.currentUser.uid);
            } catch (error) {
              console.error("Custom token ile oturum açılırken hata:", error);
              await signInAnonymously(authInstance);
              setUserId(authInstance.currentUser.uid);
            }
          } else {
            await signInAnonymously(authInstance);
            setUserId(authInstance.currentUser.uid);
          }
          setIsAdminLoggedIn(false);
        }
        setIsAuthReady(true); // Kimlik doğrulama hazır
      });

      return () => unsubscribe(); // Cleanup
    } catch (error) {
      console.error("Firebase başlatılırken hata:", error);
      setIsAuthReady(true);
    }
  }, []);

  // Firestore'dan talepleri çek (userId ve isAdminLoggedIn hazır olduğunda)
  useEffect(() => {
    if (!db || !userId || !isAuthReady || !isAdminLoggedIn) return; // Sadece admin girişliyse çek

    // Tüm talepleri çeker (Firestore güvenlik kuralları ile sadece adminin okumasına izin vermelisin)
    const q = query(collection(db, `artifacts/${__app_id}/public/requests`), orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedRequests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRequests(fetchedRequests);
    }, (error) => {
      console.error("Talepler çekilirken hata oluştu:", error);
      // Hata oluşursa (örn: yetkilendirme hatası), adminin çıkış yapmasını sağlayabiliriz
      if (error.code === 'permission-denied') {
        setAdminLoginError("Talepleri görüntüleme yetkiniz yok. Lütfen yönetici hesabıyla giriş yapın.");
        signOut(auth); // Yetki hatasında çıkış yap
      }
    });

    return () => unsubscribe(); // Cleanup
  }, [db, userId, isAuthReady, isAdminLoggedIn, auth, ADMIN_UID]); // ADMIN_UID'yi bağımlılık olarak ekledik


  // Web sitesinde sunulan hizmetlerin verileri ve her bir alt hizmete özel sorular.
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

  // Ana hizmet seçildiğinde çalışan fonksiyon.
  const handleMainServiceSelect = (serviceName) => {
    setSelectedMainService(serviceName);
    setSelectedSubService(null); // Yeni ana hizmet seçildiğinde alt hizmeti sıfırla.
    setAnswers({}); // Yeni ana hizmet seçildiğinde cevapları sıfırla.
    setCurrentStep(2); // Bir sonraki adıma geç.
    setFormErrors({}); // Hataları temizle
    setShowErrorMessage(false); // Hata mesajını gizle
  };

  // Alt hizmet seçildiğinde çalışan fonksiyon.
  const handleSubServiceSelect = (subService) => {
    setSelectedSubService(subService);
    setAnswers({}); // Yeni alt hizmet seçildiğinde cevapları sıfırla.
    setCurrentStep(3); // Bir sonraki adıma geç.
    setFormErrors({}); // Hataları temizle
    setShowErrorMessage(false); // Hata mesajını gizle
  };

  // Hizmete özel soruların cevapları değiştiğinde state'i güncelleyen fonksiyon.
  const handleAnswerChange = (questionIndex, value) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: value }));
    setFormErrors((prev) => ({ ...prev, [`question-${questionIndex}`]: undefined })); // Hata mesajını temizle
    setShowErrorMessage(false); // Hata mesajını gizle
  };

  // İletişim bilgileri form alanları değiştiğinde state'i güncelleyen fonksiyon.
  const handleContactInfoChange = (e) => {
    setContactInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormErrors((prev) => ({ ...prev, [e.target.name]: undefined })); // Hata mesajını temizle
    setShowErrorMessage(false); // Hata mesajını gizle
  };

  // Form doğrulama fonksiyonu
  const validateForm = () => {
    let errors = {};
    let isValid = true;

    // Adım 3 doğrulaması (Hizmete Özel Sorular)
    if (currentStep === 3) {
      currentQuestions.forEach((_, index) => {
        if (!answers[index] || answers[index].trim() === "") {
          errors[`question-${index}`] = "Bu alan zorunludur.";
          isValid = false;
        }
      });
    }

    // Adım 4 doğrulaması (İletişim Bilgileri)
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
      } else if (!/^\d{10,}$/.test(contactInfo.phone.replace(/\D/g, ''))) { // Sadece rakamları kontrol et, min 10 hane
        errors.phone = "Geçerli bir telefon numarası giriniz (min 10 hane).";
        isValid = false;
      }
      if (!contactInfo.message.trim()) {
        errors.message = "Mesaj alanı zorunludur.";
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  // Form gönderildiğinde çalışan fonksiyon.
  const handleSubmit = async (e) => {
    e.preventDefault(); // Sayfanın yeniden yüklenmesini engelle.

    // Son adımda (onay) submit edildiğinde
    if (currentStep === 5) {
      if (!db || !userId) {
        setShowErrorMessage(true);
        console.error("Veritabanı veya kullanıcı ID'si hazır değil.");
        return;
      }

      try {
        // Talebi public/requests koleksiyonuna kaydet
        await addDoc(collection(db, `artifacts/${__app_id}/public/requests`), {
          mainService: selectedMainService,
          subService: selectedSubService,
          answers: answers,
          contactInfo: contactInfo,
          timestamp: new Date().toISOString(), // ISO formatında zaman damgası
          submitterUserId: userId // Talebi gönderen kullanıcının UID'si (anonim veya admin)
        });

        // Başarı mesajını göster
        setShowSuccessMessage(true);
        setShowErrorMessage(false); // Hata mesajını gizle

        // Formu 3 saniye sonra sıfırla
        setTimeout(() => {
          setCurrentStep(1);
          setSelectedMainService(null);
          setSelectedSubService(null);
          setAnswers({});
          setContactInfo({ name: "", email: "", phone: "", message: "" });
          setShowSuccessMessage(false);
          setFormErrors({}); // Hataları temizle
        }, 3000);

      } catch (error) {
        console.error("Talep gönderilirken hata oluştu:", error);
        setShowErrorMessage(true); // Hata mesajını göster
        setShowSuccessMessage(false); // Başarı mesajını gizle
      }

    } else {
      // Diğer adımlarda "Devam" butonuna basıldığında
      if (validateForm()) {
        setCurrentStep(currentStep + 1);
        setShowErrorMessage(false); // Hata mesajını gizle
      } else {
        setShowErrorMessage(true); // Doğrulama hatası varsa hata mesajını göster
        setShowSuccessMessage(false); // Başarı mesajını gizle
      }
    }
  };

  // Talebi silme fonksiyonu
  const handleDeleteRequest = async (requestId) => {
    if (!db || !userId || !isAdminLoggedIn) {
      console.error("Veritabanı veya kullanıcı ID'si hazır değil veya yönetici değilsiniz.");
      return;
    }
    if (window.confirm("Bu talebi silmek istediğinizden emin misiniz?")) { // Basit onay
      try {
        await deleteDoc(doc(db, `artifacts/${__app_id}/public/requests`, requestId));
        console.log("Talep başarıyla silindi.");
      } catch (error) {
        console.error("Talep silinirken hata oluştu:", error);
      }
    }
  };

  // Talebin detaylarını gösterme fonksiyonu
  const handleViewDetails = (request) => {
    setSelectedRequestDetails(request);
  };

  // Detayları kapatma fonksiyonu
  const handleCloseDetails = () => {
    setSelectedRequestDetails(null);
  };

  // Admin giriş fonksiyonu
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAdminLoginError(""); // Önceki hataları temizle
    if (!auth) {
      setAdminLoginError("Firebase kimlik doğrulama hazır değil.");
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      if (userCredential.user.uid === ADMIN_UID) {
        setIsAdminLoggedIn(true);
        setUserId(userCredential.user.uid); // userId'yi admin UID olarak güncelle
        setAdminEmail("");
        setAdminPassword("");
        console.log("Admin olarak giriş yapıldı. UID:", userCredential.user.uid);
      } else {
        // Admin olmayan bir hesapla giriş yapıldıysa çıkış yap
        await signOut(auth);
        setAdminLoginError("Bu hesap yönetici yetkisine sahip değil.");
      }
    } catch (error) {
      console.error("Admin girişi sırasında hata:", error);
      setAdminLoginError("Giriş başarısız: " + error.message);
    }
  };

  // Admin çıkış fonksiyonu
  const handleAdminLogout = async () => {
    if (auth) {
      try {
        await signOut(auth);
        setIsAdminLoggedIn(false);
        setUserId(null); // userId'yi sıfırla
        setAdminEmail("");
        setAdminPassword("");
        setAdminLoginError("");
        setRequests([]); // Talepleri temizle
        console.log("Admin çıkış yapıldı.");
      } catch (error) {
        console.error("Çıkış yapılırken hata:", error);
      }
    }
  };


  // Mevcut alt hizmete ait soruları dinamik olarak alır.
  const currentQuestions = selectedSubService
    ? servicesData[selectedMainService]?.subCategories.find(
        (sub) => sub.name === selectedSubService
      )?.questions || []
    : [];

  // Form adımlarının tamamlanıp tamamlanmadığını kontrol eden yardımcı değişkenler.
  const isStep1Complete = selectedMainService !== null;
  const isStep2Complete = selectedSubService !== null;
  const isStep3Complete = currentQuestions.every(
    (_, index) => answers[index] && answers[index].trim() !== ""
  ) && Object.keys(formErrors).length === 0; // Hata yoksa tamamlanmış say

  const isStep4Complete =
    contactInfo.name.trim() !== "" &&
    contactInfo.email.trim() !== "" &&
    contactInfo.phone.trim() !== "" &&
    contactInfo.message.trim() !== "" &&
    Object.keys(formErrors).length === 0; // Hata yoksa tamamlanmış say

  const totalSteps = 5; // Toplam adım sayısı (1, 2, 3, 4, 5)

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 flex flex-col items-center"> {/* Ana içerik alanı, Tailwind CSS ile stil verildi */}

      {/* Hero Bölümü (En Üst Kısım) - Web sitesinin ana görsel ve başlık alanı */}
      <section className="relative h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-700 to-blue-500 text-white overflow-hidden p-8 shadow-xl">
        {/* Arka plan görseli - Placeholder, gerçek görsel yolu buraya gelecek */}
        <div className="absolute inset-0 opacity-80 bg-cover bg-center" style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-800 to-blue-600 opacity-80"></div> {/* Arka plan degrade efekti */}

        <div className="relative text-center z-10 p-6 max-w-4xl mx-auto animate-fadeInUp">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight"> {/* Font boyutları küçültüldü */}
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

      {/* Hizmetler Bölümü - Sunulan hizmetleri görsel kartlarla gösterir */}
      <section id="hizmetlerimiz" className="w-full max-w-7xl mx-auto py-20 px-8 bg-white shadow-lg rounded-xl -mt-16 z-20 relative">
        <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-10 relative pb-3"> {/* text-4xl -> text-3xl, mb-12 -> mb-10, pb-4 -> pb-3 */}
          Hizmetlerimiz
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-1.5 bg-blue-600 rounded-full"></span> {/* w-24 -> w-20 */}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Her bir hizmet için kart yapısı */}
          <div className="group relative w-full h-96 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-200">
            <Image
              src="/images/hizmet-cevre.jpg"
              alt="Çevre Düzenleme"
              layout="fill"
              objectFit="cover"
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
              layout="fill"
              objectFit="cover"
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
              src="/images/hizmet-karakale.jpg" // Karakalem görsel yolu hizmet-karakale.jpg olarak değiştirildi
              alt="Karakalem Sanatı"
              layout="fill"
              objectFit="cover"
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

          <div className="group relative w-full h-96 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-200">
            <Image
              src="/images/hizmet-parke.jpg"
              alt="Parke Döşeme"
              layout="fill"
              objectFit="cover"
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

          <div className="group relative w-full h-96 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-200">
            <Image
              src="/images/hizmet-eticaret.jpg"
              alt="E-Ticaret"
              layout="fill"
              objectFit="cover"
              className="transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-300 flex flex-col justify-end p-8 text-white">
              <h3 className="text-3xl font-bold mb-3">E-Ticaret</h3>
              <p className="text-lg mb-6 leading-relaxed opacity-90">Dekoratif kare yastıklar ve erkek gömlek koleksiyonu.</p>
              <Link href="/e-ticaret" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-7 rounded-full shadow-md transition-colors duration-300">
                Detaylı Bilgi
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Hakkımızda Bölümü */}
      <section className="py-20 px-8 bg-blue-50 w-full">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-5xl font-extrabold mb-12 text-gray-900 relative pb-6">
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

      {/* Bize Ulaşın Bölümü - İletişim bilgileri ve çok adımlı hizmet talep formu */}
      <section className="py-20 px-8 bg-blue-700 w-full text-white"> {/* bg-gray-100 -> bg-blue-700, text-gray-900 -> text-white */}
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-5xl font-extrabold mb-12 relative pb-6"> {/* text-gray-900 kaldırıldı, zaten üstten text-white alacak */}
            Bize Ulaşın
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-1.5 bg-white rounded-full"></span> {/* bg-blue-600 -> bg-white */}
          </h2>

          {/* İletişim Bilgileri (Telefon ve E-posta ikonlarla) */}
          <div className="flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0 md:space-x-12 text-xl mb-16"> {/* text-gray-700 kaldırıldı */}
            <p className="flex items-center">
              <Phone className="mr-3 text-white" size={28} /> Telefon:{" "} {/* text-blue-600 -> text-white */}
              <a href="tel:+905373235900" className="text-blue-200 hover:underline ml-2 font-semibold">0537 323 5900</a> {/* text-blue-600 -> text-blue-200 */}
            </p>
            <p className="flex items-center">
              <Mail className="mr-3 text-white" size={28} /> E-posta:{" "} {/* text-blue-600 -> text-white */}
              <a href="mailto:zamtainsaat@gmail.com" className="text-blue-200 hover:underline ml-2 font-semibold">zamtainsaat@gmail.com</a> {/* text-blue-600 -> text-blue-200 */}
            </p>
          </div>

          {/* Sosyal Medya Hesapları */}
          <div className="mt-12 mb-16">
            <h3 className="text-3xl font-bold mb-6">Sosyal Medya Hesaplarımız</h3> {/* text-gray-800 kaldırıldı */}
            <div className="flex justify-center space-x-8 text-blue-200"> {/* text-blue-600 -> text-blue-200 */}
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
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-lg flex items-center">
                <CheckCircle className="mr-3" size={24} />
                <span>Talebiniz başarıyla alınmıştır. En kısa sürede sizinle iletişime geçeceğiz.</span>
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
                        className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-500 text-lg text-gray-900" // text-gray-900 eklendi
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
                      onClick={handleSubmit} // Doğrulama handleSubmit içinde yapılacak
                      className={`px-8 py-4 rounded-xl font-bold text-lg transition duration-300 ${
                        isStep3Complete ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md" : "bg-gray-300 text-gray-600 cursor-not-allowed"
                      }`}
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
                      className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-500 text-lg text-gray-900" // text-gray-900 eklendi
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
                      type="email" // type email yapıldı
                      id="email"
                      name="email"
                      value={contactInfo.email}
                      onChange={handleContactInfoChange}
                      className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-500 text-lg text-gray-900" // text-gray-900 eklendi
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
                      type="tel" // type tel yapıldı
                      id="phone"
                      name="phone"
                      value={contactInfo.phone}
                      onChange={handleContactInfoChange}
                      className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-500 text-lg text-gray-900" // text-gray-900 eklendi
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
                      className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-500 text-lg text-gray-900" // text-gray-900 eklendi
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
                      onClick={handleSubmit} // Doğrulama handleSubmit içinde yapılacak
                      className={`px-8 py-4 rounded-xl font-bold text-lg transition duration-300 ${
                        isStep4Complete ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md" : "bg-gray-300 text-gray-600 cursor-not-allowed"
                      }`}
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
                    <p className="text-lg text-gray-800 mb-2">
                      <span className="font-semibold">Ana Hizmet:</span> {selectedMainService}
                    </p>
                    <p className="text-lg text-gray-800 mb-4">
                      <span className="font-semibold">Alt Hizmet:</span> {selectedSubService}
                    </p>

                    <h4 className="text-xl font-bold text-blue-800 mb-4">Hizmete Özel Cevaplar:</h4>
                    {currentQuestions.map((question, index) => (
                      <p key={index} className="text-lg text-gray-800 mb-2">
                        <span className="font-semibold">{question}:</span> {answers[index]}
                      </p>
                    ))}

                    <h4 className="text-xl font-bold text-blue-800 mt-6 mb-4">İletişim Bilgileri:</h4>
                    <p className="text-lg text-gray-800 mb-2">
                      <span className="font-semibold">İsim Soyisim:</span> {contactInfo.name}
                    </p>
                    <p className="text-lg text-gray-800 mb-2">
                      <span className="font-semibold">E-posta:</span> {contactInfo.email}
                    </p>
                    <p className="text-lg text-gray-800 mb-2">
                      <span className="font-semibold">Telefon:</span> {contactInfo.phone}
                    </p>
                    <p className="text-lg text-gray-800 mb-2">
                      <span className="font-semibold">Mesaj:</span> {contactInfo.message}
                    </p>
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
                      type="submit"
                      className="px-8 py-4 rounded-xl font-bold text-lg transition duration-300 bg-green-600 text-white hover:bg-green-700 shadow-md"
                    >
                      Talebi Onayla ve Gönder
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Yönetici Giriş ve Panel Bölümü */}
      <section className="py-20 px-8 bg-gray-100 w-full" id="admin-section">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-5xl font-extrabold mb-12 text-gray-900 relative pb-6">
            Yönetici Paneli
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-1.5 bg-blue-600 rounded-full"></span>
          </h2>

          {!isAuthReady ? (
            <p className="text-gray-700 text-lg mb-8">Yükleniyor... (Kimlik doğrulama bekleniyor)</p>
          ) : (
            !isAdminLoggedIn ? (
              <div className="bg-white p-10 rounded-2xl shadow-2xl max-w-md mx-auto border border-gray-200">
                <h3 className="text-3xl font-bold text-gray-800 mb-6">Yönetici Girişi</h3>
                <form onSubmit={handleAdminLogin}>
                  <div className="mb-6">
                    <label htmlFor="adminEmail" className="block text-gray-700 text-xl font-medium mb-3 text-left">
                      E-posta
                    </label>
                    <input
                      type="email"
                      id="adminEmail"
                      name="adminEmail"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-500 text-lg text-gray-900"
                      required
                    />
                  </div>
                  <div className="mb-6">
                    <label htmlFor="adminPassword" className="block text-gray-700 text-xl font-medium mb-3 text-left">
                      Şifre
                    </label>
                    <input
                      type="password"
                      id="adminPassword"
                      name="adminPassword"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-500 text-lg text-gray-900"
                      required
                    />
                  </div>
                  {adminLoginError && (
                    <p className="text-red-500 text-sm mb-4">{adminLoginError}</p>
                  )}
                  <button
                    type="submit"
                    className="w-full px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition duration-300 flex items-center justify-center text-lg shadow-md"
                  >
                    <LogIn size={22} className="mr-2" /> Giriş Yap
                  </button>
                </form>
              </div>
            ) : ( // Admin giriş yapmışsa paneli göster
              <div>
                <div className="flex justify-center mb-8">
                  <button
                    onClick={handleAdminLogout}
                    className="px-8 py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition duration-300 flex items-center justify-center text-lg shadow-md"
                  >
                    <LogOut size={22} className="mr-2" /> Çıkış Yap
                  </button>
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-6">Gönderilen Talepler</h3>
                {requests.length === 0 ? (
                  <p className="text-gray-700 text-lg">Henüz gönderilmiş bir talep bulunmamaktadır.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {requests.map((request) => (
                      <div key={request.id} className="bg-white p-6 rounded-lg shadow-md text-left border border-gray-200">
                        <p className="text-lg font-semibold text-gray-800 mb-2">
                          <span className="font-bold">Ana Hizmet:</span> {request.mainService}
                        </p>
                        <p className="text-md text-gray-700 mb-4">
                          <span className="font-bold">Alt Hizmet:</span> {request.subService}
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                          Gönderilme Tarihi: {request.timestamp ? format(new Date(request.timestamp), 'dd.MM.yyyy HH:mm') : 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                          Gönderen Kullanıcı ID: {request.submitterUserId}
                        </p>
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => handleViewDetails(request)}
                            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                          >
                            <Eye size={18} className="mr-1" /> Detayları Gör
                          </button>
                          <button
                            onClick={() => handleDeleteRequest(request.id)}
                            className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
                          >
                            <Trash2 size={18} className="mr-1" /> Sil
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </section>

      {/* Talep Detayları Modalı */}
      {selectedRequestDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full relative">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Talep Detayları</h3>
            <div className="mb-4 text-gray-800"> {/* Metin rengi düzeltildi */}
              <p className="text-lg mb-2"><span className="font-semibold">Ana Hizmet:</span> {selectedRequestDetails.mainService}</p>
              <p className="text-lg mb-2"><span className="font-semibold">Alt Hizmet:</span> {selectedRequestDetails.subService}</p>
              <p className="text-lg mb-2"><span className="font-semibold">İsim Soyisim:</span> {selectedRequestDetails.contactInfo.name}</p>
              <p className="text-lg mb-2"><span className="font-semibold">E-posta:</span> {selectedRequestDetails.contactInfo.email}</p>
              <p className="text-lg mb-2"><span className="font-semibold">Telefon:</span> {selectedRequestDetails.contactInfo.phone}</p>
              <p className="text-lg mb-2"><span className="font-semibold">Mesaj:</span> {selectedRequestDetails.contactInfo.message}</p>
              <p className="text-lg mb-2"><span className="font-semibold">Gönderilme:</span> {selectedRequestDetails.timestamp ? format(new Date(selectedRequestDetails.timestamp), 'dd.MM.yyyy HH:mm') : 'N/A'}</p>
              <p className="text-lg mb-2"><span className="font-semibold">Gönderen Kullanıcı ID:</span> {selectedRequestDetails.submitterUserId}</p>

              <h4 className="text-xl font-bold text-gray-700 mt-4 mb-2">Hizmete Özel Cevaplar:</h4>
              {Object.keys(selectedRequestDetails.answers).map((key, index) => (
                <p key={index} className="text-md mb-1">
                  <span className="font-semibold">{servicesData[selectedRequestDetails.mainService]?.subCategories.find(s => s.name === selectedRequestDetails.subService)?.questions[key] || `Soru ${parseInt(key) + 1}`}:</span> {selectedRequestDetails.answers[key]}
                </p>
              ))}
            </div>
            <button
              onClick={handleCloseDetails}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <XCircle size={24} />
            </button>
          </div>
        </div>
      )}


      {/* Alt Kısım (Footer) */}
      <footer className="py-10 bg-blue-800 text-white text-center text-md w-full"> {/* bg-gray-900 yerine bg-blue-800 yapıldı */}
        <p>&copy; {new Date().getFullYear()} Zemta İnşaat ve Hafriyat. Tüm Hakları Saklıdır.</p>
        <p className="mt-2 text-sm opacity-80">Modern Web Tasarımı ile güçlendirilmiştir.</p>
      </footer>

    </main>
  );
}
