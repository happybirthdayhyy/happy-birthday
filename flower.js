const Flow3D = {
    init: () => {
        const container = document.querySelector('.bloom');
        if(!container) return;

        // Generate kelopak secara dinamis (math!)
        for(let i=0; i<12; i++){
            let angle = (i * 30) * (Math.PI / 180);
            let x = 50 + Math.cos(angle) * 15;
            let y = 100 + Math.sin(angle) * 15;
            
            let petal = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
            petal.setAttribute("cx", x);
            petal.setAttribute("cy", y);
            petal.setAttribute("rx", "10");
            petal.setAttribute("ry", "4");
            petal.setAttribute("fill", "var(--c-sunflower)");
            // Rotasi kelopak mengarah keluar
            petal.setAttribute("transform", `rotate(${i * 30}, ${x}, ${y})`);
            petal.setAttribute("class", "petal");
            container.insertBefore(petal, container.firstChild);
        }
    },
    
    grow: () => {
        // Reset state
        gsap.set('.stem', { strokeDasharray: "100", strokeDashoffset: "100", stroke: "#A8E6CF", strokeWidth: 4, fill: "none" });
        gsap.set('.leaf', { scale: 0, transformOrigin: "bottom" });
        gsap.set('.bloom', { scale: 0, transformOrigin: "center" });

        // Animasi Bertahap (Tumbuh)
        let tl = gsap.timeline();
        tl.to('.stem', { strokeDashoffset: 0, duration: 2, ease: "power2.inOut" })
          .to('.leaf', { scale: 1, duration: 1, stagger: 0.3, ease: "elastic.out(1, 0.3)" }, "-=1")
          .to('.bloom', { scale: 1, duration: 1.5, ease: "back.out(1.5)" })
          // Bergoyang tertiup angin tanpa henti
          .to('.svg-flower', { rotation: 5, transformOrigin: "bottom", duration: 2, yoyo: true, repeat: -1, ease: "sine.inOut" });
    }
};

