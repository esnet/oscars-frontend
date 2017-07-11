import React, {Component} from 'react';
import {Grid, Row, Col} from 'react-bootstrap';


import NavBar from '../components/navbar'


export default class WelcomeApp extends Component {

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
                    <Col>
                        <h4>Welcome to OSCARS</h4>
                    </Col>
                </Row>
            </Grid>
        );
    }

}
