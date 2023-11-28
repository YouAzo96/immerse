import {
  CHAT_USER,
  ACTIVE_USER,
  FULL_USER,
  ADD_LOGGED_USER,
  CREATE_GROUP,
  FETCH_USER_CONTACTS,
  FETCH_USER_CONTACTS_SUCCESS,
  INVITE_CONTACT,
  INVITE_CONTACT_SUCCESS,
  UPDATE_USER_LIST,
} from './constants';
// Needs major change

//Import Images
import blankuser from '../../assets/images/users/blankuser.jpeg';
import { addUser } from '../../helpers/localStorage';

const INIT_STATE = {
  active_user: 0,
  users: [
    {id : 0,
    name : null,
    profilePicture : blankuser || null,
    status : "offline",
    unRead : 0,
    roomType : null,
    isGroup: null,
    messages: [
      { id: -1,
        message: null,
        time: null,
        userType: 'sender',
        isImageMessage: false,
        isFileMessage: false,
        imageMessage: null,
        fileMessage: null,
        }
      ],
    },
  ],
  groups: [
    {
      groupId: 1,
      name: '#General',
      profilePicture: 'Null',
      isGroup: true,
      unRead: 0,
      desc: 'General Group',
      members: null,
    },
  ],
  contacts: null,
  contactsLoading: false,
  chatLoading: false,
};

const Chat = (state = INIT_STATE, action) => {
  switch (action.type) {
    case CHAT_USER:
      return { ...state, chatLoading: true };

    case UPDATE_USER_LIST:
      // console.log('UpdateUserList: ' , action.payload);
      if (action.payload === undefined){
        return { ...state, chatLoading: false };
      } else {
        return { ...state, chatLoading: false, users: action.payload };
      }

    case ACTIVE_USER:
      // console.log('ActiveUser: ' + action.payload);
      return {
        ...state,
        active_user: action.payload,
      };

    case FULL_USER:
      return {
        ...state,
        users: action.payload,
      };

    case ADD_LOGGED_USER:
      const currentUsers = state.users;
      const isUserExistInConversations = currentUsers.findIndex(
        (usr) => usr.id === action.payload.id
      );
      if (isUserExistInConversations !== -1) {
        return { ...state };
      }
      return {
        ...state,
        users: [...state.users, action.payload],
      };

    case CREATE_GROUP:
      const newGroup = action.payload;
      return {
        ...state,
        groups: [...state.groups, newGroup],
      };

    case FETCH_USER_CONTACTS:
      return { ...state, contactsLoading: true };

    case FETCH_USER_CONTACTS_SUCCESS:
      return {
        ...state,
        contacts: action.payload.map((contact) => ({
          group: contact.fname[0].toUpperCase(),
          children: {
            user_id: contact.user_id,
            name: contact.fname + ' ' + contact.lname,
            email: contact.email,
            about: contact.about,
            last_seen: contact.last_seen,
            image: contact.image,
          },
        })),
        contactsLoading: false,
        error: null,
      };

    case INVITE_CONTACT:
      return { ...state, loading: true };

    case INVITE_CONTACT_SUCCESS:
      return { ...state, loading: false, error: null };

    default:
      return { ...state };
  }
};

export default Chat;

