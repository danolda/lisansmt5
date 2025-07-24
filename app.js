// Firebase v9+ modüler SDK'dan gerekli fonksiyonları içe aktar
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
// YENİ: Oturum kalıcılığı için fonksiyonlar eklendi
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

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

        // YENİ: Giriş yapmadan ÖNCE oturumun kalıcı olacağını belirtiyoruz.
        setPersistence(auth, browserLocalPersistence)
            .then(() => {
                // Oturum kalıcılığı ayarlandıktan sonra giriş yap.
                return signInWithEmailAndPassword(auth, email, password);
            })
            .then((userCredential) => {
                window.location.href = 'dashboard.html';
            })
            .catch((error) => {
                errorMessage.innerText = 'Hata: ' + error.message;
                console.error("Giriş veya Kalıcılık Hatası:", error);
            });
    });

} else if (window.location.pathname.includes('dashboard.html')) {

    // --- KULLANICI PANELİ (DASHBOARD) KODU ---
    // Bu kısımda bir değişiklik yok, önceki debug kodları hala yerinde duruyor.
    const userEmailSpan = document.getElementById('userEmail');
    const licenseKeySpan = document.getElementById('licenseKey');
    const maxAccountsSpan = document.getElementById('maxAccounts');
    const activeCountSpan = document.getElementById('activeCount');
    const remainingCountSpan = document.getElementById('remainingCount');
    const btnLogout = document.getElementById('btnLogout');
    
    onAuthStateChanged(auth, async (user) => {
        if (user) {
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
        } else {
             // YENİ: Eğer kullanıcı bulunamazsa bunu konsola yazsın.
             console.log("onAuthStateChanged tetiklendi ancak 'user' nesnesi boş. Giriş yapılmamış sayılıyor.");
            // window.location.href = 'login.html'; // Şimdilik yönlendirmeyi yoruma alalım ki konsol mesajını görebilelim.
        }
    });

    btnLogout.addEventListener('click', () => {
        signOut(auth).then(() => {
            window.location.href = 'login.html';
        });
    });
}
