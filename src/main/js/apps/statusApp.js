import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {Row, Col, Panel, Tabs, Tab, Button} from 'react-bootstrap';

@inject('connsStore', 'commonStore')
@observer
export default class StatusApp extends Component {

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.props.commonStore.setActiveNav('status');
    }


    render() {
        return (
            <Row>
                <Col mdOffset={1} md={10}>
                    <Panel>
                        <Panel.Heading>
                            <Panel.Title>OSCARS status</Panel.Title>
                        </Panel.Heading>
                        <Panel.Body>
                            <div>
                                <Tabs id='statusTabs' defaultActiveKey={1}>
                                    <Tab eventKey={1} title='Connections'>
                                        <p>IN PROGRESS, PLACEHOLDER</p>
                                        <p>Active: <b>4 (+)</b> expand</p>
                                        <p>Failed: <b>1 (+)</b> expand</p>
                                        <p>Archived: <b>12</b></p>
                                    </Tab>
                                    <Tab eventKey={2} title='PSS'>
                                        <p>IN PROGRESS, PLACEHOLDER</p>
                                        <p>REST: <b>OK</b></p>
                                        <p>Profile: <b>netlab</b></p>
                                        <p>Configuration: <b>OK</b></p>
                                        <p>Issues: <b>(+)</b> expand</p>
                                        <Button>Verify</Button>
                                    </Tab>
                                    <Tab eventKey={3} title='Topology'>
                                        <p>IN PROGRESS, PLACEHOLDER</p>
                                        <p>Files: <b>./config/topo/netlab.json</b></p>
                                        <p>Version: <b>123</b></p>
                                        <p>Last updated: <b>2 days ago</b></p>
                                        <p>Devices: <b>4</b></p>
                                        <p>Adjacencies: <b>5</b></p>
                                        <p>Consistent: <b>NO</b></p>
                                        <p>Issues: <b>(+)</b> expand</p>
                                    </Tab>
                                </Tabs>
                            </div>
                        </Panel.Body>

                    </Panel>

                </Col>
            </Row>

        );


    }

}
