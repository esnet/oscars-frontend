import React, {Component} from 'react';
import {Row, Col} from 'react-bootstrap';


export default class WelcomeApp extends Component {

    render() {

        return (
            <Row>
                <Col mdOffset={1} md={10}>
                    <h4>Welcome to OSCARS</h4>
                </Col>
            </Row>
        );
    }

}
