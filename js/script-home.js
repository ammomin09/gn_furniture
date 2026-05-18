// home.html - Home Page Script with Firebase Auth & Google Pay
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

// DOM Elements
const logoutBtn = document.getElementById("logoutBtn");
const welcomePopupOverlay = document.getElementById("welcomePopupOverlay");
const popupUserName = document.getElementById("popupUserName");
const paymentModal = document.getElementById("paymentModal");

// Close Welcome Popup Function
window.closeWelcomePopup = function () {
  welcomePopupOverlay.classList.add("hidden-popup");
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
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "../index.html";
  } else {
    // Show welcome popup with user's name (only on first visit after login)
    if (!sessionStorage.getItem("popupShown")) {
      const firstName = user.displayName ? user.displayName.split(' ')[0] : "Guest";
      popupUserName.textContent = firstName;
      welcomePopupOverlay.classList.remove("hidden-popup");
      sessionStorage.setItem("popupShown", "true");
    } else {
      welcomePopupOverlay.classList.add("hidden-popup");
    }
  }
});

// Payment Modal Functions
window.openPaymentModal = function () {
  paymentModal.classList.remove("hidden-payment");
  initGooglePay();
};

window.closePaymentModal = function () {
  paymentModal.classList.add("hidden-payment");
};

// Google Pay Integration
async function initGooglePay() {
  const paymentsClient = new google.payments.api.PaymentsClient({environment: 'TEST'});
  
  const isReadyToPayRequest = {
    apiVersion: 2,
    apiVersionMinor: 0,
    allowedPaymentMethods: [{
      type: 'CARD',
      parameters: {
        allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
        allowedCardNetworks: ['MASTERCARD', 'VISA']
      }
    }]
  };

  try {
    const isReadyToPay = await paymentsClient.isReadyToPay(isReadyToPayRequest);
    if (isReadyToPay.result) {
      addGooglePayButton(paymentsClient);
    }
  } catch (err) {
    console.log('Error checking Google Pay availability:', err);
  }
}

// Add Google Pay Button
function addGooglePayButton(paymentsClient) {
  const totalAmountSpan = document.getElementById("totalAmount");
  const amount = totalAmountSpan.textContent.replace('₹', '').trim();
  
  const paymentDataRequest = {
    apiVersion: 2,
    apiVersionMinor: 0,
    allowedPaymentMethods: [{
      type: 'CARD',
      parameters: {
        allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
        allowedCardNetworks: ['MASTERCARD', 'VISA']
      },
      tokenizationSpecification: {
        type: 'PAYMENT_GATEWAY',
        parameters: {
          gateway: 'stripe',
          stripVersion: '2021-06-04'
        }
      }
    }],
    merchantInfo: {
      merchantId: 'GN_FURNITURE_ID',
      merchantName: 'GN Furniture'
    },
    transactionInfo: {
      totalPriceStatus: 'FINAL',
      totalPrice: amount,
      currencyCode: 'INR'
    },
    callbackIntents: ['PAYMENT_AUTHORIZATION']
  };

  const button = paymentsClient.createButton({
    onClick: () => {
      paymentsClient.loadPaymentData(paymentDataRequest)
        .then(function(paymentData) {
          handlePaymentSuccess(paymentData);
        })
        .catch(function(err) {
          console.error('Payment error:', err);
          alert('Payment cancelled or failed');
        });
    },
    allowedPaymentMethods: paymentDataRequest.allowedPaymentMethods
  });

  const googlePayButton = document.getElementById('google-pay-button');
  googlePayButton.innerHTML = '';
  googlePayButton.appendChild(button);
}

// Handle Payment Success
function handlePaymentSuccess(paymentData) {
  const user = auth.currentUser;
  
  window.closePaymentModal();
  
  const message = `✅ Payment Successful!\n\nAmount: ₹${document.getElementById("totalAmount").textContent.replace('₹', '')}\nPayment Method: Google Pay\n\nThank you for shopping at GN Furniture!\n\nOrder confirmation sent to ${user.email}`;
  
  alert(message);
  
  console.log('Payment completed:', {
    user: user.email,
    timestamp: new Date().toISOString(),
    paymentData: paymentData
  });
}

// Close payment modal when clicking outside
window.addEventListener('click', function (event) {
  if (event.target === paymentModal) {
    window.closePaymentModal();
  }
});

const cards = document.querySelectorAll(".card");

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {

        if(entry.isIntersecting){
            entry.target.classList.add("show");
        } else {
            // Remove class when card leaves viewport
            // so animation repeats infinitely
            entry.target.classList.remove("show");
        }

    });
}, {
    threshold: 0.2
});

cards.forEach((card) => {
    observer.observe(card);
});

const boxes = document.querySelectorAll(".b1");

const observer2 = new IntersectionObserver((entries) => {

    entries.forEach((entry) => {

        if(entry.isIntersecting){
            entry.target.classList.add("show");
        } else {
            // Remove when leaving viewport
            // so animation repeats infinitely
            entry.target.classList.remove("show");
        }

    });

}, {
    threshold: 0.2
});

boxes.forEach((box) => {
    observer2.observe(box);
});

