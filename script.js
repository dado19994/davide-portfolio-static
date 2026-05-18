const navbar = document.querySelector('.portfolio-navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
        navbar?.classList.add('navbar-scrolled');
    } else {
        navbar?.classList.remove('navbar-scrolled');
    }
});