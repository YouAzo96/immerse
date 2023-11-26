import React, { Component } from 'react';
import { UncontrolledDropdown, DropdownToggle, Alert, DropdownMenu, DropdownItem, Button, Modal, ModalHeader, ModalBody, ModalFooter, UncontrolledTooltip, Form, Label, Input, InputGroup, } from 'reactstrap';
import SimpleBar from "simplebar-react";
import { bindActionCreators } from 'redux';

import { connect } from "react-redux";
import { inviteContact } from '../../../redux/chat/actions';

import { withTranslation } from 'react-i18next';
import { addLoggedinUser } from '../../../redux/actions';

//use sortedContacts variable as global variable to sort contacts
let sortedContacts = [
    {
        group: "A",
        children: [{ name: "Demo" }]
    }
]

class Contacts extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchTerm: "",
            modal: false,
            contacts: this.props.contactList || [],
          //   alert: {
          //     visible: this.props.alert.visible,
          //     message: this.props.alert.message,
          //     color: this.props.alert.color
          // }
        }
        this.toggle = this.toggle.bind(this);
        this.sortContact = this.sortContact.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (this.props.contacts !== prevProps.contacts && this.props.contacts) {
          this.setState({ contacts: this.props.contacts });
        }
      }

    toggle() {
        this.setState({ modal: !this.state.modal });
    }
    
    handleInputChange = (event) => {
        this.setState({ searchTerm: event.target.value });
    }

    sortContact() {
        const { contacts } = this.state;
      
        let data = contacts.reduce((r, contact) => {
          try {
            // get first letter of name of current element
            let group = contact.group;
            // if there is no property in accumulator with this letter create it
            if (!r[group]) r[group] = { group, children: [contact.children] };
            // if there is push current element to children array for that letter
            else r[group].children.push(contact.children);
          } catch (error) {
            console.log("error in sortContact is:", error);
          }
          return r;
        }, {});
      
        let sortedData = Object.values(data).sort((a, b) =>
          a.group.localeCompare(b.group)
        );
      
        sortedData.forEach((element) => {
          element.children.sort((a, b) => a.name.localeCompare(b.name));
        });
      
        this.setState({ contacts: sortedData });
        sortedContacts = sortedData;
        return sortedData;
      }
    
    filterContacts = () => {
        const { contacts, searchTerm } = this.state;
        if (!searchTerm) {
          return contacts; // No search term, return all contacts
        }
      
        const filteredContacts = contacts
          .filter((group) =>
            group.children.some(
              (contact) =>
                contact.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
          )
          .map((group) => ({
            ...group,
            children: group.children.filter((contact) =>
              contact.name.toLowerCase().includes(searchTerm.toLowerCase())
            ),
          }));
      
        return filteredContacts;
      };

    componentDidMount() {
        this.sortContact();
    }

    componentWillUnmount() {
        this.sortContact();
    }

    handleInviteClick = () => {
       const email = document.getElementById("addcontactemail-input").value;
       const message = document.getElementById("addcontact-invitemessage-input").value;
      this.props.inviteContact(email, message);
    }

    handleContactClick = (userId) => {
    //  this.props.addLoggedinUser(userId);
      this.props.addLoggedinUser(31);

    };

    render() {
        const { alert } = this.state;
        const filteredContacts = this.filterContacts();
        const { t } = this.props;
        return (
            <React.Fragment>
                <div>
                    <div className="p-4">
                        <div className="user-chat-nav float-end">
                            <div id="add-contact">
                                {/* Button trigger modal */}
                                <Button type="button" color="link" onClick={this.toggle} className="text-decoration-none text-muted font-size-18 py-0">
                                    <i className="ri-user-add-line"></i>
                                </Button>
                            </div>
                            <UncontrolledTooltip target="add-contact" placement="bottom">
                                Add Contact
                                    </UncontrolledTooltip>
                        </div>
                        <h4 className="mb-4">Contacts</h4>

                        {/* Start Add contact Modal */}
                        <Modal isOpen={this.state.modal} centered toggle={this.toggle}>
                            <ModalHeader tag="h5" className="font-size-16" toggle={this.toggle}>
                                {t('Add Contacts')}
                            </ModalHeader>
                            <ModalBody className="p-4">
                                <Form>
                                    <div className="mb-4">
                                        <Label className="form-label" htmlFor="addcontactemail-input">{t('Email')}</Label>
                                        <Input type="email" className="form-control" id="addcontactemail-input" placeholder="Enter Email" />
                                    </div>
                                    <div>
                                        <Label className="form-label" htmlFor="addcontact-invitemessage-input">{t('Invitation Message')}</Label>
                                        <textarea className="form-control" id="addcontact-invitemessage-input" rows="3" placeholder="Enter Message"></textarea>
                                    </div>
                                </Form>
                            </ModalBody>
                            <ModalFooter>
                                <Button type="button" color="link" onClick={this.toggle}>Close</Button>
                                <Button type="button" color="primary" onClick={this.handleInviteClick}>Invite Contact</Button>
                            </ModalFooter>
                        </Modal>
                        {/* End Add contact Modal */}
                        {/* Start search-box */}
                        <div className="search-box chat-search-box">
                            <InputGroup size="lg" className="bg-light rounded-lg">
                                <Button color="link" className="text-decoration-none text-muted pr-1" type="button">
                                    <i className="ri-search-line search-icon font-size-18"></i>
                                </Button>
                                <Input 
                                type="text" 
                                className="form-control bg-light " 
                                placeholder={t('Search users..')}
                                value={this.state.searchTerm}
                                onChange={this.handleInputChange} />
                            </InputGroup>
                        </div>
                        {/* End search-box */}
                    </div>
                    {/* end p-4 */}
                    {/* {this.state.alert.visible && <Alert color={this.state.alert.color}>{this.state.alert.message}</Alert>} */}
                    {/* Start contact lists */}
                    <SimpleBar style={{ maxHeight: "100%" }} id="chat-room" className="p-4 chat-message-list chat-group-list">

                        {
                            sortedContacts.map((contact, key) =>
                                <div key={key} className={key + 1 === 1 ? "" : "mt-3"}>
                                    <div className="p-3 fw-bold text-primary">
                                        {contact.group}
                                    </div>

                                    <ul className="list-unstyled contact-list">
                                        {
                                            contact.children.map((child, key) =>
                                                
                                                <li key={key} >
                                                    <div className="d-flex align-items-center">
                                                        <div className="flex-grow-1">
                                                            <h5 className="font-size-14 m-0" onClick={() => this.handleContactClick(child.user_id)}>{child.name}</h5>
                                                        </div>
                                                        <UncontrolledDropdown>
                                                            <DropdownToggle tag="a" className="text-muted">
                                                                <i className="ri-more-2-fill"></i>
                                                            </DropdownToggle>
                                                            <DropdownMenu className="dropdown-menu-end">
                                                                <DropdownItem>{t('Share')} <i className="ri-share-line float-end text-muted"></i></DropdownItem>
                                                                <DropdownItem>{t('Block')} <i className="ri-forbid-line float-end text-muted"></i></DropdownItem>
                                                                <DropdownItem>{t('Remove')} <i className="ri-delete-bin-line float-end text-muted"></i></DropdownItem>
                                                            </DropdownMenu>
                                                        </UncontrolledDropdown>
                                                    </div>
                                                </li>
                                            )
                                        }
                                    </ul>
                                </div>
                            )
                        }

                    </SimpleBar>
                    {/* end contact lists */}
                </div>
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    const { contacts } = state.Chat;
     //const { authcontacts } = state.Auth;
   // console.log("contacts from Jancel: "+ JSON.stringify(authcontacts));
    return { contacts};
};

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({ inviteContact, addLoggedinUser }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Contacts));