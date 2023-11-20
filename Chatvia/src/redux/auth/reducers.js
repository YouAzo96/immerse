import {
  LOGIN_USER,
  LOGIN_USER_SUCCESS,
  LOGOUT_USER_SUCCESS,
  REGISTER_USER,
  REGISTER_USER_SUCCESS,
  FORGET_PASSWORD,
  FORGET_PASSWORD_SUCCESS,
  API_FAILED,
  FETCH_USER_PROFILE_SUCCESS,
  CODE_SENT,
  CODE_SENT_SUCCESS,
} from './constants';

import { getLoggedInUser, getLoggedInUserInfo } from '../../helpers/authUtils';

const INIT_STATE = {
  user: {
    fname: getLoggedInUserInfo()?.fname,
    lname: getLoggedInUserInfo()?.lname,
    username: getLoggedInUserInfo()?.username,
    about: getLoggedInUser()?.about,
    imageUrl: getLoggedInUser()?.imageUrl,},
  loading: false,
  isUserLogout: false,
  error: null,
};

console.log("INIT_STATE", INIT_STATE);

const Auth = (state = INIT_STATE, action) => {
  switch (action.type) {
    case LOGIN_USER:
      return { ...state, loading: true };
    case LOGIN_USER_SUCCESS:
      return { ...state, user: action.payload, loading: false, error: null };

    case REGISTER_USER:
      return { ...state, loading: true };
    case REGISTER_USER_SUCCESS:
      return { ...state, user: action.payload, loading: false, error: null };

    case LOGOUT_USER_SUCCESS:
      return { ...state, user: null, isUserLogout: true };

    case FORGET_PASSWORD:
      return { ...state, loading: true };

    case FORGET_PASSWORD_SUCCESS:
      return {
        ...state,
        passwordResetStatus: action.payload,
        loading: false,
        error: null,
      };
    //check on chatGPT
    case CODE_SENT:
      return { ...state, loading: true };
    case CODE_SENT_SUCCESS:
      return {
        ...state,
        passwordResetStatus: action.payload,
        loading: false,
        error: null,
      };

    case API_FAILED:
      return {
        ...state,
        loading: false,
        error: action.payload,
        isUserLogout: false,
      };

    case FETCH_USER_PROFILE_SUCCESS:
        return { ...state,
              user: {...INIT_STATE.user,
                about: action.payload.about,
                imageUrl: action.payload.imageUrl},
             loading: false, 
             error: null
        };

    default: return { ...state };
    }
}

export default Auth;
