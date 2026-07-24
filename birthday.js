const Birthday = {
    init: () => {
        const targetDate = new Date(CONFIG.tanggalUlangTahun).getTime();
        
        setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                document.getElementById("cd-d").innerText = "00";
                document.getElementById("cd-h").innerText = "00";
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            document.getElementById("cd-d").innerText = String(days).padStart(2, '0');
            document.getElementById("cd-h").innerText = String(hours).padStart(2, '0');
            document.getElementById("cd-m").innerText = String(minutes).padStart(2, '0');
            document.getElementById("cd-s").innerText = String(seconds).padStart(2, '0');
        }, 1000);
    }
};

