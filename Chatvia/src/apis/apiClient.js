import axios from 'axios';
import config from '../config';
import jwt_decode from 'jwt-decode';
import { isUserAuthenticated } from '../helpers/authUtils';


// default
axios.defaults.baseURL = config.API_URL;

// content type
axios.defaults.headers.post['Content-Type'] = 'application/json';

// intercepting to capture errors
axios.interceptors.response.use(
  function (response) {
    return response.data ? response.data : response;
  },
  function (error) {
    //****We access the error data through: error.response.data._propertyname***
    return Promise.reject(error.response.data.error);
  }
);

// intercepting to verify token
axios.interceptors.request.use(
 (config) => {
  isUserAuthenticated();
  return config;
},
(error) => Promise.reject(error)
);

/**
 * Sets the default authorization
 * @param {*} token
 */
const setAuthorization = (token) => {
  axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
};

class APIClient {
  /**
   * Fetches data from given url
   */
  get = (url, params) => {
    return axios.get(url, params);
  };

  /**
   * post given data to url
   */
  create = (url, data) => {
    return axios.post(url, data);
  };

  /**
   * Updates data
   */
  update = (url, data) => {
    return axios.patch(url, data);
  };

  /**
   * Delete
   */
  delete = (url) => {
    return axios.put(url);
  };
}

export { APIClient, setAuthorization };
