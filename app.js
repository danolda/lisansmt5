// Firebase v9+ modüler SDK'dan gerekli fonksiyonları içe aktar
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// --- MASTER DEBUG 1 ---
// Bu mesaj görünüyorsa, tarayıcı bu script dosyasını okumaya başladı demektir.
console.log("--- app.js script dosyası başarıyla OKUNDU ---");

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

// --- MASTER DEBUG 2 ---
// Bu mesaj görünüyorsa, script dosyası çalışmaya devam ediyor ve Firebase'i başlatacak.
console.log("--- Firebase'i başlatma adımına gelindi ---");
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
console.log("--- Firebase başarıyla başlatıldı ---");

// --- MASTER DEBUG 3 ---
// Bu mesaj, hangi sayfada olduğumuzu kontrol etmeden hemen önce yazılacak.
// Ayrıca tarayıcının gördüğü sayfa yolunu (pathname) da yazdıracağız. Bu çok önemli!
console.log("--- Sayfa yolunu kontrol etme adımına gelindi. Tarayıcının gördüğü yol:", window.location.pathname, "---");


if (window.location.pathname.includes('login.html') || window.location.pathname.endsWith('/') || window.location.pathname.endsWith('/mt5-lisans-sitesi/')) {
    
    // --- LOGIN PAGE DEBUG ---
    console.log(">>> LOGIN SAYFASI mantığına girildi.");
    const btnLogin = document.getElementById('btnLogin');
    btnLogin.addEventListener('click', () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        setPersistence(auth, browserLocalPersistence)
            .then(() => signInWithEmailAndPassword(auth, email, password))
            .then(() => { window.location.href = 'dashboard.html'; })
            .catch((error) => { console.error("Login hatası:", error); });
    });

} else if (window.location.pathname.includes('dashboard.html')) {

    // --- DASHBOARD PAGE DEBUG ---
    console.log(">>> DASHBOARD SAYFASI mantığına girildi.");
    onAuthStateChanged(auth, async (user) => {
        console.log(">>> onAuthStateChanged fonksiyonu tetiklendi.");
        if (user) {
            console.log(">>> KULLANICI GİRİŞ YAPMIŞ olarak bulundu. UID:", user.uid);
            // ... Veri çekme kodları burada ...
            document.getElementById('userEmail').innerText = user.email;
            const docRef = doc(db, "licenses", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                console.log(">>> Firestore belgesi bulundu:", docSnap.data());
                const licenseData = docSnap.data();
                document.getElementById('licenseKey').innerText = licenseData.licenseKey;
                document.getElementById('maxAccounts').innerText = licenseData.maxAccounts;
                const activeCount = licenseData.activeAccounts ? licenseData.activeAccounts.length : 0;
                document.getElementById('activeCount').innerText = activeCount;
                document.getElementById('remainingCount').innerText = licenseData.maxAccounts - activeCount;
            } else {
                console.log(">>> Firestore belgesi BULUNAMADI.");
                document.getElementById('licenseKey').innerText = "Lisans bilgisi yok.";
            }
        } else {
             console.log(">>> KULLANICI GİRİŞ YAPMAMIŞ olarak algılandı ('user' nesnesi boş).");
        }
    });

} else {
    // --- CATCH-ALL DEBUG ---
    console.error("!!! HİÇBİR SAYFA KOŞULU EŞLEŞMEDİ !!! Sayfa yolu kontrolü başarısız.");
}
