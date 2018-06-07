import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {
    Row, Col, Card, Button,
    Nav, NavItem, NavLink,
    CardHeader, CardBody, TabPane, TabContent
} from 'reactstrap';

import { LazyLog, ScrollFollow } from 'react-lazylog';

import classnames from 'classnames';

@inject('connsStore', 'commonStore')
@observer
export default class StatusApp extends Component {

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.props.commonStore.setActiveNav('status');
        this.setState({
            activeTab: 'conn'
        });
    }

    toggle = (tab) => {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    };

    render() {
        return (
            <Row>
                <Col md={{size: 10, offset: 1}}>
                    <Card>
                        <CardHeader>OSCARS status</CardHeader>
                        <CardBody>
                            <Nav tabs>
                                <NavItem>
                                    <NavLink
                                        className={classnames({active: this.state.activeTab === 'conn'})}
                                        onClick={() => {
                                            this.toggle('conn');
                                        }}
                                    >Connections</NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                        className={classnames({active: this.state.activeTab === 'pss'})}
                                        onClick={() => {
                                            this.toggle('pss');
                                        }}
                                    >PSS</NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                        className={classnames({active: this.state.activeTab === 'topo'})}
                                        onClick={() => {
                                            this.toggle('topo');
                                        }}
                                    >Topology</NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                        className={classnames({active: this.state.activeTab === 'log'})}
                                        onClick={() => {
                                            this.toggle('log');
                                        }}
                                    >Logs</NavLink>
                                </NavItem>

                            </Nav>

                            <div>
                                <TabContent activeTab={this.state.activeTab}>
                                    <TabPane tabId='conn'>
                                        <p>IN PROGRESS, PLACEHOLDER</p>
                                        <p>Active: <b>4 (+)</b> expand</p>
                                        <p>Failed: <b>1 (+)</b> expand</p>
                                        <p>Archived: <b>12</b></p>
                                    </TabPane>
                                    <TabPane tabId='pss'>
                                        <p>IN PROGRESS, PLACEHOLDER</p>
                                        <p>REST: <b>OK</b></p>
                                        <p>Profile: <b>netlab</b></p>
                                        <p>Configuration: <b>OK</b></p>
                                        <p>Issues: <b>(+)</b> expand</p>
                                        <Button>Verify</Button>
                                    </TabPane>
                                    <TabPane tabId='topo'>
                                        <p>IN PROGRESS, PLACEHOLDER</p>
                                        <p>Files: <b>./config/topo/netlab.json</b></p>
                                        <p>Version: <b>123</b></p>
                                        <p>Last updated: <b>2 days ago</b></p>
                                        <p>Devices: <b>4</b></p>
                                        <p>Adjacencies: <b>5</b></p>
                                        <p>Consistent: <b>NO</b></p>
                                        <p>Issues: <b>(+)</b> expand</p>
                                    </TabPane>
                                    <TabPane tabId='log' style={{ height: 500 }}>
                                        <ScrollFollow
                                            startFollowing={true}
                                            render={({ follow, onScroll }) => (
                                                <LazyLog url='/api/log' stream selectableLines
                                                         follow={follow} onScroll={onScroll} />
                                            )}
                                        />
                                    </TabPane>

                                </TabContent>
                            </div>
                        </CardBody>

                    </Card>

                </Col>
            </Row>

        );


    }

}
