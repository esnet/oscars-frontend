import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {autorun, toJS} from 'mobx';
import {Card, CardBody, CardHeader} from 'reactstrap';
import {DataSet, Network} from 'vis/dist/vis-network.min.js';
import VisUtils from '../../lib/vis'
import HelpPopover from '../helpPopover';
import {size } from 'lodash-es';


@inject('connsStore', 'modalStore', 'mapStore')
@observer
export default class DetailsDrawing extends Component {
    constructor(props) {
        super(props);

        let nodeDataset = new DataSet();
        let edgeDataset = new DataSet();
        this.datasource = {
            nodes: nodeDataset,
            edges: edgeDataset
        };
    }



    onFixtureClicked = (fixture) => {
        this.props.connsStore.setSelected({
            type: 'fixture',
            data: fixture
        });
    };

    onJunctionClicked = (junction) => {
        this.props.connsStore.setSelected({
            type: 'junction',
            data: junction
        });
    };

    onPipeClicked = (pipe) => {
        this.props.connsStore.setSelected({
            type: 'pipe',
            data: pipe,
        });
    };

    componentDidMount() {
        if (size(this.props.mapStore.positions) === 0) {
            this.props.mapStore.loadPositions()
        }
        let options = {
            height: '300px',
            interaction: {
                hover: false,
                navigationButtons: false,
                zoomView: true,
                dragView: true
            },
            physics: {
                solver: 'barnesHut',
                stabilization: {
                    fit: true
                },
                barnesHut: {
                    centralGravity: 0.5
                }
            },
            nodes: {
                shape: 'dot',
                color: {background: 'white'}
            }
        };

        const schematicId = document.getElementById('schematicDrawing');

        this.network = new Network(schematicId, this.datasource, options);

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
        this.network.on('click', (params) => {
            if (params.nodes.length > 0) {
                let nodeId = params.nodes[0];
                let nodeEntry = this.datasource.nodes.get(nodeId);
                if (nodeEntry.onClick !== null) {
                    nodeEntry.onClick(nodeEntry.data);
                }

            }
            if (params.edges.length > 0) {
                let edgeId = params.edges[0];
                let edgeEntry = this.datasource.edges.get(edgeId);

                if (edgeEntry.onClick !== null) {
                    edgeEntry.onClick(edgeEntry.data);
                }
            }
        });
    }

    componentWillUnmount() {
        this.disposeOfMapUpdate();
    }

    // this automagically updates the map;
    // TODO: maybe use a reaction and don't clear the whole graph, instead add/remove/update
    disposeOfMapUpdate = autorun(() => {


        let design = this.props.connsStore.store.current.archived.cmp;
        let junctions = toJS(design.junctions);
        let fixtures = toJS(design.fixtures);
        let pipes = toJS(design.pipes);
        let positions = this.props.mapStore.positions;


        let nodes = [];
        let edges = [];
        if (size(junctions) === 0) {
            return;
        }

        junctions.map((j) => {
            let x = this.props.mapStore.positions[j.deviceUrn].x;
            let y = this.props.mapStore.positions[j.deviceUrn].y;
            let junctionNode = {
                id: j.deviceUrn,
                label: j.deviceUrn,
                size: 20,
                data: j,
                physics: false,
                fixed: {x: true, y: true},
                x: x,
                y: y,
                onClick: this.onJunctionClicked
            };
            nodes.push(junctionNode);
        });
        fixtures.map((f) => {

            let fixtureNode = {
                id: f.portUrn + ':' + f.vlan.vlanId,
                label: f.portUrn + ':' + f.vlan.vlanId,
                x: positions[f.junction].x + 10,
                shape: 'hexagon',
                size: 8,
                data: f,

                onClick: this.onFixtureClicked
            };
            nodes.push(fixtureNode);
            let edge = {
                id: f.portUrn + ':' + f.vlan.vlanId,
                from: f.junction,
                to: f.portUrn + ':' + f.vlan.vlanId,
                length: 2,
                width: 1.5,
                onClick: null
            };
            edges.push(edge);
        });
        if (typeof pipes !== 'undefined') {
            const colors = ['red', 'blue', 'green', 'orange', 'cyan', 'brown', 'pink'];

            pipes.map((p, pipe_idx) => {
                let i = 0;
                while (i < p.azERO.length - 1) {
                    let a = p.azERO[i]['urn'];
                    let b = p.azERO[i + 1]['urn'];
                    let y = p.azERO[i + 2]['urn'];
                    let z = p.azERO[i + 3]['urn'];

                    let foundZ = false;
                    nodes.map((node) => {
                        if (node.id === z) {
                            foundZ = true;
                        }
                    });
                    if (!foundZ) {
                        let x = this.props.mapStore.positions[z].x;
                        let y = this.props.mapStore.positions[z].y;
                        let zNode = {
                            id: z,
                            label: z,
                            shape: 'diamond',
                            onClick: null,
                            fixed: {x: true, y: true},
                            x: x,
                            y: y,

                        };
                        nodes.push(zNode);
                    }
                    let edge = {
                        id: pipe_idx + ' : ' + b + ' --- ' + y,
                        from: a,
                        color: colors[pipe_idx],
                        to: z,
                        width: 1.5,
                        onClick: null
                    };
                    edges.push(edge);


                    i = i + 3;
                }

            });
        }
        VisUtils.mergeItems(nodes, this.datasource.nodes);
        this.datasource.edges.clear();

        this.datasource.edges.add(edges);
        this.network.fit({animation: false})


    }, {delay: 5000});


    render() {
        const helpHeader = <span>Schematic help</span>;
        const helpBody = <span>
            <p>This schematic displays the fixtures, junctions and pipes of your connection.</p>
            <p>Fixtures are drawn as small circles. Junctions are represented by larger circles, and pipes
                are drawn as lines between junctions.</p>
            <p>Zoom in and out by mouse-wheel, click and drag the background to pan, or click-and-drag a circle
                to temporarily reposition it.</p>
            <p>Click on any component to bring up information about it. You may also click on the
                magnifying glass icon to the right to ¬auto-zoom the map to fit in the displayed window, or the chevron
                icon
                to hide / show the map.</p>
            <p>Left click and hold to pan, use mouse wheel to zoom in / out. </p>
        </span>;

        const help = <span className='float-right'>
            <HelpPopover header={helpHeader} body={helpBody} placement='right' popoverId='ddHelp'/>
        </span>;


        return (
            <Card>
                <CardHeader className='p-1'>
                    Schematic {' '} {help}
                </CardHeader>
                <CardBody>
                    <div id='schematicDrawing'><p>connection map</p></div>
                    <p>In progress!</p>
                </CardBody>
            </Card>

        );
    }
}