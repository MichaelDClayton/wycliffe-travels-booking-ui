// Add this if you want the "Scroll" text to jump to a specific section
document.querySelector('.hero-footer span:last-child').addEventListener('click', () => {
    window.scrollTo({
        top: window.innerHeight,
        behavior: 'smooth'
    });
});