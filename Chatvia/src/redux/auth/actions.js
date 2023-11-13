import {
  LOGIN_USER,
  LOGIN_USER_SUCCESS,
  LOGOUT_USER,
  LOGOUT_USER_SUCCESS,
  REGISTER_USER,
  REGISTER_USER_SUCCESS,
  FORGET_PASSWORD,
  FORGET_PASSWORD_SUCCESS,
  API_FAILED,
  CODE_SENT,
  CODE_SENT_SUCCESS,
} from './constants';

export const loginUser = (username, password, history) => ({
  type: LOGIN_USER,
  payload: { username, password, history },
});

export const loginUserSuccess = (user) => ({
  type: LOGIN_USER_SUCCESS,
  payload: user,
});

export const registerUser = (user) => ({
  type: REGISTER_USER,
  payload: { user },
});

export const registerUserSuccess = (user) => ({
  type: REGISTER_USER_SUCCESS,
  payload: user,
});

export const logoutUser = (history) => ({
  type: LOGOUT_USER,
  payload: { history },
});

export const logoutUserSuccess = () => {
  return {
    type: LOGOUT_USER_SUCCESS,
    payload: {},
  };
};

export const forgetPassword = (email, password, verifCode) => ({
  type: FORGET_PASSWORD,
  payload: { email, password, verifCode },
});
export const forgetPasswordSuccess = (passwordResetStatus) => ({
  type: FORGET_PASSWORD_SUCCESS,
  payload: passwordResetStatus,
});

export const codeSent = (email) => ({
  type: CODE_SENT,
  payload: { email },
});
export const codeSentSuccess = (passwordResetStatus) => ({
  type: CODE_SENT_SUCCESS,
  payload: passwordResetStatus,
});

export const apiError = (error) => ({
  type: API_FAILED,
  payload: error,
});
