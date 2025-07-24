// Firebase v9+ modüler SDK'dan gerekli fonksiyonları içe aktar
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// --- Script Başlangıç Kontrolü ---
console.log("--- app.js dosyası OKUNDU ---");

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
console.log("--- Firebase BAŞLATILDI ---");
console.log("--- Sayfa Yolu:", window.location.pathname, "---");

// --- SAYFA YÖNLENDİRME MANTIĞI ---
if (window.location.pathname.includes('login.html') || window.location.pathname.endsWith('/') || window.location.pathname.endsWith('/goldealisans/')) {
    
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

    console.log(">>> DASHBOARD SAYFASI mantığına girildi.");
    const btnLogout = document.getElementById('btnLogout');
    
    // Butonun bulunup bulunmadığını kontrol et
    if(btnLogout) {
        console.log(">>> 'Çıkış Yap' butonu bulundu ve tıklama olayı ekleniyor.");
        btnLogout.addEventListener('click', () => {
            signOut(auth).then(() => {
                window.location.href = 'login.html';
            });
        });
    } else {
        console.error("!!! 'Çıkış Yap' butonu (btnLogout) HTML'de bulunamadı!");
    }
    
    onAuthStateChanged(auth, async (user) => {
        console.log(">>> onAuthStateChanged fonksiyonu tetiklendi.");
        if (user) {
            console.log(">>> KULLANICI GİRİŞ YAPMIŞ olarak bulundu. UID:", user.uid);
            document.getElementById('userEmail').innerText = user.email;
            const docRef = doc(db, "licenses", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const licenseData = docSnap.data();
                document.getElementById('licenseKey').innerText = licenseData.licenseKey;
                document.getElementById('maxAccounts').innerText = licenseData.maxAccounts;
                const activeCount = licenseData.activeAccounts ? licenseData.activeAccounts.length : 0;
                document.getElementById('activeCount').innerText = activeCount;
                document.getElementById('remainingCount').innerText = licenseData.maxAccounts - activeCount;
            } else {
                document.getElementById('licenseKey').innerText = "Lisans bilgisi yok.";
            }
        } else {
             console.log(">>> KULLANICI GİRİŞ YAPMAMIŞ olarak algılandı.");
        }
    });

}
```Bu kodu `app.js`'e yapıştırıp GitHub'a gönderdikten sonra, `dashboard.html` sayfasındayken **F12 ile konsolu açıp sayfayı yenileyin.**
*   Eğer konsolda `!!! 'Çıkış Yap' butonu (btnLogout) HTML'de bulunamadı!` yazıyorsa, `dashboard.html` dosyanızda butona verdiğiniz `id` yanlıştır. Butonun `id="btnLogout"` olduğundan emin olun.
*   Eğer `>>> 'Çıkış Yap' butonu bulundu...` yazıyorsa, butonun artık çalışması gerekir.

---

### 2. EA Hesaptan Kaldırıldığında Lisans Hakkının Geri Verilmesi

Bu, çok güzel ve ileri seviye bir düşünce. Ancak bu işlevin **%100 güvenilir bir şekilde yapılması teknik olarak neredeyse imkansızdır.** İşte nedenleri ve olası çözümler:

**Neden Zor?**
*   **`OnDeinit()` Güvenilir Değildir:** EA grafikten kaldırıldığında, yeniden derlendiğinde veya MT5 kapatıldığında `OnDeinit()` fonksiyonu çalışır. Bu fonksiyona "hesabımı listeden sil" diye bir `WebRequest` koyabiliriz.
*   **Sorun:** Kullanıcının interneti giderse, bilgisayarı aniden kapanırsa (elektrik kesintisi), MT5 çökerse veya kullanıcı işlemi Görev Yöneticisi'nden sonlandırırsa `OnDeinit()` fonksiyonu **ASLA ÇALIŞMAZ.**
*   Bu durumda, kullanıcının lisans hakkı veritabanında takılı kalır ve geri gelmez. Bu durum, size sürekli "lisansım takılı kaldı, sıfırlayın" diyecek mutsuz müşteriler yaratır.

**Gerçekçi Çözümler:**

#### Çözüm A: Manuel Sıfırlama (En Basit ve Güvenilir)
Müşteriler, lisanslarını yeni bir hesaba taşımak istediklerinde size bir e-posta atarlar. Siz de Firebase Firestore'dan `activeAccounts` dizisini manuel olarak boşaltırsınız. Bu en basit yöntemdir ve size tam kontrol sağlar.

#### Çözüm B: Müşterinin Kendi Kendine Sıfırlaması (Orta Seviye)
Bu daha profesyonel bir yöntemdir:
1.  **Dashboard'a Buton Ekleyin:** `dashboard.html` sayfanıza "Aktif Hesapları Sıfırla" adında bir buton eklersiniz.
2.  **Yeni Cloud Function Yazın:** `resetAccounts` adında yeni bir Cloud Function (API) oluşturursunuz. Bu API, sadece giriş yapmış olan kullanıcının kendi `activeAccounts` dizisini boşaltır.
3.  **Entegrasyon:** Dashboard'daki buton, bu yeni API'yi çağırır.

Bu sayede kullanıcı, hesabını yeni bir VPS'e veya bilgisayara taşımadan önce dashboard'a girip tek tıkla eski hesaplarını listeden temizleyerek 5 hakkını da geri alır. Bu, `OnDeinit`'e göre **çok daha güvenilirdir.**

**Örnek `resetAccounts` Cloud Function Kodu (`functions/index.js`'e eklenir):**
```javascript
// Bu kodu mevcut exports.verifyLicense'ın altına ekleyin
exports.resetAccounts = functions.https.onCall(async (data, context) => {
    // Sadece giriş yapmış kullanıcılar bu fonksiyonu çağırabilir
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Bu işlemi yapmak için giriş yapmalısınız.');
    }

    const uid = context.auth.uid;
    const licenseRef = db.collection('licenses').doc(uid);

    try {
        // activeAccounts dizisini boş bir dizi ile güncelle
        await licenseRef.update({ activeAccounts: [] });
        return { status: 'success', message: 'Aktif hesaplarınız başarıyla sıfırlandı.' };
    } catch (error) {
        console.error("Hesap sıfırlama hatası:", error);
        throw new functions.https.HttpsError('internal', 'Hesaplar sıfırlanırken bir hata oluştu.');
    }
});
