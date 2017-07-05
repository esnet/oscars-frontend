import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {autorunAsync} from 'mobx';
import vis from 'vis';


@inject('controlsStore', 'sandboxStore')
@observer
export default class SandboxMap extends Component {
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
        this.props.controlsStore.selectFixture(fixture);
        this.props.controlsStore.openModal('editFixture');
    };

    onJunctionClicked = (junction) => {
        this.props.controlsStore.selectJunction(junction.id);
        this.props.controlsStore.openModal('editJunction');
    };
    onPipeClicked = (pipe) => {
        this.props.controlsStore.selectPipe(pipe.id);
        this.props.controlsStore.openModal('editPipe');
    };


    updateMap = autorunAsync(() => {
        let options = {
            height: '350px',
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



        let network = new vis.Network(this.mapRef, this.datasource, options);

        network.on('dragEnd', (params) => {
            if (params.nodes.length > 0) {
                let nodeId = params.nodes[0];
                this.datasource.nodes.update({id: nodeId, fixed: {x: true, y: true}});
            }
        });

        network.on('dragStart', (params) => {
            if (params.nodes.length > 0) {
                let nodeId = params.nodes[0];
                this.datasource.nodes.update({id: nodeId, fixed: {x: false, y: false}});
            }
        });
        network.on('click', (params) => {
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

        let { sandbox } = this.props.sandboxStore;
        let junctions = sandbox.junctions;
        let fixtures = sandbox.fixtures;
        let pipes = sandbox.pipes;

        this.datasource.nodes.clear();
        this.datasource.edges.clear();
        let nodes = [];
        let edges = [];


        junctions.map((j) => {
            let junctionNode = {
                id: j.id,
                label: j.id,
                size: 20,
                data: j,
                onClick: this.onJunctionClicked
            };
            nodes.push(junctionNode);
        });
        fixtures.map((f) => {
            let fixtureNode = {
                id: f.id,
                label: f.label,
                size: 8,
                data: f,
                onClick: this.onFixtureClicked
            };
            nodes.push(fixtureNode);
            let edge = {
                id: f.device+' --- '+f.id,
                from: f.device,
                to: f.id,
                length: 3,
                width: 1.5,
                onClick: null
            };
            edges.push(edge);
        });
        pipes.map((p) => {
            let edge = {
                id: p.id,
                from: p.a,
                to: p.z,
                length: 10,
                width: 5,
                data: p,
                onClick: this.onPipeClicked

            };
            edges.push(edge);

        });
        this.datasource.edges.add(edges);
        this.datasource.nodes.add(nodes);

    }, 500);


    render() {


        return (
            <div ref={(ref) => { this.mapRef = ref; }}><p>sandbox map</p></div>
        );
    }
}