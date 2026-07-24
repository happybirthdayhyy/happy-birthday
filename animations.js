const Anim = {
    // Animasi Pindah Halaman
    transition: (fromId, toId) => {
        const from = document.getElementById(fromId);
        const to = document.getElementById(toId);
        
        gsap.to(from, {
            opacity: 0, scale: 0.9, duration: 0.5, ease: "power2.inOut",
            onComplete: () => {
                from.classList.remove('active');
                from.classList.add('hidden');
                to.classList.remove('hidden');
                to.classList.add('active');
                gsap.fromTo(to, {opacity: 0, scale: 1.1}, {opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.5)"});
            }
        });
    },

    // Ketik Teks Otomatis
    typeWriter: (elementId, text, callback) => {
        const el = document.getElementById(elementId);
        el.innerHTML = "";
        let i = 0;
        const speed = 70; // ms
        
        function type() {
            if (i < text.length) {
                el.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else if (callback) {
                callback();
            }
        }
        type();
    },

    // Efek Layar Salah Password
    shake: (elementId) => {
        gsap.to(`#${elementId}`, {x: [-10, 10, -10, 10, 0], duration: 0.4});
    }
};

