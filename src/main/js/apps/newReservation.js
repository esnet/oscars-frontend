import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {Grid, Row, Col} from 'react-bootstrap';

import SelectPortFromText from '../components/selectPortFromText';
import SelectPortFromMap from '../components/selectPortFromMap';
import SandboxFixtures from '../components/sandboxFixtures';
import SandboxControls from '../components/sandboxControls';
import ConnectionParamsModal from '../components/connectionParamsModal';
import JunctionParamsModal from '../components/junctionParamsModal';

@inject('sandboxStore')
@observer
export default class NewReservationApp extends Component {

    constructor(props) {
        super(props);
        this.selectJunction = this.selectJunction.bind(this);
    }

    state = {
        junction: ''
    };

    selectJunction(junction) {
        this.setState({
            junction: junction
        });
    }

    render() {

        return (
            <div>
                <p>{this.props.sandboxStore.selection.device}</p>
                <Grid>
                    <Row>
                        <Col md={9}>
                            <SelectPortFromMap div_id="new_resv_map"/>
                        </Col>
                        <Col md={3}>
                            <SelectPortFromText  />
                            <SandboxFixtures onJunctionClick={this.selectJunction} />
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
                </Grid>
                <ConnectionParamsModal />
                <JunctionParamsModal junction={this.state.junction}/>
            </div>
        );
    }
}