import { all, call, fork, put, takeEvery } from 'redux-saga/effects';

import { APIClient } from '../../apis/apiClient';
import {
  LOGIN_USER,
  LOGOUT_USER,
  REGISTER_USER,
  FORGET_PASSWORD,
} from './constants';

import {
  loginUserSuccess,
  registerUserSuccess,
  forgetPasswordSuccess,
  apiError,
  logoutUserSuccess,
} from './actions';

/**
 * Sets the session
 * @param {*} user
 */

const create = new APIClient().create;

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
        localStorage.setItem('authUser', JSON.stringify(response.token));
        yield put(loginUserSuccess(response.token));
      } else {
        console.log(response.message); //find the element that hold error messages and write to it a significant msg.
      }
    history('/dashboard');
  }  catch (error) {
    let errorMessage;
    console.log(error);
    if (error.includes('403')) {
      errorMessage = 'User not found';
    }else if (error.includes('404')) {
      errorMessage = 'Password is incorrect';
    } else {
      errorMessage = 'Something went wrong! Please try again later';
    }
    yield put(apiError(errorMessage));
  }
}

/**
 * Logout the user
 * @param {*} param0
 */
function* logout({ payload: { history } }) {
  try {
    localStorage.removeItem('authUser');
    yield put(logoutUserSuccess(true));
  } catch (error) {}
}

/**
 * Register the user
 */
function* register({ payload: { user } }) {
  try {
    const email = user.email;
    const password = user.password;
    const response = yield call(create, '/users/register', user);
    yield put(registerUserSuccess(response));
  } catch (error) {
    yield put(apiError(error));
  }
}

/**
 * forget password
 */
function* forgetPassword({ payload: { email } }) {
  try {
    const response = yield call(create, '/forget-pwd', { email });
    yield put(forgetPasswordSuccess(response));
  } catch (error) {
    yield put(apiError(error));
  }
}

export function* watchLoginUser() {
  yield takeEvery(LOGIN_USER, login);
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

function* authSaga() {
  yield all([
    fork(watchLoginUser),
    fork(watchLogoutUser),
    fork(watchRegisterUser),
    fork(watchForgetPassword),
  ]);
}

export default authSaga;
