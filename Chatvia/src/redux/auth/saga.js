import { all, call, fork, put, takeEvery } from 'redux-saga/effects';
import { APIClient, setAuthorization } from '../../apis/apiClient';
import {
  LOGIN_USER,
  LOGOUT_USER,
  REGISTER_USER,
  FORGET_PASSWORD,
  CODE_SENT,
  FETCH_USER_PROFILE,
  API_FAILED,
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
} from './actions';
import { isUserAuthenticated, setLoggedInUser } from '../../helpers/authUtils';

/**
 * Sets the session
 * @param {*} user
 */

const create = new APIClient().create;
const get = new APIClient().get;

/**
 * Login the user
 * @param {*} payload - username and password
 */
function* login({ payload: { username, password, history } }) {
  try {
    const response = yield call(create, '/users/login', {
      username,
      password,
    });
    if (response.status === 200) {
      setAuthorization(response.token);
      setLoggedInUser(response.token);
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
    console.log('logout saga', history);
    yield put(logoutUserSuccess(true));
    localStorage.removeItem('authUser');
  } catch (error) {
    console.log("Error occured in logout:", error);
    yield put(apiError(error));
  }
}

/**
 * Register the user
 */
function* register({ payload: { user } }) {
  try {
    const response = yield call(create, '/users/register', user);
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

    console.log("saga API response is:", response)

    const user = {
      ...response,
      imageUrl: response.imageUrl ? response.imageUrl : defaultImage,
    }
    yield put(setUserProfile(user));
  }  catch (error) {
    console.log("Error in fetchUser: ", error)
    yield put(apiError(error));
  }
}

// handle Api errors
function* apiErrorHandler({ payload: error }) {
  try {
  if (error && error.status === 405 && !isUserAuthenticated()) {
    yield put(logoutUser());
  }
} catch (error) {
  console.log("Api Error", error);
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


function* authSaga() {
  yield all([
    fork(watchCodeSent),
    fork(watchLoginUser),
    fork(watchLogoutUser),
    fork(watchRegisterUser),
    fork(watchForgetPassword),
    fork(watchFetchUserProfile),
    fork(watchApiError),
  ]);
}

export default authSaga;
