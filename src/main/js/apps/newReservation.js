import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {Grid, Row, Col, Panel} from 'react-bootstrap';


import NavBar from '../components/navbar'
import SelectPort from '../components/selectPort';
import DevicePortsModal from '../components/devicePortsModal';
import EditFixtureModal from '../components/editFixtureModal';
import EditJunctionModal from '../components/editJunctionModal';
import EditPipeModal from '../components/editPipeModal';
import SandboxMap from '../components/sandboxMap';
import Sandbox from '../components/sandbox';
import SandboxControls from '../components/sandboxControls';

@inject('sandboxStore')
@observer
export default class NewReservationApp extends Component {

    constructor(props) {
        super(props);
    }


    render() {

        return (
            <div>
                <Grid fluid={true}>
                    <Row>
                        <NavBar/>
                    </Row>
                    <Row>
                        <Col md={9} sm={9}>
                            <SelectPort  />
                            <SandboxMap />
                        </Col>

                        <Col md={3} sm={3}>
                            <Sandbox />
                            <SandboxControls />
                        </Col>
                    </Row>
                    <Row>
                        <DevicePortsModal />
                        <EditFixtureModal />
                        <EditJunctionModal />
                        <EditPipeModal />

                    </Row>
                </Grid>
            </div>
        );
    }

}
