// about.html - About Page Script
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Logout Function
window.logout = async function () {
  try {
    await signOut(auth);
    window.location.href = "../index.html";
  } catch (error) {
    console.error(error);
    alert("Sign out failed");
  }
};

// Check User State
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "../index.html";
  }
});
