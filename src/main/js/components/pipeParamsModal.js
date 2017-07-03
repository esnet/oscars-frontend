import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {Modal, Button, FormControl, ControlLabel, FormGroup, Form, Checkbox} from 'react-bootstrap';


@inject('sandboxStore')
@observer
export default class PipeParamsModal extends Component {
    constructor(props) {
        super(props);
        this.closeModal = this.closeModal.bind(this);
        this.updatePipe = this.updatePipe.bind(this);
        this.deletePipe = this.deletePipe.bind(this);
        this.onAzBwChange =  this.onAzBwChange.bind(this);
        this.onZaBwChange =  this.onZaBwChange.bind(this);
        this.setSymmetrical = this.setSymmetrical.bind(this);

    }

    state = {
        symmetrical: false,
        disableZaBw: false,
        azBw: 0,
        zaBw: 0,
        modified: false
    };

    onAzBwChange(e) {
        if (this.state.symmetrical) {
            this.zabBwControl.value = e.target.value;
        }
        this.setState({
            modified: true,
            azBw: e.target.value
        });
    }


    onZaBwChange(e) {
        this.setState({
            modified: true,
            zaBw: e.target.value
        });
    }

    setSymmetrical(e) {
        let newSymmetrical = e.target.checked;

        if (newSymmetrical) {
            this.setState({
                zaBw: this.state.azBw
            });
            this.zabBwControl.value = this.state.azBw;
        }

        this.setState({
            modified: true,
            symmetrical: newSymmetrical,
            disableZaBw: newSymmetrical,
        });
    }

    deletePipe() {
        let pipe = this.props.pipe;
        this.props.sandboxStore.deletePipe(pipe.a, pipe.z);
        this.closeModal();
    }

    updatePipe() {
        let pipe = {
            a: this.props.pipe.a,
            z: this.props.pipe.z,
            azBw: this.state.azBw,
            zaBw: this.state.zaBw
        };
        this.setState({
            modified: false,
        });
        this.props.sandboxStore.updatePipe(pipe);
    }


    closeModal() {
        this.props.sandboxStore.closeModal('pipe');
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.pipe.azBw === nextProps.pipe.zaBw) {
            this.setState({
                symmetrical: true,
                disableZaBw: true,
                azBw: nextProps.pipe.azBw,
                zaBw: nextProps.pipe.zaBw
            });
        } else {
            this.setState({
                symmetrical: false,
                disableZaBw: false,
                azBw: nextProps.pipe.azBw,
                zaBw: nextProps.pipe.zaBw
            });
        }
    }


    render() {
        let showModal = this.props.sandboxStore.modals.get('pipe');
        let pipe = this.props.pipe;

        let buttons = null;
        if (this.state.modified) {
            buttons = <div>
                <Button bsStyle='primary' onClick={this.updatePipe}>Update</Button>
                {' '}
                <Button onClick={this.deletePipe}>Delete</Button>
            </div>;
        } else {
            buttons = <div>
                <Button onClick={this.deletePipe}>Delete</Button>
            </div>;
        }

        return (
            <div>
                <Modal bsSize='large' show={showModal} onHide={this.closeModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>edit a pipe</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <h3>A : {pipe.a}</h3>
                        <h3>Z : {pipe.z}</h3>
                        <Form >
                            <FormGroup>
                                <ControlLabel>Bandwidth A-Z:</ControlLabel>
                                <FormControl type="text" placeholder="0-100000"
                                             defaultValue={pipe.azBw}

                                             onChange={this.onAzBwChange}/>
                            </FormGroup>
                            <FormGroup>
                                <ControlLabel>Bandwidth Z-A:</ControlLabel>
                                <FormControl inputRef={ref => {
                                    this.zabBwControl = ref;
                                }}
                                             disabled={this.state.disableZaBw}
                                             onChange={this.onZaBwChange}
                                             defaultValue={pipe.zaBw}

                                             type="text" placeholder="0-10000"/>
                            </FormGroup>
                            <FormGroup controlId="symmetrical">
                                <Checkbox
                                    defaultChecked={this.state.symmetrical}
                                    onChange={this.setSymmetrical}>

                                    Symmetrical
                                </Checkbox>
                            </FormGroup>
                            {buttons}
                        </Form>

                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.closeModal}>Close</Button>
                    </Modal.Footer>
                </Modal>


            </div>
        );
    }
}