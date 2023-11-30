import React, { Component } from 'react';
import { PacmanLoader } from 'react-spinners';
//Import Components
import ChatLeftSidebar from './ChatLeftSidebar';
import UserChat from './UserChat/index';
import { connect } from 'react-redux';
import { fetchUserProfile } from '../../redux/auth/actions';
import { fetchUserContacts, chatUser } from '../../redux/chat/actions';
import { bindActionCreators } from 'redux';
import { APIClient } from '../../apis/apiClient';
const gatewayServiceUrl = 'http://localhost:3001';

const create = new APIClient().create;
//send ONLINE status:
/*
const subscribeUser = async (userId, user_name) => {
  try {
    if ('serviceWorker' in navigator) {
      await navigator.serviceWorker
        .register('./serviceWorker.js', { scope: '/dashboard/' }) // Adjust the scope based on your application's structure
        .then(async (registration) => {
          console.log(
            'Service Worker registered with scope:',
            registration.scope
          );
          // Check for notifications permission
          if (Notification.permission === 'granted') {
            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey:
                'BBqDXkxFpyZKr_bgvztajKcanbfXuo9vcqvSThBsaAqU_3jLMl4gwTp__V5WpQq-hRYTUpyGoTW9ubNi6owtgcY',
            });
            //Send the subscription details to your server
            await create(`${gatewayServiceUrl}/notify`, {
              subscription: subscription,
              user_id: userId,
              user_name: user_name,
            });
          } else {
            console.log('Notification permission denied.');
          }
        })
        .catch((error) => {
          console.error(
            'Service Worker registration or subscription failed:',
            error
          );
        });
    }
  } catch (error) {
    console.log('Error in Push Notif Registration: ', error);
  }
};*/
class Index extends Component {
  async componentDidMount() {
    let isSubscribed = false;

    if ('serviceWorker' in navigator) {
      await navigator.serviceWorker
        .register('./serviceWorker.js', { scope: '/dashboard/' }) // Adjust the scope based on your application's structure
        .then(async (registration) => {
          console.log(
            'Service Worker registered with scope:',
            registration.scope
          );

          // Check for notifications permission
          if (Notification.permission === 'granted') {
            if (!isSubscribed && this.props.loggedUser && this.props.loggedUser.user_id) {
              const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: 'BBqDXkxFpyZKr_bgvztajKcanbfXuo9vcqvSThBsaAqU_3jLMl4gwTp__V5WpQq-hRYTUpyGoTW9ubNi6owtgcY',
              });

              // Send the subscription details to your server
              await create(`${gatewayServiceUrl}/notify`, {
                subscription: subscription,
                user_id: this.props.loggedUser.user_id,
                user_name: this.props.loggedUser.fname + ' ' + this.props.loggedUser.lname,
              });

              isSubscribed = true;
            }
          } else {
            console.log('Notification permission denied.');
          }
        })
        .catch((error) => {
          console.error(
            'Service Worker registration or subscription failed:',
            error
          );
        });
    }
    this.props.fetchUserProfile();
    this.props.fetchUserContacts();
    this.props.chatUser();
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
          loggedUser={loggedUser}
          userContacts={userContacts}
          recentChatList={this.props.users}
        />

        {/* user chat */}
        <UserChat
          loggedUser={loggedUser}
          recentChatList={this.props.users}
          active_user={this.props.active_user}
          userContacts={userContacts}
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
    { fetchUserProfile, fetchUserContacts, chatUser },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Index);
