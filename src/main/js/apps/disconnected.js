import React, {Component} from 'react';
import {Row, Col, Card, CardHeader, CardBody} from 'reactstrap';
import {inject, observer} from 'mobx-react';

@inject('commonStore')
@observer

export default class DisconnectedApp extends Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.props.commonStore.setActiveNav('');

    }

    render() {
        return (
            <Row>
                <Col md={{size: 10, offset: 1}}>
                    <Card>
                        <CardHeader>Disconnected</CardHeader>
                        <CardBody>
                            <p>You're seeing this page because you've been disconnected from OSCARS.</p>
                            <p>This can happen when your browser is not on an allowed network,
                                or the OSCARS backend service is down.
                            </p>
                            <p>Please correct the issue (i.e. reconnect to the VPN) before
                                navigating away from this page.</p>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        );
    }

}
