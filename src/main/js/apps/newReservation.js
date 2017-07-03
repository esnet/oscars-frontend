import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {Grid, Row, Col} from 'react-bootstrap';

import SelectPortFromText from '../components/selectPortFromText';
import SelectPortFromMap from '../components/selectPortFromMap';
import Sandbox from '../components/sandbox';
import SandboxControls from '../components/sandboxControls';
import ConnectionParamsModal from '../components/connectionParamsModal';
import JunctionParamsModal from '../components/junctionParamsModal';
import PipeParamsModal from '../components/pipeParamsModal';
import FixtureParamsModal from '../components/fixtureParamsModal';
import DevicePortsModal from '../components/devicePortsModal';
import AddPortModal from '../components/addPortModal';
import NavBar from '../components/navbar'

@inject('sandboxStore')
@observer
export default class NewReservationApp extends Component {

    constructor(props) {
        super(props);
        this.selectJunction = this.selectJunction.bind(this);
        this.setPipe = this.setPipe.bind(this);
    }

    state = {
        junction: '',
        pipe: {}
    };

    selectJunction(junction) {
        this.setState({
            junction: junction
        });
    }

    setPipe(pipe) {
        this.setState({
            pipe: pipe
        });
    }

    render() {

        return (
            <div>
                <Grid fluid={true}>
                    <Row>
                        <NavBar/>
                    </Row>
                    <Row>
                        <Col md={9}>
                            <SelectPortFromMap div_id="new_resv_map"/>
                        </Col>
                        <Col md={3}>
                            <SelectPortFromText  />
                            <Sandbox onJunctionClick={this.selectJunction} onPipeClick={this.setPipe}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={8}>
                            <h2>sandbox graph</h2>
                        </Col>
                        <Col md={4}>
                            <SandboxControls />
                        </Col>
                    </Row>
                    <Row>
                        <FixtureParamsModal />
                        <DevicePortsModal />
                        <AddPortModal />

                        <ConnectionParamsModal />
                        <JunctionParamsModal junction={this.state.junction} setPipe={this.setPipe}/>
                        <PipeParamsModal pipe={this.state.pipe}/>
                    </Row>
                </Grid>
            </div>
        );
    }
}