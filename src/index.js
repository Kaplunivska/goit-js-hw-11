import { Notify } from 'notiflix';
import SimpleLightBox from 'simplelightbox';
import throttle from 'lodash.throttle';
import { Page } from './js/page';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
    searchForm: document.querySelector('.search'),
    searchButton: document.querySelector('.search__button'),
    query: document.querySelector('.search__query'),
    gallery: document.querySelector('.gallery__list'),
    loader: document.querySelector('.loader'),
  };

  const simple = new SimpleLightBox('.gallery__list .card__link', {
    captionDelay: 500,
  });

  const page = new Page();
  const throttleScrollHandler = throttle(updateScroll, 250);
  
  refs.searchForm.addEventListener('submit', searchHandler);
  hideLoader();

  function searchHandler(evt) {
    evt.preventDefault();
  
    const form = evt.currentTarget;
    const query = form.elements.searchQuery.value.trim();
  
    if (!query.length) {
      form.reset();
      Notify.warning('Search field is empty!');
  
      return;
    }
  
    clearGallery();
    callSearch(query);
    form.reset();
  }  

  async function callSearch(query) {
    try {
      showLoader();
      setSearchButtonDisabled(true);
      const data = await page.search(query);
  
      searchResponse(data);
    } catch (error) {
      Notify.failure(error.message);
    } finally {
      hideLoader();
      setSearchButtonDisabled(false);
    }
  }
  
  async function callLoadMore() {
    try {
      showLoader();
      const data = await page.loadMore();
  
      searchResponse(data);
    } catch (error) {
      Notify.failure(error.message);
    } finally {
      hideLoader();
    }
  }

  function clearGallery() {
    refs.gallery.innerHTML = '';
    simple.refresh();
  }
  
  function addCardsToGallery(list) {
    const markup = list.map(createCard).join('');
  
    refs.gallery.insertAdjacentHTML('beforeend', markup);
    simple.refresh();
  }

  function createCard(card) {
    const {
      largeImageURL,
      webformatURL,
      tags,
      likes,
      views,
      comments,
      downloads,
    } = card;
  
    return `
      <article class="card">
      <a class="card__link"
          href="${largeImageURL}">
          <div class="card__thumb">
            <img class="card__image" src="${webformatURL}" alt="${tags}"
              title="${tags}" loading="lazy" height="200">
          </div>
          <ul class="card__info">
            <li class="card__info-item">
              <p class="card__info-header">Likes</p>
              <p class="card__info-value">${likes}</p>
            </li>
            <li class="card__info-item">
              <p class="card__info-header">Views</p>
              <p class="card__info-value">${views}</p>
            </li>
            <li class="card__info-item">
              <p class="card__info-header">Comments</p>
              <p class="card__info-value">${comments}</p>
            </li>
            <li class="card__info-item">
              <p class="card__info-header">Downloads</p>
              <p class="card__info-value">${downloads}</p>
            </li>
          </ul>
        </a>
      </article>
    `;
  }

  function searchResponse({ page, per_page, hits, totalHits }) {
    if (!hits.length) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
  
      return;
    }
  
    addCardsToGallery(hits);
    checkLoadMore({ page, per_page, totalHits });
  
    if (page === 1) {
      Notify.info(`Hooray! We found ${totalHits} images.`);
    }
  } 

  function checkLoadMore({ page, per_page, totalHits }) {
    if (page * per_page >= totalHits) {
      Notify.warning(
        "We're sorry, but you've reached the end of search results."
      );
      removeScrollEvent();
    } else {
      addScrollEvent();
    }
  }

  function setSearchButtonDisabled(value) {
    refs.searchButton.disabled = value;
  }
  
  function showLoader() {
    refs.loader.classList.remove('hidden');
  }
  
  function hideLoader() {
    refs.loader.classList.add('hidden');
  }
  
  function addScrollEvent() {
    document.addEventListener('scroll', throttleScrollHandler);
  }
  
  function removeScrollEvent() {
    document.removeEventListener('scroll', throttleScrollHandler);
  }

  function updateScroll() {
    const containerOffset = 300;
    const endOfPage =
      window.innerHeight + window.pageYOffset + containerOffset >=
      document.body.offsetHeight;
  
    if (!endOfPage) return;
  
    removeScrollEvent();
    callLoadMore();
  }