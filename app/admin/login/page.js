"use client"; // Bu bileşen client-side'da çalışacağı için gereklidir.

import { useState, useEffect } from "react";
import { auth } from "../../../utils/firebase"; // Düzeltilmiş yol: app/admin/login'den root'a (../../../), sonra utils'a
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation"; // useRouter hook'unu import et

// Lucide-react ikonlarını dinamik olarak içeri aktarıyoruz.
import dynamic from "next/dynamic";
const Loader = dynamic(() => import("lucide-react").then(mod => mod.Loader), { ssr: false });
const AlertCircle = dynamic(() => import("lucide-react").then(mod => mod.AlertCircle), { ssr: false });

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter(); // Yönlendirme için useRouter hook'unu kullan

  // Kullanıcı zaten giriş yapmışsa admin paneline yönlendir
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("[Admin Login] Kullanıcı zaten giriş yapmış, admin paneline yönlendiriliyor.");
        router.push("/admin"); // Giriş yapmışsa admin paneline yönlendir
      }
    });
    return () => unsubscribe(); // Cleanup
  }, [router]); // router bağımlılığı eklendi

  const handleLogin = async (e) => {
    e.preventDefault(); // Formun varsayılan gönderimini engelle
    setError(null); // Önceki hataları temizle
    setLoading(true); // Yükleniyor durumunu başlat

    try {
      if (!auth) {
        throw new Error("Firebase Auth başlatılamadı. Lütfen konsolu kontrol edin.");
      }
      console.log(`[Admin Login] Giriş denemesi: ${email}`);
      await signInWithEmailAndPassword(auth, email, password);
      console.log("[Admin Login] Giriş başarılı!");
      // Giriş başarılı olduğunda otomatik olarak useEffect tetiklenecek ve yönlendirme yapacak
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
      setLoading(false); // Yükleniyor durumunu bitir
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
