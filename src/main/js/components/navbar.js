import React, {Component} from 'react';

import {Navbar, Nav, NavItem, NavDropdown, MenuItem}from 'react-bootstrap';
import {observer, inject} from 'mobx-react';

import {LinkContainer} from 'react-router-bootstrap';

@inject('accountStore', 'commonStore')
@observer
export default class NavBar extends Component {
    constructor(props) {
        super(props);
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
                <Navbar.Header>
                    <Navbar.Brand>
                        OSCARS
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