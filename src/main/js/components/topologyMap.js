import React, {Component} from 'react';
import vis from 'vis';
import {inject, observer} from 'mobx-react';
import {autorun, autorunAsync, whyRun, toJS, action} from 'mobx';
import ToggleDisplay from 'react-toggle-display';

import {Panel, Glyphicon} from 'react-bootstrap';

import myClient from '../agents/client';

@inject('mapStore')
@observer
export default class TopologyMap extends Component {
    constructor(props) {
        super(props);
    }

    state = {
        showMap: true
    };


    // this automagically updates the map;
    disposeOfMapUpdate = autorunAsync('map update', () => {

        this.datasource = {
            nodes: new vis.DataSet(),
            edges: new vis.DataSet(),
        };

        this.datasource.nodes.add(toJS(this.props.mapStore.network.nodes));
        this.datasource.edges.add(toJS(this.props.mapStore.network.edges));

        this.props.mapStore.network.nodes.map((entry) => {
            this.datasource.nodes.update({
                id: entry.id,
                shape: 'circle',
                scaling: {
                    size: 20
                },
                font: {
                    size: 20,
                    bold: true,
                }
            });
        });

        this.props.mapStore.network.coloredNodes.map((entry) => {
            this.datasource.nodes.update({
                id: entry.id,
                scaling: {
                    size: 40
                },
                color: {background: entry.color}
            });
        });

        this.props.mapStore.network.coloredEdges.map((entry) => {
            let edgeId = entry.id;
            if (this.datasource.edges.get(edgeId) === null) {
                edgeId = entry.id.split(' -- ')[1] + ' -- ' + entry.id.split(' -- ')[0];

            }
            if (this.datasource.edges.get(edgeId) !== null) {
                this.datasource.edges.update({
                    id: edgeId,
                    width: 8,
                    color: {color: entry.color}
                });
            } else {
                console.log('could not find edge for ' + entry.id);
            }
        });

        let options = {
            height: '330px',
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

        if (this.props.mapStore.network.initialized) {
            this.network = new vis.Network(this.mapRef, this.datasource, options);
            this.network.on('click', (params) => {
                if (params.nodes.length > 0) {
                    let nodeId = params.nodes[0];
                    this.props.selectDevice(nodeId);
                }
            });

            this.network.on('dragEnd', (params) => {
                if (params.nodes.length > 0) {
                    let nodeId = params.nodes[0];
                    this.datasource.nodes.update({id: nodeId, fixed: {x: true, y: true}});
                }
            });

            this.network.on('dragStart', (params) => {
                if (params.nodes.length > 0) {
                    let nodeId = params.nodes[0];
                    this.datasource.nodes.update({id: nodeId, fixed: {x: false, y: false}});
                }
            });
            this.network.on('stabilizationIterationsDone', () => {
                if (this.props.mapStore.network.zoomedOnColored) {

                    this.zoomOnColored();
                    this.props.mapStore.setZoomOnColored(false);
                }
            });

        }


    }, 500);


    zoomOnColored = () => {

        let nodeIds = [];
        this.props.mapStore.network.coloredNodes.map((entry) => {
            nodeIds.push(entry.id);
        });

        this.network.fit({nodes: nodeIds, animation: true});
    };

    componentWillUnmount() {
        this.disposeOfMapUpdate();
    }


    componentDidMount() {

        myClient.loadJSON({method: 'GET', url: '/viz/topology/multilayer'})
            .then(action((response) => {
                let topology = JSON.parse(response);
                this.props.mapStore.setNetwork(topology.nodes, topology.edges);
            }));

    }

    render() {
        let toggleIcon = this.state.showMap ? 'chevron-down' : 'chevron-right';

        let header =
            <span>Network Map
                <span className='pull-right'>
                    <ToggleDisplay show={this.props.mapStore.network.coloredNodes.length > 0}>
                        <Glyphicon onClick={ this.zoomOnColored} glyph='zoom-in'/>
                    </ToggleDisplay>
                    {' '}
                    <Glyphicon onClick={ () => {
                        this.network.fit({animation: true})
                    }} glyph='zoom-out'/>
                    {' '}
                    <Glyphicon onClick={ () => this.setState({showMap: !this.state.showMap})} glyph={toggleIcon}/>
                </span>
            </span>;
        return (
            <Panel collapsible expanded={this.state.showMap} header={header}>
                <div ref={(ref) => {
                    this.mapRef = ref;
                }}><p>Topology</p></div>
            </Panel>

        );

    }
}