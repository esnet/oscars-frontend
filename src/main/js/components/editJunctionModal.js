import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {
    Modal,
    Button,
    Panel,
    FormControl,
    ControlLabel,
    FormGroup,
    Form,
    ListGroup,
    ListGroupItem
} from 'react-bootstrap';

import ToggleDisplay from 'react-toggle-display';

import picker from '../lib/picking';

const modalName = 'editJunction';

@inject('sandboxStore', 'controlsStore')
@observer
export default class EditJunctionModal extends Component {
    constructor(props) {
        super(props);
    }

    closeModal = () => {
        this.props.controlsStore.closeModal(modalName);
    };


    onAzBwChange = (e) => {
        this.props.controlsStore.setParamsForEditJunction({
            azBw: e.target.value
        });
    };

    onZaBwChange = (e) => {
        this.props.controlsStore.setParamsForEditJunction({
            zaBw: e.target.value
        });
    };

    deleteJunction = () => {
        let junction = this.props.controlsStore.editJunction.junction;
        let fixtureIds = this.props.sandboxStore.fixturesOf(junction);
        fixtureIds.map((id) => {
            let f = this.props.sandboxStore.findFixture(id);
            if (f.vlan !== null) {
                picker.releaseDeleted(f.port, f.vlan);
            }
        });

        this.props.sandboxStore.deleteJunctionDeep(junction);
        this.closeModal();
    };

    addPipe = () => {
        let editJunction = this.props.controlsStore.editJunction;
        let junction = editJunction.junction;
        let otherJunction = editJunction.otherJunction;

        if (otherJunction !== 'choose') {
            let pipe = {
                a: junction,
                z: otherJunction,
            };
            const pipeId = this.props.sandboxStore.addPipe(pipe);
            let bwUpdate = {
                azBw: editJunction.azBw,
                zaBw: editJunction.zaBw,
            };
            this.props.sandboxStore.updatePipe(pipeId, bwUpdate);

            this.props.controlsStore.setParamsForEditPipe({
                pipeId: pipe.id,
                a: pipe.a,
                z: pipe.z,
                azBw: editJunction.azBw,
                zaBw: editJunction.zaBw,
                showUpdateButton: false,
            });
            this.props.controlsStore.openModal('editPipe');
        }
    };

    unconnectedJunctions() {
        let junction = this.props.controlsStore.editJunction.junction;
        let pipes = this.props.sandboxStore.pipesConnectedTo(junction);
        let junctions = this.props.sandboxStore.sandbox.junctions;

        let unconnectedJunctions = [{
            label: 'Choose one..',
            value: 'choose'
        }];


        junctions.map((j) => {
            if (j.id !== junction) {
                let foundPipeBetween = false;
                pipes.map((p) => {
                    if (p.a === j.id || p.z === j.id) {
                        foundPipeBetween = true;
                    }
                });
                if (!foundPipeBetween) {
                    unconnectedJunctions.push({
                        label: j.id,
                        value: j.id
                    });
                }
            }
        });

        return unconnectedJunctions;
    }

    selectOtherJunction = (e) => {
        const otherJunction = e.target.value;
        let showAddPipe = otherJunction !== 'choose';

        this.props.controlsStore.setParamsForEditJunction({
            otherJunction: otherJunction,
            showAddPipeButton: showAddPipe
        });

    };

    render() {
        let editJunction = this.props.controlsStore.editJunction;

        let junction = editJunction.junction;
        let showModal = this.props.controlsStore.modals.get(modalName);

        let noPipesText = <div>No other junctions found that are not already connected. Can not add a new pipe from
            here.</div>;

        let addPipeButton = null;
        if (editJunction.showAddPipeButton) {
            addPipeButton = <Button bsStyle='primary' onClick={this.addPipe}>Add</Button>
        }

        let unconnectedJunctions = this.unconnectedJunctions();
        let showAddPipeControls = false;

        if (unconnectedJunctions.length > 1) {
            showAddPipeControls = true;
            noPipesText = null;
        }

        let connectedPipes = this.props.sandboxStore.pipesConnectedTo(junction);

        return (
            <Modal show={showModal} onHide={this.closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{junction}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Panel>
                        <ListGroup> {
                            connectedPipes.map((pipe) => {
                                return <ListGroupItem key={pipe.id} onClick={() => {
                                    this.props.controlsStore.setParamsForEditPipe({
                                        pipeId: pipe.id
                                    });
                                    this.props.controlsStore.openModal('editPipe');
                                }}>{pipe.a} {pipe.azBw} / {pipe.zaBw} {pipe.z}</ListGroupItem>
                            })
                        }
                        </ListGroup>
                        {' '}
                        <ToggleDisplay show={showAddPipeControls}>
                            <Form>
                                <FormGroup controlId="pipe">
                                    <ControlLabel>Pipe to:</ControlLabel>
                                    {' '}
                                    <FormControl componentClass="select" defaultValue='choose'
                                                 onChange={this.selectOtherJunction}>
                                        {
                                            unconnectedJunctions.map((option, index) => {
                                                return <option key={index} value={option.value}>{option.label}</option>
                                            })
                                        }
                                    </FormControl>
                                </FormGroup>
                                {' '}
                                <FormGroup controlId="a_z_bw">
                                    <ControlLabel>Bandwidth (A to Z):</ControlLabel>
                                    <FormControl size='8' onChange={this.onAzBwChange}/>
                                </FormGroup>
                                {' '}
                                <FormGroup controlId="z_a_bw">
                                    <ControlLabel>Bandwidth (Z to A):</ControlLabel>
                                    <FormControl size='8' onChange={this.onZaBwChange}/>
                                </FormGroup>
                                {' '}
                                {addPipeButton}

                            </Form>
                        </ToggleDisplay>

                        {noPipesText}

                        <Button bsStyle='warning' className='pull-right' onClick={this.deleteJunction}>Delete
                            junction</Button>
                    </Panel>

                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.closeModal}>Close</Button>
                </Modal.Footer>
            </Modal>


        );
    }
}