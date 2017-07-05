import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {toJS} from 'mobx';
import {ListGroup, ListGroupItem, Panel} from 'react-bootstrap';

@inject('sandboxStore', 'controlsStore')
@observer
export default class Sandbox extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const sandbox = this.props.sandboxStore.sandbox;

        let junctionNodes = sandbox.junctions.map((junction) => {
            let device = junction.id;
            let key = junction.id;
            let fixtureNodes = sandbox.fixtures.map((entry) => {
                if (entry.device === device) {
                    let key = entry.id;
                    let label = entry.label;
                    return <ListGroupItem key={key} onClick={() => {
                        this.props.controlsStore.selectFixture(entry);
                        this.props.controlsStore.openModal('editFixture');
                    }}>{label}</ListGroupItem>

                }
            });

            return (
                <ListGroupItem key={key}>
                    <ListGroup>
                        <ListGroupItem key={key + 'dev'} onClick={() => {
                            this.props.controlsStore.selectJunction(device);
                            this.props.controlsStore.openModal('editJunction');

                        }}>{device}</ListGroupItem>

                        <ListGroupItem key={key + 'fix'}>
                            <ListGroup>
                                {fixtureNodes}
                            </ListGroup>
                        </ListGroupItem>
                    </ListGroup>
                </ListGroupItem>
            )

        });

        let pipeNodes = <ListGroup> {
            sandbox.pipes.map((pipe) => {
                return <ListGroupItem key={pipe.id} onClick={() => {
                    this.props.controlsStore.selectPipe(pipe.id);
                    this.props.controlsStore.openModal('editPipe');
                }}>{pipe.a} {pipe.azBw} / {pipe.zaBw} {pipe.z}</ListGroupItem>
            })
        }
        </ListGroup>;

        let addPipeButton = null;
        /*
         if (this.props.sandboxStore.sandbox.junctions.length >=2) {
         addPipeButton = <Button onClick={this.props.sandboxStore.openModal('pipe')}>Add a pipe..</Button>
         }
         */
        return (
            <Panel>
                <h4>Junctions and fixtures:</h4>
                <ListGroup>{junctionNodes}</ListGroup>
                <h4>Pipes</h4>
                {pipeNodes}
                {addPipeButton}
            </Panel>
        )
    };

};
