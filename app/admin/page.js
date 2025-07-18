"use client";

import { useState, useEffect } from 'react';
import { db, auth } from '../../utils/firebase'; // Düzeltilmiş yol: app/admin'den root'a (../../), sonra utils'a
import { collection, query, onSnapshot, deleteDoc, doc } from 'firebase/firestore'; // Firestore fonksiyonlarını içe aktar
import { onAuthStateChanged, signOut } from 'firebase/auth'; // Auth durumunu dinlemek ve çıkış yapmak için
import { useRouter } from 'next/navigation'; // Yönlendirme için useRouter

// Lucide-react ikonlarını dinamik olarak içeri aktarıyoruz.
import dynamic from "next/dynamic";
const Loader = dynamic(() => import("lucide-react").then(mod => mod.Loader), { ssr: false });
const Trash2 = dynamic(() => import("lucide-react").then(mod => mod.Trash2), { ssr: false });
const Eye = dynamic(() => import("lucide-react").then(mod => mod.Eye), { ssr: false });
const LogOut = dynamic(() => import("lucide-react").then(mod => mod.LogOut), { ssr: false });

export default function AdminPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [user, setUser] = useState(null); // Kullanıcı objesini tutmak için
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);
  const router = useRouter(); // useRouter hook'unu kullan

  // Auth durumunu dinle ve kullanıcıyı doğrula
  useEffect(() => {
    console.log("[Admin Auth Init] Auth durumu dinleniyor...");
    if (!auth) {
      console.error("[Admin Auth Init ERROR] Firebase Auth nesnesi (auth) başlatılamadı veya tanımsız. Lütfen utils/firebase.js dosyasını kontrol edin.");
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
        router.push("/admin/login"); // Giriş yapmamışsa giriş sayfasına yönlendir
      }
      setIsAuthReady(true);
      console.log("[Admin Auth] isAuthReady true olarak ayarlandı.");
    });

    return () => unsubscribeAuth();
  }, [router]); // router bağımlılığı eklendi

  // Firebase Firestore'dan veri çekme (sadece kullanıcı giriş yapmışsa)
  useEffect(() => {
    console.log("[Admin Data Fetch Effect] isAuthReady:", isAuthReady, "user:", user, "db:", db);
    if (!isAuthReady || !user) { // Auth hazır değilse veya kullanıcı yoksa veri çekme
      console.log("[Admin Data Fetch] Firebase Auth henüz hazır değil veya kullanıcı giriş yapmadı. Veri çekme bekleniyor.");
      setLoading(false); // Yükleniyor durumunu kapat
      return;
    }
    if (!db) {
      console.error("[Admin Data Fetch ERROR] Firebase Firestore nesnesi (db) başlatılamadı veya tanımsız. Lütfen utils/firebase.js dosyasını kontrol edin.");
      setError("Firebase veritabanı servisi başlatılamadı. Lütfen konsolu kontrol edin.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // __app_id global değişkenini kullan ve string olduğundan emin ol
    const currentAppId = typeof __app_id !== 'undefined' ? String(__app_id) : 'default-app-id';
    const collectionPath = `artifacts/${currentAppId}/requests`;
    console.log(`[Admin Data Fetch] Firestore koleksiyon yolu: ${collectionPath}`);

    // Firestore'dan gerçek zamanlı veri çekme
    const q = collection(db, collectionPath);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log("[Admin Data Fetch] onSnapshot tetiklendi.");
      const fetchedRequests = [];
      snapshot.forEach((doc) => {
        fetchedRequests.push({ id: doc.id, ...doc.data() });
      });

      // Tarihe göre ters sırada sırala (en yeni en üstte)
      fetchedRequests.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setRequests(fetchedRequests);
      setLoading(false);
      console.log(`[Admin Data Fetch] ${fetchedRequests.length} talep başarıyla çekildi.`);
    }, (err) => {
      console.error("[Admin Data Fetch ERROR] Firestore'dan veri çekilirken hata:", err);
      setError("Talepler yüklenirken bir hata oluştu: " + err.message);
      setLoading(false);
    });

    // Component unmount edildiğinde listener'ı temizle
    return () => {
      console.log("[Admin Data Fetch] onSnapshot listener temizlendi.");
      unsubscribe();
    };
  }, [isAuthReady, user, db]); // user bağımlılığı eklendi

  const handleRefresh = () => {
    setLoading(true);
    setRequests([]); // Mevcut talepleri temizle
    // useEffect bağımlılıkları sayesinde otomatik olarak yeniden yüklenecektir
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
      router.push("/admin/login"); // Çıkış yapıldıktan sonra giriş sayfasına yönlendir
    } catch (err) {
      console.error("[Admin Logout ERROR] Çıkış yapılırken hata:", err);
      setError("Çıkış yapılırken bir hata oluştu: " + err.message);
    }
  };

  // Eğer Firebase auth henüz hazır değilse veya kullanıcı giriş yapmamışsa yükleniyor göster
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

  // Eğer bir hata varsa, hata mesajını göster
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

  // Kullanıcı giriş yapmamışsa (veya giriş yapması bekleniyorsa), hiçbir şey render etme
  // useEffect zaten /admin/login'e yönlendirecektir.
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
                {/* selectedRequest.answers'ın bir nesne olduğunu varsayarak */}
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
