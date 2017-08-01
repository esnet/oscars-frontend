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
    ListGroupItem,
    OverlayTrigger,
    Glyphicon,
    Popover
} from 'react-bootstrap';

import ToggleDisplay from 'react-toggle-display';
import transformer from '../lib/transform';


const modalName = 'editJunction';

@inject('designStore', 'controlsStore', 'mapStore', 'modalStore')
@observer
export default class EditJunctionModal extends Component {
    constructor(props) {
        super(props);
    }

    closeModal = () => {
        this.props.controlsStore.setParamsForEditJunction({
            showAddPipeButton: false
        });
        this.props.modalStore.closeModal(modalName);
    };


    deleteJunction = () => {
        let junction = this.props.controlsStore.editJunction.junction;

        this.props.designStore.deleteJunctionDeep(junction);

        this.props.mapStore.deleteColoredNode(junction);
        this.closeModal();
    };

    addPipe = () => {
        let editJunction = this.props.controlsStore.editJunction;
        let junction = editJunction.junction;
        let otherJunction = editJunction.otherJunction;

        if (otherJunction !== 'choose') {
            const pipeId = this.props.designStore.addPipe({
                a: junction,
                z: otherJunction
            });
            let pipe = this.props.designStore.findPipe(pipeId);
            let params = transformer.existingPipeToEditParams(pipe);

            this.props.controlsStore.mergeParamsForEditPipe(params);
            this.props.modalStore.openModal('editPipe');
        }
    };

    unconnectedJunctions() {
        let junction = this.props.controlsStore.editJunction.junction;
        let pipes = this.props.designStore.pipesConnectedTo(junction);
        let junctions = this.props.designStore.design.junctions;

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
        let showModal = this.props.modalStore.modals.get(modalName);

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

        let connectedPipes = this.props.designStore.pipesConnectedTo(junction);


        let helpPopover = <Popover id='help-junctionControls' title='Junction Controls'>
            <p>Here you can view a list of pipes connected to this junction. Click
                on one of them to open the form that edits the pipe parameters.</p>
            <p>If the design contains other junctions that could potentially be connected to this
                with a new pipe, a set of controls will appear allowing you to select the other end
                of the pipe. Click the "Add" button to add a new pipe.</p>
            <p>Finally, you may click the "Delete" button to remove this junction as
                well as all the fixtures belonging to it and pipes connecting to here. </p>
        </Popover>;

        let header = <p>Junction controls
            <OverlayTrigger trigger='click' rootClose placement='left' overlay={helpPopover}>
                <Glyphicon className='pull-right' glyph='question-sign'/>
            </OverlayTrigger>
        </p>;

        return (
            <Modal show={showModal} onHide={this.closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{junction}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Panel header={header}>
                        <ListGroup> {
                            connectedPipes.map((pipe) => {
                                return <ListGroupItem key={pipe.id + '-connected'} onClick={() => {
                                    this.props.controlsStore.setParamsForEditPipe({
                                        pipeId: pipe.id
                                    });
                                    this.props.modalStore.openModal('editPipe');
                                }}>Pipe: {pipe.a} -- {pipe.z}</ListGroupItem>
                            })
                        }
                        </ListGroup>
                        {' '}
                        <ToggleDisplay show={showAddPipeControls}>
                            <Form>
                                <FormGroup controlId="pipe">
                                    <ControlLabel>New pipe to:</ControlLabel>
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