import React, {Component} from 'react';
import {Row, Col,Panel} from 'react-bootstrap';
import myClient from '../agents/client';
import {action} from 'mobx';
import {inject, observer} from 'mobx-react';

@inject('commonStore')
@observer

export default class AboutApp extends Component {
    constructor(props) {
        super(props);
    }


    componentWillMount() {

        myClient.submit('GET', '/api/version')
            .then(
                action((response) => {
                    this.props.commonStore.setVersion('backend', response);
                }));
    }


    render() {
        return (
            <Row>
                <Col mdOffset={1} md={10}>
                    <Panel>
                        <Panel.Heading>
                            <h3>About OSCARS</h3>
                        </Panel.Heading>
                        <Panel.Body>
                            <div>
                                Frontend version: <u>{this.props.commonStore.version.frontend}</u>
                            </div>
                            <div>
                                Backend version: <u>{this.props.commonStore.version.backend}</u>
                            </div>
                        </Panel.Body>
                    </Panel>
                </Col>
            </Row>
        );
    }

}
