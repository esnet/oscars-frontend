import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {Modal, Button, FormControl, ControlLabel, FormGroup, Form, Panel} from 'react-bootstrap';

const modalName = 'editPipe';

@inject('sandboxStore', 'controlsStore')
@observer
export default class PipeParamsModal extends Component {
    constructor(props) {
        super(props);

    }

    state = {
        modified: false
    };

    updateControls(params) {
        this.zaBwControl.value = params.zaBw;
        this.azBwControl.value = params.azBw;
        this.props.controlsStore.setAzBw(params.azBw);
        this.props.controlsStore.setZaBw(params.zaBw);
    }

    onAzBwChange = (e) => {
        let newAzBw = e.target.value;
        let params = {
            azBw: newAzBw,
            zaBw: this.props.controlsStore.selection.zaBw,
        };
        this.setState({modified: true});
        this.updateControls(params);
    };


    onZaBwChange = (e) => {
        let newZaBw = e.target.value;
        let params = {
            zaBw: newZaBw,
            azBw: this.props.controlsStore.selection.azBw,
        };
        this.setState({modified: true});
        this.updateControls(params);
    };

    deletePipe = () => {
        let pipeId = this.props.controlsStore.selection.pipe;
        this.props.sandboxStore.deletePipe(pipeId);
        this.closeModal();
    };

    updatePipe = () => {
        let selection = this.props.controlsStore.selection;
        let params = {
            azBw: selection.azBw,
            zaBw: selection.zaBw
        };
        let pipeId = selection.pipe;
        this.props.sandboxStore.updatePipe(pipeId, params);
        this.setState({
            modified: false,
        });
    };

    closeModal = () => {
        this.props.controlsStore.closeModal(modalName);
    };


    render() {
        let selection = this.props.controlsStore.selection;
        let showModal = this.props.controlsStore.modals.get(modalName);
        let pipe = this.props.sandboxStore.findPipe(selection.pipe);

        let update = null;
        if (this.state.modified) {
            update = <Button bsStyle='primary' onClick={this.updatePipe}>Update</Button>;
        }

        let buttons = <div className='pull-right'>
            {update}
            {' '}
            <Button bsStyle='warning' onClick={this.deletePipe}>Delete</Button>
        </div>;

        let body = <div>No pipe found!</div>;
        if (pipe !== null) {
            let header = <span>Pipe bandwidth</span>;
            body = <div>
                <h3>A : {pipe.a}</h3>
                <h3>Z : {pipe.z}</h3>

                <Panel header={header}>
                    <Form inline>
                        <FormGroup>
                            <ControlLabel>A-Z:</ControlLabel>
                            {' '}
                            <FormControl type="text" placeholder="0-100000"
                                         inputRef={ref => {
                                             this.azBwControl = ref;
                                         }}
                                         defaultValue={selection.azBw}

                                         onChange={this.onAzBwChange}/>
                        </FormGroup>
                        {' '}
                        <FormGroup>
                            <ControlLabel>Z-A:</ControlLabel>
                            {' '}
                            <FormControl inputRef={ref => {
                                this.zaBwControl = ref;
                            }}
                                         onChange={this.onZaBwChange}
                                         defaultValue={selection.zaBw}
                                         type="text" placeholder="0-10000"/>
                        </FormGroup>
                        {' '}
                    </Form>
                    {buttons}
                </Panel>

            </div>
        }

        return (
            <div>
                <Modal bsSize='large' show={showModal} onHide={this.closeModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Editing pipe</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {body}

                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.closeModal}>Close</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}