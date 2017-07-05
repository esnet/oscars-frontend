import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {Modal, Button, Panel, FormControl, ControlLabel, FormGroup, Form, ListGroup, ListGroupItem} from 'react-bootstrap';

const modalName = 'editJunction';

@inject('sandboxStore', 'controlsStore')
@observer
export default class EditJunctionModal extends Component {
    constructor(props) {
        super(props);
    }

    state = {
        showAddPipeButton: false,
        otherJunction: 'choose',
    };

    closeModal = () => {
        this.props.controlsStore.closeModal(modalName);
    };


    onAzBwChange =(e) => {
        this.props.controlsStore.setAzBw(e.target.value);
    };

    onZaBwChange = (e) => {
        this.props.controlsStore.setZaBw(e.target.value);
    };

    deleteJunction = () => {
        let junction = this.props.controlsStore.selection.junction;

        this.props.sandboxStore.deleteJunctionDeep(junction);
        this.closeModal();
    };


    addPipe = () => {
        let junction = this.props.controlsStore.selection.junction;

        if (this.state.otherJunction !== 'choose') {
            let pipe = {
                a: junction,
                z: this.state.otherJunction,
                azBw: this.props.controlsStore.selection.azBw,
                zaBw: this.props.controlsStore.selection.zaBw
            };
            console.log(pipe);
            this.props.sandboxStore.addPipe(pipe);
            this.props.controlsStore.selectPipe(pipe.id);
            this.props.controlsStore.openModal('editPipe');
        }
    };

    unconnectedJunctions() {
        let junction = this.props.controlsStore.selection.junction;
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

        this.setState({
            otherJunction: otherJunction,
            showAddPipeButton: showAddPipe
        });
    };

    render() {

        let junction = this.props.controlsStore.selection.junction;
        let showModal = this.props.controlsStore.modals.get(modalName);

        let unconnectedJunctions = this.unconnectedJunctions();
        let pipeSelection = <div>No other junctions found that are not already connected. Can not add a new pipe from here.</div>;
        let addPipeButton = null;

        if (this.state.showAddPipeButton) {
            addPipeButton = <Button bsStyle='primary' onClick={this.addPipe}>Add</Button>
        }

        if (unconnectedJunctions.length > 1) {
            pipeSelection = <Form inline>
                <FormGroup controlId="pipe">
                    <ControlLabel>Pipe to:</ControlLabel>
                    {' '}
                    <FormControl componentClass="select" defaultValue='choose' onChange={this.selectOtherJunction}>
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
        }

        let connectedPipes = this.props.sandboxStore.pipesConnectedTo(junction);

        let pipeNodes = <ListGroup> {
            connectedPipes.map((pipe) => {
                return <ListGroupItem key={pipe.id} onClick={() => {
                    this.props.controlsStore.selectPipe(pipe.id);
                    this.props.controlsStore.openModal('editPipe');
                }}>{pipe.a} {pipe.azBw} / {pipe.zaBw} {pipe.z}</ListGroupItem>
            })
        }
        </ListGroup>;


        return (
            <div>
                <Modal bsSize='large' show={showModal} onHide={this.closeModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>{junction}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Panel>
                        {pipeNodes}
                        {pipeSelection}
                        <Button bsStyle='warning' className='pull-right' onClick={this.deleteJunction}>Delete junction</Button>
                        </Panel>

                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.closeModal}>Close</Button>
                    </Modal.Footer>
                </Modal>


            </div>
        );
    }
}