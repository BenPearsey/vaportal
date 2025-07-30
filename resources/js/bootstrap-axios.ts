import axios from 'axios';

(window as any).axios = axios   

axios.defaults.withCredentials = true;         // send session + XSRF cookies
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.headers.common['Accept']         = 'application/json';

// Fetch the XSRF cookie exactly once –
// Sanctum sets the cookie and we can use the API afterwards
axios.get('/sanctum/csrf-cookie');

export default axios;
