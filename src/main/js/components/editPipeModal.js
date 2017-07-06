import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {Modal, Button, FormControl, ControlLabel, FormGroup, Form, Panel} from 'react-bootstrap';
import ToggleDisplay from 'react-toggle-display';

const modalName = 'editPipe';

@inject('sandboxStore', 'controlsStore')
@observer
export default class PipeParamsModal extends Component {
    constructor(props) {
        super(props);
    }


    onAzBwChange = (e) => {
        let newAzBw = e.target.value;
        this.props.controlsStore.setParamsForEditPipe({
            azBw: newAzBw,
            showUpdateButton: true
        });
    };


    onZaBwChange = (e) => {
        let newZaBw = e.target.value;
        this.props.controlsStore.setParamsForEditPipe({
            zaBw: newZaBw,
            showUpdateButton: true
        });
    };

    deletePipe = () => {
        let pipeId = this.props.controlsStore.editPipe.pipeId;
        this.props.sandboxStore.deletePipe(pipeId);
        this.closeModal();
    };

    updatePipe = () => {
        let editPipe = this.props.controlsStore.editPipe;
        let params = {
            azBw: editPipe.azBw,
            zaBw: editPipe.zaBw
        };
        let pipeId = editPipe.pipeId;
        this.props.sandboxStore.updatePipe(pipeId, params);
        this.props.controlsStore.setParamsForEditPipe({
            showUpdateButton: false
        });
    };

    closeModal = () => {
        this.props.controlsStore.closeModal(modalName);
    };

    render() {
        let editPipe = this.props.controlsStore.editPipe;
        let showModal = this.props.controlsStore.modals.get(modalName);
        let pipe = this.props.sandboxStore.findPipe(editPipe.pipeId);


        let pipeExists = false;
        let header = <span>Pipe bandwidth</span>;
        if (pipe !== null) {
            pipeExists = true;
            header = <span>{pipe.a} - {pipe.z} bandwidth</span>;
        }

        return (
            <div>
                <Modal bsSize='large' show={showModal} onHide={this.closeModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Editing pipe</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <ToggleDisplay show={pipeExists}>
                            <Panel header={header}>
                                <Form inline>
                                    <FormGroup>
                                        <ControlLabel>A-Z:</ControlLabel>
                                        {' '}
                                        <FormControl type="text"
                                                     placeholder="0-100000"
                                                     defaultValue={editPipe.azBw}
                                                     onChange={this.onAzBwChange}/>
                                    </FormGroup>
                                    {' '}
                                    <FormGroup>
                                        <ControlLabel>Z-A:</ControlLabel>
                                        {' '}
                                        <FormControl onChange={this.onZaBwChange}
                                                     defaultValue={editPipe.zaBw}
                                                     type="text" placeholder="0-10000"/>
                                    </FormGroup>
                                    {' '}
                                </Form>
                                <div className='pull-right'>
                                    <ToggleDisplay show={editPipe.showUpdateButton}>
                                        <Button bsStyle='primary' onClick={this.updatePipe}>Update</Button>
                                    </ToggleDisplay>
                                    {' '}
                                    <Button bsStyle='warning' onClick={this.deletePipe}>Delete</Button>
                                </div>
                            </Panel>
                        </ToggleDisplay>

                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.closeModal}>Close</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}