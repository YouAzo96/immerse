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
  FETCH_USER_PROFILE,
  FETCH_USER_PROFILE_SUCCESS,
  CODE_SENT,
  CODE_SENT_SUCCESS,
  UPDATE_USER_PROFILE,
  FETCH_USER_CONTACTS,
  FETCH_USER_CONTACTS_SUCCESS,
  INVITE_CONTACT,
  INVITE_CONTACT_SUCCESS,
  SHOW_ALERT,
  HIDE_ALERT,
  TRIGGER_ALERT,
} from './constants';

export const loginUser = (email, password, history) => ({
  type: LOGIN_USER,
  payload: { email, password, history },
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

export const fetchUserProfile = () => ({
  type: FETCH_USER_PROFILE,
  payload: {},
});

export const setUserProfile = (user) => ({
  type: FETCH_USER_PROFILE_SUCCESS,
  payload: user,
});

export const updateUserProfile = (user) => ({
  type: UPDATE_USER_PROFILE,
  payload: user,
});

export const fetchUserContacts = () => ({
  type: FETCH_USER_CONTACTS,
  payload: {},
});

export const setUserContacts = (contacts) => ({
  type: FETCH_USER_CONTACTS_SUCCESS,
  payload: contacts,
});

export const inviteContact = (email, message) => ({
  type: INVITE_CONTACT,
  payload: {refereeEmail: email, message: message},
});

export const inviteContactSuccess = (contact) => ({
  type: INVITE_CONTACT_SUCCESS,
  payload: contact,
});

export const showAlert = (message, color) => ({
  type: SHOW_ALERT,
  payload: { message, color },
});

export const hideAlert = () => ({
  type: HIDE_ALERT,
  payload: {},
});

export const triggerAlert = (message, color) => ({
  type: TRIGGER_ALERT,
  payload: { message, color },
});