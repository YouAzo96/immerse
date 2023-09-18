import React, { Suspense } from 'react';
import { Routes as SwitchRoute, Route, Navigate } from 'react-router-dom';

//import routes
import { authProtectedRoutes, publicRoutes } from './routes';

//import layouts
import NonAuthLayout from "../layouts/NonAuth";
import AuthLayout from "../layouts/AuthLayout/";

const AuthProtected = (props) => {
    /*
      Navigate is un-auth access protected routes via url
      */
  
      if (props.isAuthProtected && !localStorage.getItem("authUser")) {
            return (
                <Navigate to={{ pathname: "/login", state: { from: props.location } }} />
            );
        }
  
    return <>{props.children}</>;
  };

/**
 * Main Route component
 */
const Routes = () => {

    return (
        // rendering the router with layout
            <React.Fragment>
            <Suspense fallback = {<div></div>} >
                <SwitchRoute>
                    {/* public routes */}
                    {publicRoutes.map((route, idx) =>
                        <Route 
                            path={route.path} 
                            layout={NonAuthLayout} 
                            element={
                                <NonAuthLayout>
                                    {route.component}
                                </NonAuthLayout>
                            }
                            key={idx} 
                            isAuthProtected={false} 
                        />
                    )}

                    {/* private/auth protected routes */}
                    {authProtectedRoutes.map((route, idx) =>
                        <Route 
                            path={route.path} 
                            layout={AuthLayout} 
                            element={
                                <AuthProtected isAuthProtected={true}>
                                    <AuthLayout>{route.component}</AuthLayout>
                                </AuthProtected>
                            }
                            key={idx} 
                            isAuthProtected={true}  />
                    )}
                </SwitchRoute>
                </Suspense>
            </React.Fragment>
    );
}

export default Routes;