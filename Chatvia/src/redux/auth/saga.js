import { all, call, fork, put, takeEvery } from 'redux-saga/effects';

import { APIClient } from '../../apis/apiClient';
import {
  LOGIN_USER,
  LOGOUT_USER,
  REGISTER_USER,
  FORGET_PASSWORD,
  CODE_SENT,
} from './constants';

import {
  loginUserSuccess,
  registerUserSuccess,
  forgetPasswordSuccess,
  apiError,
  logoutUserSuccess,
  codeSentSuccess,
} from './actions';
import { setLoggedInUser } from '../../helpers/authUtils';

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
    localStorage.removeItem('authUser');
    yield put(logoutUserSuccess(true));
  } catch (error) {}
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

function* authSaga() {
  yield all([
    fork(watchCodeSent),
    fork(watchLoginUser),
    fork(watchLogoutUser),
    fork(watchRegisterUser),
    fork(watchForgetPassword),
  ]);
}

export default authSaga;
