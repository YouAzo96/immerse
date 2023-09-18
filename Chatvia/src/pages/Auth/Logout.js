import React, { useEffect } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import withRouter from "../../components/withRouter";

//redux store
import { logoutUser } from '../../redux/actions';
import { createSelector } from 'reselect';

/**
 * Logouts the user
 * @param {*} props 
 */
const Logout = (props) => {
  const dispatch = useDispatch();
  // const { isUserLogout } = useSelector((state) => ({
  //     isUserLogout: state.Auth.isUserLogout,
  //   }));

  const layoutdata = createSelector(
    (state) => state.Auth,
    (logoutauth) => ({
      isUserLogout: logoutauth.isUserLogout,
    }),
  );

  // Inside your component
  const isUserLogout = useSelector(layoutdata);

  useEffect(() => {
    dispatch(logoutUser(props.router.navigate));
  }, [dispatch, props.router.navigate]);

  if (isUserLogout) {
    
    return <Navigate to="/login" />;
  }

  document.title = "Logout | Chatvia React - Responsive Bootstrap 5 Chat App"

  return (<React.Fragment></React.Fragment>)
}

export default withRouter(connect(null, { logoutUser })(Logout));