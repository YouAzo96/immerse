import { fork,all,put,call, takeEvery } from 'redux-saga/effects';
import blankuser from '../../assets/images/users/blankuser.jpeg';
import defaultImage from '../../assets/images/users/blankuser.jpeg';

import {
  CHAT_USER,
  ACTIVE_USER,
  ADD_LOGGED_USER,
  CREATE_GROUP,
  FULL_USER
} from './constants';
import {chatUser, activeUser,setFullUser,addLoggedinUser} from './actions';

// Import any necessary API functions or services here
import { APIClient, setAuthorization, setupInterceptor } from '../../apis/apiClient';
import axios from 'axios';
import isEqual from 'lodash/isEqual';
const create = new APIClient().create;
const get = new APIClient().get;


// Worker Sagas
function* handleChatUser(action) {
  try {
    // Add logic for handling CHAT_USER action here if needed
  } catch (error) {
    console.error('Error in handleChatUser saga:', error);
  }
}

function* handleFullUser(action) {
    try {
      // Add logic for handling FULL_USER action here if needed
    } catch (error) {
      console.error('Error in handleChatUser saga:', error);
    }
  }

function* handleActiveUser(action) {
  try {
    console.log("ActiveUser: "+action.payload);
  } catch (error) {
    console.error('Error in handleActiveUser saga:', error);
  }
}

function* handleAddLoggedUser(action) {
  try {
    //Contact structure built by Jancel
    // {
    //     '0': {
    //       group: 'M',
    //       children: {
    //         user_id: 30,
    //         name: 'Michael dummy',
    //         email: 'admin1@immerse.com',
    //         about: null,
    //         image: '/static/media/blankuser.7a6a6c54279a54d1977c.jpeg'
    //       }
    //     }
    //   }
    //we should have this data in contacts and we pull from contacts where user_id = action
    console.log("action: "+ action.payload);
    const token = localStorage.getItem('authUser').replace(/"/g, '');
    const response = yield call(get, 'users/contacts', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Assuming response is an array of contacts
    const contacts = response.map((contact) => ({
      ...contact,
      image: contact.image ? contact.image : defaultImage,
    }));
    console.log("Contacts New SAGA: "+JSON.stringify(contacts));

    //find specific contact to add it as newUser 
    const contact = contacts.find(item => item.user_id == action.payload);

    console.log("Contact Found: "+JSON.stringify(contact));
    if(contact){
    const newUser = { 
            id: contact.user_id,
            name: contact.fname + " " +contact.lname,
            profilePicture: contact.image || blankuser,
            status: 'online',//to be handled
            unRead: 0,
            roomType: 'contact',
            isGroup: false,
            messages: [],
          };
          console.log("NewUser: "+ JSON.stringify(newUser));
          yield put(addLoggedinUser(newUser));
          yield put(activeUser(action.payload));
        }
  } catch (error) {
    console.error('Error in handleAddLoggedUser saga:', error);
  }
}

function* handleCreateGroup(action) {
  try {
    // Add logic for handling CREATE_GROUP action here if needed
  } catch (error) {
    console.error('Error in handleCreateGroup saga:', error);
  }
}


function* watchChatUser() {
  yield takeEvery(CHAT_USER, handleChatUser);
}

function* watchActiveUser() {
  yield takeEvery(ACTIVE_USER, handleActiveUser);
}

function* watchAddLoggedUser() {
  yield takeEvery(ADD_LOGGED_USER, handleAddLoggedUser);
}

function* watchCreateGroup() {
  yield takeEvery(CREATE_GROUP, handleCreateGroup);
}

function* watchFullUser() {
  yield takeEvery(FULL_USER, handleFullUser);
}


function* ChatSaga() {
    yield all([
        fork(watchChatUser),
        fork(watchActiveUser),
        fork(watchAddLoggedUser),
        fork(watchCreateGroup),
        fork(watchFullUser),
    ]);
  }


export default ChatSaga;
