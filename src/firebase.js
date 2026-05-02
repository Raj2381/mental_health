import { initializeApp } from "firebase/app";
import { browserLocalPersistence, getAuth, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAWZYbRRrTWqpzAnIW4wBS75vTr1kjBAp0",
  authDomain: "student-wellness-hub-692b9.firebaseapp.com",
  projectId: "student-wellness-hub-692b9",
  storageBucket: "student-wellness-hub-692b9.appspot.com",
  messagingSenderId: "572871284727",
  appId: "1:572871284727:web:b3ecf01a36799759da00f2",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("[Firebase] Failed to set auth persistence:", error);
});