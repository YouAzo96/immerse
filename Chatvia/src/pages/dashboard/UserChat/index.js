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

//Import Components
import UserProfileSidebar from '../../../components/UserProfileSidebar';
import SelectContact from '../../../components/SelectContact';
import UserHead from './UserHead';
import ImageList from './ImageList';
import ChatInput from './ChatInput';
import FileList from './FileList';

//actions
import { openUserSidebar, setFullUser } from '../../../redux/actions';

//Import Images
import avatar4 from '../../../assets/images/users/avatar-4.jpg';
import avatar1 from '../../../assets/images/users/avatar-1.jpg';

//i18n
import { useTranslation } from 'react-i18next';

import {
  getConversationByUserId,
  updateConversation,
} from '../../../helpers/localStorage';

//Get Closest STUN Server:
const GEO_LOC_URL =
  'https://raw.githubusercontent.com/pradt2/always-online-stun/master/geoip_cache.txt';
const IPV4_URL =
  'https://raw.githubusercontent.com/pradt2/always-online-stun/master/valid_ipv4s.txt';
const GEO_USER_URL = 'https://geolocation-db.com/json/';
const geoLocs = await (await fetch(GEO_LOC_URL)).json();
const { latitude, longitude } = await (await fetch(GEO_USER_URL)).json();
const closestAddr = (await (await fetch(IPV4_URL)).text())
  .trim()
  .split('\n')
  .map((addr) => {
    const [stunLat, stunLon] = geoLocs[addr.split(':')[0]];
    const dist =
      ((latitude - stunLat) ** 2 + (longitude - stunLon) ** 2) ** 0.5;
    return [addr, dist];
  })
  .reduce(([addrA, distA], [addrB, distB]) =>
    distA <= distB ? [addrA, distA] : [addrB, distB]
  )[0];
console.log(closestAddr);

function UserChat(props) {
  const user = props.loggedUser;
  const [peerConnection, setPeerConnection] = useState(null);
  const [socket, setSocket] = useState(null);
  const ref = useRef();

  const [modal, setModal] = useState(false);

  /* intilize t variable for multi language implementation */
  const { t } = useTranslation();

  //demo conversation messages
  //userType must be required
  const [allUsers] = useState(props.recentChatList);
  const [activeUser] = useState(props.active_user);
  const [chatMessages, setchatMessages] = useState(
    props.recentChatList[props.active_user].messages
  );

  useEffect(() => {
    const token = localStorage.getItem('authUser');
    if (socket && !token) {
      socket.disconnect();
      setSocket(null);
    } else if (!socket && token) {
      const newSocket = io('http://localhost:3001', {
        query: {
          userId: token,
        },
      });
      setSocket(newSocket);
    }

    // Clean up previous socket connection when component unmounts or token changes
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  useEffect(() => {
    // Initialize peer connection
    const initPeerConnection = async () => {
      const ICEConfig = {
        iceServers: [
          { urls: `stun:${closestAddr}` },
          // { urls: 'stun:stun.l.google.com:19302' },
          // { urls: 'stun:stun1.l.google.com:19302' },
          // { urls: 'stun:stun2.l.google.com:19302' },
          // { urls: 'stun:stun3.l.google.com:19302' },
          // { urls: 'stun:stun4.l.google.com:19302' },
          // { urls: 'stun:stun.stunprotocol.org:3478' },
          // Add more STUN or TURN servers as needed
        ],
      };
      const peerConnection = new RTCPeerConnection(ICEConfig);
      // Create an offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      // Send the offer to the server for signaling
      if (!socket) {
        return;
      }
      socket.emit('offer', {
        to: 'otherUserId', // Replace with the recipient's socket.id
        offer: offer,
      });

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          // Send ICE candidate to the server
          socket.emit('ice-candidate', {
            to: 'otherUserId', // Replace with the recipient's socket.id
            iceCandidate: event.candidate,
          });
        }
      };

      setPeerConnection(peerConnection);
    };

    initPeerConnection();

    return () => {
      if (peerConnection) {
        peerConnection.close();
      }
    };
  }, [peerConnection]);

  // Handle signaling events
  useEffect(() => {
    const handleOffer = (data) => {
      // Handle offer and create answer
      // Example: createAnswer();
    };

    const handleAnswer = async (data) => {
      // Handle answer
      await peerConnection.setRemoteDescription(data.answer);
    };

    const handleIceCandidate = async (data) => {
      // Add ICE candidate to peer connection
      await peerConnection.addIceCandidate(data.iceCandidate);
    };
    if (!socket) {
      return;
    }
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);

    return () => {
      socket.off('offer', handleOffer);
      socket.off('answer', handleAnswer);
      socket.off('ice-candidate', handleIceCandidate);
    };
  }, [socket]);

  useEffect(() => {
    setchatMessages(props.recentChatList[props.active_user].messages);
    ref.current.recalculate();
    if (ref.current.el) {
      ref.current.getScrollElement().scrollTop =
        ref.current.getScrollElement().scrollHeight;
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
          image: avatar4,
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
      props.recentChatList[props.active_user].id
    );

    user.messages = [...user.messages, messageObj];

    // console.log('user: ', user);

    await updateConversation(user);

    let copyallUsers = [...allUsers];
    copyallUsers[props.active_user].messages = [...chatMessages, messageObj];
    copyallUsers[props.active_user].isTyping = false;
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

  console.log('activeUser: ', props.recentChatList[activeUser]);

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
                                <DropdownToggle tag="a" className="text-muted">
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
                                {chat.userType === 'sender'
                                  ? props.recentChatList[props.active_user].name
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

const mapStateToProps = (state) => {
  const { active_user } = state.Chat;
  const { userSidebar } = state.Layout;
  return { active_user, userSidebar };
};

export default withRouter(
  connect(mapStateToProps, { openUserSidebar, setFullUser })(UserChat)
);
