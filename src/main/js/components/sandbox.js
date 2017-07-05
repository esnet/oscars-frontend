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
        let haveFixtures = false;

        let fixtureNodes = <ListGroup> {
            sandbox.junctions.map((junction) => {
                let device = junction.id;
                let key = junction.id;
                let fixtureNodes = sandbox.fixtures.map((entry) => {
                    haveFixtures = true;
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

            })
        }
        </ListGroup>;

        let fixturesHeader = <h4>Fixtures</h4>;
        if (!haveFixtures) {
            fixturesHeader = null;
        }

        let havePipes = false;
        let pipeNodes = <ListGroup> {
            sandbox.pipes.map((pipe) => {
                havePipes = true;

                return <ListGroupItem key={pipe.id} onClick={() => {
                    this.props.controlsStore.selectPipe(pipe.id);
                    this.props.controlsStore.openModal('editPipe');
                }}>{pipe.a} {pipe.azBw} / {pipe.zaBw} {pipe.z}</ListGroupItem>
            })
        }
        </ListGroup>;
        let pipesHeader = <h4>Pipes</h4>;
        if (!havePipes) {
            pipesHeader = null;
        }

        return (
            <Panel>
                {fixturesHeader}
                {fixtureNodes}
                {pipesHeader}
                {pipeNodes}
            </Panel>
        )
    };

};
