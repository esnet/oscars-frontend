import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {Modal, Button, FormControl, ControlLabel, FormGroup, Form, ListGroup, ListGroupItem} from 'react-bootstrap';


@inject('sandboxStore')
@observer
export default class JunctionParamsModal extends Component {
    constructor(props) {
        super(props);
        this.closeModal = this.closeModal.bind(this);
        this.onAzBwChange = this.onAzBwChange.bind(this);
        this.onZaBwChange = this.onZaBwChange.bind(this);

    }

    onAzBwChange(e) {
        this.props.sandboxStore.selection.azBw = e.target.value;
    }

    onZaBwChange(e) {
        this.props.sandboxStore.selection.zaBw = e.target.value;
    }

    closeModal() {
        this.props.sandboxStore.closeModal('junction');
    }


    unconnectedJunctions() {
        let junction = this.props.junction;
        let pipes = this.props.sandboxStore.sandbox.pipes;
        let junctions = this.props.sandboxStore.sandbox.junctions;
        let unconnectedJunctions = [{
            label: 'Choose one..',
            id: -1
        }];
        junctions.map((j) => {
            if (j.id !== junction) {
                let foundPipeBetween = false;
                pipes.map((p) => {
                    if (p.a === j.id && p.z === junction || p.a === junction && p.z === j.id) {
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

    connectedPipes() {
        let junction = this.props.junction;
        let pipes = this.props.sandboxStore.sandbox.pipes;
        let connectedPipes = [];
        pipes.map((p) => {
            if (p.a === junction) {
                connectedPipes.push({
                    a: p.a,
                    z: p.z,
                    azBw: p.azBw,
                    zaBw: p.zaBw,
                })
            } else if (p.z === junction) {
                connectedPipes.push({
                    a: p.z,
                    z: p.a,
                    azBw: p.zaBw,
                    zaBw: p.azBw,
                })

            }
        });
        return connectedPipes;
    }

    render() {
        let junction = this.props.junction;
        let showModal = this.props.sandboxStore.modals.get('junction');
        let unconnectedJunctions = this.unconnectedJunctions();
        let pipeSelection = null;

        if (unconnectedJunctions.length > 1) {
            pipeSelection = <Form inline>
                <FormGroup controlId="pipe">
                    <ControlLabel>Pipe to:</ControlLabel>
                    {' '}
                    <FormControl componentClass="select" defaultValue='-1' onChange={(e) => {
                        this.props.sandboxStore.selection.otherJunction = e.target.value;
                    }}>
                        {
                            unconnectedJunctions.map((option, index) => {
                                return <option key={index} value={option.value}>{option.label}</option>
                            })
                        }
                    </FormControl>
                </FormGroup>
                {' '}
                <FormGroup controlId="a_z_bw">
                    <ControlLabel>Bandwidth:</ControlLabel>
                    <FormControl size='8' onChange={this.onAzBwChange}/>
                </FormGroup>
                {' '}
                <FormGroup controlId="z_a_bw">
                    <ControlLabel>BW (Z to A):</ControlLabel>
                    <FormControl size='8' onChange={this.onZaBwChange}/>
                </FormGroup>
                {' '}
                <Button onClick={() => {
                    if (this.props.sandboxStore.selection.otherJunction !== -1) {
                        let pipe = {
                            a: junction,
                            z: this.props.sandboxStore.selection.otherJunction,
                            azBw: this.props.sandboxStore.selection.azBw,
                            zaBw: this.props.sandboxStore.selection.zaBw
                        };
                        this.props.sandboxStore.addPipe(pipe);
                        this.closeModal();

                    }

                }}>Add</Button>

            </Form>
        }
        let pipeNodes =
            <ListGroup> {
                this.connectedPipes().map((p, index) => {

                    return(<ListGroupItem key={index}>{p.a} {p.azBw} / {p.zaBw} {p.z}</ListGroupItem>)
                })
            }
            </ListGroup>;

        return (
            <div>
                <Modal show={showModal} onHide={this.closeModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>{junction}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {pipeNodes}
                        {pipeSelection}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.closeModal}>Close</Button>
                    </Modal.Footer>
                </Modal>


            </div>
        );
    }
}