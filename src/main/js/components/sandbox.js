import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {toJS} from 'mobx';
import validator from '../lib/validation'
import {ListGroup, ListGroupItem, Panel} from 'react-bootstrap';
import transformer from '../lib/transform';

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
                let fixtureNodes = sandbox.fixtures.map((fixture) => {
                    haveFixtures = true;
                    if (fixture.device === device) {
                        let key = fixture.id;
                        let label = fixture.label;
                        const validationLabel = validator.fixtureLabel(fixture);

                        return <ListGroupItem key={key} onClick={() => {
                            const params = transformer.existingFixtureToEditParams(fixture);
                            this.props.controlsStore.setParamsForEditFixture(params);
                            this.props.controlsStore.openModal('editFixture');
                        }}>{label}<span className='pull-right'>{validationLabel}</span></ListGroupItem>

                    }
                });

                return (
                    <ListGroupItem key={key}>
                        <ListGroup>
                            <ListGroupItem key={key + 'dev'} onClick={() => {
                                this.props.controlsStore.setParamsForEditJunction({junction: device});
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
                const validationLabel = validator.pipeLabel(pipe);

                return <ListGroupItem key={pipe.id} onClick={() => {
                    const params = transformer.existingPipeToEditParams(pipe);
                    this.props.controlsStore.setParamsForEditPipe(params);

                    this.props.controlsStore.openModal('editPipe');
                }}>{pipe.a} --- {pipe.z}<span className='pull-right'>{validationLabel}</span></ListGroupItem>
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
