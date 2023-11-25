import React, { Component } from 'react';
import { PacmanLoader } from 'react-spinners';
//Import Components
import ChatLeftSidebar from "./ChatLeftSidebar";
import UserChat from "./UserChat/index";

import { connect } from "react-redux";
import { fetchUserProfile, fetchUserContacts } from '../../redux/auth/actions';
import { bindActionCreators } from 'redux';

class Index extends Component {
    componentDidMount() {
        console.log("this.props in Index are:", this);
        this.props.fetchUserProfile();
        this.props.fetchUserContacts();
    }
    
    render() {
        const { loading, loggedUser, userContacts } = this.props;
        document.title = "Chat | Immerse: Real-Time Chat App"

        if (loading || !loggedUser || !userContacts) {
            return (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <PacmanLoader />
                </div>
            )
        }

        return (
            <React.Fragment>
                {/* chat left sidebar */}
                <ChatLeftSidebar loggedUser={loggedUser} userContacts={userContacts} recentChatList={this.props.users} />

                {/* user chat */}
                <UserChat loggedUser={loggedUser} recentChatList={this.props.users} />

            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    const { users } = state.Chat;
    const { loading, user, contacts } = state.Auth;
    return { users, loading, loggedUser: user, userContacts: contacts };
};

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({ fetchUserProfile, fetchUserContacts }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(Index);