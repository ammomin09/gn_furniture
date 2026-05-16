// index.html - Google Authentication Script
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Always ask user to choose account
provider.setCustomParameters({
  prompt: "select_account"
});

// DOM Elements
const loginSection = document.getElementById("loginSection");
const userSection = document.getElementById("userSection");
const userPhoto = document.getElementById("userPhoto");
const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const errorBox = document.getElementById("errorBox");
const popupOverlay = document.getElementById("popupOverlay");

// Close Popup Function
window.closePopup = function() {
  popupOverlay.classList.add("hidden-popup");
};

// Show Error Message
function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
}

// Hide Error Message
function hideError() {
  errorBox.classList.add("hidden");
}

// Google Login Function
window.googleLogin = async function () {
  hideError();

  try {
    // Force account chooser
    provider.setCustomParameters({
      prompt: "select_account"
    });

    // Session only until browser closes
    await setPersistence(auth, browserSessionPersistence);

    // Google Login
    await signInWithPopup(auth, provider);

    // Redirect after login
    window.location.href = "pages/home.html";

  } catch (error) {
    console.error(error);
    showError(error.message);
  }
};

// Logout Function
window.logout = async function () {
  hideError();

  try {
    await signOut(auth);
    alert("Signed out successfully");
  } catch (error) {
    console.error(error);
    showError("Sign out failed");
  }
};

// Check User State
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginSection.classList.add("hidden");
    userSection.classList.remove("hidden");

    userPhoto.src = user.photoURL;
    userName.textContent = user.displayName;
    userEmail.textContent = user.email;
  } else {
    loginSection.classList.remove("hidden");
    userSection.classList.add("hidden");
  }
});
