import React, {Component} from 'react';

import {observer, inject} from 'mobx-react';
import {action, toJS} from 'mobx';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

import {Card, CardBody, CardHeader,
    Nav, NavItem, NavLink,
    TabPane, TabContent, Button, Collapse} from 'reactstrap';
import DetailsGeneral from './detailsGeneral';
import PropTypes from 'prop-types';
import myClient from '../../agents/client';
import Moment from 'moment';
import classnames from 'classnames';

const format = 'Y/MM/DD HH:mm:ss';

@inject('connsStore')
@observer
export default class DetailsInfo extends Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.setState({
            junctionTab: 'commands',
            ccUrn: {

            },
            ccType: {

            }
        });
        this.refreshStatuses();
    }

    componentWillUnmount() {
        clearTimeout(this.refreshTimeout);
    }


    refreshStatuses = () => {
        // console.log('running refresh');
        const selected = this.props.connsStore.store.selected;
        if (typeof selected.type === 'undefined') {
            // nada
        } else if (selected.type === 'junction') {
            const deviceUrn = selected.data.deviceUrn;

            myClient.submitWithToken('GET', '/protected/pss/controlPlaneStatus/' + deviceUrn, '')
                .then(
                    action((response) => {
                        let status = JSON.parse(response);
                        // console.log(status);
                        this.props.connsStore.setStatuses(deviceUrn, status);
                    }));
        }
        this.refreshTimeout = setTimeout(this.refreshStatuses, 5000); // update per 5 seconds

    };


    initControlPlaneCheck = () => {
        const selected = this.props.connsStore.store.selected;
        let deviceUrn = selected.data.deviceUrn;
        // console.log("initiating cp check "+deviceUrn);
        myClient.submitWithToken('GET', '/protected/pss/checkControlPlane/' + deviceUrn, '')
            .then(
                action((response) => {
                })
            );

    };


    render() {
        const selected = this.props.connsStore.store.selected;
        if (typeof selected.type === 'undefined') {
            return <DetailsGeneral/>;
        }

        if (selected.type === 'fixture') {
            return this.fixtureInfo()
        } else if (selected.type === 'junction') {
            return this.junctionInfo()

        } else if (selected.type === 'pipe') {
            return this.pipeInfo()
        } else if (selected.type === 'connection') {
            return <DetailsGeneral/>;

        }
        return <h3>error!</h3>;


    }

    fixtureInfo() {
        const d = this.props.connsStore.store.selected.data;
        const info = [
            {
                'k': 'Port',
                'v': d.portUrn
            },
            {
                'k': 'Vlan ID',
                'v': d.vlan.vlanId
            },
            {
                'k': 'Ingress',
                'v': d.ingressBandwidth + ' Mbps'
            },
            {
                'k': 'Egress',
                'v': d.egressBandwidth + ' Mbps'
            },
        ];

        return <Card>
            <CardHeader className='p-1'>Fixture</CardHeader>
            <CardBody>
                <u>In progress!</u>
                <BootstrapTable tableHeaderClass={'hidden'} data={info} bordered={false}>
                    <TableHeaderColumn dataField='k' isKey={true}/>
                    <TableHeaderColumn dataField='v'/>
                </BootstrapTable>
            </CardBody>
        </Card>

    }

    setJunctionTab = (tab) => {
        if (this.state.junctionTab !== tab) {
            this.setState({
                junctionTab : tab
            });
        }
    };

    toggleCommandCollapse = (urn, type) => {
        let newSt = {ccType: {}, ccUrn: {}};
        if (this.state.ccType[type]) {
            newSt.ccType[type] = false;
        } else {
            newSt.ccType[type] = true;
        }
        if (this.state.ccUrn[urn]) {
            newSt.ccUrn[urn] = false;
        } else {
            newSt.ccUrn[urn] = true;
        }
        this.setState(newSt);


    };

    junctionInfo() {

        const selected = this.props.connsStore.store.selected;
        let deviceUrn = selected.data.deviceUrn;
        let cpStatus = <b>Status not loaded yet..</b>;
        if (deviceUrn in this.props.connsStore.store.statuses) {
            let statuses = this.props.connsStore.store.statuses[deviceUrn];
            cpStatus = <div>
                <p>Status: {statuses['controlPlaneStatus']}</p>
                <p>Updated: {Moment(statuses['lastUpdated']).fromNow()}</p>
                <p>Output: {statuses['output']}</p>
            </div>;
        }


        return <Card>
            <CardHeader className='p-1'>{deviceUrn}</CardHeader>
            <CardBody>
                <div>
                    <Nav tabs>
                        <NavItem>
                            <NavLink
                                className={classnames({ active: this.state.junctionTab === 'commands' })}
                                onClick={() => { this.setJunctionTab('commands'); }}>
                                Router commands
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                                className={classnames({ active: this.state.junctionTab === 'diagnostics' })}
                                onClick={() => { this.setJunctionTab('diagnostics'); }}>
                                Diagnostics
                            </NavLink>
                        </NavItem>
                    </Nav>
                    <TabContent activeTab={this.state.junctionTab}>
                        <TabPane tabId='commands' title='Router commands'>
                            {
                                this.props.connsStore.store.commands.map(c => {
                                    if (c.deviceUrn === selected.data.deviceUrn) {
                                        let isOpen = this.state.ccType[c.type] && this.state.ccUrn[c.deviceUrn];

                                        return <Card key={c.type}>
                                            <CardHeader className='p-1'
                                                onClick={() => this.toggleCommandCollapse(c.deviceUrn, c.type)}>
                                                <NavLink href='#'>{c.type}</NavLink>
                                            </CardHeader>
                                            <CardBody>
                                                <Collapse isOpen={isOpen}>
                                                    <pre>{c.contents}</pre>
                                                </Collapse>
                                            </CardBody>

                                        </Card>
                                    } else {
                                        return null;
                                    }

                                })
                            }
                        </TabPane>
                        <TabPane tabId='diagnostics' title='Diagnostics'>
                            <Card>
                                <CardHeader>
                                    Control plane status
                                </CardHeader>
                                <CardBody>
                                    <div>
                                        {cpStatus}
                                    </div>
                                    <Button color='info'
                                            onClick={this.initControlPlaneCheck}>Initiate new check</Button>
                                </CardBody>
                            </Card>
                        </TabPane>
                    </TabContent>
                </div>
            </CardBody>

        </Card>

    }

    pipeInfo() {
        const d = this.props.connsStore.store.selected.data;
        const info = [
            {
                'k': 'A',
                'v': d.a
            },
            {
                'k': 'Z',
                'v': d.z
            },
            {
                'k': 'A-Z Bandwidth',
                'v': d.azBandwidth + ' Mbps'
            },
            {
                'k': 'Z-A Bandwidth',
                'v': d.zaBandwidth + ' Mbps'
            },
        ];
        for (let i = 0; i < d.azERO.length; i++) {
            info.push({k: '', v: d.azERO[i].urn});
        }


        return <Card>
            <CardHeader className='p-1'>Pipes</CardHeader>
            <CardBody>

                <u>In progress!</u>
                <BootstrapTable tableHeaderClass={'hidden'} data={info} bordered={false}>
                    <TableHeaderColumn dataField='k' isKey={true}/>
                    <TableHeaderColumn dataField='v'/>
                </BootstrapTable>
            </CardBody>
        </Card>

    }

}


DetailsInfo.propTypes = {
    refresh: PropTypes.func.isRequired,
};
