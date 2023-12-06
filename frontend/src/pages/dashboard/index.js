import React, { Component } from 'react';
import { PacmanLoader } from 'react-spinners';
//Import Components
import ChatLeftSidebar from './ChatLeftSidebar';
import UserChat from './UserChat/index';
import { connect } from 'react-redux';
import { fetchUserProfile } from '../../redux/auth/actions';
import { getLoggedInUserInfo } from '../../helpers/authUtils';
import {
  addUser,
  getConversations,
  updateConversation,
} from '../../helpers/localStorage';
import {
  fetchUserContacts,
  chatUser,
  fetchUserMessages,
} from '../../redux/chat/actions';
import { bindActionCreators } from 'redux';
import { APIClient } from '../../apis/apiClient';
import config from '../../config';
const gatewayServiceUrl = config.BACKEND_URL;

const create = new APIClient().create;
//send ONLINE status:
class Index extends Component {
  hasFetchedMessages = false;

  async componentDidMount() {
    // if (!this.hasFetchedMessages) {
    //   const current_user_id = getLoggedInUserInfo().user_id;
    //   const allusers = await getConversations(current_user_id);
    //   this.props.fetchUserMessages(allusers);
    //   this.hasFetchedMessages = true; // Mark messages as fetched
    // }
    this.props.fetchUserProfile();
    this.props.fetchUserContacts();
    this.props.chatUser();

    // //register s.worker:
    // if (!this.serviceWorkerRegistered || !this.isSubscribed) {
    //   const registration = await navigator.serviceWorker
    //     .register('./serviceWorker.js', {
    //       scope: '/dashboard/',
    //     })
    //     .then(async (registration) => {
    //       if (registration) {
    //         console.log('sw registered');
    //         localStorage.getItem('serviceWorkerRegistered', true);

    //         navigator.serviceWorker.addEventListener(
    //           'activate',
    //           async (event) => {
    //             registration = event.target;
    //             await registration.pushManager
    //               .subscribe({
    //                 userVisibleOnly: true,
    //                 applicationServerKey:
    //                   'BBqDXkxFpyZKr_bgvztajKcanbfXuo9vcqvSThBsaAqU_3jLMl4gwTp__V5WpQq-hRYTUpyGoTW9ubNi6owtgcY',
    //               })
    //               .then(async (subscription) => {
    //                 console.log('subscribed: ', subscription);
    //                 await create(`${gatewayServiceUrl}notify`, {
    //                   subscription: this.subscription,
    //                   user_id: this.props.loggedUser.user_id,
    //                   user_name: `${this.props.loggedUser.fname} ${this.props.loggedUser.lname}`,
    //                 });
    //                 if (resp.success) {
    //                   console.log('Subscription sent!');
    //                   this.isSubscribed = true;
    //                 }
    //               });
    //           }
    //         );
    //       }
    //     })
    //     .catch((err) => {
    //       console.log('error registering sw. ', err);
    //     });
    // }
  }
  render() {
    const { loading, loggedUser, userContacts, chatLoading } = this.props;
    document.title = 'Chat | Immerse: Real-Time Chat App';

    if (loading || !loggedUser || !userContacts || chatLoading) {
      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100vw',
          }}
        >
          <PacmanLoader />
        </div>
      );
    }

    return (
      <React.Fragment>
        {/* chat left sidebar */}
        <ChatLeftSidebar
          loggedUser={this.props.loggedUser}
          userContacts={this.props.userContacts}
          recentChatList={this.props.users}
        />

        {/* user chat */}
        <UserChat
          loggedUser={this.props.loggedUser}
          recentChatList={this.props.users}
          active_user={this.props.active_user}
          userContacts={this.props.userContacts}
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  const { users, contacts, chatLoading, active_user } = state.Chat;
  const { loading, user } = state.Auth;
  return {
    users,
    loading,
    loggedUser: user,
    active_user: active_user,
    userContacts: contacts,
    chatLoading,
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    { fetchUserProfile, fetchUserContacts, fetchUserMessages, chatUser },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Index);
