import {
  all,
  call,
  fork,
  put,
  select,
  takeEvery,
  delay,
} from 'redux-saga/effects';
import {
  APIClient,
  setAuthorization,
  setupInterceptor,
} from '../../apis/apiClient';
import {
  LOGIN_USER,
  LOGOUT_USER,
  REGISTER_USER,
  FORGET_PASSWORD,
  CODE_SENT,
  FETCH_USER_PROFILE,
  API_FAILED,
  UPDATE_USER_PROFILE,
  TRIGGER_ALERT,
} from './constants';

import defaultImage from '../../assets/images/users/blankuser.jpeg';

import {
  loginUserSuccess,
  registerUserSuccess,
  forgetPasswordSuccess,
  apiError,
  logoutUserSuccess,
  codeSentSuccess,
  setUserProfile,
  logoutUser,
  showAlert,
  hideAlert,
  triggerAlert,
} from './actions';
import {
  getLoggedInUserInfo,
  isUserAuthenticated,
  setLoggedInUser,
} from '../../helpers/authUtils';

import axios from 'axios';
import isEqual from 'lodash/isEqual';
import { initializeDatabase } from '../../helpers/localStorage';

/**
 * Sets the session
 * @param {*} user
 */

const create = new APIClient().create;
const get = new APIClient().get;

/**
 * Login the user
 * @param {*} payload - email and password
 */
function* login({ payload: { email, password, history } }) {
  try {
    const response = yield call(create, '/users/login', {
      email,
      password,
    });
    if (response.status === 200) {
      setAuthorization(response.token);
      setLoggedInUser(response.token);
      setupInterceptor();
      //send notifications subscription to backend:
      // const loggeduser = getLoggedInUserInfo();
      // const currentuser_name = loggeduser.fname + ' ' + loggeduser.lname;
      // subscribeUser(loggeduser.user_id, currentuser_name);

      yield put(loginUserSuccess(response.token));
    } else {
      console.log(response.message); //find the element that hold error messages and write to it a significant msg.
    }
    history('/dashboard');
  } catch (error) {
    yield put(apiError(error));
  }
}

/**
 * Logout the user
 * @param {*} param0
 */
function* logout({ payload: { history } }) {
  try {
    yield put(logoutUserSuccess(true));
    localStorage.removeItem('authUser');
    window.location.reload();
  } catch (error) {
    console.log('Error occured in logout:', error);
    yield put(apiError(error));
  }
}

/**
 * Register the user
 */
function* register({ payload: { user } }) {
  try {
    console.log('register user is:', user);
    const response = yield call(create, '/users/register', user);
    setAuthorization(response.token);
    setLoggedInUser(response.token);
    yield put(registerUserSuccess(response.token));
  } catch (error) {
    yield put(apiError(error));
  }
}

/**
 * forget password
 */
function* forgetPassword({ payload: { email, password, verifCode } }) {
  try {
    const response = yield call(create, '/users/forget-pwd', {
      email,
      password,
      verifCode,
    });
    yield put(forgetPasswordSuccess(response.success));
  } catch (error) {
    yield put(apiError(error));
  }
}

function* codeSent({ payload: { email } }) {
  try {
    const response = yield call(create, '/users/code-gen', { email });
    yield put(codeSentSuccess(response.success));
  } catch (error) {
    yield put(apiError(error));
  }
}

// fetch the user data for profile
function* fetchUserProfile() {
  try {
    const token = localStorage.getItem('authUser').replace(/"/g, '');
    const response = yield call(get, '/users/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const loggedUser = getLoggedInUserInfo();

    const user = {
      ...response,
      user_id: loggedUser.user_id,
      fname: loggedUser.fname,
      lname: loggedUser.lname,
      email: loggedUser.email,
      userId: loggedUser.user_id,
      about: response.about,
      image: response.image ? response.image : defaultImage,
    };
    yield put(setUserProfile(user));
  } catch (error) {
    console.log('Error in fetchUser: ', error);
    yield put(apiError(error));
  }
}

// update the user profile
function* updateUserProfile(action) {
  try {
    const currentUser = yield select((state) => state.Auth.user);
    const updatedUser = Object.keys(currentUser).reduce((result, key) => {
      if (action.payload[key] === undefined) {
        result[key] = currentUser[key];
      } else if (key === 'image' && !action.payload.hasOwnProperty(key)) {
        result[key] = currentUser[key];
      } else if (!isEqual(action.payload[key], currentUser[key])) {
        result[key] = action.payload[key];
      }
      return result;
    }, {});

    if (Object.keys(updatedUser).length > 0) {
      const token = localStorage.getItem('authUser').replace(/"/g, '');
      const response = yield call(axios.put, '/users/update', updatedUser, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const user = { ...currentUser, ...updatedUser };
      setLoggedInUser(response.token);
      yield put(fetchUserProfile());
    } else {
      console.log('No changes to update');
    }
  } catch (error) {
    console.log('Error in updateUserProfile:', error);
    yield put(apiError(error));
  }
}

// handle Api errors
function* apiErrorHandler(error) {
  try {
    if (
      !isUserAuthenticated() &&
      error.payload &&
      error.payload.status === 401
    ) {
      yield put(triggerAlert(error.payload.message, 'danger'));
      yield put(logoutUser());
    } else {
      console.log('Error from API Error:', error.payload);
    }
  } catch (error) {
    console.log('Api Error', error);
  }
}

function* alertHandler({ payload: { message, color } }) {
  try {
    console.log('Alert Handler:', message, color);
    yield put(showAlert(message, color));

    yield delay(10000);

    yield put(hideAlert());
  } catch (error) {
    console.log('Alert Error', error);
    yield put(apiError(error));
  }
}

export function* watchLoginUser() {
  yield takeEvery(LOGIN_USER, login);
}
export function* watchCodeSent() {
  yield takeEvery(CODE_SENT, codeSent);
}
export function* watchLogoutUser() {
  yield takeEvery(LOGOUT_USER, logout);
}

export function* watchRegisterUser() {
  yield takeEvery(REGISTER_USER, register);
}

export function* watchForgetPassword() {
  yield takeEvery(FORGET_PASSWORD, forgetPassword);
}

export function* watchFetchUserProfile() {
  yield takeEvery(FETCH_USER_PROFILE, fetchUserProfile);
}

export function* watchApiError() {
  yield takeEvery(API_FAILED, apiErrorHandler);
}

export function* watchUpdateUserProfile() {
  yield takeEvery(UPDATE_USER_PROFILE, updateUserProfile);
}

export function* watchAlert() {
  yield takeEvery(TRIGGER_ALERT, alertHandler);
}

function* authSaga() {
  yield all([
    fork(watchCodeSent),
    fork(watchLoginUser),
    fork(watchLogoutUser),
    fork(watchRegisterUser),
    fork(watchForgetPassword),
    fork(watchFetchUserProfile),
    fork(watchApiError),
    fork(watchUpdateUserProfile),
    fork(watchAlert),
  ]);
}

export default authSaga;
