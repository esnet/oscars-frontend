import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {Grid, Row, Col, Panel} from 'react-bootstrap';

import SelectPort from '../components/selectPort';
import Sandbox from '../components/sandbox';
import SandboxMap from '../components/sandboxMap';
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
        this.selectAndOpenJunction = this.selectAndOpenJunction.bind(this);
        this.setPipe = this.setPipe.bind(this);
        this.setAndOpenPipe = this.setAndOpenPipe.bind(this);
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

    selectAndOpenJunction(junction) {
        this.setState({
            junction: junction
        });
        this.props.sandboxStore.openModal('junction');
    }

    setAndOpenPipe(pipe) {
        this.setState({
            pipe: pipe
        });
        this.props.sandboxStore.openModal('pipe');

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
                            <SelectPort  />
                            <Panel>
                                <SandboxMap onPipeClicked={this.setAndOpenPipe} onJunctionClicked={this.selectAndOpenJunction}/>
                            </Panel>
                        </Col>
                        <Col md={3}>
                            <Sandbox onJunctionClicked={this.selectJunction} onPipeClicked={this.setPipe}/>
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
