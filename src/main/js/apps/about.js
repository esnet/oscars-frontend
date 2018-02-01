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
        let header = <h3>About OSCARS</h3>
        return (
            <Row>
                <Col>
                    <Panel header={header}>
                        <div>
                            Frontend version: <u>{this.props.commonStore.version.frontend}</u>
                        </div>
                        <div>
                            Backend version: <u>{this.props.commonStore.version.backend}</u>
                        </div>
                    </Panel>
                </Col>
            </Row>
        );
    }

}
