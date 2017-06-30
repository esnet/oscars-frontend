import React, {Component} from 'react';
import {inject} from 'mobx-react';
import {action} from 'mobx';
import vis from 'vis';

import myClient from '../agents/client';
import FixtureParamsModal from './fixtureParamsModal';
import DevicePortsModal from './devicePortsModal';
import AddPortModal from './addPortModal';

@inject('sandboxStore', 'topologyStore')
export default class SelectPortFromMap extends Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.props.topologyStore.loadAvailablePorts();
    }


    componentDidMount() {
        myClient.loadJSON({method: 'GET', url: '/viz/topology/multilayer'})
            .then(
                action((response) => {
                        let topology = JSON.parse(response);
                        let options = {
                            height: '450px',
                            interaction: {
                                hover: false,
                                navigationButtons: false,
                                zoomView: true,
                                dragView: true
                            },
                            physics: {
                                stabilization: true
                            },
                            nodes: {
                                shape: 'dot',
                                color: {background: 'white'}
                            }
                        };
                        let nodeDataset = new vis.DataSet(topology.nodes);
                        let edgeDataset = new vis.DataSet(topology.edges);
                        let datasource = {
                            nodes: nodeDataset,
                            edges: edgeDataset
                        };


                    let network = new vis.Network(this.mapRef, datasource, options);
                        network.on('click', (params) => {
                            if (params.nodes.length > 0) {
                                let nodeId = params.nodes[0];
                                this.props.sandboxStore.selectDevice(nodeId);
                            }
                        });

                        network.on('dragEnd', (params) => {
                            if (params.nodes.length > 0) {
                                let nodeId = params.nodes[0];
                                nodeDataset.update({id: nodeId, fixed: {x: true, y: true}});
                            }
                        });

                        network.on('dragStart', (params) => {
                            if (params.nodes.length > 0) {
                                let nodeId = params.nodes[0];
                                nodeDataset.update({id: nodeId, fixed: {x: false, y: false}});
                            }
                        });

                    }
                )
            )
        ;

    }

    render() {

        return (
            <div>
                <FixtureParamsModal />
                <DevicePortsModal />
                <AddPortModal />

                <div ref={(ref) => {
                    this.mapRef = ref;
                }}
                     className="col-md-10">

                </div>
            </div>
        );
    }
}