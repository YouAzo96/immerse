import React, { Component } from 'react';
import { PacmanLoader } from 'react-spinners';
//Import Components
import ChatLeftSidebar from './ChatLeftSidebar';
import UserChat from './UserChat/index';
import { connect } from 'react-redux';
import { fetchUserProfile } from '../../redux/auth/actions';
import { fetchUserContacts } from '../../redux/chat/actions';
import { bindActionCreators } from 'redux';
import { APIClient } from '../../apis/apiClient';
const gatewayServiceUrl = 'http://localhost:3001';

const create = new APIClient().create;
const get = new APIClient().get;

//send ONLINE status:
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
};

class Index extends Component {
  async componentDidMount() {
    this.props.fetchUserProfile();
    this.props.fetchUserContacts();
  }

  render() {
    const { loading, loggedUser, userContacts } = this.props;
    document.title = 'Chat | Immerse: Real-Time Chat App';

    if (loading || !loggedUser || !userContacts) {
      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          <PacmanLoader />
        </div>
      );
    }
    const currentuser_name =
      this.props.loggedUser.fname + ' ' + this.props.loggedUser.lname;
    subscribeUser(this.props.loggedUser.user_id, currentuser_name);
    return (
      <React.Fragment>
        {/* chat left sidebar */}
        <ChatLeftSidebar
          loggedUser={loggedUser}
          userContacts={userContacts}
          recentChatList={this.props.users}
        />

        {/* user chat */}
        <UserChat loggedUser={loggedUser} recentChatList={this.props.users} />
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  const { users, contacts } = state.Chat;
  const { loading, user } = state.Auth;
  return { users, loading, loggedUser: user, userContacts: contacts };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ fetchUserProfile, fetchUserContacts }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(Index);
