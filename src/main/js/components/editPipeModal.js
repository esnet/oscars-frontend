import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {Modal, Button, FormControl, ControlLabel, FormGroup, Form,
    Label, Panel, OverlayTrigger, Glyphicon, Popover} from 'react-bootstrap';
import ToggleDisplay from 'react-toggle-display';

const modalName = 'editPipe';

@inject('designStore', 'controlsStore')
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
        this.props.designStore.deletePipe(pipeId);
        this.closeModal();
    };

    updatePipe = () => {
        let editPipe = this.props.controlsStore.editPipe;
        let params = {
            azBw: editPipe.azBw,
            zaBw: editPipe.zaBw
        };
        let pipeId = editPipe.pipeId;
        this.props.designStore.updatePipe(pipeId, params);
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
        let pipe = this.props.designStore.findPipe(editPipe.pipeId);


        let pipeExists = false;
        let showWarning = false;
        let pipeTitle = '';
        let zaLabel = '';
        let azLabel = '';
        if (pipe !== null) {
            pipeExists = true;
            showWarning = !pipe.bwPreviouslySet;
            pipeTitle = <span>{pipe.a} - {pipe.z}</span>;
            azLabel = 'From ' + pipe.a + ' to ' + pipe.z;
            zaLabel = 'From ' + pipe.z + ' to ' + pipe.a;
        }


        let helpPopover = <Popover id='help-pipeControls' title='Pipe controls'>
            <p>Here you can edit the pipe parameters. Every pipe in a design
                must have locked in A-Z and Z-A bandwidth quantities.</p>
            <p>Use the textboxes to input the bandwidth you want, and click "Set" to lock
                the values in.</p>
            <p>Alternatively, you may click the "Delete" button to remove this pipe from the design.</p>
        </Popover>;


        let header = <p>Pipe controls for {pipeTitle}
            <OverlayTrigger trigger='click' rootClose placement='left' overlay={helpPopover}>
                <Glyphicon className='pull-right' glyph='question-sign'/>
            </OverlayTrigger>
        </p>;


        return (
            <Modal show={showModal} onHide={this.closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Editing pipe</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ToggleDisplay show={pipeExists}>
                        <Panel header={header}>
                            <ToggleDisplay show={showWarning}>
                                <h3><Label bsStyle='warning'>Bandwidth not set!</Label></h3>
                            </ToggleDisplay>

                            <Form>
                                <FormGroup>
                                    <ControlLabel>{azLabel}</ControlLabel>
                                    {' '}
                                    <FormControl type="text"
                                                 placeholder="0-100000"
                                                 defaultValue={editPipe.azBw}
                                                 onChange={this.onAzBwChange}/>
                                </FormGroup>
                                {' '}
                                <FormGroup>
                                    <ControlLabel>{zaLabel}</ControlLabel>
                                    {' '}
                                    <FormControl onChange={this.onZaBwChange}
                                                 defaultValue={editPipe.zaBw}
                                                 type="text" placeholder="0-10000"/>
                                </FormGroup>
                                {' '}
                            </Form>
                            <div className='pull-right'>
                                <ToggleDisplay show={editPipe.showUpdateButton}>
                                    <Button bsStyle='primary' onClick={this.updatePipe}>Set</Button>
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
        );
    }
}