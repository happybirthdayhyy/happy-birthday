const GiftBox = {
    init: () => {
        const gift = document.getElementById('the-gift');
        if(!gift) return;

        gift.addEventListener('click', () => {
            // Mainkan suara buka kado jika ada
            const sfx = document.getElementById('sfx-pop');
            if(sfx) sfx.play().catch(e=>console.log("Audio di-block browser"));

            // Animasi kotak terbuka (GSAP)
            gsap.to(".lid", { y: -50, rotation: 15, duration: 0.5, ease: "power2.out" });
            gsap.to(gift, { scale: 0.9, duration: 0.1, yoyo: true, repeat: 1 });

            // Tunggu sebentar, lalu Ledakan Bunga!
            setTimeout(() => {
                GiftBox.flowerExplosion();
                // Pindah ke Main Menu setelah ledakan selesai
                setTimeout(() => {
                    Anim.transition('s-gift', 's-menu');
                }, 2500);
            }, 600);
        }, { once: true });
    },

    flowerExplosion: () => {
        // Konfigurasi Canvas Confetti Premium dengan bentuk kustom
        const duration = 2000;
        const end = Date.now() + duration;

        (function frame() {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.8 },
                colors: ['#FFD700', '#FFFFFF', '#A8E6CF']
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.8 },
                colors: ['#FFD700', '#FFF8E7', '#FFFFFF']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    }
};

