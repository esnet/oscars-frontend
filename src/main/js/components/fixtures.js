import React, {Component} from 'react';
import {ListGroup, ListGroupItem} from 'react-bootstrap';
import {inject} from 'mobx-react';

export default class FixtureList extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let fixtureNodes = this.props.fixtures.map((urn) => {
            return (<Fixture key={urn} urn={urn} onClick={() => {
            }}/>)
        });

        return <ListGroup>{fixtureNodes}</ListGroup>
    };
};


@inject('sandboxStore')
class Fixture extends React.Component {
    constructor(props) {
        super(props);
    }

    onFixtureClicked = () => {
        this.props.sandboxStore.selectFixture(this.props.urn);
    };

    render() {
        return (
            <ListGroupItem onClick={this.onFixtureClicked} key={this.props.urn}>{this.props.urn}</ListGroupItem>
        )
    }
}