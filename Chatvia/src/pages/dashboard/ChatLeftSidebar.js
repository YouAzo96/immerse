import React, { useEffect, useState } from 'react';
import { connect, useDispatch } from "react-redux";
import { getLoggedInUserInfo, isUserAuthenticated } from "../../helpers/authUtils";

import { TabContent, TabPane } from "reactstrap";

//Import Components
import Profile from "./Tabs/Profile";
import Chats from "./Tabs/Chats";
import Groups from "./Tabs/Groups";
import Contacts from "./Tabs/Contacts";
import Settings from "./Tabs/Settings";
import { fetchUserProfile, logoutUser } from '../../redux/actions';
import { useSelector } from 'react-redux';

function ChatLeftSidebar(props) {
    const dispatch = useDispatch();
    const activeTab = props.activeTab;
    const [user, setUser] = useState(null);
    const [isUserLoaded, setIsUserLoaded] = useState(false);
    const loggedInUserData = useSelector(state => state.Auth.user);

    useEffect(() => {
    dispatch(fetchUserProfile());
    }, [dispatch]);

    useEffect(() => {
        console.log("loggedInUserData", loggedInUserData);
        if (loggedInUserData?.about) {
            const userData = {
                fname: loggedInUserData.fname,
                lname: loggedInUserData.lname,
                username: loggedInUserData.username,
                about: loggedInUserData.about,
                imageUrl: loggedInUserData.imageUrl,
            }
        setUser(userData);
        setIsUserLoaded(true);
        } else if (loggedInUserData === null) {
          console.log("loggedInUserData is null");
          window.location.href = "/logout";

        }
    }, [loggedInUserData]);

    if (!isUserLoaded) {
    return <div>Loading...</div>;
    }

    return (
        <React.Fragment>
            <div className="chat-leftsidebar me-lg-1">

                <TabContent activeTab={activeTab}  >
                    {/* Start Profile tab-pane */}
                    <TabPane tabId="profile" id="pills-user"   >
                        {/* profile content  */}
                        <Profile user ={user}/>
                    </TabPane>
                    {/* End Profile tab-pane  */}

                    {/* Start chats tab-pane  */}
                    <TabPane tabId="chat" id="pills-chat">
                        {/* chats content */}
                        <Chats recentChatList={props.recentChatList} />
                    </TabPane>
                    {/* End chats tab-pane */}

                    {/* Start groups tab-pane */}
                    <TabPane tabId="group" id="pills-groups">
                        {/* Groups content */}
                        <Groups />
                    </TabPane>
                    {/* End groups tab-pane */}

                    {/* Start contacts tab-pane */}
                    <TabPane tabId="contacts" id="pills-contacts">
                        {/* Contact content */}
                        <Contacts />
                    </TabPane>
                    {/* End contacts tab-pane */}

                    {/* Start settings tab-pane */}
                    <TabPane tabId="settings" id="pills-setting">
                        {/* Settings content */}
                        <Settings user = {user} />
                    </TabPane>
                    {/* End settings tab-pane */}
                </TabContent>
                {/* end tab content */}

            </div>
        </React.Fragment>
    );
}

const mapStatetoProps = state => {
    return {
        ...state.Layout
    };
};

export default connect(mapStatetoProps, null)(ChatLeftSidebar);