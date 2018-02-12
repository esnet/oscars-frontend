import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {
    Modal, Button, FormControl, ControlLabel, FormGroup, Form,
    Well, Panel, OverlayTrigger, Glyphicon, Popover, Row, Col,
    Tabs, Tab,
    ListGroup, ListGroupItem, HelpBlock, InputGroup, PanelGroup
} from 'react-bootstrap';
import PropTypes from 'prop-types';

import ToggleDisplay from 'react-toggle-display';
import EroTypeahead from './eroTypeahead';
import {autorun, autorunAsync, whyRun, toJS} from 'mobx';

import myClient from '../agents/client';
import Confirm from 'react-confirm-bootstrap';
import Validator from '../lib/validation';

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

        if (pipe === null || pipe.locked || !conn.schedule.locked) {
            return;
        }

        let modeNeedsPathUpdate = false;

        if (!ep.paths.sync.initialized) {
            modeNeedsPathUpdate = true;
        }
        if (mode === 'fits') {
            modeNeedsPathUpdate = true;
        }
        if (!modeNeedsPathUpdate) {
            return;
        }

        // clear ERO, show loading state
        this.props.controlsStore.setParamsForEditPipe({
            paths: {
                sync: {
                    loading: true
                }
            },
            ero: {
                message: 'Updating path..',
                acceptable: false,
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
                let uiParams = {
                    paths: {
                        sync: {
                            loading: false,
                            initialized: true
                        },
                        fits: {},
                        shortest: {},
                        leastHops: {},
                        widestSum: {},
                        widestAZ: {},
                        widestZA: {}
                    },
                    A_TO_Z: {},
                    Z_TO_A: {}
                };

                let syncedModes = ['fits', 'shortest', 'leastHops', 'widestSum', 'widestAZ', 'widestZA'];
                syncedModes.map(mode => {
                    let ero = [];
                    if (parsed[mode] === null) {
                        uiParams.paths[mode].acceptable = false;
                        uiParams.paths[mode].azAvailable = -1;
                        uiParams.paths[mode].zaAvailable = -1;
                        uiParams.paths[mode].azBaseline = -1;
                        uiParams.paths[mode].zaBaseline = -1;
                        uiParams.paths[mode].ero = [];
                        return;
                    }

                    parsed[mode]['azEro'].map((e) => {
                        ero.push(e['urn']);
                    });
                    uiParams.paths[mode].ero = ero;
                    if (ero.length > 0) {
                        uiParams.paths[mode].acceptable = true;
                        uiParams.paths[mode].azAvailable = parsed[mode].azAvailable;
                        uiParams.paths[mode].zaAvailable = parsed[mode].zaAvailable;
                        uiParams.paths[mode].azBaseline = parsed[mode].azBaseline;
                        uiParams.paths[mode].zaBaseline = parsed[mode].zaBaseline;
                    } else {
                        uiParams.paths[mode].acceptable = false;
                        uiParams.paths[mode].azAvailable = -1;
                        uiParams.paths[mode].zaAvailable = -1;
                        uiParams.paths[mode].azBaseline = -1;
                        uiParams.paths[mode].zaBaseline = -1;
                    }
                    if (mode === 'widestAZ') {
                        uiParams.A_TO_Z.widest = uiParams.paths[mode].azAvailable;
                    }
                    if (mode === 'widestZA') {
                        uiParams.Z_TO_A.widest = uiParams.paths[mode].zaAvailable;
                    }
                });

                if (ep.ero.mode === 'manual') {
                    // if the selected mode is manual, TODO
                } else {
                    // otherwise, the selected mode was just synced from the server; update the ERO.
                    // the validate() call that comes later will take care of the bandwidth validation

                    if (uiParams.paths[ep.ero.mode].acceptable) {
                        uiParams.ero = {
                            acceptable: true,
                            message: 'Calculated ERO:',
                            hops: uiParams.paths[ep.ero.mode].ero
                        }

                    } else {
                        uiParams.ero = {
                            acceptable: false,
                            message: 'No path found!',
                            hops: []
                        };

                    }
                }


                this.props.controlsStore.setParamsForEditPipe(uiParams);
            }).then(() => {
            this.validate();
        });

    }, 1000);


    validationDispose = autorunAsync('validation', () => {
        this.validate();

    }, 1000);

    validate() {

        const ep = this.props.controlsStore.editPipe;
        if (ep.paths.sync.loading || !ep.paths.sync.initialized) {
            return;
        }
        let azAvailable = ep.paths[ep.ero.mode].azAvailable;
        let zaAvailable = ep.paths[ep.ero.mode].zaAvailable;
        let azBaseline = ep.paths[ep.ero.mode].azBaseline;
        let zaBaseline = ep.paths[ep.ero.mode].zaBaseline;

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
        let inputStr = Validator.cleanBandwidth(e.target.value, this.azBwControl);
        const newBw = Number(inputStr);

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
        let inputStr = Validator.cleanBandwidth(e.target.value, this.zaBwControl);
        const newBw = Number(inputStr);

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
        this.props.controlsStore.setParamsForEditPipe({locked: false, ero: {hops: [], acceptable: false}});
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
                mode: mode,
                acceptable: false,
                message: '',
                hops: []
            }
        };


        if (mode === 'manual') {
            // it was just changed, so clear everything
            params.ero.hops = [];
            params.ero.acceptable = false;
        } else {
            params.ero.hops = ep.paths[mode].ero;
            params.ero.acceptable = ep.paths[mode].acceptable;
            if (!params.ero.acceptable) {
                params.ero.message = 'No path found';
            } else {
                params.ero.message = '';
            }
        }

        this.props.controlsStore.setParamsForEditPipe(params);

    };

    render() {
        let ep = this.props.controlsStore.editPipe;
        let conn = this.props.controlsStore.connection;
        let pipe = this.props.designStore.findPipe(ep.pipeId);
        let design = this.props.designStore.design;

        if (pipe === null) {
            return null;
        }

        const acceptable = ep.A_TO_Z.acceptable && ep.Z_TO_A.acceptable && ep.ero.acceptable;
        const disableLockBtn = !acceptable;

        let showModal = this.props.modalStore.modals.get(modalName);
        let pipeTitle = <span>{pipe.a} - {pipe.z}</span>;
        let aFixtures = [];
        let zFixtures = [];
        let aIngress = 0;
        let aEgress = 0;
        let zIngress = 0;
        let zEgress = 0;

        design.fixtures.map(f => {
            if (f.device === pipe.a) {
                aFixtures.push(f)
                aIngress = aIngress + f.ingress;
                aEgress = aEgress + f.egress;
            }
            if (f.device === pipe.z) {
                zFixtures.push(f)
                zIngress = zIngress + f.ingress;
                zEgress = zEgress + f.egress;
            }
        });


        let helpPopover = <Popover id='help-pipeControls' title='Pipe controls'>
            <p>Here you can edit the pipe parameters. Every pipe in a design
                must have locked in A-Z and Z-A bandwidth quantities, as well as
                an Explicit Route Object (ERO).</p>
            <p>Use the textboxes to input the bandwidth you want, and click "Lock" to lock
                the values in.</p>
            <p>As a convenience feature, if you type 'g' or 'G' in the bandwidth controls,
                that character will be replaced by '000'.</p>
            <p>Alternatively, you may click the "Delete" button to remove this pipe from the design.</p>
        </Popover>;


        return (
            <Modal bsSize='large' show={showModal} onHide={this.closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Editing pipe</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Panel>
                        <Panel.Heading>
                            <p>Pipe controls for {pipeTitle}
                                <OverlayTrigger trigger='click' rootClose placement='left' overlay={helpPopover}>
                                    <Glyphicon className='pull-right' glyph='question-sign'/>
                                </OverlayTrigger>
                            </p>
                        </Panel.Heading>
                        <Panel.Body>
                            <ToggleDisplay show={!conn.schedule.locked}>
                                <h2>Schedule must be locked to edit pipe parameters.</h2>
                            </ToggleDisplay>

                            <Row>
                                <Col md={4} lg={4} sm={4}>
                                    <h4>{pipe.a}</h4>
                                    <u>Fixtures:</u>
                                    <ListGroup>
                                        {
                                            aFixtures.map(f => {
                                                return <ListGroupItem
                                                    key={f.label}>{f.label} ({f.ingress} / {f.egress})</ListGroupItem>
                                            })
                                        }
                                    </ListGroup>
                                    <p>Total ingress: <b>{aIngress} Mbps</b></p>
                                    <p>Total egress: <b>{aEgress} Mbps</b></p>
                                </Col>
                                <Col md={4} lg={4} sm={4}>
                                    <hr/>
                                    <Row>
                                        <ToggleDisplay show={!ep.locked}>
                                            <FormGroup validationState={ep.A_TO_Z.validationState}>
                                                <InputGroup bsSize='large'>
                                                    <InputGroup.Addon>
                                                        <Glyphicon glyph='arrow-right'/>
                                                    </InputGroup.Addon>

                                                    <FormControl type="text"
                                                                 placeholder="0-100000"
                                                                 defaultValue={ep.A_TO_Z.bw}
                                                                 inputRef={ref => {
                                                                     this.azBwControl = ref;
                                                                 }}

                                                                 disabled={ep.locked}
                                                                 onChange={this.onAzBwChange}/>
                                                </InputGroup>
                                                <HelpBlock><p>{ep.A_TO_Z.validationText}</p></HelpBlock>
                                                <HelpBlock>Reservable on this
                                                    ERO: {ep.A_TO_Z.available} Mbps</HelpBlock>
                                                <ToggleDisplay show={(ep.ero.mode === 'fits')}>
                                                    <HelpBlock>Widest: {ep.A_TO_Z.widest} Mbps</HelpBlock>
                                                </ToggleDisplay>
                                                <HelpBlock>Baseline: {ep.A_TO_Z.baseline} Mbps</HelpBlock>

                                            </FormGroup>
                                        </ToggleDisplay>
                                        <ToggleDisplay show={ep.locked}>
                                            <Well>{ep.A_TO_Z.bw} Mbps</Well>
                                        </ToggleDisplay>

                                    </Row>
                                    <hr/>
                                    <Row>
                                        <ToggleDisplay show={!ep.locked}>
                                            <FormGroup validationState={ep.Z_TO_A.validationState}>
                                                <InputGroup bsSize='large'>
                                                    <FormControl type="text"
                                                                 placeholder="0-100000"
                                                                 defaultValue={ep.Z_TO_A.bw}
                                                                 inputRef={ref => {
                                                                     this.zaBwControl = ref;
                                                                 }}

                                                                 disabled={ep.locked}
                                                                 onChange={this.onZaBwChange}/>
                                                    <InputGroup.Addon>
                                                        <Glyphicon glyph='arrow-left'/>
                                                    </InputGroup.Addon>
                                                </InputGroup>

                                                <HelpBlock><p>{ep.Z_TO_A.validationText}</p></HelpBlock>
                                                <HelpBlock>Reservable on this
                                                    ERO: {ep.Z_TO_A.available} Mbps</HelpBlock>
                                                <ToggleDisplay show={(ep.ero.mode === 'fits')}>
                                                    <HelpBlock>Widest: {ep.Z_TO_A.widest} Mbps</HelpBlock>
                                                </ToggleDisplay>
                                                <HelpBlock>Baseline: {ep.Z_TO_A.baseline} Mbps</HelpBlock>

                                            </FormGroup>

                                        </ToggleDisplay>
                                        <ToggleDisplay show={ep.locked}>
                                            <Well>{ep.Z_TO_A.bw} Mbps</Well>
                                        </ToggleDisplay>
                                    </Row>
                                </Col>
                                <Col md={4} lg={4} sm={4}>
                                    <h4>{pipe.z}</h4>
                                    <u>Fixtures:</u>
                                    <ListGroup>
                                        {
                                            zFixtures.map(f => {
                                                return <ListGroupItem
                                                    key={f.label}>{f.label} ({f.ingress} / {f.egress})</ListGroupItem>
                                            })
                                        }
                                    </ListGroup>
                                    <p>Total ingress: <b>{zIngress} Mbps</b></p>
                                    <p>Total egress: <b>{zEgress} Mbps</b></p>
                                </Col>
                            </Row>


                            <ToggleDisplay show={conn.schedule.locked}>
                                <ToggleDisplay show={!ep.locked}>
                                    <PathSelectMode onSelectModeChange={this.onSelectModeChange}/>
                                </ToggleDisplay>
                                <Row>
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

                                        <Confirm
                                            onConfirm={this.deletePipe}
                                            body="Are yous sure you want to delete?"
                                            confirmText="Confirm"
                                            title="Delete pipe">
                                            <Button bsStyle='warning' className='pull-right'>Delete</Button>

                                        </Confirm>

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
                        </Panel.Body>

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

        const pathSelectModeOpts = [
            {value: 'fits', label: 'Fit to bandwidth'},
            {value: 'shortest', label: 'Shortest (by metric)'},
            {value: 'leastHops', label: 'Least hops'},
            {value: 'widestSum', label: 'Widest overall'},
            {value: 'widestAZ', label: 'Widest, priority =>'},
            {value: 'widestZA', label: 'Widest, priority <='},
// TODO            {value: 'manual', label: 'Manual mode'}
        ];
        return <Form horizontal>
            <FormGroup>
                <Col sm={2} componentClass={ControlLabel}>Path mode:</Col>
                <Col sm={4}>
                    <FormControl componentClass="select" onChange={this.props.onSelectModeChange}>
                        {
                            pathSelectModeOpts.map((option, index) => {
                                return <option key={index} value={option.value}>{option.label}</option>
                            })
                        }
                    </FormControl>
                </Col>
                <Col sm={6}>
                    <p>Path mode help</p>
                    <Tabs id='modes' defaultActiveKey={1}>
                        <Tab eventKey={1} title='Dynamic modes'>
                            <p>These modes re-calculate your path every time you change the bandwidth.
                                Depending on your input and the state of the network, a path might not be
                                found; in that case you won't be able to lock the pipe. </p>

                            <PanelGroup accordion id="accordion-dynamic">
                                <Panel eventKey='fits'>
                                    <Panel.Heading>
                                        <Panel.Title toggle>Fit to bandwidth</Panel.Title>
                                    </Panel.Heading>
                                    <Panel.Body collapsible>
                                        <p> in this mode OSCARS will calculate the shortest path (based on policy
                                            metric) that will fit the bandwidth you want. You will always be able
                                            to find a zero-bandwidth path; this will be the same as the shortest
                                            (by metric) mode.</p>
                                    </Panel.Body>
                                </Panel>
                            </PanelGroup>
                        </Tab>
                        <Tab eventKey={2} title='Fixed modes'>
                            <p> These modes will always provide the same path, given a specific schedule and
                                start/end points. In these modes, if you change the bandwidth, the path will not
                                change; rather, your input will be validated against previously calculated
                                maximum values. If it exceeds those values, you won't be able to lock the pipe.</p>
                            <PanelGroup accordion id="accordion-fixed">
                                <Panel eventKey='sbm'>
                                    <Panel.Heading>
                                        <Panel.Title toggle>Shortest (by metric)</Panel.Title>
                                    </Panel.Heading>
                                    <Panel.Body collapsible>
                                        <p> The shortest path on the network as calculated by the policy metric. Will be
                                            the
                                            most economical on resources and will maximize the overall network
                                            throughput, and
                                            minimize latency.</p>
                                    </Panel.Body>
                                </Panel>
                                <Panel eventKey='sbh'>
                                    <Panel.Heading>
                                        <Panel.Title toggle>Least hops</Panel.Title>
                                    </Panel.Heading>
                                    <Panel.Body collapsible>
                                        <p> The path that goes over the least amount of network devices and connections.
                                            This minimizes the chance that the path will be disrupted by outages.</p>
                                    </Panel.Body>
                                </Panel>
                                <Panel eventKey='wo'>
                                    <Panel.Heading>
                                        <Panel.Title toggle>Widest overall</Panel.Title>
                                    </Panel.Heading>
                                    <Panel.Body collapsible>
                                        <p> The path that has the maximum available bandwidth, considered as a sum
                                            of the available bandwidth in both directions. When you want the most
                                            possible bandwidth over the network maximizing flow in both directions. </p>
                                    </Panel.Body>
                                </Panel>
                                <Panel eventKey='wd'>
                                    <Panel.Heading>
                                        <Panel.Title toggle>Widest (direction)</Panel.Title>
                                    </Panel.Heading>
                                    <Panel.Body collapsible>
                                        <p> The path that has the maximum available bandwidth in a specific direction.
                                            When you want the greatest possible bandwidth over the network maximizing
                                            flow in one direction only. </p>
                                    </Panel.Body>
                                </Panel>

                            </PanelGroup>

                        </Tab>
                    </Tabs>


                </Col>
            </FormGroup>
        </Form>;
    }
}

PathSelectMode.propTypes = {
    onSelectModeChange: PropTypes.func.isRequired
};
