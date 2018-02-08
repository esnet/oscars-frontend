import React, {Component} from 'react';

import {observer, inject} from 'mobx-react';
import {action, autorunAsync, toJS} from 'mobx';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

import {Panel, Tabs, Tab, Button} from 'react-bootstrap';
import DetailsGeneral from '../components/detailsGeneral';
import PropTypes from 'prop-types';
import myClient from "../agents/client";
import Moment from 'moment';

const format = 'Y/MM/DD HH:mm:ss';

@inject('connsStore')
@observer
export default class DetailsInfo extends Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
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

        return <Panel>
            <Panel.Heading>
                <p>Fixture</p>
            </Panel.Heading>
            <Panel.Body>
                <BootstrapTable tableHeaderClass={'hidden'} data={info} bordered={false}>
                    <TableHeaderColumn dataField='k' isKey={true}/>
                    <TableHeaderColumn dataField='v'/>
                </BootstrapTable>
            </Panel.Body>
        </Panel>

    }

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
        return <Panel>
            <Panel.Heading>
                <p>{deviceUrn}</p>
            </Panel.Heading>
            <Panel.Body>
                <div>
                    <Tabs id='junctionTabs' defaultActiveKey={1}>
                        <Tab eventKey={1} title="Router commands">
                            {
                                this.props.connsStore.store.commands.map(c => {
                                    if (c.deviceUrn === selected.data.deviceUrn) {
                                        return <Panel key={c.type} defaultExpanded={false}>
                                            <Panel.Heading>
                                                <Panel.Title toggle>{c.type}</Panel.Title>
                                            </Panel.Heading>
                                            <Panel.Body collapsible>
                                                <pre>{c.contents}</pre>
                                            </Panel.Body>

                                        </Panel>
                                    } else {
                                        return null;
                                    }

                                })
                            }
                        </Tab>
                        <Tab eventKey={2} title='Diagnostics'>
                            <Panel>
                                <Panel.Heading>
                                    <p>Control plane status</p>
                                </Panel.Heading>
                                <Panel.Collapse>
                                    <div>
                                        {cpStatus}
                                    </div>
                                    <Button bsStyle='info'
                                            onClick={this.initControlPlaneCheck}>Initiate new check</Button>
                                </Panel.Collapse>
                            </Panel>
                        </Tab>
                    </Tabs>
                </div>
            </Panel.Body>

        </Panel>

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


        return <Panel>
            <Panel.Heading>
                <p>Pipes</p>
            </Panel.Heading>
            <Panel.Body>
                <BootstrapTable tableHeaderClass={'hidden'} data={info} bordered={false}>
                    <TableHeaderColumn dataField='k' isKey={true}/>
                    <TableHeaderColumn dataField='v'/>
                </BootstrapTable>
            </Panel.Body>
        </Panel>

    }

}


DetailsInfo.propTypes = {
    refresh: PropTypes.func.isRequired,
};
