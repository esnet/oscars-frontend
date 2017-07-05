import React, {Component} from 'react';
import vis from 'vis';
import { action } from 'mobx';

import myClient from '../agents/client';

export default class TopologyMap extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        myClient.loadJSON({method: 'GET', url: '/viz/topology/multilayer'})
            .then(
                action((response) => {
                        let topology = JSON.parse(response);
                        let options = {
                            height: '400px',
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
                                this.props.onClickDevice(nodeId);
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
            <div ref={(ref) => { this.mapRef = ref; }}  />
        );
    }
}