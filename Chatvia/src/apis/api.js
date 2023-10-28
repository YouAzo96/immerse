import axios from 'axios';
import config from '../config';
import { setLoggedInUser } from '../helpers/authUtils';

const API_BASE_URL = config.API_URL; // Replace with actual backend server URL once its running

const registerUser = async (userData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/users/register`, userData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

const loginUser = async (email, password) => {
  const userData = {
    email: email,
    password: password,
}
    try {
        const response = await axios.post(`${API_BASE_URL}/api/users/login`, userData);
        console.log("Response data:", response);
        setLoggedInUser(response)
        return response.data;
    } catch (error) {
        throw error;
    }
};

axios.interceptors.response.use(
    function (response) {
      return response.data ? response.data : response;
    },
    function (error) {
        console.log("Error:", error);
      // Check the status code in the error response
      let message;
      if (error.response) {
        const status = error.response.status;
        switch (status) {
          case 500:
            message = 'Internal Server Error';
            break;
          case 401:
            message = 'Invalid credentials';
            break;
          case 404:
            message = "Sorry! the data you are looking for could not be found";
            break;
          default:
            message = error.message || error;
        }
      } else {
        // Handle other types of errors (e.g., network issues)
        message = 'Network error: Unable to reach the server.';
      }
      return Promise.reject(message);
    }
  );
  

export { registerUser, loginUser };
