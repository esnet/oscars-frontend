import React, {Component} from 'react';

import {Nav, NavItem}from 'react-bootstrap';

import {LinkContainer} from 'react-router-bootstrap';

export default class NavBar extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Nav bsStyle="tabs">
                <LinkContainer to="/">
                    <NavItem >Home</NavItem>
                </LinkContainer>
                <LinkContainer to="/welcome">
                    <NavItem >Welcome</NavItem>
                </LinkContainer>
                <LinkContainer to="/react/new">
                    <NavItem >New Reservation</NavItem>
                </LinkContainer>
            </Nav>

        )
    }
}