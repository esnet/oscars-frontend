import React, {Component} from 'react';
import vis from 'vis';
import {action} from 'mobx';
import {Panel, Glyphicon} from 'react-bootstrap';

import myClient from '../agents/client';

export default class TopologyMap extends Component {
    constructor(props) {
        super(props);
    }

    state = {
        showMap: true
    };

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


                        this.network = new vis.Network(this.mapRef, datasource, options);
                        this.network.on('click', (params) => {
                            if (params.nodes.length > 0) {
                                let nodeId = params.nodes[0];
                                this.props.onClickDevice(nodeId);
                            }
                        });

                        this.network.on('dragEnd', (params) => {
                            if (params.nodes.length > 0) {
                                let nodeId = params.nodes[0];
                                nodeDataset.update({id: nodeId, fixed: {x: true, y: true}});
                            }
                        });

                        this.network.on('dragStart', (params) => {
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
        let toggleIcon = this.state.showMap ? 'chevron-down' : 'chevron-right';

        let header = <div>Network Map
            <div className='pull-right'>
                <Glyphicon onClick={ () => { this.network.fit() }} glyph='zoom-out'/>
                {' '}
                <Glyphicon onClick={ () => this.setState({showMap: !this.state.showMap})} glyph={toggleIcon}/>
            </div>
        </div>;
        return (
            <Panel collapsible expanded={this.state.showMap} header={header}>
                <div ref={(ref) => {
                    this.mapRef = ref;
                }}><p>Topology</p></div>
            </Panel>

        );

    }
}