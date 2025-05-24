// Progressive image loader.
class ImageLoader {
  constructor() {
    this.observerSupported = 'IntersectionObserver' in window;
    this.observer = this.observerSupported ? 
      new IntersectionObserver(this.onIntersection.bind(this), {
        rootMargin: '50px 0px',
        threshold: 0.01
      }) : null;
    this.loadedImages = new Set();
  }

  observe(imageElement) {
    if (!imageElement) return;
    
    if (this.observerSupported) {
      this.observer.observe(imageElement);
    } else {
      // Fallback for browsers that don't support IntersectionObserver
      this.loadImage(imageElement);
    }
  }

  onIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.loadImage(entry.target);
        this.observer.unobserve(entry.target);
      }
    });
  }

  loadImage(img) {
    if (this.loadedImages.has(img)) return;

    const src = img.getAttribute('data-src');
    if (!src) return;

    // Create a temporary image to load the full version
    const tempImg = new Image();
    
    tempImg.onload = () => {
      img.src = src;
      img.classList.add('loaded');
      this.loadedImages.add(img);
    };

    tempImg.src = src;
  }

  // Utility method to prepare an image for progressive loading
  static prepare(img) {
    if (!img) return;
    
    // Store the original source
    const originalSrc = img.src;
    img.setAttribute('data-src', originalSrc);
    
    // Set a tiny placeholder or blur until the image loads
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    img.style.filter = 'blur(5px)';
    img.style.transition = 'filter 0.3s ease-out';
    
    // Add load event listener to remove blur
    img.onload = () => {
      img.style.filter = '';
    };
  }
}
