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
        this.addPipe = this.addPipe.bind(this);
        this.selectOtherJunction = this.selectOtherJunction.bind(this);

    }

    state = {
        showAddPipeButton: false,
        otherJunction: 'choose',
        azBw: 0,
        zaBw: 0
    };

    onAzBwChange(e) {
        this.setState({
            azBw: e.target.value
        });
    }

    onZaBwChange(e) {
        this.setState({
            zaBw: e.target.value
        });
    }

    closeModal() {
        this.props.sandboxStore.closeModal('junction');
    }

    addPipe() {
        let junction = this.props.junction;
        if (this.state.otherJunction !== 'choose') {
            let pipe = {
                a: junction,
                z: this.state.otherJunction,
                azBw: this.state.azBw,
                zaBw: this.state.zaBw
            };
            console.log(pipe);
            this.props.sandboxStore.addPipe(pipe);
            this.props.setPipe(pipe);
            this.closeModal();
            this.props.sandboxStore.openModal('pipe');
        }
    }

    unconnectedJunctions() {
        let junction = this.props.junction;
        let pipes = this.props.sandboxStore.sandbox.pipes;
        let junctions = this.props.sandboxStore.sandbox.junctions;

        let unconnectedJunctions = [{
            label: 'Choose one..',
            value: 'choose'
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

    selectOtherJunction(e) {
        console.log(e.target.value);
        let showAddPipe = e.target.value !== 'choose';

        this.setState({
            otherJunction: e.target.value,
            showAddPipeButton: showAddPipe
        });
    }

    render() {
        let junction = this.props.junction;
        let showModal = this.props.sandboxStore.modals.get('junction');
        let unconnectedJunctions = this.unconnectedJunctions();
        let pipeSelection = null;
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

        let pipeItems = [];
        let pipes = this.connectedPipes();
        for (let index = 0; index < pipes.length; index++) {
            let p = pipes[index];
            pipeItems.push(
                <ListGroupItem key={index}>
                    <div>{p.a} {p.azBw} / {p.zaBw} {p.z}</div>
                    {' '}
                    <Button onClick={() => {
                        this.props.setPipe(p);
                        this.closeModal();
                        this.props.sandboxStore.openModal('pipe');
                    }}>Edit</Button>
            </ListGroupItem>)
        }
        let pipeList = <ListGroup> {pipeItems }</ListGroup>;

        return (
            <div>
                <Modal bsSize='large' show={showModal} onHide={this.closeModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>{junction}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {pipeList}
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