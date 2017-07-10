import React, {Component} from 'react';
import {Grid, Row, Col} from 'react-bootstrap';


import NavBar from '../components/navbar'
import ConnectionsList from '../components/connectionsList';
import ConnectionModal from '../components/connectionModal';

export default class ListConnectionsApp extends Component {

    constructor(props) {
        super(props);
    }


    render() {
        return (
            <Grid fluid={true}>
                <Row>
                    <NavBar active='list'/>
                </Row>
                <Row>
                    <Col sm={4}>{' '}</Col>
                </Row>
                <Row>
                    <ConnectionsList/>

                </Row>
                <Row>
                    <ConnectionModal />
                </Row>

            </Grid>
        );
    }

}
