// index.html - Complete Authentication Script with Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { firebaseConfig } from "./firebase-config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Always ask user to choose account
provider.setCustomParameters({
  prompt: "select_account"
});

// DOM Elements
const errorBox = document.getElementById("errorBox");
const popupOverlay = document.getElementById("popupOverlay");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const usernameStatus = document.getElementById("usernameStatus");

let isSubmitting = false;

// Close Popup Function
window.closePopup = function() {
  document.getElementById("popupOverlay").style.display = "none";
};

// Show Error Message
function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
  errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(() => {
    errorBox.classList.add("hidden");
  }, 6000);
}

// Show Success Message
function showSuccess(message) {
  errorBox.style.background = "#e6ffe6";
  errorBox.style.borderColor = "#27ae60";
  errorBox.style.color = "#229954";
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
  setTimeout(() => {
    errorBox.classList.add("hidden");
    errorBox.style.background = "#ffe6e6";
    errorBox.style.borderColor = "#e74c3c";
    errorBox.style.color = "#c0392b";
  }, 3000);
}

// Hide Error Message
function hideError() {
  errorBox.classList.add("hidden");
}

// Switch between Login and Signup tabs
window.switchTab = function(tab) {
  hideError();
  clearForms();
  
  if (tab === 'login') {
    loginForm.classList.add('active-form');
    signupForm.classList.remove('active-form');
    document.getElementById('loginTabBtn').classList.add('active');
    document.getElementById('signupTabBtn').classList.remove('active');
  } else {
    signupForm.classList.add('active-form');
    loginForm.classList.remove('active-form');
    document.getElementById('signupTabBtn').classList.add('active');
    document.getElementById('loginTabBtn').classList.remove('active');
  }
};

// Clear all forms
function clearForms() {
  document.getElementById('loginEmail').value = '';
  document.getElementById('loginPassword').value = '';
  document.getElementById('signupUsername').value = '';
  document.getElementById('signupEmail').value = '';
  document.getElementById('signupPassword').value = '';
  document.getElementById('signupConfirmPassword').value = '';
  usernameStatus.textContent = '';
}

// Set button loading state
function setButtonLoading(button, isLoading) {
  if (isLoading) {
    button.disabled = true;
    button.style.opacity = '0.7';
    button.style.cursor = 'not-allowed';
    button.textContent = button.textContent.includes('Create') ? '⏳ Creating Account...' : button.textContent.includes('Login') ? '⏳ Signing In...' : '⏳ Processing...';
  } else {
    button.disabled = false;
    button.style.opacity = '1';
    button.style.cursor = 'pointer';
    button.textContent = button.textContent.includes('Creating Account') ? 'Create Account' : button.textContent.includes('Signing In') ? 'Login' : 'Sign up with Google';
  }
}

// Check Username Availability
const usernameInput = document.getElementById('signupUsername');
if (usernameInput) {
  usernameInput.addEventListener('blur', async function() {
    const username = this.value.trim();
    if (!username) {
      usernameStatus.textContent = '';
      return;
    }
    
    if (username.length < 3) {
      usernameStatus.textContent = '⚠ Username must be at least 3 characters';
      usernameStatus.style.color = '#e74c3c';
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      usernameStatus.textContent = '⚠ Username can only contain letters, numbers, and underscores';
      usernameStatus.style.color = '#e74c3c';
      return;
    }

    try {
      usernameStatus.textContent = '⏳ Checking availability...';
      usernameStatus.style.color = '#f39c12';
      
      const q = query(collection(db, 'users'), where('username', '==', username.toLowerCase()));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        usernameStatus.textContent = '✓ Username available';
        usernameStatus.style.color = '#27ae60';
      } else {
        usernameStatus.textContent = '✗ Username already taken';
        usernameStatus.style.color = '#e74c3c';
      }
    } catch (error) {
      console.error('Error checking username:', error);
      usernameStatus.textContent = '';
    }
  });
}

// Email/Password Signup
window.handleEmailSignup = async function(event) {
  event.preventDefault();
  
  if (isSubmitting) return;
  isSubmitting = true;
  
  hideError();
  const submitBtn = event.target.querySelector('button[type="submit"]');
  setButtonLoading(submitBtn, true);

  const username = document.getElementById('signupUsername').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('signupConfirmPassword').value;

  // Validation
  if (username.length < 3) {
    showError('Username must be at least 3 characters');
    setButtonLoading(submitBtn, false);
    isSubmitting = false;
    return;
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    showError('Username can only contain letters, numbers, and underscores');
    setButtonLoading(submitBtn, false);
    isSubmitting = false;
    return;
  }

  if (password !== confirmPassword) {
    showError('Passwords do not match');
    setButtonLoading(submitBtn, false);
    isSubmitting = false;
    return;
  }

  if (password.length < 6) {
    showError('Password must be at least 6 characters');
    setButtonLoading(submitBtn, false);
    isSubmitting = false;
    return;
  }

  if (!email.includes('@')) {
    showError('Please enter a valid email address');
    setButtonLoading(submitBtn, false);
    isSubmitting = false;
    return;
  }

  try {
    // Check if username already exists
    const q = query(collection(db, 'users'), where('username', '==', username.toLowerCase()));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      showError('Username already taken');
      setButtonLoading(submitBtn, false);
      isSubmitting = false;
      return;
    }

    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;

    // Store user data in Firestore
    await setDoc(doc(db, 'users', userId), {
      username: username.toLowerCase(),
      email: email,
      displayName: username,
      createdAt: new Date(),
      authMethod: 'email'
    });

    showSuccess('✓ Account created successfully! Redirecting...');
    clearForms();
    
    setTimeout(() => {
      window.location.href = "pages/home.html";
    }, 2000);

  } catch (error) {
    console.error('Signup error:', error);
    if (error.code === 'auth/email-already-in-use') {
      showError('Email is already registered. Please login instead.');
    } else if (error.code === 'auth/invalid-email') {
      showError('Invalid email address');
    } else if (error.code === 'auth/weak-password') {
      showError('Password is too weak. Please use a stronger password.');
    } else {
      showError(error.message || 'Signup failed. Please try again.');
    }
    setButtonLoading(submitBtn, false);
    isSubmitting = false;
  }
};

// Email/Password Login
window.handleEmailLogin = async function(event) {
  event.preventDefault();
  
  if (isSubmitting) return;
  isSubmitting = true;
  
  hideError();
  const submitBtn = event.target.querySelector('button[type="submit"]');
  setButtonLoading(submitBtn, true);

  const emailOrUsername = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!emailOrUsername || !password) {
    showError('Please enter both email/username and password');
    setButtonLoading(submitBtn, false);
    isSubmitting = false;
    return;
  }

  try {
    let email = emailOrUsername;

    // Check if input is username or email
    if (!emailOrUsername.includes('@')) {
      // It's a username, find the email
      const q = query(collection(db, 'users'), where('username', '==', emailOrUsername.toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        showError('Username or email not found');
        setButtonLoading(submitBtn, false);
        isSubmitting = false;
        return;
      }

      const userData = querySnapshot.docs[0].data();
      email = userData.email;
    }

    // Set session persistence
    await setPersistence(auth, browserSessionPersistence);

    // Sign in with email and password
    await signInWithEmailAndPassword(auth, email, password);

    showSuccess('✓ Login successful! Redirecting...');
    clearForms();
    
    // Redirect after successful login
    setTimeout(() => {
      window.location.href = "pages/home.html";
    }, 1500);

  } catch (error) {
    console.error('Login error:', error);
    if (error.code === 'auth/user-not-found') {
      showError('User not found');
    } else if (error.code === 'auth/wrong-password') {
      showError('Wrong password. Please try again.');
    } else if (error.code === 'auth/invalid-email') {
      showError('Invalid email address');
    } else if (error.code === 'auth/too-many-requests') {
      showError('Too many failed attempts. Please try again later.');
    } else {
      showError(error.message || 'Login failed. Please try again.');
    }
    setButtonLoading(submitBtn, false);
    isSubmitting = false;
  }
};

// Google Login Function
window.googleLogin = async function () {
  hideError();
  
  if (isSubmitting) return;
  isSubmitting = true;

  try {
    // Force account chooser
    provider.setCustomParameters({
      prompt: "select_account"
    });

    // Session only until browser closes
    await setPersistence(auth, browserSessionPersistence);

    // Google Login
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if user exists in Firestore
    const userDocSnap = await getDocs(query(
      collection(db, 'users'),
      where('uid', '==', user.uid)
    ));

    if (userDocSnap.empty) {
      // Generate unique username from email
      const baseUsername = user.email.split('@')[0];
      let username = baseUsername;
      let counter = 1;

      // Check if username is available
      let q = query(collection(db, 'users'), where('username', '==', username.toLowerCase()));
      let snapshot = await getDocs(q);

      while (!snapshot.empty) {
        username = `${baseUsername}${counter}`;
        q = query(collection(db, 'users'), where('username', '==', username.toLowerCase()));
        snapshot = await getDocs(q);
        counter++;
      }

      // Store new user data in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        username: username.toLowerCase(),
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: new Date(),
        authMethod: 'google'
      });
    }

    showSuccess('✓ Google authentication successful! Redirecting...');
    
    // Redirect after login
    setTimeout(() => {
      window.location.href = "pages/home.html";
    }, 1500);

  } catch (error) {
    console.error('Google login error:', error);
    if (error.code !== 'auth/popup-closed-by-user') {
      showError(error.message || 'Google authentication failed. Please try again.');
    }
    isSubmitting = false;
  }
};

// Logout Function
window.logout = async function () {
  hideError();

  try {
    await signOut(auth);
    clearForms();
    window.location.href = "../index.html";
  } catch (error) {
    console.error('Logout error:', error);
    showError("Sign out failed. Please try again.");
  }
};

// Check User State on page load
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is logged in, redirect to home
    window.location.href = "pages/home.html";
  }
});
