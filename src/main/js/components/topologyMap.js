import React, {Component} from 'react';
import vis from 'vis';
import {inject, observer} from 'mobx-react';
import {autorun, autorunAsync, whyRun, toJS, action} from 'mobx';

import {Panel, Glyphicon} from 'react-bootstrap';

import myClient from '../agents/client';

@inject('controlsStore', 'mapStore')
@observer
export default class TopologyMap extends Component {
    constructor(props) {
        super(props);
    }

    state = {
        showMap: true
    };

    selectDevice = (device) => {
        this.props.controlsStore.setParamsForAddFixture({device: device});
        this.props.controlsStore.openModal('addFixture');
    };


    bestFit(network, nodes) {

        console.log('bestfit');
        network.moveTo({scale: 10, animation: true});
        network.stopSimulation();

        let bigBB = {top: Infinity, left: Infinity, right: -Infinity, bottom: -Infinity};
        nodes.map((i) => {
            let bb = network.getBoundingBox(i);
            if (bb.top < bigBB.top) bigBB.top = bb.top;
            if (bb.left < bigBB.left) bigBB.left = bb.left;
            if (bb.right > bigBB.right) bigBB.right = bb.right;
            if (bb.bottom > bigBB.bottom) bigBB.bottom = bb.bottom;
        });

        let canvasWidth = network.canvas.body.container.clientWidth;
        let canvasHeight = network.canvas.body.container.clientHeight;

        let scaleX = canvasWidth / (bigBB.right - bigBB.left);
        let scaleY = canvasHeight / (bigBB.bottom - bigBB.top);
        let scale = scaleX;
        if (scale * (bigBB.bottom - bigBB.top) > canvasWidth) scale = scaleY;

        console.log(bigBB);
        console.log(scaleX + ' ' + scaleY + ' ' + scale);
        console.log(canvasWidth + ' ' + canvasHeight);

//        if (scale > 1) scale = 0.9 * scale;


        network.moveTo({
            scale: scale,
            position: {
                x: (bigBB.right + bigBB.left) / 2,
                y: (bigBB.bottom + bigBB.top) / 2
            },
            animation: true
        });
        console.log(network.getScale());


    }

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
                    this.selectDevice(nodeId);
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
        }


    }, 500);

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
                    <Glyphicon onClick={ () => {
                        this.network.fit()
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