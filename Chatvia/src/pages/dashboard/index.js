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

class Index extends Component {
  async componentDidMount() {
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
