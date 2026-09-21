import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// La configuración de tu proyecto Firebase que acabamos de generar
const firebaseConfig = {
  apiKey: "AIzaSyCcFx97-KDaXJeb-ed2DpP4SnexONCH7NM",
  authDomain: "transnewfastcar-9c78e.firebaseapp.com",
  projectId: "transnewfastcar-9c78e",
  storageBucket: "transnewfastcar-9c78e.firebasestorage.app",
  messagingSenderId: "115169830404",
  appId: "1:115169830404:web:0871bb45c52eb0481bf751"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar y exportar la Base de Datos para usarla en tus vistas
export const db = getFirestore(app);