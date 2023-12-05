import React, { Component } from 'react';
import { PacmanLoader } from 'react-spinners';
//Import Components
import ChatLeftSidebar from './ChatLeftSidebar';
import UserChat from './UserChat/index';
import { connect } from 'react-redux';
import { fetchUserProfile } from '../../redux/auth/actions';
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
  isSubscribed = false;
  hasFetchedMessages = false;
  async componentDidMount() {
    this.props.fetchUserProfile();
    this.props.fetchUserContacts();
    this.props.chatUser();
    if (!this.hasFetchedMessages) {
      this.props.fetchUserMessages();
      this.hasFetchedMessages = true; // Mark messages as fetched
    }
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
