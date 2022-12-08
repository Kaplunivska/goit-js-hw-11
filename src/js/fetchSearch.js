import axios from 'axios';

const API_KEY = '31910419-a0e9973305d8d11bbc959bfc7';
const ITEM_PER_PAGE = 40;

const instance = axios.create({
    baseURL: 'https://pixabay.com/api/',
    params: {
      key: API_KEY,
      image_type: 'photo',
      safesearch: true,
      orientation: 'horizontal',
      per_page: ITEM_PER_PAGE,
    },
  });

  export async function fetchQuery(query, page = 1) {
    const options = {
      params: {
        q: query,
        page,
      },
    };
  
    const result = await instance.get('', options);
    const data = await result.data;
  
    return { page, per_page: ITEM_PER_PAGE, ...data };
  }