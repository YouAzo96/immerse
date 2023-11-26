import {
  CHAT_USER,
  ACTIVE_USER,
  FULL_USER,
  ADD_LOGGED_USER,
  CREATE_GROUP,
} from './constants';
// Needs major change

//Import Images
import blankuser from '../../assets/images/users/blankuser.jpeg';
 import avatar2 from '../../assets/images/users/avatar-2.jpg';
 import avatar8 from '../../assets/images/users/avatar-8.jpg';
 import img4 from '../../assets/images/small/img-4.jpg';
 import img7 from '../../assets/images/small/img-7.jpg';

const INIT_STATE = {
 
  // users: [
  //   {
  //     id: 0,
  //     name: null,
  //     profilePicture: blankuser || null,
  //     status: 'active',
  //     unRead: 0,
  //     roomType: null,
  //     isGroup: null,
  //     messages: [
  //       {
  //         id: -1,
  //         message: null,
  //         time: null,
  //         userType: 'sender',
  //         isImageMessage: false,
  //         isFileMessage: false,
  //         imageMessage: null,
  //         fileMessage: null,
  //       },
  //     ],
  //   },
  // ],
  active_user: 0,
  users: [
    { id : 0, name : "Patrick Hendricks", profilePicture : avatar2, status : "online", unRead : 0, roomType : "contact", isGroup: false,
        messages: [
            { id: 1, message: "hi", time: "01:05", userType: "receiver", isImageMessage : false, isFileMessage : false },
            { id: 2, message: "hi patrick", time: "10.00", userType: "sender", isImageMessage : false, isFileMessage : false },
            { id: 3, message: "how's going on your project?", time: "01:05", userType: "receiver", isImageMessage : false, isFileMessage : false },
            { id: 4, message: "Do you need any help?", time: "01:06", userType: "receiver", isImageMessage : false, isFileMessage : false },
            { id : 33, isToday : true },
            { id: 5, message: "Let me know?", time: "01:06", userType: "receiver", isImageMessage : false, isFileMessage : false },
            { id: 6, message: "hi...Good Morning!", time: "09:05", userType: "sender", isImageMessage : false, isFileMessage : false },
            { id: 7, message: "Image", time: "10:30", userType: "receiver", isImageMessage : true, isFileMessage : false, imageMessage : [ { image : img4 }, { image : img7 } ] },
            { id: 8, message: "please, save this pictures to your file and give it to me after you have done with editing!", time: "10:31", userType: "receiver", isImageMessage : false, isFileMessage : false },
            { id: 9, message: "hey! there I'm available", time: "02:50 PM", userType: "sender", isImageMessage : false, isFileMessage : false },
    ] },
    { id : 1, name : "Youssef Azougagh", profilePicture : avatar2, status : "online", unRead : 0, roomType : "contact", isGroup: false,
        messages: [

        ] }
  ],
  groups: [
    { gourpId : 1, name : "#General", profilePicture : "Null", isGroup : true, unRead : 0, desc : "General Group",
        members : [
            { userId : 1, name : "Sara Muller", profilePicture : "Null", role : null },
            { userId : 2, name : "Ossie Wilson", profilePicture : avatar8, role : "admin" },
        ]
    },
  ],
  contacts: [
   // { id: 1, name: 'Albert Rodarte' },
  ],
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
      const newUser = action.payload;
      return {
        ...state,
        users: [...state.users, newUser],
      };

    case CREATE_GROUP:
      const newGroup = action.payload;
      return {
        ...state,
        groups: [...state.groups, newGroup],
      };

    default:
      return { ...state };
  }
};

export default Chat;
