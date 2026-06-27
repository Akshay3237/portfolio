document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Fade In Animation (Intersection Observer)
    const fadeElements = document.querySelectorAll('.fade-in');
    const appearOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('appear');
            observer.unobserve(entry.target);
        });
    }, appearOptions);

    fadeElements.forEach(el => appearOnScroll.observe(el));

    // Simple Carousel Logic
    const setupCarousel = (containerId) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        const track = container.querySelector('.carousel-track');
        if (!track) return;
        const slides = Array.from(track.children);
        const nextBtn = container.querySelector('.next-btn');
        const prevBtn = container.querySelector('.prev-btn');
        let currentIndex = 0;

        const updateCarousel = () => {
            if (slides.length === 0) return;
            const slideWidth = slides[0].getBoundingClientRect().width;
            const gap = parseFloat(window.getComputedStyle(track).gap) || 0;
            const moveAmount = slideWidth + gap;
            track.style.transform = `translateX(-${currentIndex * moveAmount}px)`;
        };

        const getVisibleSlides = () => {
            if (window.innerWidth <= 768) return 1;
            if (window.innerWidth <= 1024) return 2;
            return 3;
        };

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const visible = getVisibleSlides();
                if (currentIndex < slides.length - visible) {
                    currentIndex++;
                    updateCarousel();
                } else {
                    currentIndex = 0; // Loop back
                    updateCarousel();
                }
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                const visible = getVisibleSlides();
                if (currentIndex > 0) {
                    currentIndex--;
                    updateCarousel();
                } else {
                    currentIndex = slides.length - visible; // Loop to end
                    updateCarousel();
                }
            });
        }

        window.addEventListener('resize', () => {
            // Reset to prevent broken layout on resize
            currentIndex = 0;
            updateCarousel();
        });
        
        // Auto play carousel
        setInterval(() => {
            const visible = getVisibleSlides();
            if (currentIndex < slides.length - visible) {
                currentIndex++;
            } else {
                currentIndex = 0;
            }
            updateCarousel();
        }, 5000);
    };

    setupCarousel('services-carousel');
    setupCarousel('testimonials-carousel');
});
