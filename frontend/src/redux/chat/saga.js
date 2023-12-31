import { fork, all, put, select, call, takeEvery } from 'redux-saga/effects';
import defaultImage from '../../assets/images/users/blankuser.jpeg';

import {
  CHAT_USER,
  ACTIVE_USER,
  ADD_LOGGED_USER,
  CREATE_GROUP,
  FULL_USER,
  FETCH_USER_CONTACTS,
  INVITE_CONTACT,
  FETCH_USER_MESSAGES,
} from './constants';
import { apiError, triggerAlert } from '../auth/actions';
import {
  activeUser,
  addLoggedinUser,
  setUserContacts,
  inviteContactSuccess,
  setUserMessages,
  updateUserList,
} from './actions';
import { setActiveTab } from '../layout/actions';
// Import any necessary API functions or services here
import { APIClient } from '../../apis/apiClient';
import axios from 'axios';
import { addConversation, getConversations } from '../../helpers/localStorage';
import { getLoggedInUserInfo } from '../../helpers/authUtils';
const create = new APIClient().create;
const get = new APIClient().get;
const loggedInUser = getLoggedInUserInfo();

// fetch the contacts for the user
function* fetchUserContacts() {
  try {
    const token = localStorage.getItem('authUser').replace(/"/g, '');
    const response = yield call(get, 'users/contacts', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const contacts = response.map((contact) => ({
      ...contact,
      image: contact.image ? contact.image : defaultImage,
    }));

    yield put(setUserContacts(contacts));
  } catch (error) {
    yield put(apiError(error));
  }
}
function* fetchUserMessages(currentUsers) {
  try {
    const token = localStorage.getItem('authUser').replace(/"/g, '');
    const currentUsersList = currentUsers.payload;
    const response = yield call(get, 'users/messages', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('messages from mysql', response);
    const messages = response;
    if (messages.length > 0) {
      console.log(messages);
      const payload = { currentUsersList, messages };
      yield put(setUserMessages(payload)); //takes current users in indexDB and new messages from mysql
    }
  } catch (error) {
    yield put(apiError(error));
  }
}
function* inviteContacts(action) {
  try {
    const token = localStorage.getItem('authUser').replace(/"/g, '');
    const response = yield call(axios.post, '/users/invite', action.payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    yield put(inviteContactSuccess(response));
    yield put(triggerAlert(response));
  } catch (error) {
    console.log('Error in inviteContact:', error);
    yield put(apiError(error));
  }
}
// Worker Sagas
function* handleChatUser(action) {
  try {
    const local = yield call(getConversations, loggedInUser.user_id);
    if (!local) {
      yield put(updateUserList());
    } else {
      yield put(updateUserList(local));
    }
  } catch (error) {
    window.location.reload();
    console.error('Error in handleChatUser saga:', error);
    yield put(apiError(error));
  }
}

function* handleFullUser(action) {
  try {
    // Add logic for handling FULL_USER action here if needed
  } catch (error) {
    console.error('Error in handleChatUser saga:', error);
  }
}

function* handleAddLoggedUser(action) {
  try {
    const user = action.payload;
    //user.user_id=31
    //id=1,
    const users = yield select((state) => state.Chat.users);
    console.log('Users: ', users);
    if (users[0].name === null) {
      console.log('Removing default user');
      //remove the default user
      users.splice(0, 1);
    }
    const newUserId = users.findIndex((item) => item.id === user.id);
    yield call(addConversation, loggedInUser.user_id, user);
    yield put(activeUser(newUserId)); //just open their conversation
    yield put(setActiveTab('chat')); //move to chats tab
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
export function* watchChatUser() {
  yield takeEvery(CHAT_USER, handleChatUser);
}

export function* watchAddLoggedUser() {
  yield takeEvery(ADD_LOGGED_USER, handleAddLoggedUser);
}

export function* watchCreateGroup() {
  yield takeEvery(CREATE_GROUP, handleCreateGroup);
}

export function* watchFullUser() {
  yield takeEvery(FULL_USER, handleFullUser);
}

export function* watchFetchUserContacts() {
  yield takeEvery(FETCH_USER_CONTACTS, fetchUserContacts);
}
export function* watchFetchUserMessages() {
  yield takeEvery(FETCH_USER_MESSAGES, fetchUserMessages);
}
export function* watchInviteContact() {
  yield takeEvery(INVITE_CONTACT, inviteContacts);
}

function* ChatSaga() {
  yield all([
    fork(watchChatUser),
    fork(watchAddLoggedUser),
    fork(watchCreateGroup),
    fork(watchFullUser),
    fork(watchInviteContact),
    fork(watchFetchUserContacts),
    fork(watchFetchUserMessages),
  ]);
}

export default ChatSaga;
