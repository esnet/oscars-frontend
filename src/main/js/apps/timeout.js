import React, {Component} from 'react';
import {Row, Col,Panel} from 'react-bootstrap';
import myClient from '../agents/client';
import {action} from 'mobx';
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
                <Col mdOffset={1} md={10}>
                    <Panel>
                        <Panel.Heading>
                            <h3>Idle timeout</h3>
                        </Panel.Heading>
                        <Panel.Body>
                            <p>You're seeing this page because the hold timer expired while you were . You'll need
                                to start over again.

                            </p>
                        </Panel.Body>
                    </Panel>
                </Col>
            </Row>
        );
    }

}
