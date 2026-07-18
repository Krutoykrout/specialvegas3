const CONFIG = window.VEGAS_CONFIG || {};
const CARS = window.VEGAS_CARS || [];
const BASE = document.body?.dataset?.base || '';
const byId = (id) => document.getElementById(id);
const qs = (sel, root=document) => root.querySelector(sel);
const qsa = (sel, root=document) => [...root.querySelectorAll(sel)];
const money = (num) => new Intl.NumberFormat('ru-RU').format(num);
const asset = (path) => BASE + path;
const page = (path) => BASE + path;
const carUrl = (car) => page(`cars/${car.id}/`);
const waLink = (text) => `${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;

function setCommon(){
  qsa('[data-phone-text]').forEach(el => el.textContent = CONFIG.phoneDisplay || '8 969 050-20-20');
  qsa('[data-phone-href]').forEach(el => el.href = `tel:${CONFIG.phoneHref || '+79690502020'}`);
  qsa('[data-wa-general]').forEach(el => el.href = waLink('Здравствуйте! Хочу узнать условия аренды автомобиля под выкуп.'));
  qsa('[data-address]').forEach(el => el.textContent = CONFIG.address || 'Москва, ул. Краснобогатырская, дом 2 стр. 16, подъезд 2, этаж 3, офис 7');
  const burger = qs('.burger');
  const mobile = qs('.mobile-nav');
  if(burger && mobile){
    burger.addEventListener('click', () => {
      const open = mobile.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  const year = qs('[data-year-now]');
  if(year) year.textContent = new Date().getFullYear();
}
function badgeHtml(car){
  if(car.badge === 'electric') return '<span class="energy-badge energy-badge--electric">⚡ Электро</span>';
  if(car.badge === 'hybrid') return '<span class="energy-badge energy-badge--hybrid">⚡ Гибрид</span>';
  return '';
}
function specsMini(car){
  const items = [car.bodyType, car.fuel, car.transmission].filter(Boolean);
  return `<div class="spec-line" aria-label="Краткие характеристики">${items.map(v => `<span>${v}</span>`).join('')}</div>`;
}
function carCard(car, index=0){
  const description = (car.description || '').split(/(?<=[.!?])\s+/)[0].trim();
  const shortDescription = description.length > 92 ? `${description.slice(0, 89).trim()}…` : description;
  return `<article class="car-card car-card--showcase reveal" style="--delay:${Math.min(index, 9) * 45}ms" data-car-card data-car-id="${car.id}">
    <a class="car-card__photo" href="${carUrl(car)}" aria-label="${car.title} в аренду под выкуп">
      <img src="${asset(car.cover)}" alt="${car.title} в аренду под выкуп" loading="lazy">
      ${badgeHtml(car)}
      <span class="card-light-line" aria-hidden="true"></span>
    </a>
    <div class="car-card__body">
      <div class="car-card__head"><a href="${carUrl(car)}"><h3>${car.title}</h3></a><span>${car.carClass}</span></div>
      <p class="car-card__short">${shortDescription}</p>
      ${specsMini(car)}
      <div class="car-card__bottom"><div><span>Ежедневный платёж</span><strong>От ${money(car.priceFrom)} ₽/день</strong></div><a class="btn btn--dark" href="${carUrl(car)}" aria-label="Посмотреть автомобиль ${car.title}">Посмотреть автомобиль</a></div>
    </div>
  </article>`;
}
function unique(cars, key){ return [...new Set(cars.map(c => c[key]).filter(v => v !== undefined && v !== null))].sort((a,b)=>String(a).localeCompare(String(b),'ru')); }
function fillSelect(id, values, allText){
  const select = byId(id); if(!select) return;
  select.innerHTML = `<option value="">${allText}</option>` + values.map(v => `<option value="${v}">${v}</option>`).join('');
}
function renderPopular(cars){
  const grid = byId('popular-cars'); if(!grid || grid.dataset.staticPopular) return;
  const ids = ['lada-granta','lada-vesta','moskvich-3','geely-cityray','geely-monjaro','voyah-free'];
  const featured = ids.map(id => cars.find(c => c.id === id)).filter(Boolean);
  grid.innerHTML = featured.map(carCard).join('');
}
function initCatalog(cars){
  const grid = byId('catalog-grid'); if(!grid) return;
  fillSelect('filter-brand', unique(cars,'brand'), 'Все марки');
  fillSelect('filter-body', unique(cars,'bodyType'), 'Любой кузов');
  fillSelect('filter-fuel', unique(cars,'fuel'), 'Любое топливо');
  fillSelect('filter-transmission', unique(cars,'transmission'), 'Любая коробка');
  fillSelect('filter-drive', unique(cars,'drive'), 'Любой привод');
  fillSelect('filter-seats', unique(cars,'seats').map(String), 'Любое число мест');
  const controls = qsa('[data-filter]');
  const count = byId('catalog-count');
  const shown = byId('catalog-shown');
  const loadMore = byId('load-more');
  const toggle = byId('filter-toggle');
  const panel = byId('filters-panel');
  let visibleCount = getPageSize();
  function isMobileCatalog(){ return window.matchMedia('(max-width: 640px)').matches; }
  function getPageSize(){ return isMobileCatalog() ? 8 : cars.length; }
  function filtered(){
    const search = (byId('filter-search')?.value || '').trim().toLowerCase();
    const brand = byId('filter-brand')?.value || '';
    const body = byId('filter-body')?.value || '';
    const fuel = byId('filter-fuel')?.value || '';
    const transmission = byId('filter-transmission')?.value || '';
    const drive = byId('filter-drive')?.value || '';
    const seats = byId('filter-seats')?.value || '';
    const price = byId('filter-price')?.value || '';
    const sort = byId('filter-sort')?.value || 'default';
    let list = cars.filter(car => {
      const hay = `${car.brand} ${car.model} ${car.title} ${car.carClass}`.toLowerCase();
      if(search && !hay.includes(search)) return false;
      if(brand && car.brand !== brand) return false;
      if(body && car.bodyType !== body) return false;
      if(fuel && car.fuel !== fuel) return false;
      if(transmission && car.transmission !== transmission) return false;
      if(drive && car.drive !== drive) return false;
      if(seats && String(car.seats) !== seats) return false;
      if(price === '2000' && car.priceFrom > 2000) return false;
      if(price === '3000' && car.priceFrom > 3000) return false;
      if(price === '5000' && car.priceFrom > 5000) return false;
      if(price === '5001' && car.priceFrom <= 5000) return false;
      return true;
    });
    if(sort === 'price-asc') list.sort((a,b)=>a.priceFrom-b.priceFrom);
    if(sort === 'price-desc') list.sort((a,b)=>b.priceFrom-a.priceFrom);
    if(sort === 'brand-asc') list.sort((a,b)=>`${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`,'ru'));
    if(sort === 'energy-first') list.sort((a,b)=>Number(Boolean(b.badge))-Number(Boolean(a.badge)) || a.priceFrom-b.priceFrom);
    return list;
  }
  function render(resetVisible=false){
    const list = filtered();
    const mobile = isMobileCatalog();
    if(!mobile) visibleCount = list.length;
    else if(resetVisible) visibleCount = getPageSize();
    const visible = mobile ? list.slice(0, visibleCount) : list;
    grid.innerHTML = visible.length ? visible.map(carCard).join('') : `<div class="empty-state">По таким параметрам машины не нашлись. Попробуйте убрать один из фильтров. Каталог постоянно обновляется — напишите нам в удобном мессенджере, и мы поможем подобрать подходящий вариант.</div>`;
    if(count) count.textContent = `${list.length}`;
    if(shown) shown.textContent = mobile ? `Показано ${Math.min(visible.length, list.length)} из ${list.length}` : `Найдено: ${list.length}`;
    if(loadMore) loadMore.hidden = !mobile || visibleCount >= list.length;
    observeReveal();
  }
  controls.forEach(el => el.addEventListener('input', () => render(true)));
  byId('filters-reset')?.addEventListener('click', () => { controls.forEach(el => { if(el.id === 'filter-sort') el.value = 'default'; else el.value = ''; }); render(true); });
  byId('filters-apply')?.addEventListener('click', () => { if(window.matchMedia('(max-width: 640px)').matches && panel && toggle){ panel.classList.remove('is-open'); toggle.setAttribute('aria-expanded','false'); toggle.textContent='Открыть фильтры'; } render(true); });
  loadMore?.addEventListener('click', () => { visibleCount += getPageSize(); render(false); });
  toggle?.addEventListener('click', () => { const open = panel.classList.toggle('is-open'); toggle.setAttribute('aria-expanded', open ? 'true' : 'false'); toggle.textContent = open ? 'Скрыть фильтры' : 'Открыть фильтры'; });
  window.addEventListener('resize', () => { render(false); });
  render(true);
}
function initGallery(){
  const root = qs('.car-gallery'); if(!root) return;
  qsa('.thumbs button', root).forEach(btn => btn.addEventListener('click', () => {
    qsa('.thumbs button', root).forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const img = byId('main-car-photo');
    if(!img) return;
    img.classList.add('swap');
    setTimeout(()=>{ img.src = btn.dataset.photo; img.classList.remove('swap'); }, 120);
  }));
}

function initPhotoLightbox(){
  const gallery = qs('.car-gallery');
  const main = byId('main-car-photo');
  if(!gallery || !main) return;

  const thumbButtons = qsa('.thumbs button', gallery);
  const getPhotos = () => {
    const list = thumbButtons.map((btn, i) => {
      const img = qs('img', btn);
      return { src: btn.dataset.photo || img?.src || main.src, alt: img?.alt || main.alt || `Фото автомобиля ${i + 1}` };
    }).filter(item => item.src);
    return list.length ? list : [{ src: main.src, alt: main.alt || 'Фото автомобиля' }];
  };

  let photos = getPhotos();
  let current = Math.max(0, photos.findIndex(p => main.src.endsWith(p.src.replace(/^\.\.?\//,'')) || main.src === p.src));

  const lightbox = document.createElement('div');
  lightbox.className = 'photo-lightbox';
  lightbox.hidden = true;
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Просмотр фотографии автомобиля');
  lightbox.innerHTML = `
    <button class="photo-lightbox__close" type="button" aria-label="Закрыть просмотр">×</button>
    <button class="photo-lightbox__nav photo-lightbox__nav--prev" type="button" aria-label="Предыдущее фото">‹</button>
    <figure class="photo-lightbox__figure">
      <img class="photo-lightbox__img" alt="">
      <figcaption class="photo-lightbox__caption"></figcaption>
    </figure>
    <button class="photo-lightbox__nav photo-lightbox__nav--next" type="button" aria-label="Следующее фото">›</button>
  `;
  document.body.appendChild(lightbox);

  const closeBtn = qs('.photo-lightbox__close', lightbox);
  const prevBtn = qs('.photo-lightbox__nav--prev', lightbox);
  const nextBtn = qs('.photo-lightbox__nav--next', lightbox);
  const img = qs('.photo-lightbox__img', lightbox);
  const caption = qs('.photo-lightbox__caption', lightbox);

  function setLightboxPhoto(index){
    photos = getPhotos();
    if(!photos.length) return;
    current = (index + photos.length) % photos.length;
    img.src = photos[current].src;
    img.alt = photos[current].alt;
    caption.textContent = `${current + 1} / ${photos.length}`;
    const single = photos.length < 2;
    prevBtn.hidden = single;
    nextBtn.hidden = single;
  }
  function openLightbox(index){
    setLightboxPhoto(index);
    lightbox.hidden = false;
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    closeBtn.focus({preventScroll:true});
  }
  function closeLightbox(){
    lightbox.hidden = true;
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    main.focus({preventScroll:true});
  }
  function activeIndex(){
    const active = thumbButtons.findIndex(btn => btn.classList.contains('active'));
    return active >= 0 ? active : Math.max(0, photos.findIndex(p => main.src.endsWith(p.src.replace(/^\.\.?\//,'')) || main.src === p.src));
  }

  main.setAttribute('tabindex', '0');
  main.setAttribute('role', 'button');
  main.setAttribute('aria-label', 'Открыть фотографию автомобиля крупно');
  main.addEventListener('click', () => openLightbox(activeIndex()));
  main.addEventListener('keydown', (event) => {
    if(event.key === 'Enter' || event.key === ' '){ event.preventDefault(); openLightbox(activeIndex()); }
  });

  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', () => setLightboxPhoto(current - 1));
  nextBtn.addEventListener('click', () => setLightboxPhoto(current + 1));
  lightbox.addEventListener('click', (event) => { if(event.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (event) => {
    if(lightbox.hidden) return;
    if(event.key === 'Escape') closeLightbox();
    if(event.key === 'ArrowLeft') setLightboxPhoto(current - 1);
    if(event.key === 'ArrowRight') setLightboxPhoto(current + 1);
  });
  let touchStartX = 0;
  let touchStartY = 0;
  lightbox.addEventListener('touchstart', (event) => {
    const touch = event.changedTouches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }, {passive:true});
  lightbox.addEventListener('touchend', (event) => {
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    if(Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4){
      setLightboxPhoto(current + (dx < 0 ? 1 : -1));
    }
  }, {passive:true});

}

function observeReveal(){
  const items = qsa('.reveal:not(.is-visible)');
  if(!('IntersectionObserver' in window)){ items.forEach(x=>x.classList.add('is-visible')); return; }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => { if(entry.isIntersecting){ entry.target.classList.add('is-visible'); obs.unobserve(entry.target); }});
  }, {threshold:.12});
  items.forEach(x=>obs.observe(x));
}

function initMobileActionBar(){
  const bar = qs('.mobile-action-bar');
  if(!bar) return;
  const update = () => {
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    const hero = qs('.hero');
    const threshold = hero ? Math.max(260, hero.offsetHeight * 0.56) : 220;
    bar.classList.toggle('is-visible', y > threshold);
  };
  update();
  window.addEventListener('scroll', update, {passive:true});
  window.addEventListener('resize', update);
}

function initCinematicHero(){
  const hero = qs('[data-cinematic-hero]');
  if(!hero) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reduce){
    let ticking = false;
    const update = () => {
      const rect = hero.getBoundingClientRect();
      const p = Math.min(Math.max(-rect.top / Math.max(rect.height, 1), 0), 1);
      hero.style.setProperty('--scrollp', p.toFixed(3));
      ticking = false;
    };
    const requestUpdate = () => {
      if(!ticking){ requestAnimationFrame(update); ticking = true; }
    };
    update();
    window.addEventListener('scroll', requestUpdate, {passive:true});
    window.addEventListener('resize', requestUpdate);
  }
}



function showMessengerNotice(message){
  let notice = qs('.messenger-notice');
  if(!notice){
    notice = document.createElement('div');
    notice.className = 'messenger-notice';
    notice.setAttribute('role','status');
    document.body.appendChild(notice);
  }
  notice.textContent = message;
  notice.classList.add('is-visible');
  clearTimeout(notice._timer);
  notice._timer = setTimeout(() => notice.classList.remove('is-visible'), 2600);
}

function messengerLink(baseUrl, message){
  if(!baseUrl) return '';
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}text=${encodeURIComponent(message)}`;
}

function initMessengerLinks(){
  qsa('[data-messenger]').forEach(link => {
    const messenger = link.dataset.messenger;
    const message = link.dataset.message || 'Здравствуйте! Хочу узнать условия аренды автомобиля под выкуп.';
    let href = '';

    if(messenger === 'whatsapp') href = waLink(message);
    if(messenger === 'telegram') href = messengerLink(CONFIG.telegram || '', message);
    if(messenger === 'max') href = CONFIG.max || '';

    if(href){
      link.href = href;
      link.target = '_blank';
      link.rel = 'noopener';

      if(messenger === 'max'){
        link.addEventListener('click', () => {
          if(navigator.clipboard?.writeText){
            navigator.clipboard.writeText(message)
              .then(() => showMessengerNotice('Сообщение для MAX скопировано — вставьте его в открывшийся чат.'))
              .catch(() => {});
          }
        });
      }
    }else{
      link.href = '#';
      link.addEventListener('click', event => {
        event.preventDefault();
        showMessengerNotice(`Ссылка на ${messenger === 'telegram' ? 'Telegram' : 'MAX'} пока не настроена.`);
      });
    }
  });
}

function initMessengerModal(){
  const modal = byId('messenger-modal');
  if(!modal) return;
  const close = () => {
    modal.hidden = true;
    document.body.classList.remove('messenger-modal-open');
  };
  qsa('[data-open-messengers]').forEach(button => button.addEventListener('click', event => {
    event.preventDefault();
    modal.hidden = false;
    document.body.classList.add('messenger-modal-open');
    qs('[data-close-messengers]', modal)?.focus({preventScroll:true});
  }));
  qs('[data-close-messengers]', modal)?.addEventListener('click', close);
  modal.addEventListener('click', event => { if(event.target === modal) close(); });
  document.addEventListener('keydown', event => { if(event.key === 'Escape' && !modal.hidden) close(); });
}

document.addEventListener('DOMContentLoaded', () => { setCommon(); initMessengerLinks(); initMessengerModal(); renderPopular(CARS); initCatalog(CARS); initGallery(); initPhotoLightbox(); initCinematicHero(); initMobileActionBar(); observeReveal(); });
