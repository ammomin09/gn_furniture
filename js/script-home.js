// home.html - Home Page Script with Firebase Auth & Order Management
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const logoutBtn = document.getElementById("logoutBtn");
const welcomePopupOverlay = document.getElementById("welcomePopupOverlay");
const popupUserName = document.getElementById("popupUserName");
const orderModal = document.getElementById("orderModal");
const orderError = document.getElementById("orderError");

let isSubmitting = false;
const WELCOME_POPUP_SHOWN_KEY = "gnFurnitureWelcomePopupShown";

function getStoredCurrentUserProfile() {
  try {
    const rawProfile = localStorage.getItem("gnFurnitureCurrentUser");
    return rawProfile ? JSON.parse(rawProfile) : null;
  } catch (error) {
    console.error("Error reading current user profile:", error);
    return null;
  }
}

function getStoredProfileForUser(user) {
  const currentProfile = getStoredCurrentUserProfile();
  if (currentProfile?.uid === user?.uid) {
    return currentProfile;
  }

  try {
    const rawProfiles = localStorage.getItem("gnFurnitureUsers");
    const profiles = rawProfiles ? JSON.parse(rawProfiles) : {};
    return Object.values(profiles).find((profile) => profile?.uid === user?.uid) || null;
  } catch (error) {
    console.error("Error reading stored profiles:", error);
    return null;
  }
}

function markWelcomePopupSeen() {
  sessionStorage.setItem(WELCOME_POPUP_SHOWN_KEY, "true");
  localStorage.setItem(WELCOME_POPUP_SHOWN_KEY, "true");
}

function shouldShowWelcomePopup() {
  return sessionStorage.getItem(WELCOME_POPUP_SHOWN_KEY) !== "true" && localStorage.getItem(WELCOME_POPUP_SHOWN_KEY) !== "true";
}

// Close Welcome Popup Function
window.closeWelcomePopup = function () {
  welcomePopupOverlay.classList.add("hidden-popup");
  markWelcomePopupSeen();
};

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

// Check User State - Hide logout button if not logged in
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "../index.html";
  } else {
    const storedProfile = getStoredProfileForUser(user);
    let firstName = "Guest";

    if (storedProfile?.displayName) {
      firstName = storedProfile.displayName.split(' ')[0];
    } else if (storedProfile?.username) {
      firstName = storedProfile.username.charAt(0).toUpperCase() + storedProfile.username.slice(1);
    } else if (user.displayName) {
      firstName = user.displayName.split(' ')[0];
    } else if (user.email) {
      firstName = user.email.split('@')[0];
    }

    popupUserName.textContent = firstName;

    if (shouldShowWelcomePopup()) {
      markWelcomePopupSeen();

      try {
        const docSnap = await getDoc(doc(db, 'users', user.uid));
        if (docSnap.exists() && docSnap.data().username) {
          firstName = docSnap.data().username.charAt(0).toUpperCase() + docSnap.data().username.slice(1);
          popupUserName.textContent = firstName;
        }
      } catch (error) {
        console.warn("Using local fallback for the welcome name:", error);
      }

      welcomePopupOverlay.classList.remove("hidden-popup");

      setTimeout(() => {
        window.closeWelcomePopup();
      }, 8000);
    } else {
      welcomePopupOverlay.classList.add("hidden-popup");
    }
  }
});

// Order Modal Functions
window.openOrderModal = function () {
  orderModal.classList.remove("hidden-order");
  clearOrderForm();
};

window.closeOrderModal = function () {
  orderModal.classList.add("hidden-order");
  clearOrderForm();
};

// Clear Order Form
function clearOrderForm() {
  document.getElementById('productName').value = '';
  document.getElementById('quantity').value = '';
  document.getElementById('fullName').value = '';
  document.getElementById('email').value = '';
  document.getElementById('phone').value = '';
  document.getElementById('city').value = '';
  document.getElementById('address').value = '';
  document.getElementById('price').value = '';
  document.getElementById('deliveryDate').value = '';
  hideOrderError();
}

// Show Error Message
function showOrderError(message) {
  console.log('Showing error:', message);
  orderError.style.display = 'block';
  orderError.style.background = "#ffe6e6";
  orderError.style.borderColor = "#e74c3c";
  orderError.style.color = "#c0392b";
  orderError.textContent = message;
  orderError.classList.remove("hidden");
}

// Hide Error Message
function hideOrderError() {
  orderError.classList.add("hidden");
  orderError.style.display = 'none';
}

// Set button loading state
function setOrderButtonLoading(button, isLoading) {
  if (isLoading) {
    button.disabled = true;
    button.style.opacity = '0.7';
    button.style.cursor = 'not-allowed';
    button.textContent = '⏳ Processing Order...';
  } else {
    button.disabled = false;
    button.style.opacity = '1';
    button.style.cursor = 'pointer';
    button.textContent = 'Confirm Order';
  }
}

// Handle Order Submit
window.handleOrderSubmit = async function(event) {
  event.preventDefault();
  console.log('Order submit started');

  if (isSubmitting) {
    console.log('Already submitting, returning');
    return;
  }
  isSubmitting = true;

  hideOrderError();
  const submitBtn = event.target.querySelector('button[type="submit"]');
  setOrderButtonLoading(submitBtn, true);

  const user = auth.currentUser;

  if (!user) {
    console.error('No user logged in');
    showOrderError('Please log in to place an order');
    setOrderButtonLoading(submitBtn, false);
    isSubmitting = false;
    return;
  }

  console.log('Current user:', user.uid);

  // Get form values
  const productName = document.getElementById('productName').value.trim();
  const quantity = parseInt(document.getElementById('quantity').value);
  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const city = document.getElementById('city').value.trim();
  const address = document.getElementById('address').value.trim();
  const price = parseFloat(document.getElementById('price').value);
  const deliveryDate = document.getElementById('deliveryDate').value;

  // Validation
  if (!productName) {
    showOrderError('Please enter product name');
    setOrderButtonLoading(submitBtn, false);
    isSubmitting = false;
    return;
  }

  if (quantity <= 0 || isNaN(quantity)) {
    showOrderError('Quantity must be greater than 0');
    setOrderButtonLoading(submitBtn, false);
    isSubmitting = false;
    return;
  }

  if (!fullName) {
    showOrderError('Please enter your full name');
    setOrderButtonLoading(submitBtn, false);
    isSubmitting = false;
    return;
  }

  if (!email.includes('@')) {
    showOrderError('Please enter a valid email address');
    setOrderButtonLoading(submitBtn, false);
    isSubmitting = false;
    return;
  }

  if (!/^[0-9]{10}$/.test(phone)) {
    showOrderError('Please enter a valid 10-digit phone number');
    setOrderButtonLoading(submitBtn, false);
    isSubmitting = false;
    return;
  }

  if (!city) {
    showOrderError('Please enter your city');
    setOrderButtonLoading(submitBtn, false);
    isSubmitting = false;
    return;
  }

  if (!address) {
    showOrderError('Please enter your complete address');
    setOrderButtonLoading(submitBtn, false);
    isSubmitting = false;
    return;
  }

  if (price <= 0 || isNaN(price)) {
    showOrderError('Price must be greater than 0');
    setOrderButtonLoading(submitBtn, false);
    isSubmitting = false;
    return;
  }

  if (!deliveryDate) {
    showOrderError('Please select a delivery date');
    setOrderButtonLoading(submitBtn, false);
    isSubmitting = false;
    return;
  }

  // Check if delivery date is in future
  const selectedDate = new Date(deliveryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    showOrderError('Delivery date must be in the future');
    setOrderButtonLoading(submitBtn, false);
    isSubmitting = false;
    return;
  }

  try {
    console.log('Preparing order data...');

    // Add order to Firestore
    const orderData = {
      userId: user.uid,
      userEmail: user.email,
      productName: productName,
      quantity: quantity,
      fullName: fullName,
      email: email,
      phone: phone,
      city: city,
      address: address,
      price: price,
      totalAmount: price * quantity,
      deliveryDate: deliveryDate,
      orderStatus: 'pending',
      createdAt: serverTimestamp(),
      notes: ''
    };

    console.log('Order data:', orderData);
    console.log('Adding to Firestore...');

    const docRef = await addDoc(collection(db, 'orders'), orderData);

    console.log('Order placed successfully:', docRef.id);

    // Show success message
    orderError.style.display = 'block';
    orderError.style.background = "#e6ffe6";
    orderError.style.borderColor = "#27ae60";
    orderError.style.color = "#229954";
    orderError.textContent = `✓ Order placed successfully! Order ID: ${docRef.id}`;
    orderError.classList.remove("hidden");

    clearOrderForm();
    setOrderButtonLoading(submitBtn, false);
    isSubmitting = false;

    // Auto-close modal after 3 seconds
    setTimeout(() => {
      window.closeOrderModal();
      // Reset error styling
      orderError.style.background = "#ffe6e6";
      orderError.style.borderColor = "#e74c3c";
      orderError.style.color = "#c0392b";
    }, 3000);

  } catch (error) {
    console.error('Order submission error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);

    let errorMsg = error.message || 'Failed to place order. Please try again.';

    // Handle specific Firestore errors
    if (error.code === 'permission-denied') {
      errorMsg = 'Permission denied. Please contact support.';
    } else if (error.code === 'unavailable') {
      errorMsg = 'Service unavailable. Please try again later.';
    }

    showOrderError(errorMsg);
    setOrderButtonLoading(submitBtn, false);
    isSubmitting = false;
  }
};

// Close order modal when clicking outside
window.addEventListener('click', function (event) {
  if (event.target === orderModal) {
    window.closeOrderModal();
  }
});

// Navigation drawer (mobile) toggle
// Note: On some breakpoints we intentionally show a simple (non-drawer) nav.
// So we only enable drawer behavior when the toggle exists and the nav is meant to be a drawer.
(function initNavDrawer() {
  const navToggle = document.getElementById('navToggle');
  const primaryNav = document.getElementById('primaryNav');
  const navBackdrop = document.getElementById('navBackdrop');

  if (!navToggle || !primaryNav || !navBackdrop) return;

  const setOpen = (isOpen) => {
    primaryNav.classList.toggle('is-open', isOpen);
    navBackdrop.classList.toggle('is-open', isOpen);
    navToggle.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  // If burger is hidden via CSS, avoid intercepting clicks.
  if (window.getComputedStyle(navToggle).display === 'none') {
    // Important: do not bind drawer/backdrop handlers that might block navigation.
    return;
  }

  // Ensure backdrop never captures clicks when drawer is not open.
    // Backdrop must never block taps while drawer is disabled by CSS
    navBackdrop.style.pointerEvents = 'none';
    navBackdrop.style.opacity = '0';
    navBackdrop.style.visibility = 'hidden';

    // Extra safety: ensure links are clickable
    primaryNav.style.pointerEvents = 'auto';
    navToggle.style.pointerEvents = 'auto';


  navToggle.addEventListener('click', function () {
    setOpen(!primaryNav.classList.contains('is-open'));
  });
  navBackdrop.addEventListener('click', function () {
    setOpen(false);
  });
  primaryNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', function () {
      // Only close when drawer is actually in use
      if (window.getComputedStyle(navToggle).display !== 'none') setOpen(false);
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setOpen(false);
  });
})();


// Card Animation Observer
const cards = document.querySelectorAll(".card");

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {

        if(entry.isIntersecting){
            entry.target.classList.add("show");
        } else {
            entry.target.classList.remove("show");
        }

    });
}, {
    threshold: 0.2
});

cards.forEach((card) => {
    observer.observe(card);
});

// Box Animation Observer
const boxes = document.querySelectorAll(".b1");

const observer2 = new IntersectionObserver((entries) => {

    entries.forEach((entry) => {

        if(entry.isIntersecting){
            entry.target.classList.add("show");
        } else {
            entry.target.classList.remove("show");
        }

    });

}, {
    threshold: 0.2
});

boxes.forEach((box) => {
    observer2.observe(box);
});

