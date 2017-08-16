import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {autorunAsync, toJS} from 'mobx';
import {Panel, Glyphicon, OverlayTrigger, Popover} from 'react-bootstrap';
import transformer from '../lib/transform';
import vis from 'vis';
import validator from '../lib/validation'


@inject('connsStore', 'modalStore')
@observer
export default class ConnectionDrawing extends Component {
    constructor(props) {
        super(props);

        let nodeDataset = new vis.DataSet();
        let edgeDataset = new vis.DataSet();
        this.datasource = {
            nodes: nodeDataset,
            edges: edgeDataset
        };
    }


    state = {
        showMap: true
    };

    onFixtureClicked = (fixture) => {
    };

    onJunctionClicked = (junction) => {
    };

    onPipeClicked = (pipe) => {
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

        this.network = new vis.Network(this.mapRef, this.datasource, options);

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
    // TODO: use a reaction and don't clear the whole graph, instead add/remove/update
    disposeOfMapUpdate = autorunAsync(() => {


        let design = this.props.connsStore.store.current.reserved.cmp;
        let junctions = toJS(design.junctions);
        let fixtures = toJS(design.fixtures);
        let pipes = toJS(design.pipes);


        this.datasource.nodes.clear();
        this.datasource.edges.clear();
        let nodes = [];
        let edges = [];


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
                id: f.portUrn,
                label: f.portUrn,
                size: 8,
                data: f,
                onClick: this.onFixtureClicked
            };
            nodes.push(fixtureNode);
            let edge = {
                id: f.portUrn,
                from: f.junction,
                to: f.portUrn,
                length: 3,
                width: 1.5,
                onClick: null
            };
            edges.push(edge);
        });
        pipes.map((p) => {
            let edge = {
                id: p.a + ' -- ' + p.z,
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
        let toggleIcon = this.state.showMap ? 'chevron-down' : 'chevron-right';


        let myHelp = <Popover id='help-connectionDrawing' title='Connection drawing'>
            <p>This drawing displays the fixtures, junctions and pipes of your connection.</p>
            <p>Fixtures are drawn as small circles. Junctions are represented by larger circles, and pipes
                are drawn as lines between junctions.</p>
            <p>Unlocked components are drawn in orange color .</p>
            <p>Zoom in and out by mouse-wheel, click and drag the background to pan, or click-and-drag a circle
                to temporarily reposition it.</p>
            <p>Click on any component to bring up its edit form. You may also click on the
                magnifying glass icon to the right to readjust the map, or the chevron icon
                to hide / show the map.</p>
        </Popover>;


        let header = <div>Connection drawing
            <div className='pull-right'>
                <OverlayTrigger trigger='click' rootClose placement='left' overlay={myHelp}>
                    <Glyphicon glyph='question-sign'/>
                </OverlayTrigger>
                {' '}
                <Glyphicon onClick={() => {
                    this.network.fit({animation: true})
                }} glyph='zoom-out'/>
                {' '}
                <Glyphicon onClick={() => this.setState({showMap: !this.state.showMap})} glyph={toggleIcon}/>
            </div>
        </div>;

        return (
            <Panel collapsible expanded={this.state.showMap} header={header}>
                <div ref={(ref) => {
                    this.mapRef = ref;
                }}><p>connection map</p></div>
            </Panel>

        );
    }
}