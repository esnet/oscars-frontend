import React, {Component} from 'react';
import {Row, Col, Card, CardHeader, CardBody} from 'reactstrap';
import {inject, observer} from 'mobx-react';

@inject('commonStore')
@observer

export default class TimeoutApp extends Component {
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
                        <CardHeader>Idle timeout</CardHeader>
                        <CardBody>
                            <p>You're seeing this page because the hold timer expired while you were . You'll need
                                to start over again.
                            </p>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        );
    }

}
