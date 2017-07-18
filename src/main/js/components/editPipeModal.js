import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {
    Modal, Button, FormControl, ControlLabel, FormGroup, Form,
    Label, Panel, OverlayTrigger, Glyphicon, Popover, Row, Col,
    ListGroup, ListGroupItem
} from 'react-bootstrap';
import ToggleDisplay from 'react-toggle-display';
import EroTypeahead from './eroTypeahead';
import {whyRun} from 'mobx';

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
        });
    };


    onZaBwChange = (e) => {
        let newZaBw = e.target.value;
        this.props.controlsStore.setParamsForEditPipe({
            zaBw: newZaBw,
        });
    };

    deletePipe = () => {
        let pipeId = this.props.controlsStore.editPipe.pipeId;
        this.props.designStore.deletePipe(pipeId);
        this.closeModal();
    };

    unlockBw = () => {
        let editPipe = this.props.controlsStore.editPipe;
        let params = {
            bwPreviouslySet: false,
        };
        let pipeId = editPipe.pipeId;
        this.props.designStore.updatePipe(pipeId, params);
    };

    updatePipe = () => {
        let editPipe = this.props.controlsStore.editPipe;
        let params = {
            azBw: editPipe.azBw,
            zaBw: editPipe.zaBw,
            ero: editPipe.ero,
            bwPreviouslySet: true,
        };
        let pipeId = editPipe.pipeId;
        this.props.designStore.updatePipe(pipeId, params);
    };

    unlockEro = () => {
        this.props.controlsStore.setParamsForEditPipe({
            nextHopsOrigin: this.props.controlsStore.editPipe.a,
            lockedEro: false,
            ero: []
        });
    };

    lockEro = () => {
        this.props.controlsStore.setParamsForEditPipe({
            lockedEro: true,
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
        let pipeTitle = '';
        let zaLabel = '';
        let azLabel = '';
        let bwLocked = true;
        let eroLocked = editPipe.lockedEro;

        if (pipe !== null) {
            pipeExists = true;
            bwLocked = pipe.bwPreviouslySet;
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
                            <ToggleDisplay show={!bwLocked}>
                                <Row>
                                    <Col>
                                        <h3><Label bsStyle='warning'>Bandwidth not set!</Label></h3>
                                    </Col>
                                </Row>
                            </ToggleDisplay>
                            <Form>
                                <Row>
                                    <Col>
                                        <FormGroup>
                                            <ControlLabel>{azLabel}</ControlLabel>
                                            {' '}
                                            <FormControl type="text"
                                                         placeholder="0-100000"
                                                         defaultValue={editPipe.azBw}
                                                         disabled={bwLocked}
                                                         onChange={this.onAzBwChange}/>
                                        </FormGroup>
                                        {' '}
                                        <FormGroup>
                                            <ControlLabel>{zaLabel}</ControlLabel>
                                            {' '}
                                            <FormControl onChange={this.onZaBwChange}
                                                         disabled={bwLocked}
                                                         defaultValue={editPipe.zaBw}
                                                         type="text" placeholder="0-10000"/>
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <div className='pull-right'>
                                            <ToggleDisplay show={!bwLocked}>
                                                <Button className='pull-right' bsStyle='primary' onClick={this.updatePipe}>Lock bandwidth</Button>
                                            </ToggleDisplay>
                                            <ToggleDisplay show={bwLocked}>
                                                <Button className='pull-right' onClick={this.unlockBw} bsStyle='warning'>Unlock bandwidth</Button>
                                            </ToggleDisplay>
                                        </div>
                                    </Col>
                                </Row>



                                <Row>
                                    <Col>
                                        <h4>ERO</h4>
                                        <ListGroup>
                                            <ListGroupItem>{editPipe.a}</ListGroupItem>
                                            {
                                                editPipe.ero.map(urn => {
                                                    return <ListGroupItem key={urn}>{urn}</ListGroupItem>
                                                })
                                            }
                                            <ListGroupItem>{editPipe.z}</ListGroupItem>
                                        </ListGroup>
                                        <FormGroup>
                                            <ToggleDisplay show={!eroLocked}>
                                                <ControlLabel>Select next hop</ControlLabel>
                                                <EroTypeahead />
                                                <Button className='pull-right' onClick={this.lockEro}>Lock ERO</Button>
                                            </ToggleDisplay>
                                            <ToggleDisplay show={eroLocked}>
                                                <Button className='pull-right' onClick={this.unlockEro}>Unlock ERO</Button>
                                            </ToggleDisplay>
                                        </FormGroup>
                                    </Col>
                                </Row>
                                {' '}
                            </Form>
                            {' '}
                            <Row>
                                <Col>
                                    <Button bsStyle='warning' className='pull-right' onClick={this.deletePipe}>Delete pipe</Button>
                                </Col>
                            </Row>

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