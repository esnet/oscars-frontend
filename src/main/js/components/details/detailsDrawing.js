import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {autorun, toJS} from 'mobx';
import {Card, CardBody, CardHeader, PopoverHeader, PopoverBody, Popover} from 'reactstrap';
import vis from 'vis';
import VisUtils from '../../lib/vis'
import FontAwesome from 'react-fontawesome';
import {size } from 'lodash-es';


@inject('connsStore', 'modalStore')
@observer
export default class DetailsDrawing extends Component {
    constructor(props) {
        super(props);

        let nodeDataset = new vis.DataSet();
        let edgeDataset = new vis.DataSet();
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
        let options = {
            height: '300px',
            interaction: {
                hover: false,
                navigationButtons: false,
                zoomView: true,
                dragView: true
            },
            physics: {
                solver: 'forceAtlas2Based',
                stabilization: {
                    fit: true
                }
            },
            nodes: {
                shape: 'dot',
                color: {background: 'white'}
            }
        };

        const schematicId = document.getElementById('schematicDrawing');

        this.network = new vis.Network(schematicId, this.datasource, options);

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

    componentWillMount() {

        this.setState({
            showMap: true,
            showHelp: false
        });
    }

    // this automagically updates the map;
    // TODO: maybe use a reaction and don't clear the whole graph, instead add/remove/update
    disposeOfMapUpdate = autorun(() => {


        let design = this.props.connsStore.store.current.archived.cmp;
        let junctions = toJS(design.junctions);
        let fixtures = toJS(design.fixtures);
        let pipes = toJS(design.pipes);


        let nodes = [];
        let edges = [];
        if (size(junctions) === 0) {
            return;
        }

        junctions.map((j) => {
            let junctionNode = {
                id: j.deviceUrn,
                label: j.deviceUrn,
                size: 20,
                data: j,
                onClick: this.onJunctionClicked
            };
            nodes.push(junctionNode);
        });
        fixtures.map((f) => {
            let fixtureNode = {
                id: f.portUrn + ':' + f.vlan.vlanId,
                label: f.portUrn + ':' + f.vlan.vlanId,
                size: 8,
                data: f,
                onClick: this.onFixtureClicked
            };
            nodes.push(fixtureNode);
            let edge = {
                id: f.portUrn + ':' + f.vlan.vlanId,
                from: f.junction,
                to: f.portUrn + ':' + f.vlan.vlanId,
                length: 3,
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
                        let zNode = {
                            id: z,
                            label: z,
                            onClick: null

                        };
                        nodes.push(zNode);
                    }
                    let edge = {
                        id: pipe_idx + ' : ' + b + ' --- ' + y,
                        from: a,
                        color: colors[pipe_idx],
                        to: z,
                        length: 3,
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

    }, {delay: 500});

    toggleHelp = () => {
        this.setState({
            showHelp: !this.state.showHelp
        });
    };

    render() {
        const schHelp =
            <span className='pull-right'>
                <FontAwesome
                    onClick={this.toggleHelp}
                    className='pull-right'
                    name='question'
                    id='mapHelpIcon'
                />
                <Popover placement='right'
                         isOpen={this.state.showHelp}
                         target='mapHelpIcon'
                         toggle={this.toggleHelp}>
                    <PopoverHeader>Schematic help</PopoverHeader>
                    <PopoverBody>
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
                    </PopoverBody>
                </Popover>
        </span>;

        return (
            <Card>
                <CardHeader className='p-1'>
                    Schematic {schHelp}
                </CardHeader>
                <CardBody>
                    <div id='schematicDrawing'><p>connection map</p></div>
                    <p>In progress!</p>
                </CardBody>
            </Card>

        );
    }
}