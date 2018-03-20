import React, {Component} from 'react';
import vis from 'vis';
import {inject, observer} from 'mobx-react';
import {autorun, toJS, action} from 'mobx';
import ToggleDisplay from 'react-toggle-display';

require('vis/dist/vis-network.min.css');
require('vis/dist/vis.css');
import FontAwesome from 'react-fontawesome';

import {
    Card, CardHeader, CardBody,
    Popover, PopoverHeader, PopoverBody
} from 'reactstrap';

import myClient from '../agents/client';
import PropTypes from 'prop-types';

@inject('mapStore')
@observer
export default class NetworkMap extends Component {
    constructor(props) {
        super(props);
    }


    // this automagically updates the map;
    disposeOfMapUpdate = autorun(() => {

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
                navigationButtons: true,
                keyboard: true,
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
        const mapId = document.getElementById(this.props.mapDivId);

        if (this.props.mapStore.network.initialized) {
            this.network = new vis.Network(mapId, this.datasource, options);
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


    }, {delay: 500});


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

    componentWillMount() {
        this.setState({
            showHelp: false
        });
    }

    componentDidMount() {

        myClient.loadJSON({method: 'GET', url: '/api/map'})
            .then(action((response) => {
                let topology = JSON.parse(response);
                this.props.mapStore.setNetwork(topology.nodes, topology.edges);
            }));

    }

    toggleHelp = () => {
        this.setState({showHelp: !this.state.showHelp});
    };

    render() {


        return (
            <Card>
                <CardHeader className='p-1'>
                    Network Map
                    <span className='pull-right'>

                        <ToggleDisplay show={this.props.mapStore.network.coloredNodes.length > 0}>
                            <FontAwesome onClick={this.zoomOnColored} name='search-plus'/>
                        </ToggleDisplay>
                        {' '}

                        <FontAwesome onClick={() => {
                            this.network.fit({animation: true})
                        }} name='search-minus'/>
                        {' '}

                        <FontAwesome onClick={this.toggleHelp}
                                     name='question'
                                     id='mapHelpIcon' />

                        <Popover placement='left'
                                 isOpen={this.state.showHelp}
                                 target='mapHelpIcon'
                                 toggle={this.toggleHelp}>
                            <PopoverHeader>Map help</PopoverHeader>
                            <PopoverBody>
                                <p>This is the map of the entire network managed by OSCARS. Devices are represented
                                    by circles, and links between them by lines.
                                </p>
                                <p>The primary action is to click on a device to bring up a list of its ports that can be added as a
                                    fixture.</p>
                                <p>Zoom in and out by mouse-wheel, click and drag the background to pan,
                                    or click-and-drag a node to temporarily reposition.
                                </p>
                                <p>You may also click on the (-) magnifying glass icon to
                                    adjust the map to fit the entire network. The (+) magnifying
                                    glass will zoom to fit all the selected junctions. Click the chevron icon
                                    to hide / show the map.</p>
                            </PopoverBody>
                        </Popover>

                    </span>

                </CardHeader>
                <CardBody>
                    <div id={this.props.mapDivId}>
                        <p> Network Map</p>
                    </div>
                </CardBody>

            </Card>

        );

    }
}

NetworkMap.propTypes = {
    mapDivId: PropTypes.string.isRequired,
    selectDevice: PropTypes.func.isRequired

};