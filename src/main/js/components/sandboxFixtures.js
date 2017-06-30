import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {toJS} from 'mobx';
import {ListGroup, ListGroupItem} from 'react-bootstrap';

@inject('sandboxStore')
@observer
export default class SandboxFixtures extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let fixtureNodes = this.props.sandboxStore.sandbox.fixtures.map((entry) => {
            let port = entry.port;
            let device = entry.device;
            let key = entry.id;
            let id = entry.id;

            return (<Fixture key={key} id={id} device={device} port={port}/>)
        });

        return <div>
            <p>Reservation fixtures:</p>
            <ListGroup>{fixtureNodes}</ListGroup>
        </div>
    };

};


@inject('sandboxStore')
class Fixture extends React.Component {
    constructor(props) {
        super(props);
    }

    onFixtureClicked = () => {
        this.props.sandboxStore.selectFixture(this.props.id, true);
    };

    render() {
        return (
            <ListGroupItem onClick={this.onFixtureClicked} key={this.props.id}>{this.props.id}</ListGroupItem>
        )
    }
}