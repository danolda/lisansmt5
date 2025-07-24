// Firebase v9+ modüler SDK'dan gerekli fonksiyonları içe aktar
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// --- Script Başlangıç Kontrolü ---
console.log("--- app.js dosyası OKUNDU ---");

// Firebase yapılandırma bilgileriniz...
const firebaseConfig = {
  apiKey: "AIzaSyDLibwYuw_2qWo18K3eilJjbE54r7wncUI",
  authDomain: "goldealisans.firebaseapp.com",
  projectId: "goldealisans",
  storageBucket: "goldealisans.appspot.com",
  messagingSenderId: "689063095221",
  appId: "1:689063095221:web:e311fef41a857cedb1c7fc",
  measurementId: "G-7C16XNKFL9"
};

// --- Firebase'i Başlatma ---
console.log("--- Firebase'i başlatma adımına gelindi ---");
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
console.log("--- Firebase başarıyla başlatıldı ---");


// --- Sayfa Yönlendirme Mantığı ---
console.log("--- Sayfa yolunu kontrol etme adımına gelindi. Tarayıcının gördüğü yol:", window.location.pathname, "---");

// GİRİŞ SAYFASI İÇİN KOD
// Not: GitHub Pages için proje adını da yola dahil ediyoruz
if (window.location.pathname.includes('login.html') || window.location.pathname.endsWith('/') || window.location.pathname.endsWith('/goldealisans/') || window.location.pathname.endsWith('/mt5-lisans-sitesi/')) {
    
    console.log(">>> LOGIN SAYFASI mantığına girildi.");
    const btnLogin = document.getElementById('btnLogin');
    
    if (btnLogin) {
        btnLogin.addEventListener('click', () => {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            setPersistence(auth, browserLocalPersistence)
                .then(() => {
                    return signInWithEmailAndPassword(auth, email, password);
                })
                .then(() => {
                    window.location.href = 'dashboard.html';
                })
                .catch((error) => {
                    console.error("Giriş veya Kalıcılık Hatası:", error);
                    const errorMessage = document.getElementById('error-message');
                    if(errorMessage) errorMessage.innerText = 'Hata: E-posta veya şifre yanlış.';
                });
        });
    }

// DASHBOARD SAYFASI İÇİN KOD
} else if (window.location.pathname.includes('dashboard.html')) {

    console.log(">>> DASHBOARD SAYFASI mantığına girildi.");
    const btnLogout = document.getElementById('btnLogout');
    
    // Çıkış Yap Butonu Kontrolü
    if(btnLogout) {
        console.log(">>> 'Çıkış Yap' butonu bulundu ve tıklama olayı ekleniyor.");
        btnLogout.addEventListener('click', () => {
            signOut(auth).then(() => {
                window.location.href = 'login.html';
            });
        });
    } else {
        console.error("!!! 'Çıkış Yap' butonu (id='btnLogout') HTML'de bulunamadı!");
    }
    
    // Kullanıcı Oturum Durumunu Dinle
    onAuthStateChanged(auth, async (user) => {
        console.log(">>> onAuthStateChanged fonksiyonu tetiklendi.");
        if (user) {
            console.log(">>> KULLANICI GİRİŞ YAPMIŞ olarak bulundu. UID:", user.uid);
            document.getElementById('userEmail').innerText = user.email;

            const docRef = doc(db, "licenses", user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                console.log(">>> Firestore belgesi bulundu:", docSnap.data());
                const licenseData = docSnap.data();
                document.getElementById('licenseKey').innerText = licenseData.licenseKey || "Tanımsız";
                document.getElementById('maxAccounts').innerText = licenseData.maxAccounts || "0";
                
                const activeCount = licenseData.activeAccounts ? licenseData.activeAccounts.length : 0;
                document.getElementById('activeCount').innerText = activeCount;
                document.getElementById('remainingCount').innerText = (licenseData.maxAccounts || 0) - activeCount;
            } else {
                console.log(">>> Firestore belgesi BULUNAMADI.");
                document.getElementById('licenseKey').innerText = "Bu hesaba atanmış lisans yok.";
            }
        } else {
             console.log(">>> KULLANICI GİRİŞ YAPMAMIŞ olarak algılandı ('user' nesnesi boş).");
        }
    });
}
