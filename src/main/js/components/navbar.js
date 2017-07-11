import React, {Component} from 'react';

import {Nav, NavItem}from 'react-bootstrap';

import {LinkContainer, IndexLinkContainer} from 'react-router-bootstrap';

export default class NavBar extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Nav bsStyle='tabs' activeKey={this.props.active}>
                <IndexLinkContainer to='/'>
                    <NavItem eventKey='home'>Home</NavItem>
                </IndexLinkContainer>
                <LinkContainer to='/pages/list' >
                    <NavItem eventKey='list'>List</NavItem>
                </LinkContainer>
                <LinkContainer to='/pages/new' >
                    <NavItem eventKey='new'>Reserve</NavItem>
                </LinkContainer>
            </Nav>

        )
    }
}