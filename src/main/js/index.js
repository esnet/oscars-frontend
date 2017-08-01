import React from 'react';

import ReactDOM from 'react-dom';

import {BrowserRouter, Route, Switch, Redirect} from 'react-router-dom';
import {Grid, Row, Col} from 'react-bootstrap';

import {useStrict} from 'mobx';
import {Provider} from 'mobx-react';

import ListConnectionsApp from './apps/listConnections';
import SelectDesignApp from './apps/selectDesign';
import NewDesignApp from './apps/designApp';
import WelcomeApp from './apps/welcome';
import AccountApp from './apps/accountApp';
import AdminUsersApp from './apps/usersAdminApp';
import Login from './apps/login';
import Logout from './apps/logout';

import NavBar from './components/navbar'

import accountStore from './stores/accountStore';
import commonStore from './stores/commonStore';
import controlsStore from './stores/controlsStore';
import mapStore from './stores/mapStore';
import designStore from './stores/designStore';
import topologyStore from './stores/topologyStore';
import connsStore from './stores/connsStore';
import userStore from './stores/userStore';
import modalStore from './stores/modalStore';


const PrivateRoute = ({component: Component, ...rest}) => (
    <Route {...rest} render={props => (
        accountStore.isLoggedIn() ? (
            <Component {...props}/>
        ) : (
            <Redirect to={{
                pathname: '/login',
                state: {from: props.location}
            }}/>
        )
    )}/>
);

const AdminRoute = ({component: Component, ...rest}) => (
    <Route {...rest}
           render={(props) => {
               if (accountStore.isLoggedIn() && accountStore.isAdmin()) {
                   return <Component {...props}/>;
               }
               if (accountStore.isLoggedIn()) {
                   return <Redirect to={{
                       pathname: '/',
                       state: {from: props.location}
                   }}/>;
               }
               return <Redirect to={{
                   pathname: '/login',
                   state: {from: props.location}
               }}/>;
           }}
    />
);

const stores = {
    accountStore,
    commonStore,
    connsStore,
    controlsStore,
    mapStore,
    designStore,
    topologyStore,
    userStore,
    modalStore
};
useStrict(true);

let token = localStorage.getItem('token');
if (token) {
    accountStore.setLoggedinToken(token);
    accountStore.setLoggedinUsername(localStorage.getItem('username'));
    accountStore.setLoggedinAdmin(localStorage.getItem('admin'));
}

ReactDOM.render(
    <Provider {...stores}>
        <BrowserRouter >
            <Grid fluid={true}>
                <Row>
                    <NavBar/>
                </Row>
                <Row>
                    <Col sm={4}>{' '}</Col>
                </Row>
                <Switch>
                    <Route exact path="/" component={WelcomeApp}/>
                    <Route exact path="/login" component={Login}/>
                    <Route exact path="/logout" component={Logout}/>
                    <PrivateRoute exact path="/pages/list" component={ListConnectionsApp}/>
                    <PrivateRoute exact path="/pages/selectDesign" component={SelectDesignApp}/>
                    <PrivateRoute exact path="/pages/newDesign" component={NewDesignApp}/>
                    <PrivateRoute exact path="/pages/account" component={AccountApp}/>
                    <AdminRoute exact path="/pages/admin/users" component={AdminUsersApp}/>
                </Switch>
            </Grid>
        </BrowserRouter>
    </Provider>, document.getElementById('react'));