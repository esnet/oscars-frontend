import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {Grid, Row, Col} from 'react-bootstrap';

import SelectFixtureFromText from '../components/selectFixtureFromText';
import SelectFixtureFromMap from '../components/selectFixtureFromMap';
import SandboxFixtures from '../components/sandboxFixtures';
import SandboxControls from '../components/sandboxControls';

@inject('sandboxStore')
@observer
export default class NewReservationApp extends Component {

    render() {
        return (
            <div>
                <p>{this.props.sandboxStore.selection.device}</p>
                <Grid>
                    <Row>
                        <Col md={10}>
                            <SelectFixtureFromMap div_id="new_resv_map"/>
                        </Col>
                        <Col md={2}>
                            <SelectFixtureFromText  />
                            <SandboxFixtures /></Col>
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
            </div>
        );
    }
}