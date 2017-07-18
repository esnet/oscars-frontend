import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {autorunAsync, toJS} from 'mobx';
import {Panel, Glyphicon, OverlayTrigger, Popover} from 'react-bootstrap';
import transformer from '../lib/transform';
import vis from 'vis';
import validator from '../lib/validation'


@inject('controlsStore', 'designStore')
@observer
export default class DesignDrawing extends Component {
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
        const params = transformer.existingFixtureToEditParams(fixture);
        this.props.controlsStore.setParamsForEditFixture(params);
        this.props.controlsStore.openModal('editFixture');
    };

    onJunctionClicked = (junction) => {
        this.props.controlsStore.setParamsForEditJunction({junction: junction.id});
        this.props.controlsStore.openModal('editJunction');
    };

    onPipeClicked = (pipe) => {
        const params = transformer.existingPipeToEditParams(pipe);
        this.props.controlsStore.setParamsForEditPipe(params);
        this.props.controlsStore.openModal('editPipe');
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


        let {design} = this.props.designStore;
        let junctions = toJS(design.junctions);
        let fixtures = toJS(design.fixtures);
        let pipes = toJS(design.pipes);


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
                color: {'background': validator.fixtureMapColor(f)},
                data: f,
                onClick: this.onFixtureClicked
            };
            nodes.push(fixtureNode);
            let edge = {
                id: f.device + ' --- ' + f.id,
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
                color: validator.pipeMapColor(p),

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


        let myHelp = <Popover id='help-designMap' title='Help'>
            This drawing will auto-update to reflect changes to
            the design components as they are added, deleted, or updated.
            Junctions are represented by larger circles, and pipes
            are drawn as lines between junctions. Fixtures are drawn as smaller circles.
            Any component drawn in orange color needs attention from the user.
            Click on any component to bring up its edit form. You may also click on the
            magnifying glass icon to the right to readjust the map, or the chevron icon
            to hide / show the map.

        </Popover>;


        let header = <div>Design drawing
            <div className='pull-right'>
                <OverlayTrigger trigger='click' rootClose placement='left' overlay={myHelp}>
                    <Glyphicon glyph='question-sign'/>
                </OverlayTrigger>
                {' '}
                <Glyphicon onClick={ () => {
                    this.network.fit({animation: true})
                }} glyph='zoom-out'/>
                {' '}
                <Glyphicon onClick={ () => this.setState({showMap: !this.state.showMap})} glyph={toggleIcon}/>
            </div>
        </div>;

        return (
            <Panel collapsible expanded={this.state.showMap} header={header}>
                <div ref={(ref) => {
                    this.mapRef = ref;
                }}><p>design map</p></div>
            </Panel>

        );
    }
}