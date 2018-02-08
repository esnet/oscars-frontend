import React, {Component} from 'react';

import {Navbar, Nav, NavItem, NavDropdown, MenuItem}from 'react-bootstrap';
import {observer, inject} from 'mobx-react';

import {LinkContainer} from 'react-router-bootstrap';
import {Link } from 'react-router-dom';
import { AlertList } from 'react-bs-notifier';
import {toJS, observable, whyRun, autorunAsync} from 'mobx'

@inject('accountStore', 'commonStore')
@observer
export default class NavBar extends Component {
    constructor(props) {
        super(props);
    }



    componentWillMount() {
        this.syncLoggedIn();
    }

    componentWillUnmount() {
        clearTimeout(this.timeoutId);
    }

    syncLoggedIn() {
        if (localStorage.getItem('loggedin.username') == null) {
            this.props.accountStore.logout();
        } else {
            this.props.accountStore.setLoggedinAdmin(localStorage.getItem('loggedin.admin'));
            this.props.accountStore.setLoggedinToken(localStorage.getItem('loggedin.token'));
            this.props.accountStore.setLoggedinUsername(localStorage.getItem('loggedin.username'));
        }

        this.timeoutId = setTimeout(() => {
            this.syncLoggedIn()
        }, 500);


    }


    render() {
        let leftNav =
            <Nav bsStyle='tabs' activeKey={this.props.commonStore.nav.active}>
                <LinkContainer to='/login'>
                    <NavItem eventKey='login'>Login</NavItem>
                </LinkContainer>
            </Nav>;
        let rightNav = null;


        if (this.props.accountStore.isLoggedIn()) {
            let admin = null;

            if (this.props.accountStore.isAdmin()) {
                admin = <NavDropdown id='admin' eventKey='admin' title='Admin'>
                    <LinkContainer to='/pages/admin/users'>
                        <MenuItem>Users</MenuItem>
                    </LinkContainer>
                </NavDropdown>
            }

            leftNav = <Nav bsStyle='tabs' activeKey={this.props.commonStore.nav.active}>
                <LinkContainer to='/pages/list'>
                    <NavItem eventKey='list'>List</NavItem>
                </LinkContainer>
                <LinkContainer to='/pages/details'>
                    <NavItem eventKey='details'>Details</NavItem>
                </LinkContainer>

                <LinkContainer to='/pages/newDesign'>
                    <NavItem eventKey='newDesign'>New</NavItem>
                </LinkContainer>

{/*
                <LinkContainer to='/pages/selectDesign'>
                    <NavItem eventKey='selectDesign'>Copy</NavItem>
                </LinkContainer>
*/}
                {admin}
            </Nav>;



            rightNav =
                <Nav pullRight>
                    <LinkContainer to='/pages/account'>
                        <NavItem eventKey='account'>My Account</NavItem>
                    </LinkContainer>
                    <LinkContainer to='/logout'>
                        <NavItem eventKey='logout'>Logout</NavItem>
                    </LinkContainer>
                </Nav>;

        }
        return (
            <Navbar collapseOnSelect>
                <AlertList
                    position='top-right'
                    alerts={toJS(this.props.commonStore.alerts)}
                    timeout={1000}
                    dismissTitle="Dismiss"
                    onDismiss={(alert) => {this.props.commonStore.removeAlert(alert)}}
                />

                <Navbar.Header>
                    <Navbar.Brand>
                        <Link to='/pages/about'>OSCARS</Link>
                    </Navbar.Brand>
                </Navbar.Header>
                <Navbar.Collapse>
                    {leftNav}
                    {rightNav}
                </Navbar.Collapse>
            </Navbar>
        )
    }
}