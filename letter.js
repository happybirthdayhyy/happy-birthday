const Letter = {
    init: () => {
        const envelope = document.getElementById('the-envelope');
        if(!envelope) return;

        envelope.addEventListener('click', () => {
            envelope.classList.add('opened');
            // Geser kertas ke atas
            gsap.to(".paper", { y: -150, duration: 1, ease: "power2.out", onComplete: () => {
                // Ketik isi surat dari config
                Anim.typeWriter('letter-content', CONFIG.surat);
            }});
        }, { once: true });
    }
};

