const Gallery = {
    init: () => {
        const card = document.getElementById('swipe-card');
        if(!card) return;

        let startX = 0;
        card.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; });
        card.addEventListener('touchend', (e) => {
            let endX = e.changedTouches[0].clientX;
            if (startX - endX > 50) {
                // Swipe Kiri -> Animasi membuang kartu ke kiri
                gsap.to(card, { x: -300, rotation: -20, opacity: 0, duration: 0.5, onComplete: () => {
                    card.style.display = 'none'; // Sembunyikan foto pertama
                }});
            } else if (endX - startX > 50) {
                // Swipe Kanan
                gsap.to(card, { x: 300, rotation: 20, opacity: 0, duration: 0.5, onComplete: () => {
                    card.style.display = 'none';
                }});
            }
        });
    }
};

