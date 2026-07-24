document.addEventListener("DOMContentLoaded", () => {
    
    // Inisialisasi Modul
    GiftBox.init();
    Gallery.init();
    Letter.init();
    Flow3D.init();
    Birthday.init();

    // 1. Loading Seolah-olah Mendownload Aset Premium
    setTimeout(() => {
        Anim.transition('s-loading', 's-password');
    }, 2000);

    // 2. Logika Password
    const btnLogin = document.getElementById('btn-login');
    const inputPass = document.getElementById('pass-input');
    
    btnLogin.addEventListener('click', () => {
        if (inputPass.value.toLowerCase() === CONFIG.password.toLowerCase()) {
            // Putar musik (Browser mensyaratkan user interaksi pertama untuk BGM)
            document.getElementById('bgm').play().catch(e=>console.log(e));
            
            // Efek Flash Kuning
            gsap.to("body", { backgroundColor: "#FFD700", duration: 0.3, yoyo: true, repeat: 1 });
            Anim.transition('s-password', 's-opening');
            
            // Mulai ngetik setelah transisi
            setTimeout(() => {
                Anim.typeWriter('typing-opening', CONFIG.teksOpening, () => {
                    gsap.to('#btn-start-journey', { opacity: 1, duration: 1 });
                });
            }, 800);
        } else {
            Anim.shake('s-password');
            document.getElementById('pass-error').innerText = "Kunci salah, coba lagi! 🤭";
        }
    });

    // 3. Tombol Mulai Perjalanan
    document.getElementById('btn-start-journey').addEventListener('click', () => {
        Anim.transition('s-opening', 's-gift');
    });

    // 6. Logika Main Menu (Routing Sub-Halaman)
    document.querySelectorAll('.menu-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const target = e.target.getAttribute('data-target');
            Anim.transition('s-menu', target);
            
            // Jika membuka Bunga, jalankan animasinya
            if(target === 's-flower') {
                setTimeout(Flow3D.grow, 500);
            }
        });
    });

    // Tombol Kembali dari Sub-Halaman ke Menu Utama
    document.querySelectorAll('.btn-back').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const parentSection = e.target.closest('.screen').id;
            Anim.transition(parentSection, 's-menu');
        });
    });

    // Tombol Ending di Halaman Birthday
    document.getElementById('btn-ending').addEventListener('click', () => {
        Anim.transition('s-birthday', 's-ending');
        setTimeout(() => {
            Anim.typeWriter('ending-text', CONFIG.ucapanAkhir);
        }, 800);
    });
});

