import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import vis from 'vis';


@inject('sandboxStore')
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

    onFixtureClicked = (id) => {
        this.props.sandboxStore.selectFixture(id, true);
    };


    componentDidMount() {
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
                this.datasource.nodes.get(nodeId).onClick(nodeId);
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


    render() {

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
                onClick: this.props.onJunctionClicked
            };
            nodes.push(junctionNode);
        });
        fixtures.map((f) => {
            let fixtureNode = {
                id: f.id,
                label: f.id,
                size: 8,
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
                id: p.a+' --- '+p.z,
                from: p.a,
                to: p.z,
                length: 10,
                width: 5,
                data: p,
                onClick: this.props.onPipeClicked

            };
            edges.push(edge);

        });
        this.datasource.edges.add(edges);
        this.datasource.nodes.add(nodes);

        return (
            <div ref={(ref) => { this.mapRef = ref; }}><p>sandbox map</p></div>
        );
    }
}