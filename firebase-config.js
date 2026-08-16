// Firebase v10 CDN ES Modülleri
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// FIREBASE PROJE BİLGİLERİNİZİ BURAYA GİRİN:
const firebaseConfig = {
  apiKey: "FIREBASE_API_KEY_BURAYA",
  authDomain: "bydesign-portfolyo.firebaseapp.com",
  projectId: "bydesign-portfolyo",
  storageBucket: "bydesign-portfolyo.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

// Uygulamayı Başlat
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
