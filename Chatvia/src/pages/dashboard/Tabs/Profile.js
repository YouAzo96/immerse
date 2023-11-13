import React, { useEffect, useState } from "react";
import {
  Dropdown,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  Card,
} from 'reactstrap';

//Import components
import CustomCollapse from '../../../components/CustomCollapse';
import AttachedFiles from '../../../components/AttachedFiles';

//Import Images
import avatar1 from '../../../assets/images/users/avatar-1.jpg';

//i18n
import { useTranslation } from "react-i18next";
import { getLoggedInUserInfo } from "../../../helpers/authUtils";
import { fetchUserProfile } from "../../../redux/actions";
import { useDispatch, useSelector } from "react-redux";

function Profile(props) {
  const user = getLoggedInUserInfo();
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.Auth.user);
  console.log(userData);
  useEffect(() => {
    console.log("fetching user profile");
    dispatch(fetchUserProfile());
  }, [dispatch]);


  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isOpen1, setIsOpen1] = useState(true);
  const [isOpen2, setIsOpen2] = useState(false);
  const [files] = useState([
    { name: 'Admin-A.zip', size: '12.5 MB', thumbnail: 'ri-file-text-fill' },
    { name: 'Image-1.jpg', size: '4.2 MB', thumbnail: 'ri-image-fill' },
    { name: 'Image-2.jpg', size: '3.1 MB', thumbnail: 'ri-image-fill' },
    { name: 'Landing-A.zip', size: '6.7 MB', thumbnail: 'ri-file-text-fill' },
  ]);

  /* intilize t variable for multi language implementation */
  const { t } = useTranslation();

  const toggleCollapse1 = () => {
    setIsOpen1(!isOpen1);
    setIsOpen2(false);
  };

  const toggleCollapse2 = () => {
    setIsOpen2(!isOpen2);
    setIsOpen1(false);
  };

  const toggle = () => setDropdownOpen(!dropdownOpen);


  return (
    <React.Fragment>
      <div>
        <div className="px-4 pt-4">
          <div className="user-chat-nav float-end">
            <Dropdown isOpen={dropdownOpen} toggle={toggle}>
              <DropdownToggle
                tag="a"
                className="font-size-18 text-muted dropdown-toggle"
              >
                <i className="ri-more-2-fill"></i>
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-end">
                <DropdownItem>{t('Edit')}</DropdownItem>
                <DropdownItem>{t('Action')}</DropdownItem>
                <DropdownItem divider />
                <DropdownItem>{t('Another action')}</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
          <h4 className="mb-0">{t('My Profile')}</h4>
        </div>

        <div className="text-center p-4 border-bottom">
          <div className="mb-4">
            <img
              src={userData.imageUrl}
              className="rounded-circle avatar-lg img-thumbnail"
              alt="chatvia"
            />
          </div>

          <h5 className="font-size-16 mb-1 text-truncate">
            {t(user.fname + " " + user.lname)}
          </h5>
          <p className="text-muted text-truncate mb-1">
            <i className="ri-record-circle-fill font-size-10 text-success me-1 d-inline-block"></i>{' '}
            {t('Active')}
          </p>
        </div>
        {/* End profile user  */}

        {/* Start user-profile-desc */}
        <div className="p-4 user-profile-desc">
          <div className="text-muted">
            <p className="mb-4">
              {t(
                userData.about
              )}
            </p>
          </div>

          <div id="profile-user-accordion-1" className="custom-accordion">
            <Card className="shadow-none border mb-2">
              {/* import collaps */}
              <CustomCollapse
                title="About"
                iconClass="ri-user-2-line"
                isOpen={isOpen1}
                toggleCollapse={toggleCollapse1}
              >
                <div>
                  <p className="text-muted mb-1">{t("Name")}</p>
                  <h5 className="font-size-14">{t(user.fname + " " + user.lname)}</h5>
                </div>

                <div className="mt-4">
                  <p className="text-muted mb-1">{t("Email")}</p>
                  <h5 className="font-size-14">{t(user.username)}</h5>
                </div>
              </CustomCollapse>
            </Card>
            {/* End About card  */}

              {/* ATTACHED FILES COLLAPSE TAB, might reuse for something else. */}
            {/* <Card className="mb-1 shadow-none border"> */}
              {/* import collaps */}
              {/* <CustomCollapse */}
                {/* title="Attached Files" */}
                {/* iconClass="ri-attachment-line" */}
                {/* isOpen={isOpen2} */}
                {/* toggleCollapse={toggleCollapse2} */}
              {/* > */}
                {/* attached files */}
                {/* <AttachedFiles files={files} /> */}
              {/* </CustomCollapse>  */}
            {/* </Card> */}
            {/* End Attached Files card  */}
          </div>
          {/* end profile-user-accordion  */}
        </div>
        {/* end user-profile-desc  */}
      </div>
    </React.Fragment>
  );
}

export default Profile;
