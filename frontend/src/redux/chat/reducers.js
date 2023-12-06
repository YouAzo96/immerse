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
import {
  addUser,
  getConversations,
  updateConversation,
} from '../../helpers/localStorage';
import { all } from 'axios';
import { getLoggedInUserInfo } from '../../helpers/authUtils';

const INIT_STATE = {
  active_user: 0,
  users: [
    {
      id: 0,
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
    case FETCH_USER_MESSAGES:
      return { ...state, chatLoading: true };

    case FETCH_USER_MESSAGES_SUCCESS:
      //we get from the DB an array of json objects
      //Each JSON obj is contains: sender_id and msg fields
      //msg field is a list of messages from the corresponding sender
      const current_user_id = getLoggedInUserInfo().user_id;
      const allusers = action.payload.currentUsersList;
      const receivedMessages = action.payload.messages;
      console.log('allusers from indexDb: ', allusers);
      console.log('reeivedmsgs: ', receivedMessages);

      receivedMessages.map((OneSenderMessages) => {
        for (const user of allusers) {
          if (OneSenderMessages.sender_id === user.id) {
            user.messages.push(...OneSenderMessages.msg);
          }
        }
        //delete the messages from the received object
        const index = receivedMessages.indexOf(OneSenderMessages);
        if (index !== -1) {
          receivedMessages.splice(index, 1);
        }
      });
      //If any messages are left in receivedMessages obj,
      // it means we dont have open conv. with them:
      if (receivedMessages.length >= 1) {
        receivedMessages.map((OneSenderMessages) => {
          const contact = state.contacts.find(
            (cntct) => (cntct.children.user_id = OneSenderMessages.sender_id)
          );
          if (contact) {
            const newUser = {
              id: allusers.length + 1,
              name: contact.children.name,
              profilePicture: contact.children.image || blankuser || null,
              status: contact.children.last_seen,
              unRead: OneSenderMessages.msg.length,
              roomType: 'contact',
              isGroup: false,
              messages: [...OneSenderMessages.msg],
            };

            allusers.push(newUser);
          }
        });
      }
      console.log('allUsers after fetching messages: ', allusers);
      allusers.map((usr) => {
        updateConversation(current_user_id, usr);
      });
      return {
        ...state,
        chatLoading: false,
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
