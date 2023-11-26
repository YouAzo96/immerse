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
} from './constants';
// Needs major change

//Import Images
import avatar2 from '../../assets/images/users/avatar-2.jpg';

const INIT_STATE = {
  // Message structure:
  //  {
  //   id: 1,
  //   message: 'hi',
  //   time: '00:1',
  //   userType: 'sender',
  //   image: '/static/media/avatar-4.b23e41d9c09997efbc21.jpg',
  //   isFileMessage: false,
  //   isImageMessage: false
  // },
  // {
  //   id: 2,
  //   message: 'image',
  //   imageMessage: [
  //     {
  //       image: 'blob:http://localhost:3000/597cfcf4-1e71-45e1-9bf8-60874ded50a6'
  //     }
  //   ],
  //   time: '00:31',
  //   userType: 'sender',
  //   image: '/static/media/avatar-4.b23e41d9c09997efbc21.jpg',
  //   isImageMessage: true,
  //   isFileMessage: false
  // },
  // {
  //   id: 3,
  //   message: 'file',
  //   fileMessage: 'WIN_20210928_19_09_35_Pro.jpg',
  //   size: 117114,
  //   time: '00:21',
  //   userType: 'sender',
  //   image: '/static/media/avatar-4.b23e41d9c09997efbc21.jpg',
  //   isFileMessage: true,
  //   isImageMessage: false
  // }
  active_user: 0,
  users: [
    {
      id: 0,
      name: 'Patrick Hendricks',
      profilePicture: avatar2,
      status: 'online',
      unRead: 0,
      roomType: 'contact',
      isGroup: false,
      messages: [],
    },
  ],
  groups: [
    {
      gourpId: 1,
      name: '#General',
      profilePicture: 'Null',
      isGroup: true,
      unRead: 0,
      desc: 'General Group',
      members: null,
    },
  ],
  contacts: null,
};

const Chat = (state = INIT_STATE, action) => {
  switch (action.type) {
    case CHAT_USER:
      return { ...state };

    case ACTIVE_USER:
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
      console.log('Action Payload:' + JSON.stringify(action.payload));
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
