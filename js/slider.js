// Perfect Image Slider Script

let currentSlide = 0;
const slides = document.querySelector('.slides');
const sliderDots = document.querySelectorAll('.slider-dot');
const totalSlides = 5; // Number of images in the slider
let autoplayInterval;

// Initialize slider
document.addEventListener('DOMContentLoaded', function () {
    setupSlider();
    startAutoplay();
    attachEventListeners();
});

function setupSlider() {
    updateSlider();
    updateDots();
}

function updateSlider() {
    const translateAmount = currentSlide * 100;
    slides.style.transform = `translateX(-${translateAmount}%)`;
}

function updateDots() {
    sliderDots.forEach((dot, index) => {
        dot.classList.remove('active');
        if (index === currentSlide) {
            dot.classList.add('active');
        }
    });
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateSlider();
    updateDots();
    resetAutoplay();
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateSlider();
    updateDots();
    resetAutoplay();
}

function goToSlide(slideIndex) {
    currentSlide = slideIndex;
    updateSlider();
    updateDots();
    resetAutoplay();
}

function startAutoplay() {
    autoplayInterval = setInterval(() => {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateSlider();
        updateDots();
    }, 2500); // Change slide every 2.5 seconds
}

function resetAutoplay() {
    clearInterval(autoplayInterval);
    startAutoplay();
}

function attachEventListeners() {
    // Prev button
    const prevBtn = document.querySelector('.slider-arrow.prev');
    if (prevBtn) {
        prevBtn.addEventListener('click', prevSlide);
    }

    // Next button
    const nextBtn = document.querySelector('.slider-arrow.next');
    if (nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
    }

    // Dots
    sliderDots.forEach((dot, index) => {
        dot.addEventListener('click', () => goToSlide(index));
    });

    // Pause autoplay on mouse hover
    slides.addEventListener('mouseenter', () => {
        clearInterval(autoplayInterval);
    });

    // Resume autoplay on mouse leave
    slides.addEventListener('mouseleave', () => {
        startAutoplay();
    });
}

// Make functions globally available
window.nextSlide = nextSlide;
window.prevSlide = prevSlide;
window.goToSlide = goToSlide;
