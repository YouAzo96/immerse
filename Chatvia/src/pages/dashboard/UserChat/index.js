import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import {
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  UncontrolledDropdown,
  Modal,
  ModalHeader,
  ModalBody,
  CardBody,
  Button,
  ModalFooter,
} from 'reactstrap';
import { connect } from 'react-redux';

import SimpleBar from 'simplebar-react';

import withRouter from '../../../components/withRouter';
import blankuser from '../../../assets/images/users/blankuser.jpeg';

//Import Components
import UserProfileSidebar from '../../../components/UserProfileSidebar';
import SelectContact from '../../../components/SelectContact';
import UserHead from './UserHead';
import ImageList from './ImageList';
import ChatInput from './ChatInput';
import FileList from './FileList';

//actions
import {
  openUserSidebar,
  setFullUser,
  addLoggedinUser,
} from '../../../redux/actions';

//Import Images
import avatar4 from '../../../assets/images/users/avatar-4.jpg';
import avatar1 from '../../../assets/images/users/avatar-1.jpg';

//i18n
import { useTranslation } from 'react-i18next';

import {
  getConversationByUserId,
  updateConversation,
} from '../../../helpers/localStorage';
import { getLoggedInUser } from '../../../helpers/authUtils';

function UserChat(props) {
  const user = props.loggedUser;
  const active_user = props.active_user;
  const contacts = props.userContacts;
  //userType must be required
  const [allUsers] = useState(props.recentChatList);
  const [chatMessages, setchatMessages] = useState(
    props.recentChatList[props.active_user].messages
  );

  const ref = useRef();
  const socketRef = useRef();
  const [modal, setModal] = useState(false);

  /* intilize t variable for multi language implementation */
  const { t } = useTranslation();

  useEffect(() => {
    const token = getLoggedInUser();

    // Check if the socket instance already exists in the ref
    if (!socketRef.current && token) {
      const newSocket = io('http://localhost:3001', {
        query: {
          userId: token,
        },
      });
      socketRef.current = newSocket;
    }

    // Set up event listeners or any other socket-related logic
    if (socketRef.current) {
      socketRef.current.on('chat message', (data) => {
        const { sender, message } = data;
        //check if we have an open conversation
        const copyallUsers = [...allUsers];
        const foundUserIndex = Object.keys(allUsers).find(
          (key) => allUsers[key].id === sender
        );
        //if the sender have an open chat with us
        if (foundUserIndex) {
          copyallUsers[foundUserIndex].messages.push(message);
          copyallUsers[foundUserIndex].unRead += 1;
          console.log('new users list: ', copyallUsers);
          props.setFullUser(copyallUsers);
          scrolltoBottom();
        } else {
          //else
          const contact = contacts.find(
            (cntct) => (cntct.children.user_id = sender)
          );
          if (contact) {
            const newUser = {
              id: copyallUsers.length + 1,
              name: contact.children.name,
              profilePicture: contact.children.image || blankuser || null,
              status: 'online',
              unRead: 1,
              roomType: 'contact',
              isGroup: false,
              messages: [message],
            };

            copyallUsers.push(newUser);
            //props.addLoggedinUser(newUser);
            props.setFullUser(copyallUsers);
          }
        }
      });
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    setchatMessages(props.recentChatList[props.active_user].messages);
    if (ref.current) {
      ref.current.recalculate();
      if (ref.current.el) {
        ref.current.getScrollElement().scrollTop =
          ref.current.getScrollElement().scrollHeight;
      }
    }
  }, [props.active_user, props.recentChatList]);

  const toggle = () => setModal(!modal);

  const addMessage = async (message, type) => {
    var messageObj = null;

    let d = new Date();
    var n = d.getSeconds();

    //matches the message type is text, file or image, and create object according to it
    switch (type) {
      case 'textMessage':
        messageObj = {
          id: chatMessages.length + 1,
          message: message,
          time: '00:' + n,
          userType: 'sender',
          image: null,
          isFileMessage: false,
          isImageMessage: false,
        };
        break;

      case 'fileMessage':
        messageObj = {
          id: chatMessages.length + 1,
          message: 'file',
          fileMessage: message.name,
          size: message.size,
          time: '00:' + n,
          userType: 'sender',
          image: avatar4,
          isFileMessage: true,
          isImageMessage: false,
        };
        break;

      case 'imageMessage':
        var imageMessage = [{ image: message }];

        messageObj = {
          id: chatMessages.length + 1,
          message: 'image',
          imageMessage: imageMessage,
          size: message.size,
          time: '00:' + n,
          userType: 'sender',
          image: avatar4,
          isImageMessage: true,
          isFileMessage: false,
        };
        break;

      default:
        break;
    }

    //add message object to chat
    setchatMessages([...chatMessages, messageObj]);

    const user = await getConversationByUserId(
      props.loggedUser.user_id,
      props.recentChatList[props.active_user].id
    );

    user.messages = [...user.messages, messageObj];

    await updateConversation(props.loggedUser.user_id, user);

    let copyallUsers = [...allUsers];
    copyallUsers[props.active_user].messages = [...chatMessages, messageObj];
    copyallUsers[props.active_user].isTyping = false;
    //send to user :
    if (socketRef.current) {
      console.log('Here: ', copyallUsers[props.active_user].id);
      socketRef.current.emit('chat message', {
        sender: props.loggedUser.user_id,
        receiver: copyallUsers[props.active_user].id,
        message: messageObj,
      });
    }
    props.setFullUser(copyallUsers);

    scrolltoBottom();
  };

  function scrolltoBottom() {
    if (ref.current.el) {
      ref.current.getScrollElement().scrollTop =
        ref.current.getScrollElement().scrollHeight;
    }
  }

  const deleteMessage = (id) => {
    let conversation = chatMessages;

    var filtered = conversation.filter(function (item) {
      return item.id !== id;
    });

    setchatMessages(filtered);
  };

  if (props.recentChatList[props.active_user].name === null) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100%',
        }}
      >
        <p>No conversations available</p>
      </div>
    );
  } else {
    return (
      <React.Fragment>
        <div className="user-chat w-100 overflow-hidden">
          <div className="d-lg-flex">
            <div
              className={
                props.userSidebar
                  ? 'w-70 overflow-hidden position-relative'
                  : 'w-100 overflow-hidden position-relative'
              }
            >
              {/* render user head */}
              <UserHead />

              <SimpleBar
                style={{ maxHeight: '100%' }}
                ref={ref}
                className="chat-conversation p-5 p-lg-4"
                id="messages"
              >
                <ul className="list-unstyled mb-0">
                  {chatMessages.map((chat, key) =>
                    chat.isToday && chat.isToday === true ? (
                      <li key={'dayTitle' + key}>
                        <div className="chat-day-title">
                          <span className="title">Today</span>
                        </div>
                      </li>
                    ) : props.recentChatList[props.active_user].isGroup ===
                      true ? (
                      <li
                        key={key}
                        className={chat.userType === 'sender' ? 'right' : ''}
                      >
                        <div className="conversation-list">
                          <div className="chat-avatar">
                            {chat.userType === 'sender' ? (
                              <img src={user.image} alt="chatvia" />
                            ) : props.recentChatList[props.active_user]
                                .profilePicture === 'Null' ? (
                              <div className="chat-user-img align-self-center me-3">
                                <div className="avatar-xs">
                                  <span className="avatar-title rounded-circle bg-primary-subtle text-primary">
                                    {chat.userName && chat.userName.charAt(0)}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <img
                                src={
                                  props.recentChatList[props.active_user]
                                    .profilePicture
                                }
                                alt="chatvia"
                              />
                            )}
                          </div>

                          <div className="user-chat-content">
                            <div className="ctext-wrap">
                              <div className="ctext-wrap-content">
                                {chat.message && (
                                  <p className="mb-0">{chat.message}</p>
                                )}
                                {chat.imageMessage && (
                                  // image list component
                                  <ImageList images={chat.imageMessage} />
                                )}
                                {chat.fileMessage && (
                                  //file input component
                                  <FileList
                                    fileName={chat.fileMessage}
                                    fileSize={chat.size}
                                  />
                                )}
                                {chat.isTyping && (
                                  <p className="mb-0">
                                    typing
                                    <span className="animate-typing">
                                      <span className="dot ms-1"></span>
                                      <span className="dot ms-1"></span>
                                      <span className="dot ms-1"></span>
                                    </span>
                                  </p>
                                )}
                                {!chat.isTyping && (
                                  <p className="chat-time mb-0">
                                    <i className="ri-time-line align-middle"></i>{' '}
                                    <span className="align-middle">
                                      {chat.time}
                                    </span>
                                  </p>
                                )}
                              </div>
                              {!chat.isTyping && (
                                <UncontrolledDropdown className="align-self-start">
                                  <DropdownToggle
                                    tag="a"
                                    className="text-muted ms-1"
                                  >
                                    <i className="ri-more-2-fill"></i>
                                  </DropdownToggle>
                                  <DropdownMenu>
                                    <DropdownItem>
                                      {t('Copy')}{' '}
                                      <i className="ri-file-copy-line float-end text-muted"></i>
                                    </DropdownItem>
                                    <DropdownItem>
                                      {t('Save')}{' '}
                                      <i className="ri-save-line float-end text-muted"></i>
                                    </DropdownItem>
                                    <DropdownItem onClick={toggle}>
                                      Forward{' '}
                                      <i className="ri-chat-forward-line float-end text-muted"></i>
                                    </DropdownItem>
                                    <DropdownItem
                                      onClick={() => deleteMessage(chat.id)}
                                    >
                                      Delete{' '}
                                      <i className="ri-delete-bin-line float-end text-muted"></i>
                                    </DropdownItem>
                                  </DropdownMenu>
                                </UncontrolledDropdown>
                              )}
                            </div>
                            {
                              <div className="conversation-name">
                                {chat.userType === 'sender'
                                  ? 'Patricia Smith'
                                  : chat.userName}
                              </div>
                            }
                          </div>
                        </div>
                      </li>
                    ) : (
                      <li
                        key={key}
                        className={chat.userType === 'sender' ? 'right' : ''}
                      >
                        <div className="conversation-list">
                          {
                            //logic for display user name and profile only once, if current and last messaged sent by same receiver
                            chatMessages[key + 1] ? (
                              chatMessages[key].userType ===
                              chatMessages[key + 1].userType ? (
                                <div className="chat-avatar">
                                  <div className="blank-div"></div>
                                </div>
                              ) : (
                                <div className="chat-avatar">
                                  {chat.userType === 'sender' ? (
                                    <img src={user.image} alt="chatvia" />
                                  ) : props.recentChatList[props.active_user]
                                      .profilePicture === 'Null' ? (
                                    <div className="chat-user-img align-self-center me-3">
                                      <div className="avatar-xs">
                                        <span className="avatar-title rounded-circle bg-primary-subtle text-primary">
                                          {props.recentChatList[
                                            props.active_user
                                          ].name.charAt(0)}
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    <img
                                      src={
                                        props.recentChatList[props.active_user]
                                          .profilePicture
                                      }
                                      alt="chatvia"
                                    />
                                  )}
                                </div>
                              )
                            ) : (
                              <div className="chat-avatar">
                                {chat.userType === 'sender' ? (
                                  <img src={user.image} alt="chatvia" />
                                ) : props.recentChatList[props.active_user]
                                    .profilePicture === 'Null' ? (
                                  <div className="chat-user-img align-self-center me-3">
                                    <div className="avatar-xs">
                                      <span className="avatar-title rounded-circle bg-primary-subtle text-primary">
                                        {props.recentChatList[
                                          props.active_user
                                        ].name.charAt(0)}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <img
                                    src={
                                      props.recentChatList[props.active_user]
                                        .profilePicture
                                    }
                                    alt="chatvia"
                                  />
                                )}
                              </div>
                            )
                          }

                          <div className="user-chat-content">
                            <div className="ctext-wrap">
                              <div className="ctext-wrap-content">
                                {chat.message && (
                                  <p className="mb-0">{chat.message}</p>
                                )}
                                {chat.imageMessage && (
                                  // image list component
                                  <ImageList images={chat.imageMessage} />
                                )}
                                {chat.fileMessage && (
                                  //file input component
                                  <FileList
                                    fileName={chat.fileMessage}
                                    fileSize={chat.size}
                                  />
                                )}
                                {chat.isTyping && (
                                  <p className="mb-0">
                                    typing
                                    <span className="animate-typing">
                                      <span className="dot ms-1"></span>
                                      <span className="dot ms-1"></span>
                                      <span className="dot ms-1"></span>
                                    </span>
                                  </p>
                                )}
                                {!chat.isTyping && (
                                  <p className="chat-time mb-0">
                                    <i className="ri-time-line align-middle"></i>{' '}
                                    <span className="align-middle">
                                      {chat.time}
                                    </span>
                                  </p>
                                )}
                              </div>
                              {!chat.isTyping && (
                                <UncontrolledDropdown className="align-self-start ms-1">
                                  <DropdownToggle
                                    tag="a"
                                    className="text-muted"
                                  >
                                    <i className="ri-more-2-fill"></i>
                                  </DropdownToggle>
                                  <DropdownMenu>
                                    <DropdownItem>
                                      {t('Copy')}{' '}
                                      <i className="ri-file-copy-line float-end text-muted"></i>
                                    </DropdownItem>
                                    <DropdownItem>
                                      {t('Save')}{' '}
                                      <i className="ri-save-line float-end text-muted"></i>
                                    </DropdownItem>
                                    <DropdownItem onClick={toggle}>
                                      Forward{' '}
                                      <i className="ri-chat-forward-line float-end text-muted"></i>
                                    </DropdownItem>
                                    <DropdownItem
                                      onClick={() => deleteMessage(chat.id)}
                                    >
                                      Delete{' '}
                                      <i className="ri-delete-bin-line float-end text-muted"></i>
                                    </DropdownItem>
                                  </DropdownMenu>
                                </UncontrolledDropdown>
                              )}
                            </div>
                            {chatMessages[key + 1] ? (
                              chatMessages[key].userType ===
                              chatMessages[key + 1].userType ? null : (
                                <div className="conversation-name">
                                  {chat.userType === 'receiver'
                                    ? props.recentChatList[props.active_user]
                                        .name
                                    : 'Admin'}
                                </div>
                              )
                            ) : (
                              <div className="conversation-name">
                                {chat.userType === 'sender'
                                  ? user.fname
                                  : 'Admin'}
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    )
                  )}
                </ul>
              </SimpleBar>

              <Modal backdrop="static" isOpen={modal} centered toggle={toggle}>
                <ModalHeader toggle={toggle}>Forward to...</ModalHeader>
                <ModalBody>
                  <CardBody className="p-2">
                    <SimpleBar style={{ maxHeight: '200px' }}>
                      <SelectContact handleCheck={() => {}} />
                    </SimpleBar>
                    <ModalFooter className="border-0">
                      <Button color="primary">Forward</Button>
                    </ModalFooter>
                  </CardBody>
                </ModalBody>
              </Modal>

              <ChatInput onaddMessage={addMessage} />
            </div>

            <UserProfileSidebar
              activeUser={props.recentChatList[props.active_user]}
            />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  const { active_user } = state.Chat;
  const { userSidebar } = state.Layout;
  return { active_user, userSidebar };
};

export default withRouter(
  connect(mapStateToProps, { openUserSidebar, setFullUser })(UserChat)
);
