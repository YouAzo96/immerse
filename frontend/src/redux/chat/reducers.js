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
  FETCH_USER_MESSAGES,
  FETCH_USER_MESSAGES_SUCCESS,
} from './constants';
// Needs major change

//Import Images
import blankuser from '../../assets/images/users/blankuser.jpeg';
import { addUser } from '../../helpers/localStorage';
import { all } from 'axios';

const INIT_STATE = {
  active_user: 0,
  users: [
    {
      id: -1,
      name: null,
      profilePicture: blankuser || null,
      status: 'offline',
      unRead: 0,
      roomType: null,
      isGroup: null,
      messages: [
        {
          id: -1,
          message: null,
          time: null,
          userType: 'sender',
          isImageMessage: false,
          isFileMessage: false,
          imageMessage: null,
          fileMessage: null,
        },
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
      if (action.payload === undefined) {
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

    case 'SET_ACTIVE_USER':
      return {
        ...state,
        active_user: action.payload,
      };

    case FULL_USER:
      console.log('fullUser', action.payload);
      const mergedUsers = action.payload.fullUser.reduce((merged, user) => {
        const existingUser = merged.find(existing => existing.id === user.id);
        if (existingUser) {
          user.messages.forEach(newMessage => {
            if (!existingUser.messages.find(existingMessage => existingMessage.id === newMessage.id)) {
              existingUser.messages.push(newMessage);
            }
          });
          return merged;
        } else {
          return [...merged, user];
        }
      }, []);
      return {
        ...state,
        users: mergedUsers,
      };

    case ADD_LOGGED_USER:
      const currentUsers = state.users;
      const isUserExistInConversations = currentUsers.findIndex(
        (usr) => usr.id === action.payload.id
      );
      if (isUserExistInConversations !== -1) {
        return { ...state };
      }
      let filteredUsers = [...state.users, action.payload];
      if (state.users[0] && state.users[0].id === -1) {
        filteredUsers = filteredUsers.slice(1);
      }
      return {
        ...state,
        users: filteredUsers,
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
    case FETCH_USER_MESSAGES:
      return { ...state, loading: true, chatLoading: true };

    case FETCH_USER_MESSAGES_SUCCESS:
      let newUsers = action.payload;

      // If newUsers is undefined or empty, return the current state
      if (!newUsers || newUsers.length === 0) {
        return { ...state, loading: false, chatLoading: false };
      }

      let users = state.users;
      let filUsers = users.filter((user) => user.id !== -1);

      // Merge newUsers into filUsers
      filUsers = [...filUsers, ...newUsers];

      const updatedUsers = filUsers.map(user => {
        const newUser = newUsers.find(newUser => newUser.id === user.id);
        if (newUser) {
          // If the user is already in the array, update the user's messages
          return {
            ...user,
            messages: [...user.messages, ...newUser.messages]
          };
        } else {
          // If not, return the user as is
          return user;
        }
      });

      return { ...state, loading: false, chatLoading: false, error: null, users: updatedUsers }; 

    case INVITE_CONTACT:
      return { ...state, loading: true };

    case INVITE_CONTACT_SUCCESS:
      return { ...state, loading: false, error: null };

    default:
      return { ...state };
  }
};

export default Chat;
