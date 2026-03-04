import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // YENİ EKLENDİ
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBoou4x3aOxl1Mae_mBnhkl0nL3KmuU0BE",
  authDomain: "gym-app-6ecd7.firebaseapp.com",
  projectId: "gym-app-6ecd7",
  storageBucket: "gym-app-6ecd7.firebasestorage.app",
  messagingSenderId: "382843081725",
  appId: "1:382843081725:web:5b780b0afa13c10ff2bf94",
  measurementId: "G-J4TVV7J8H5",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app); // YENİ EKLENDİ: Diğer sayfalarda kullanmak için dışa aktarıyoruz
