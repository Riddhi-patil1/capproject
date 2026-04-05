import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Replace with your Firebase project config from the Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDsw5ScZfGeovKdU0gCn4Pz_I0bIMONTj8",
  authDomain: "justice-os.firebaseapp.com",
  projectId: "justice-os",
  storageBucket: "justice-os.firebasestorage.app",
  messagingSenderId: "120830319860",
  appId: "1:120830319860:web:d204c2efa0780a764452a1",
  measurementId: "G-P845B8YNFG"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
