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
  FETCH_USER_PROFILE,
  TRIGGER_ALERT,
  SHOW_ALERT,
  HIDE_ALERT,
} from './constants';

const INIT_STATE = {
  user: null,
  contactsLoading: false,
  loading: false,
  isUserLogout: false,
  error: null,
  success: false,
  alert: {
    visible: false,
    message: '',
    color: 'danger'
  }
};

const Auth = (state = INIT_STATE, action) => {
  switch (action.type) {
    case LOGIN_USER:
      return { ...state, loading: true };
    case LOGIN_USER_SUCCESS:
      return { ...state, user: action.payload, loading: false, error: null };

    case REGISTER_USER:
      return { ...state, loading: true };
    case REGISTER_USER_SUCCESS:
      return { ...state, user: action.payload, loading: false, error: null, success: true };

    case LOGOUT_USER_SUCCESS:
      localStorage.removeItem('activeTab');
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

    case FETCH_USER_PROFILE:
      return { ...state, loading: true };

    case FETCH_USER_PROFILE_SUCCESS:
        return { ...state,
              user: {
                user_id:action.payload.user_id,
                fname: action.payload.fname,
                lname: action.payload.lname,
                email: action.payload.email,
                about: action.payload.about,
                image: action.payload.image
              },
             loading: false, 
             error: null
        };
    case SHOW_ALERT:
      
      return {
        ...state,
        alert: {
          visible: true,
          message: action.payload.message,
          color: action.payload.color
        }
      };
    
    case HIDE_ALERT:
      return {
        ...state,
        alert: {
          ...state.alert,
          visible: false
        }
      };

    case TRIGGER_ALERT:
      return {
        ...state,
        alert: {
          visible: state.alert.visible,
          message: action.payload.message,
          color: action.payload.color
        }
      };

    default: return { ...state };
    }
}

export default Auth;
