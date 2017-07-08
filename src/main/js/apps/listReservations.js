import React, {Component} from 'react';
import {Grid, Row, Col} from 'react-bootstrap';


import NavBar from '../components/navbar'
import TopologyMap from '../components/topologyMap';

export default class ListReservationsApp extends Component {

    constructor(props) {
        super(props);
    }


    render() {
        return (
            <Grid fluid={true}>
                <Row>
                    <NavBar/>
                </Row>
                <Row>
                    <Col>
                        <TopologyMap />
                    </Col>

                </Row>
            </Grid>
        );
    }

}
