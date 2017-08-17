import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {
    Modal, Button, FormControl, ControlLabel, FormGroup, Form,
    Well, Panel, OverlayTrigger, Glyphicon, Popover, Row, Col,
    ListGroup, ListGroupItem, HelpBlock
} from 'react-bootstrap';
import PropTypes from 'prop-types';

import ToggleDisplay from 'react-toggle-display';
import EroTypeahead from './eroTypeahead';
import {autorun, autorunAsync, whyRun, toJS} from 'mobx';


import myClient from '../agents/client';

const modalName = 'editPipe';

@inject('designStore', 'controlsStore', 'topologyStore', 'modalStore')
@observer
export default class PipeParamsModal extends Component {
    constructor(props) {
        super(props);
    }

    pathUpdateDispose = autorunAsync('pathUpdate', () => {
        let conn = this.props.controlsStore.connection;
        let ep = this.props.controlsStore.editPipe;

        let pipe = this.props.designStore.findPipe(ep.pipeId);

        let mode = ep.ero.mode;
        let modeNeedsPathUpdate = mode === 'shortest' || mode === 'fits';

        if (pipe === null || pipe.locked || !conn.schedule.locked || !modeNeedsPathUpdate) {
            return;
        }

        this.props.controlsStore.setParamsForEditPipe({
            loading: true,
            ero: {
                message: 'Updating path..',
                hops: []
            }
        });

        let params = {
            interval: {
                beginning: conn.schedule.start.at.getTime() / 1000,
                ending: conn.schedule.end.at.getTime() / 1000
            },
            a: ep.a,
            z: ep.z,
            azBw: ep.A_TO_Z.bw,
            zaBw: ep.Z_TO_A.bw,
        };


        myClient.loadJSON({method: 'POST', url: '/api/pce/paths', params})
            .then((response) => {
                let parsed = JSON.parse(response);

                let shortestEro = [];
                parsed['shortest']['azEro'].map((e) => {
                    shortestEro.push(e['urn']);
                });
                let fitsEro = [];
                parsed['fits']['azEro'].map((e) => {
                    fitsEro.push(e['urn']);
                });

                let params = {
                    loading: false,
                    fits: {
                        azAvailable: parsed.fits.azAvailable,
                        zaAvailable: parsed.fits.zaAvailable,
                        azBaseline: parsed.fits.azBaseline,
                        zaBaseline: parsed.fits.zaBaseline,
                        ero: shortestEro

                    },
                    shortest: {
                        azAvailable: parsed.shortest.azAvailable,
                        zaAvailable: parsed.shortest.zaAvailable,
                        azBaseline: parsed.shortest.azBaseline,
                        zaBaseline: parsed.shortest.zaBaseline,
                        ero: fitsEro
                    }
                };
                if (ep.ero.mode === 'shortest') {
                    params.ero = {
                        acceptable: true,
                        message: 'Shortest path:',
                        hops: shortestEro
                    };

                } else if (ep.ero.mode === 'fits') {
                    if (fitsEro.length === 0) {
                        params.ero = {
                            acceptable: false,
                            message: 'No path found!',
                            hops: []
                        };
                        params.fits = {
                            azAvailable: 0,
                            zaAvailable: 0,
                            azBaseline: 0,
                            zaBaseline: 0,
                            ero: []
                        }
                    } else {
                        params.ero = {
                            acceptable: true,
                            message: 'Fitting bandwidth:',
                            hops: fitsEro
                        };

                    }

                }
                this.props.controlsStore.setParamsForEditPipe(params);
            }).then(() => {
            this.validate();
        });

    }, 1000);


    validationDispose = autorunAsync('validation', () => {
        this.validate();

    }, 1000);

    validate() {

        const ep = this.props.controlsStore.editPipe;
        if (ep.loading) {
            return;
        }
        let azAvailable = 0;
        let zaAvailable = 0;
        let azBaseline = 0;
        let zaBaseline = 0;
        if (ep.ero.mode === 'shortest') {
            azAvailable = ep.shortest.azAvailable;
            zaAvailable = ep.shortest.zaAvailable;
            azBaseline = ep.shortest.azBaseline;
            zaBaseline = ep.shortest.zaBaseline;
        } else if (ep.ero.mode === 'fits') {
            azAvailable = ep.fits.azAvailable;
            zaAvailable = ep.fits.zaAvailable;
            azBaseline = ep.fits.azBaseline;
            zaBaseline = ep.fits.zaBaseline;
        } else {
            return;
        }

        let params = {
            A_TO_Z: {
                available: azAvailable,
                baseline: azBaseline,
            },
            Z_TO_A: {
                available: zaAvailable,
                baseline: zaBaseline,
            }
        };
        if (ep.A_TO_Z.bw > azAvailable) {

            params.A_TO_Z.validationText = 'Larger than available';
            params.A_TO_Z.validationState = 'error';
            params.A_TO_Z.acceptable = false;

        } else if (ep.A_TO_Z.bw > azBaseline) {
            params.A_TO_Z.validationText = 'Larger than baseline';
            params.A_TO_Z.validationState = 'error';
            params.A_TO_Z.acceptable = false;

        } else {
            params.A_TO_Z.validationText = '';
            params.A_TO_Z.validationState = 'success';
            params.A_TO_Z.acceptable = true;
        }
        if (ep.Z_TO_A.bw > zaAvailable) {
            params.Z_TO_A.validationText = 'Larger than available';
            params.Z_TO_A.validationState = 'error';
            params.Z_TO_A.acceptable = false;

        } else if (ep.A_TO_Z.bw > zaBaseline) {
            params.Z_TO_A.validationText = 'Larger than baseline';
            params.Z_TO_A.validationState = 'error';
            params.Z_TO_A.acceptable = false;

        } else {
            params.Z_TO_A.validationText = '';
            params.Z_TO_A.validationState = 'success';
            params.Z_TO_A.acceptable = true;
        }
        this.props.controlsStore.setParamsForEditPipe(params);

    }


    componentWillUnmount() {
        this.pathUpdateDispose();
        this.validationDispose();

    }


    onAzBwChange = (e) => {
        let newBw = e.target.value;


        if (isNaN(newBw) || e.target.value.length === 0) {
            this.props.controlsStore.setParamsForEditPipe({
                A_TO_Z: {
                    validationText: 'Not a number',
                    validationState: 'error',
                    acceptable: false
                }
            });
        } else if (newBw < 0) {
            this.props.controlsStore.setParamsForEditPipe({
                A_TO_Z: {
                    validationText: 'Negative value',
                    validationState: 'error',
                    acceptable: false
                }
            });
        } else {
            this.props.controlsStore.setParamsForEditPipe({
                A_TO_Z: {
                    bw: newBw,
                }
            });

        }
    };


    onZaBwChange = (e) => {
        const newBw = Number(e.target.value);


        if (isNaN(newBw) || e.target.value.length === 0) {
            this.props.controlsStore.setParamsForEditPipe({
                Z_TO_A: {
                    validationText: 'Not a number',
                    validationState: 'error',
                    acceptable: false
                }
            });
        } else if (newBw < 0) {
            this.props.controlsStore.setParamsForEditPipe({
                Z_TO_A: {
                    validationText: 'Negative value',
                    validationState: 'error',
                    acceptable: false
                }
            });
        } else {
            this.props.controlsStore.setParamsForEditPipe({
                Z_TO_A: {
                    bw: newBw,
                }
            });

        }


    };

    deletePipe = () => {
        let pipeId = this.props.controlsStore.editPipe.pipeId;
        this.props.designStore.deletePipe(pipeId);
        this.closeModal();
    };

    lockPipe = () => {
        const ep = this.props.controlsStore.editPipe;
        let params = {
            azBw: ep.A_TO_Z.bw,
            zaBw: ep.Z_TO_A.bw,
            mode: ep.ero.mode,
            ero: ep.ero.hops,
        };
        this.props.designStore.lockPipe(ep.pipeId, params);
        this.props.controlsStore.setParamsForEditPipe({locked: true});

    };
    unlockPipe = () => {
        const ep = this.props.controlsStore.editPipe;
        this.props.controlsStore.setParamsForEditPipe({locked: false});
        this.props.designStore.unlockPipe(ep.pipeId);

    };

    closeModal = () => {
        this.props.controlsStore.setParamsForEditPipe({pipeId: null});
        this.props.modalStore.closeModal(modalName);
    };

    onSelectModeChange = (e) => {
        const mode = e.target.value;
        const ep = this.props.controlsStore.editPipe;
        let params = {
            ero: {
                mode: mode
            }
        };
        if (mode === 'shortest') {
            params.ero.hops = ep.shortest.ero;
            params.ero.acceptable = true;
        } else if (mode === 'fits') {
            params.ero.hops = ep.fits.ero;
            params.ero.acceptable = ep.fits.ero.length > 0;
        } else if (mode === 'manual') {
            params.ero.hops = [];
            params.ero.acceptable = false;
        }
        this.props.controlsStore.setParamsForEditPipe(params);

    };

    render() {
        let ep = this.props.controlsStore.editPipe;
        let conn = this.props.controlsStore.connection;
        let pipe = this.props.designStore.findPipe(ep.pipeId);

        if (pipe === null) {
            return null;
        }

        const acceptable = ep.A_TO_Z.acceptable && ep.Z_TO_A.acceptable && ep.ero.acceptable;
        let disableLockBtn = !acceptable;

        let showModal = this.props.modalStore.modals.get(modalName);
        let pipeTitle = <span>{pipe.a} - {pipe.z}</span>;
        let azLabel = 'From ' + pipe.a + ' to ' + pipe.z;
        let zaLabel = 'From ' + pipe.z + ' to ' + pipe.a;

        let helpPopover = <Popover id='help-pipeControls' title='Pipe controls'>
            <p>Here you can edit the pipe parameters. Every pipe in a design
                must have locked in A-Z and Z-A bandwidth quantities, as well as
                an ERO.</p>
            <p>Use the textboxes to input the bandwidth you want, and click "Lock" to lock
                the values in.</p>
            <p>Alternatively, you may click the "Delete" button to remove this pipe from the design.</p>
        </Popover>;


        let header = <p>Pipe controls for {pipeTitle}
            <OverlayTrigger trigger='click' rootClose placement='left' overlay={helpPopover}>
                <Glyphicon className='pull-right' glyph='question-sign'/>
            </OverlayTrigger>
        </p>;


        return (
            <Modal bsSize='large' show={showModal} onHide={this.closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Editing pipe</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Panel header={header}>
                        <ToggleDisplay show={!conn.schedule.locked}>
                            <h2>Schedule must be locked to edit pipe parameters.</h2>
                        </ToggleDisplay>

                        <ToggleDisplay show={conn.schedule.locked}>
                            <Row>
                                <Col md={12} lg={12} sm={12}>
                                    <PathSelectMode onSelectModeChange={this.onSelectModeChange}/>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6} lg={6} sm={6}>
                                    <ToggleDisplay show={!ep.locked}>
                                        <h4>Bandwidth</h4>
                                        <FormGroup validationState={ep.A_TO_Z.validationState}>
                                            <ControlLabel>{azLabel}</ControlLabel>
                                            {' '}
                                            <FormControl type="text"
                                                         placeholder="0-100000 (Mbps)"
                                                         defaultValue={ep.A_TO_Z.bw}
                                                         disabled={ep.locked}
                                                         onChange={this.onAzBwChange}/>
                                            <HelpBlock><p>{ep.A_TO_Z.validationText}</p></HelpBlock>
                                            <HelpBlock>Reservable: {ep.A_TO_Z.available} Mbps</HelpBlock>
                                            <HelpBlock>Baseline: {ep.A_TO_Z.baseline} Mbps</HelpBlock>
                                        </FormGroup>
                                        {' '}
                                        <FormGroup validationState={ep.Z_TO_A.validationState}>
                                            <ControlLabel>{zaLabel}</ControlLabel>
                                            {' '}
                                            <FormControl onChange={this.onZaBwChange}
                                                         disabled={ep.locked}
                                                         defaultValue={ep.Z_TO_A.bw}
                                                         type="text"
                                                         placeholder="0-10000 (Mbps)"/>

                                            <HelpBlock><p>{ep.Z_TO_A.validationText}</p></HelpBlock>
                                            <HelpBlock>Available: {ep.Z_TO_A.available} Mbps</HelpBlock>
                                            <HelpBlock>Baseline: {ep.Z_TO_A.baseline} Mbps</HelpBlock>
                                        </FormGroup>
                                    </ToggleDisplay>
                                    <ToggleDisplay show={ep.locked}>
                                        <Well>A to Z bandwidth: {ep.A_TO_Z.bw} Mbps</Well>
                                        {' '}
                                        <Well>Z to A bandwidth: {ep.Z_TO_A.bw} Mbps</Well>
                                    </ToggleDisplay>

                                </Col>

                                <Col md={6} lg={6} sm={6}>
                                    <h4>ERO</h4>
                                    <p>{ep.ero.message}</p>
                                    <ListGroup>
                                        {
                                            ep.ero.hops.map(urn => {
                                                return <ListGroupItem key={urn}>{urn}</ListGroupItem>
                                            })
                                        }
                                    </ListGroup>
                                    <ToggleDisplay show={!ep.locked && ep.ero.mode === 'manual'}>
                                        <FormGroup>
                                            <ControlLabel>Select next hop</ControlLabel>
                                            <EroTypeahead/>
                                        </FormGroup>
                                    </ToggleDisplay>
                                </Col>
                            </Row>
                            {' '}

                            <Row>
                                <Col>

                                    <Button bsStyle='warning'
                                            className='pull-right'
                                            onClick={this.deletePipe}>Delete</Button>
                                    {' '}
                                    <ToggleDisplay show={!ep.locked}>
                                        <Button bsStyle='primary'
                                                disabled={disableLockBtn}
                                                className='pull-right'
                                                onClick={this.lockPipe}>Lock</Button>
                                        {' '}
                                    </ToggleDisplay>
                                    <ToggleDisplay show={ep.locked}>
                                        <Button bsStyle='warning'
                                                className='pull-right'
                                                onClick={this.unlockPipe}>Unlock</Button>
                                        {' '}
                                    </ToggleDisplay>

                                </Col>
                            </Row>

                        </ToggleDisplay>
                    </Panel>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.closeModal}>Close</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}


@inject('controlsStore', 'designStore')
@observer
class PathSelectMode extends Component {

    render() {
        let pathSelectModeOpts = [
            {value: 'fits', label: 'Fits bandwidth'},
            {value: 'shortest', label: 'Shortest path'},
            //            {value: 'manual', label: 'Specify ERO'}
        ];
        return <FormControl componentClass="select" onChange={this.props.onSelectModeChange}>
            {
                pathSelectModeOpts.map((option, index) => {
                    return <option key={index} value={option.value}>{option.label}</option>
                })
            }
        </FormControl>;
    }
}

PathSelectMode.propTypes = {
    onSelectModeChange: PropTypes.func.isRequired
};
