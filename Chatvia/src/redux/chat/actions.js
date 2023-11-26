import {
    CHAT_USER,ACTIVE_USER,FULL_USER, ADD_LOGGED_USER, CREATE_GROUP, FETCH_USER_CONTACTS, FETCH_USER_CONTACTS_SUCCESS, INVITE_CONTACT, INVITE_CONTACT_SUCCESS
} from './constants';


export const chatUser = () => ({
    type: CHAT_USER
});

export const activeUser = (userId) => ({
    type: ACTIVE_USER,
    payload : userId
});

export const setFullUser = (fullUser) => ({
    type: FULL_USER,
    payload : fullUser
});

export const addLoggedinUser = (userData) => ({
    type: ADD_LOGGED_USER,
    payload : userData
});

export const createGroup = (groupData) => ({
    type : CREATE_GROUP,
    payload : groupData
})



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
