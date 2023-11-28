import jwtDecode from 'jwt-decode';
import { useHistory } from 'react-router-dom';

/**
 * Checks if user is authenticated
 */
const isUserAuthenticated = () => {
  try {
    const user = getLoggedInUser();
    if (user == null) {
      return false;
    }
    const decoded = jwtDecode(user);
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      console.warn('access token expired');
      return false;
    }
    return true;
  } catch (e) {
    console.warn('access token expired');
    return false;
  }
};
const getLoggedInUserInfo = () => {
  return isUserAuthenticated() ? jwtDecode(getLoggedInUser()) : null;
};

/**
 * Returns the logged in user
 */
const getLoggedInUser = () => {
  try {
    const user = localStorage.getItem('authUser');

    return user ? (typeof user == 'object' ? user : JSON.parse(user)) : null;
  } catch (error) {
    console.log('Error in getLoggedInUser:', error);
  }
};

/**
 * Sets the logged in user
 */
const setLoggedInUser = (user) => {
  localStorage.setItem('authUser', JSON.stringify(user));
};

const setLoggedInUserRefresh = (user) => {
  localStorage.setItem('authUser', JSON.stringify(user));
  window.location.reload();
}

export {
  isUserAuthenticated,
  setLoggedInUser,
  setLoggedInUserRefresh,
  getLoggedInUser,
  getLoggedInUserInfo,
};
