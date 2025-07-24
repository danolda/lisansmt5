// ... dosyanın başındaki import ve firebaseConfig kodları aynı kalacak ...

} else if (window.location.pathname.includes('dashboard.html')) {

    // --- KULLANICI PANELİ (DASHBOARD) KODU ---
    const userEmailSpan = document.getElementById('userEmail');
    const licenseKeySpan = document.getElementById('licenseKey');
    // ... diğer değişken tanımlamaları ...
    const btnLogout = document.getElementById('btnLogout');
    
    // Kullanıcının giriş durumunu dinle
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // --- YENİ DEBUG KODU ---
            console.log("Kullanıcı giriş yaptı. UID:", user.uid);
            userEmailSpan.innerText = user.email;
            
            // Firestore'dan kullanıcının UID'sine karşılık gelen belge referansını oluştur
            const docRef = doc(db, "licenses", user.uid);
            // --- YENİ DEBUG KODU ---
            console.log("Firestore'dan şu belge isteniyor:", docRef.path);

            try {
                const docSnap = await getDoc(docRef); // Belgeyi getir

                if (docSnap.exists()) {
                    // --- YENİ DEBUG KODU ---
                    console.log("Belge bulundu! İçerik:", docSnap.data());
                    const licenseData = docSnap.data();
                    licenseKeySpan.innerText = licenseData.licenseKey;
                    maxAccountsSpan.innerText = licenseData.maxAccounts;
                    
                    const activeCount = licenseData.activeAccounts ? licenseData.activeAccounts.length : 0;
                    activeCountSpan.innerText = activeCount;
                    remainingCountSpan.innerText = licenseData.maxAccounts - activeCount;
                } else {
                    // --- YENİ DEBUG KODU ---
                    console.log("Belge bulunamadı! Bu UID'ye sahip bir belge Firestore'da yok.");
                    licenseKeySpan.innerText = "Bu hesaba atanmış bir lisans bulunamadı!";
                }
            } catch (error) {
                // --- YENİ DEBUG KODU ---
                console.error("Firestore'dan veri çekerken HATA oluştu:", error);
                licenseKeySpan.innerText = "Veritabanından veri alınırken bir hata oluştu.";
            }

        } else {
            // Kullanıcı giriş yapmamış, giriş sayfasına yönlendir
            window.location.href = 'login.html';
        }
    });

    // Çıkış yap butonu
    btnLogout.addEventListener('click', () => {
        signOut(auth).then(() => {
            window.location.href = 'login.html';
        });
    });
}
