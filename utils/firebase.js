// firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase yapılandırması ortam değişkenlerinden alınır
// process.env.NEXT_PUBLIC_FIREBASE_API_KEY gibi değişkenlerin
// .env.local dosyasında doğru tanımlandığından emin olun.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app;
let auth;
let db;

// Uygulama henüz başlatılmadıysa başlat
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("[Firebase Init] Firebase başarıyla başlatıldı.");
  } catch (error) {
    console.error("[Firebase Init ERROR] Firebase başlatılırken kritik hata oluştu:", error);
    // Hata durumunda null olarak kalmalarını sağlarız
    app = null;
    auth = null;
    db = null;
  }
} else {
  // Zaten başlatıldıysa mevcut örneği kullan
  app = getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  console.log("[Firebase Init] Mevcut Firebase örneği kullanılıyor.");
}

export { auth, db };
