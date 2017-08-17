import React, {Component} from 'react';

import {observer, inject} from 'mobx-react';
import {action, autorunAsync, toJS} from 'mobx';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

import {Panel, Tabs, Tab} from 'react-bootstrap';
import DetailsGeneral from '../components/detailsGeneral';
import PropTypes from 'prop-types';


@inject('connsStore')
@observer
export default class DetailsInfo extends Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.periodicCheck();
    }

    periodicCheck() {
        this.props.refresh();


        setTimeout(() => {
            this.periodicCheck()
        }, 60000);

    }


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

        return <Panel header='Fixture'>
            <BootstrapTable tableHeaderClass={'hidden'} data={info} bordered={false}>
                <TableHeaderColumn dataField='k' isKey={true}/>
                <TableHeaderColumn dataField='v'/>
            </BootstrapTable>
        </Panel>

    }

    junctionInfo() {
        const selected = this.props.connsStore.store.selected;
        let header = selected.data.deviceUrn;
        return <Panel header={header}>
            <div>
                <Tabs id='junctionTabs' defaultActiveKey={1}>
                    <Tab eventKey={1} title="Diagnostics">
                        <Panel header='TODO'>
                            <p>Coming soon!</p>
                        </Panel>
                    </Tab>
                    <Tab eventKey={2} title="Router commands">
                        <Panel header='TODO'>
                            <p>Coming soon!</p>
                        </Panel>
                    </Tab>
                </Tabs>
            </div>
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


        return <Panel header='Pipe'>
            <BootstrapTable tableHeaderClass={'hidden'} data={info} bordered={false}>
                <TableHeaderColumn dataField='k' isKey={true}/>
                <TableHeaderColumn dataField='v'/>
            </BootstrapTable>
        </Panel>

    }

}


DetailsInfo.propTypes = {
    refresh: PropTypes.func.isRequired,
};
