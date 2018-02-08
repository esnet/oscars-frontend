import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {toJS} from 'mobx';
import validator from '../lib/validation'
import {Panel, Glyphicon, Nav, NavItem, OverlayTrigger, Popover} from 'react-bootstrap';
import transformer from '../lib/transform';
import ToggleDisplay from 'react-toggle-display';

@inject('connsStore')
@observer
export default class DetailsComponents extends Component {
    constructor(props) {
        super(props);
    }

    onFixtureClicked = (fixture) => {
        this.props.connsStore.setSelected({
            type: 'fixture',
            data: fixture
        });
    };

    onJunctionClicked = (junction) => {
        this.props.connsStore.setSelected({
            type: 'junction',
            data: junction
        });
    };

    onPipeClicked = (pipe) => {
        this.props.connsStore.setSelected({
            type: 'pipe',
            data: pipe,
        });
    };
    onConnectionClicked = () => {
        this.props.connsStore.setSelected({
            type: 'connection',
            data: '',
        });
    };

    render() {

        const cmp = this.props.connsStore.store.current.archived.cmp;
        const connId = this.props.connsStore.store.current.connectionId;


        let compHelp = <Popover id='help-detailsComponents' title='Component list'>
            <p>This displays the fixtures, junctions, and pipes for the current connection. </p>
            <p>You may click on any component to bring up information about it.</p>
        </Popover>;


        return (

            <Panel>
                <Panel.Heading>
                    <p>Components
                        <OverlayTrigger trigger='click' rootClose placement='left' overlay={compHelp}>
                            <Glyphicon className='pull-right' glyph='question-sign'/>
                        </OverlayTrigger>
                    </p>
                </Panel.Heading>
                <Panel.Body>
                    <h5><b>General connection info</b></h5>
                    <Nav bsStyle='pills' stacked>
                        <NavItem onClick={this.onConnectionClicked}>ID: {connId}</NavItem>
                    </Nav>

                    <ToggleDisplay show={cmp.junctions.length > 0}>
                        <h5><b>Junctions & fixtures</b></h5>
                        {
                            cmp.junctions.map((junction) => {
                                let fixtureNodes = cmp.fixtures.map((fixture) => {
                                    if (fixture.junction === junction.refId) {
                                        const label = fixture.portUrn + ':' + fixture.vlan.vlanId;

                                        return <NavItem key={label} onClick={() => {
                                            this.onFixtureClicked(fixture)
                                        }}>
                                            {label}
                                        </NavItem>

                                    }
                                });

                                return (
                                    <Nav bsStyle='pills' stacked key={junction.refId + 'nav'}>
                                        <NavItem active={true}
                                                 key={junction.refId}
                                                 onClick={() => {
                                                     this.onJunctionClicked(junction)
                                                 }}>
                                            <b><u>{junction.refId}</u></b>
                                        </NavItem>
                                        {fixtureNodes}

                                    </Nav>
                                )
                            })
                        }
                    </ToggleDisplay>


                    <ToggleDisplay show={cmp.pipes.length > 0}>
                        <h5><b>Pipes</b></h5>
                        <Nav bsStyle='pills' stacked>
                            {
                                cmp.pipes.map((pipe) => {
                                    return <NavItem key={pipe.a + ' --' + pipe.z}
                                                    onClick={() => {
                                                        this.onPipeClicked(pipe)
                                                    }}>
                                        {pipe.a} -- {pipe.z}
                                    </NavItem>
                                })
                            }
                        </Nav>
                    </ToggleDisplay>
                </Panel.Body>

            </Panel>
        )
    };

};
