import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {
    Card, CardHeader, CardBody, CardSubtitle,
    Nav, NavItem, NavLink,
    Popover, PopoverBody, PopoverHeader} from 'reactstrap';
import ToggleDisplay from 'react-toggle-display';
import FontAwesome from 'react-fontawesome';
import {size } from 'lodash-es';

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
    componentWillMount() {
        this.setState({
            showHelp: false
        });
    }
    toggleHelp = () => {
        this.setState({showHelp: !this.state.showHelp});
    };

    render() {

        const cmp = this.props.connsStore.store.current.archived.cmp;
        if (size(cmp.junctions) === 0) {
            return <p>Loading..</p>;
        }
        const connId = this.props.connsStore.store.current.connectionId;

        const compHelp =
            <span className='pull-right'>
                        <FontAwesome
                            onClick={this.toggleHelp}
                            className='pull-right'
                            name='question'
                            id='compHelpIcon'
                        />
                        <Popover placement='left'
                                 isOpen={this.state.showHelp}
                                 target='compHelpIcon'
                                 toggle={this.toggleHelp}>
                            <PopoverHeader>Component list</PopoverHeader>
                            <PopoverBody>
                            <p>This displays the fixtures, junctions, and pipes for the current connection. </p>
                            <p>You may click on any component to bring up information about it.</p>

                            </PopoverBody>
                        </Popover>
        </span>;


        return (

            <Card>
                <CardHeader>Components {compHelp}</CardHeader>
                <CardBody>
                    <CardSubtitle>Connection info:</CardSubtitle>
                    <Nav vertical pills>
                        <NavItem onClick={this.onConnectionClicked}>
                            <NavLink href='#'>ID: {connId}</NavLink>
                            </NavItem>
                    </Nav>

                    <ToggleDisplay show={cmp.junctions.length > 0}>
                        <hr />
                        <CardSubtitle>Junctions & fixtures:</CardSubtitle>
                        {
                            cmp.junctions.map((junction) => {
                                let fixtureNodes = cmp.fixtures.map((fixture) => {
                                    if (fixture.junction === junction.refId) {

                                        let label = (fixture.portUrn + ':' + fixture.vlan.vlanId)
                                            .replace(junction.refId+':', '');

                                        return <NavItem key={label} onClick={() => {
                                            this.onFixtureClicked(fixture)
                                        }}>
                                            <NavLink href='#'>{label}</NavLink>
                                        </NavItem>

                                    }
                                });

                                return (
                                    <Nav vertical pills key={junction.refId + 'nav'}>
                                        <NavItem key={junction.refId}
                                                 onClick={() => {
                                                     this.onJunctionClicked(junction)
                                                 }}>
                                            <NavLink active href='#'>{junction.refId}</NavLink>
                                        </NavItem>
                                        {fixtureNodes}

                                    </Nav>
                                )
                            })
                        }
                    </ToggleDisplay>


                    <ToggleDisplay show={cmp.pipes.length > 0}>
                        <hr />
                        <CardSubtitle>Pipes:</CardSubtitle>
                        <Nav pills vertical>
                            {
                                cmp.pipes.map((pipe) => {
                                    return <NavItem key={pipe.a + ' --' + pipe.z}
                                                    onClick={() => {
                                                        this.onPipeClicked(pipe)
                                                    }}>
                                        <NavLink href='#'><small>{pipe.a} -- {pipe.z}</small></NavLink>
                                    </NavItem>
                                })
                            }
                        </Nav>
                    </ToggleDisplay>
                </CardBody>

            </Card>
        )
    };

};
