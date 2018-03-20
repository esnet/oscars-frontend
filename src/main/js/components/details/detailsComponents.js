import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {
    Card, CardHeader, CardBody, CardSubtitle,
    ListGroupItem, ListGroup,
    NavLink,
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
                <CardHeader className='p-1'>Components {compHelp}</CardHeader>
                <CardBody>
                    <CardSubtitle>Connection info:</CardSubtitle>
                    <ListGroup className='p-1'>
                        <ListGroupItem className='p-1' onClick={this.onConnectionClicked}>
                            <NavLink href='#'>ID: {connId}</NavLink>
                        </ListGroupItem>
                    </ListGroup>

                    <ToggleDisplay show={cmp.junctions.length > 0}>
                        <hr />
                        <CardSubtitle>Junctions & fixtures:</CardSubtitle>
                        {
                            cmp.junctions.map((junction) => {
                                let fixtureNodes = cmp.fixtures.map((fixture) => {
                                    if (fixture.junction === junction.refId) {

                                        let label = (fixture.portUrn + ':' + fixture.vlan.vlanId)
                                            .replace(junction.refId+':', '');

                                        return <ListGroupItem className='p-0' key={label} onClick={() => {
                                            this.onFixtureClicked(fixture)
                                        }}>
                                            <NavLink href='#'>{label}</NavLink>
                                        </ListGroupItem>

                                    }
                                });

                                return (
                                    <ListGroup className='p-0' key={junction.refId + 'nav'}>
                                        <ListGroupItem className='p-0' key={junction.refId}
                                                 onClick={() => {
                                                     this.onJunctionClicked(junction)
                                                 }}>
                                            <NavLink href='#'><strong>{junction.refId}</strong></NavLink>
                                        </ListGroupItem>
                                        {fixtureNodes}
                                    </ListGroup>
                                )
                            })
                        }
                    </ToggleDisplay>


                    <ToggleDisplay show={cmp.pipes.length > 0}>
                        <hr />
                        <CardSubtitle>Pipes:</CardSubtitle>
                        <ListGroup>
                            {
                                cmp.pipes.map((pipe) => {
                                    return <ListGroupItem className='p-0' key={pipe.a + ' --' + pipe.z}
                                                    onClick={() => {
                                                        this.onPipeClicked(pipe)
                                                    }}>
                                        <NavLink href='#'><small>{pipe.a} -- {pipe.z}</small></NavLink>
                                    </ListGroupItem>
                                })
                            }
                        </ListGroup>
                    </ToggleDisplay>
                </CardBody>

            </Card>
        )
    };

};
