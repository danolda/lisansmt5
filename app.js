// Firebase v9+ modüler SDK'dan gerekli fonksiyonları içe aktar
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Sizin sağladığınız Firebase yapılandırma bilgileri
const firebaseConfig = {
  apiKey: "AIzaSyDLibwYuw_2qWo18K3eilJjbE54r7wncUI",
  authDomain: "goldealisans.firebaseapp.com",
  projectId: "goldealisans",
  storageBucket: "goldealisans.appspot.com",
  messagingSenderId: "689063095221",
  appId: "1:689063095221:web:e311fef41a857cedb1c7fc",
  measurementId: "G-7C16XNKFL9"
};

// Firebase servislerini başlat
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

//--- Sayfa yoluna göre ilgili kodu çalıştır ---
if (window.location.pathname.includes('login.html') || window.location.pathname.endsWith('/') || window.location.pathname.endsWith('/mt5-lisans-sitesi/')) {
    
    // --- GİRİŞ SAYFASI KODU ---
    const btnLogin = document.getElementById('btnLogin');
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');

    btnLogin.addEventListener('click', () => {
        const email = emailField.value;
        const password = passwordField.value;

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                window.location.href = 'dashboard.html';
            })
            .catch((error) => {
                errorMessage.innerText = 'Hata: E-posta veya şifre yanlış.';
                console.error("Giriş Hatası:", error);
            });
    });

} else if (window.location.pathname.includes('dashboard.html')) {

    // --- KULLANICI PANELİ (DASHBOARD) KODU ---
    const userEmailSpan = document.getElementById('userEmail');
    const licenseKeySpan = document.getElementById('licenseKey');
    const maxAccountsSpan = document.getElementById('maxAccounts');
    const activeCountSpan = document.getElementById('activeCount');
    const remainingCountSpan = document.getElementById('remainingCount');
    const btnLogout = document.getElementById('btnLogout');
    
    // Kullanıcının giriş durumunu dinle
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // --- DEBUG KODU BAŞLANGICI ---
            console.log("Kullanıcı giriş yaptı. UID:", user.uid);
            userEmailSpan.innerText = user.email;
            
            const docRef = doc(db, "licenses", user.uid);
            console.log("Firestore'dan şu belge isteniyor:", docRef.path);

            try {
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    console.log("Belge bulundu! İçerik:", docSnap.data());
                    const licenseData = docSnap.data();
                    licenseKeySpan.innerText = licenseData.licenseKey;
                    maxAccountsSpan.innerText = licenseData.maxAccounts;
                    
                    const activeCount = licenseData.activeAccounts ? licenseData.activeAccounts.length : 0;
                    activeCountSpan.innerText = activeCount;
                    remainingCountSpan.innerText = licenseData.maxAccounts - activeCount;
                } else {
                    console.log("Belge bulunamadı! Bu UID'ye sahip bir belge Firestore'da yok.");
                    licenseKeySpan.innerText = "Bu hesaba atanmış bir lisans bulunamadı!";
                }
            } catch (error) {
                console.error("Firestore'dan veri çekerken HATA oluştu:", error);
                licenseKeySpan.innerText = "Veritabanından veri alınırken bir hata oluştu.";
            }
            // --- DEBUG KODU SONU ---

        } else {
            window.location.href = 'login.html';
        }
    });

    btnLogout.addEventListener('click', () => {
        signOut(auth).then(() => {
            window.location.href = 'login.html';
        });
    });
}
