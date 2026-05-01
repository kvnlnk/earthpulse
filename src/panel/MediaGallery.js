// Lightbox lives on body level so it's truly fullscreen centered
let lightbox = null;

function ensureLightbox() {
  if (lightbox) return lightbox;

  lightbox = document.createElement('div');
  lightbox.className = 'lightbox lightbox--hidden';
  lightbox.innerHTML = `
    <button class="lightbox__close">&times;</button>
    <div class="lightbox__content"></div>
    <p class="lightbox__caption"></p>
  `;
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox__close')) {
      lightbox.classList.add('lightbox--hidden');
    }
  });
  document.body.appendChild(lightbox);
  return lightbox;
}

export function renderGallery(mediaItems, container) {
  container.innerHTML = '';

  if (mediaItems.length === 0) {
    container.innerHTML = '<p class="gallery__empty">No media available</p>';
    return;
  }

  const gallery = document.createElement('div');
  gallery.className = 'gallery';

  mediaItems.slice(0, 6).forEach((item) => {
    const el = document.createElement('div');
    el.className = 'gallery__item';

    if (item.mediaType === 'image') {
      el.innerHTML = `
        <img src="${item.thumbnail}" alt="${item.title}" loading="lazy" />
        <span class="gallery__title">${item.title}</span>
      `;
    } else {
      el.innerHTML = `
        <div class="gallery__video-thumb">
          <img src="${item.thumbnail}" alt="${item.title}" loading="lazy" />
          <span class="gallery__play">\u25B6</span>
        </div>
        <span class="gallery__title">${item.title}</span>
      `;
    }

    el.addEventListener('click', () => {
      const lb = ensureLightbox();
      const content = lb.querySelector('.lightbox__content');
      content.innerHTML = `<img src="${item.thumbnail}" alt="${item.title}" />`;
      lb.querySelector('.lightbox__caption').textContent = item.title;
      lb.classList.remove('lightbox--hidden');
    });

    gallery.appendChild(el);
  });

  container.appendChild(gallery);
}
