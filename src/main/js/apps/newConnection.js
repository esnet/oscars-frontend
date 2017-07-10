import React, {Component} from 'react';
import {Grid, Row, Col} from 'react-bootstrap';


import NavBar from '../components/navbar'
import TopologyMap from '../components/topologyMap';
import AddFixtureModal from '../components/addFixtureModal';
import EditFixtureModal from '../components/editFixtureModal';
import EditJunctionModal from '../components/editJunctionModal';
import EditPipeModal from '../components/editPipeModal';
import DisplayErrorsModal from '../components/displayErrorsModal';
import SandboxMap from '../components/sandboxMap';
import Sandbox from '../components/sandbox';
import SandboxControls from '../components/sandboxControls';
import SelectPort from '../components/selectPort';

export default class NewConnectionApp extends Component {

    constructor(props) {
        super(props);
    }


    render() {

        return (
            <Grid fluid={true}>
                <Row>
                    <NavBar active='new'/>
                </Row>
                <Row>
                    <Col sm={4}>{' '}</Col>
                </Row>
                <Row>
                    <Col md={8} sm={8}>
                        <TopologyMap />
                        <SandboxMap />
                    </Col>
                    <Col md={4} sm={4}>
                        <SelectPort/>
                        <SandboxControls />
                        <Sandbox />
                    </Col>
                </Row>
                <AddFixtureModal />
                <EditFixtureModal />
                <EditJunctionModal />
                <EditPipeModal />
                <DisplayErrorsModal />
            </Grid>
        );
    }

}
