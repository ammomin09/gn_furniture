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
const profile = document.querySelector(".profile");

if (profile) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      } else {
        entry.target.classList.remove("show");
      }
    });
  }, {
    threshold: 0.3
  });

  observer.observe(profile);
}

// Legacy site-header mobile drawer (about.html, contact.html)
(function initLegacyDrawer() {
  const burger = document.getElementById('legacyBurger');
  const nav = document.getElementById('legacyNav');
  const backdrop = document.getElementById('legacyBackdrop');
  if (!burger || !nav || !backdrop) return;

  const setOpen = (isOpen) => {
    nav.classList.toggle('is-open', isOpen);
    backdrop.classList.toggle('is-open', isOpen);
    burger.classList.toggle('is-open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  burger.addEventListener('click', function () {
    setOpen(!nav.classList.contains('is-open'));
  });
  backdrop.addEventListener('click', function () {
    setOpen(false);
  });
  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', function () {
      if (window.innerWidth <= 1024) setOpen(false);
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setOpen(false);
  });
})();