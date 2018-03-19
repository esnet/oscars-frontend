import React, {Component} from 'react';

import {
    Navbar, NavbarBrand, Nav, NavItem, UncontrolledDropdown, DropdownMenu, DropdownToggle,
    NavLink, DropdownItem
} from 'reactstrap';
import {observer, inject} from 'mobx-react';

import {LinkContainer} from 'react-router-bootstrap';
import {AlertList} from 'react-bs-notifier';
import {toJS} from 'mobx'

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

        if (!this.props.accountStore.isLoggedIn()) {
            return <Navbar color='faded' light expand='md'>
                <NavbarBrand href='/pages/about'>OSCARS</NavbarBrand>

                <Nav navbar>
                    <NavLink href='/login' active={this.props.commonStore.nav.active === 'login'}>Login</NavLink>
                </Nav>
            </Navbar>

        }

        let admin = null;
        if (this.props.accountStore.isAdmin()) {
            admin = <UncontrolledDropdown>
                <DropdownToggle nav caret>
                    Admin
                </DropdownToggle>
                <DropdownMenu>
                    <NavLink href='/pages/admin/users'>Users</NavLink>
                </DropdownMenu>
            </UncontrolledDropdown>
        }

        return (
            <Navbar color='faded' light expand='md'>
                <AlertList
                    position='top-right'
                    alerts={toJS(this.props.commonStore.alerts)}
                    timeout={1000}
                    dismissTitle='Dismiss'
                    onDismiss={(alert) => {
                        this.props.commonStore.removeAlert(alert)
                    }}
                />
                <NavbarBrand href='/pages/about'>OSCARS</NavbarBrand>


                <Nav navbar>
                    <NavLink href='/pages/map'
                             active={this.props.commonStore.nav.active === 'map'}>Network Map</NavLink>
                    <NavLink href='/pages/list'
                             active={this.props.commonStore.nav.active === 'list'}>List</NavLink>
                    <NavLink href='/pages/details'
                             active={this.props.commonStore.nav.active === 'details'}>Details</NavLink>
                    <NavLink href='/pages/newDesign'
                             active={this.props.commonStore.nav.active === 'newDesign'}>New</NavLink>
                    <NavLink href='/pages/status'
                             active={this.props.commonStore.nav.active === 'status'}>Status</NavLink>

                    {admin}
                    <NavLink href='/pages/account'
                             active={this.props.commonStore.nav.active === 'account'}>My Account</NavLink>
                    <NavLink href='/logout'
                             active={this.props.commonStore.nav.active === 'logout'}>Logout</NavLink>
                </Nav>
            </Navbar>
        )
    }
}