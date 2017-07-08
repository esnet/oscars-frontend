import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {toJS} from 'mobx';
import validator from '../lib/validation'
import {Panel, Glyphicon, Nav, NavItem} from 'react-bootstrap';
import transformer from '../lib/transform';
import ToggleDisplay from 'react-toggle-display';

@inject('sandboxStore', 'controlsStore')
@observer
export default class Sandbox extends Component {
    constructor(props) {
        super(props);
    }

    render() {

        const sandbox = this.props.sandboxStore.sandbox;


        return (

            <Panel header='Components' collapsible defaultExpanded={true}>
                <ToggleDisplay show={sandbox.junctions.length > 0}>
                    <h5><u>Junctions & fixtures</u></h5>
                    {
                        sandbox.junctions.map((junction) => {
                            let device = junction.id;
                            let fixtureNodes = sandbox.fixtures.map((fixture) => {
                                if (fixture.device === device) {
                                    let key = fixture.id;
                                    let label = fixture.label;
                                    const validationLabel = validator.fixtureLabel(fixture);

                                    return <NavItem key={key} onClick={() => {
                                        const params = transformer.existingFixtureToEditParams(fixture);
                                        this.props.controlsStore.setParamsForEditFixture(params);
                                        this.props.controlsStore.openModal('editFixture');
                                    }}>
                                        <Glyphicon glyph='minus'/>{' '}
                                        {label}
                                        <span className='pull-right'>{validationLabel}</span>
                                    </NavItem>

                                }
                            });

                            return (
                                <Nav bsStyle='pills' stacked key={device + 'nav'}>
                                    <NavItem active={true} key={device} onClick={() => {
                                        this.props.controlsStore.setParamsForEditJunction({junction: device});
                                        this.props.controlsStore.openModal('editJunction');
                                    }}
                                    ><b><u>{device}</u></b></NavItem>
                                    {fixtureNodes}

                                </Nav>
                            )

                        })
                    }
                </ToggleDisplay>
                <ToggleDisplay show={sandbox.pipes.length > 0}>
                    <h5><u>Pipes</u></h5>
                    <Nav bsStyle='pills' stacked>
                        {
                            sandbox.pipes.map((pipe) => {
                                const validationLabel = validator.pipeLabel(pipe);

                                return <NavItem key={pipe.id} onClick={() => {
                                    const params = transformer.existingPipeToEditParams(pipe);
                                    this.props.controlsStore.setParamsForEditPipe(params);

                                    this.props.controlsStore.openModal('editPipe');
                                }}>{pipe.a} --- {pipe.z}<span
                                    className='pull-right'>{validationLabel}</span></NavItem>
                            })
                        }
                    </Nav>
                </ToggleDisplay>
            </Panel>
        )
    };

};
