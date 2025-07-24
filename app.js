// Firebase v9+ modüler SDK'dan gerekli fonksiyonları içe aktar
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDLibwYuw_2qWo18K3eilJjbE54r7wncUI",
  authDomain: "goldealisans.firebaseapp.com",
  projectId: "goldealisans",
  storageBucket: "goldealisans.appspot.com",
  messagingSenderId: "689063095221",
  appId: "1:689063095221:web:e311fef41a857cedb1c7fc",
  measurementId: "G-7C16XNKFL9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// GİRİŞ SAYFASI İÇİN KOD
if (window.location.pathname.includes('login.html') || window.location.pathname.endsWith('/goldealisans/')) {
    
    const btnLogin = document.getElementById('btnLogin');
    
    if (btnLogin) {
        btnLogin.addEventListener('click', () => {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            setPersistence(auth, browserLocalPersistence)
                .then(() => signInWithEmailAndPassword(auth, email, password))
                .then(() => { window.location.href = 'dashboard.html'; })
                .catch((error) => {
                    const errorMessage = document.getElementById('error-message');
                    if(errorMessage) errorMessage.innerText = 'Hata: E-posta veya şifre yanlış.';
                });
        });
    }

// DASHBOARD SAYFASI İÇİN KOD
} else if (window.location.pathname.includes('dashboard.html')) {

    const btnLogout = document.getElementById('btnLogout');
    
    // Çıkış Yap Butonu
    if(btnLogout) {
        btnLogout.addEventListener('click', () => {
            signOut(auth).then(() => {
                // DÜZELTME: Tarayıcıyı sitenin kök dizinine yönlendiriyoruz.
                window.location.href = '/goldealisans/';
            });
        });
    }
    
    // Kullanıcı Oturum Durumunu Dinle
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            document.getElementById('userEmail').innerText = user.email;

            const docRef = doc(db, "licenses", user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const licenseData = docSnap.data();
                document.getElementById('licenseKey').innerText = licenseData.licenseKey || "Tanımsız";
                document.getElementById('maxAccounts').innerText = licenseData.maxAccounts || "0";
                
                const activeCount = licenseData.activeAccounts ? licenseData.activeAccounts.length : 0;
                document.getElementById('activeCount').innerText = activeCount;
                document.getElementById('remainingCount').innerText = (licenseData.maxAccounts || 0) - activeCount;
            } else {
                document.getElementById('licenseKey').innerText = "Bu hesaba atanmış lisans yok.";
            }
        }
    });
}
