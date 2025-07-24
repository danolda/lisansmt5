// BURAYI KENDİ FIREBASE PROJE AYARLARINIZLA DOLDURUN
// Firebase konsolunda Proje Ayarları (dişli ikonu) > Genel sekmesinde bulabilirsiniz.
const firebaseConfig = {
  apiKey: "AIzaSy...YOUR_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "...",
  appId: "1:..."
};

// Firebase'i başlat
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

//--- Hangi sayfada olduğumuzu kontrol et ---
if (window.location.pathname.endsWith('login.html') || window.location.pathname === '/') {
    // --- GİRİŞ SAYFASI KODU ---
    const btnLogin = document.getElementById('btnLogin');
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');

    btnLogin.addEventListener('click', e => {
        const email = emailField.value;
        const password = passwordField.value;

        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Başarılı giriş
                window.location.href = 'dashboard.html';
            })
            .catch((error) => {
                errorMessage.innerText = 'Hata: ' + error.message;
            });
    });

} else if (window.location.pathname.endsWith('dashboard.html')) {
    // --- KULLANICI PANELİ KODU ---
    const userEmailSpan = document.getElementById('userEmail');
    const licenseKeySpan = document.getElementById('licenseKey');
    const maxAccountsSpan = document.getElementById('maxAccounts');
    const activeCountSpan = document.getElementById('activeCount');
    const remainingCountSpan = document.getElementById('remainingCount');
    const btnLogout = document.getElementById('btnLogout');
    
    auth.onAuthStateChanged(user => {
        if (user) {
            // Kullanıcı giriş yapmış, verileri Firestore'dan çekelim
            userEmailSpan.innerText = user.email;
            
            // Firestore'dan 'licenses' koleksiyonundan kullanıcının UID'sine karşılık gelen belgeyi getir
            db.collection('licenses').doc(user.uid).get().then(doc => {
                if (doc.exists) {
                    const licenseData = doc.data();
                    licenseKeySpan.innerText = licenseData.licenseKey;
                    maxAccountsSpan.innerText = licenseData.maxAccounts;
                    
                    const activeCount = licenseData.activeAccounts ? licenseData.activeAccounts.length : 0;
                    activeCountSpan.innerText = activeCount;
                    remainingCountSpan.innerText = licenseData.maxAccounts - activeCount;
                } else {
                    licenseKeySpan.innerText = "Lisans bilgisi bulunamadı!";
                }
            }).catch(error => {
                console.error("Veritabanı hatası: ", error);
                licenseKeySpan.innerText = "Veri alınırken hata oluştu.";
            });

        } else {
            // Kullanıcı giriş yapmamış, giriş sayfasına yönlendir
            window.location.href = 'login.html';
        }
    });

    btnLogout.addEventListener('click', e => {
        auth.signOut().then(() => {
            window.location.href = 'login.html';
        });
    });
}