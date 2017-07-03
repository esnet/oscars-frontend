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
        let junctionNodes = this.props.sandboxStore.sandbox.junctions.map((junction) => {
            let device = junction.id;
            let key = junction.id;
            let fixtureNodes = this.props.sandboxStore.sandbox.fixtures.map((entry) => {
                if (entry.device === device) {
                    let port = entry.port;
                    let key = entry.id;
                    let id = entry.id;
                    return (<Fixture key={key} id={id} device={device} port={port}/>)
                }
            });

            return (
                <ListGroupItem key={key}>
                    <div onClick={() => {
                        this.props.onJunctionClick(device);
                        this.props.sandboxStore.selectJunction(device)

                    }}>{device}</div>
                    <ListGroup>
                        {fixtureNodes}
                    </ListGroup>

                </ListGroupItem>)

        });

        let pipeNodes =
            <ListGroup> {
                this.props.sandboxStore.sandbox.pipes.map((p, index) => {

                    return(<ListGroupItem key={index}>{p.a} {p.azBw} / {p.zaBw} {p.z}</ListGroupItem>)
                })
            }
            </ListGroup>;
        return <div>
            <p>Junctions and fixtures:</p>
            <ListGroup>{junctionNodes}</ListGroup>
            <p>Pipes</p>
            {pipeNodes}
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