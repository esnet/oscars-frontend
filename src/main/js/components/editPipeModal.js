import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {
    Modal, Button, FormControl, ControlLabel, FormGroup, Form,
    Well, Panel, OverlayTrigger, Glyphicon, Popover, Row, Col,
    Tabs, Tab, ButtonToolbar,
    ListGroup, ListGroupItem, HelpBlock, InputGroup, PanelGroup
} from 'react-bootstrap';
import PropTypes from 'prop-types';

import ToggleDisplay from 'react-toggle-display';
import EroSelect from './eroSelect';
import {autorunAsync, toJS} from 'mobx';

import myClient from '../agents/client';
import Confirm from 'react-confirm-bootstrap';
import Validator from '../lib/validation';
import {Tooltip} from 'react-tippy';

const modalName = 'editPipe';

@inject('designStore', 'controlsStore', 'topologyStore', 'modalStore')
@observer
export default class PipeParamsModal extends Component {
    constructor(props) {
        super(props);
    }

    /*
    componentWillMount() {
        this.props.controlsStore.setParamsForEditPipe({
            ero: {
                mode: 'fits'
            }

        });
    }
    */

    pathUpdateDispose = autorunAsync('pathUpdate', () => {
        let conn = this.props.controlsStore.connection;
        let ep = this.props.controlsStore.editPipe;

        let pipe = this.props.designStore.findPipe(ep.pipeId);

        if (pipe === null || pipe.locked || !conn.schedule.locked) {
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
            include: ep.ero.include
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

                const modes = ['fits', 'shortest', 'leastHops', 'widestSum', 'widestAZ', 'widestZA'];
                modes.map(mode => {
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

                // the selected mode was just synced from the server; update the ERO.
                // the validate() call that comes later will take care of the bandwidth validation
                if (typeof ep.paths[ep.ero.mode] === 'undefined') {
                    console.log('undefined path for ' + ep.ero.mode);
                    console.log(toJS(ep));
                }

                if (uiParams.paths[ep.ero.mode].acceptable) {
                    uiParams.ero = {
                        acceptable: true,
                        message: 'Path found.',
                        hops: uiParams.paths[ep.ero.mode].ero
                    }

                } else {
                    uiParams.ero = {
                        acceptable: false,
                        message: 'No path found!',
                        hops: []
                    };

                }

                this.props.controlsStore.setParamsForEditPipe(uiParams);
            })
            .then(() => {
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
        if (typeof ep.paths[ep.ero.mode] === 'undefined') {
            console.log('undefined path for ' + ep.ero.mode);
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

        const eroControlModes = ['fits', 'widestAZ', 'widestSum', 'widestZA'];

        const showEroControls = !ep.locked && eroControlModes.includes(ep.ero.mode);
        let eroOffset = 0;
        if (!showEroControls) {
            eroOffset = 3;
        }

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
                aFixtures.push(f);
                aIngress = aIngress + f.ingress;
                aEgress = aEgress + f.egress;
            }
            if (f.device === pipe.z) {
                zFixtures.push(f);
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

                            <ToggleDisplay show={conn.schedule.locked}>

                                <Row>
                                    <Col md={4} lg={4} sm={4}>
                                        <Panel>
                                            <Panel.Heading>
                                                <Panel.Title>{pipe.a}</Panel.Title>
                                            </Panel.Heading>
                                            <Panel.Body>
                                                <u>Fixtures:</u>
                                                <small>
                                                    <ListGroup>
                                                        {
                                                            aFixtures.map(f => {
                                                                return <ListGroupItem
                                                                    key={f.label}>{f.label} (i: {f.ingress}M /
                                                                    e: {f.egress}M)</ListGroupItem>
                                                            })
                                                        }
                                                    </ListGroup>
                                                </small>
                                                <p>Total ingress: <b>{aIngress} Mbps</b></p>
                                                <p>Total egress: <b>{aEgress} Mbps</b></p>
                                            </Panel.Body>
                                        </Panel>
                                    </Col>
                                    <Col md={4} lg={4} sm={4}>
                                        <Panel>
                                            <Panel.Heading>
                                                <Panel.Title>Bandwidth</Panel.Title>
                                            </Panel.Heading>
                                            <Panel.Body>
                                                <Row>
                                                    <Col sm={9} md={9} lg={9}>
                                                        <ToggleDisplay show={!ep.locked}>
                                                            <FormGroup validationState={ep.A_TO_Z.validationState}>
                                                                <InputGroup>
                                                                    <InputGroup.Addon>
                                                                        <Glyphicon glyph='arrow-right'/>
                                                                    </InputGroup.Addon>

                                                                    <FormControl type='text'
                                                                                 placeholder='0-100000'
                                                                                 defaultValue={ep.A_TO_Z.bw}
                                                                                 inputRef={ref => {
                                                                                     this.azBwControl = ref;
                                                                                 }}

                                                                                 disabled={ep.locked}
                                                                                 onChange={this.onAzBwChange}/>
                                                                </InputGroup>
                                                                <HelpBlock>
                                                                    <small>
                                                                        <p>{ep.A_TO_Z.validationText}</p>
                                                                        <p>Reservable: {ep.A_TO_Z.available} Mbps</p>
                                                                        <ToggleDisplay show={(ep.ero.mode === 'fits')}>
                                                                            <p>Widest: {ep.A_TO_Z.widest} Mbps</p>
                                                                        </ToggleDisplay>
                                                                        <p>Baseline: {ep.A_TO_Z.baseline} Mbps</p>
                                                                    </small>
                                                                </HelpBlock>
                                                            </FormGroup>
                                                        </ToggleDisplay>
                                                        <ToggleDisplay show={ep.locked}>
                                                            <Well>{ep.A_TO_Z.bw} Mbps</Well>
                                                        </ToggleDisplay>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col smOffset={3} mdOffset={3} lgOffset={3} sm={9} md={9} lg={9}>
                                                        <ToggleDisplay show={!ep.locked}>
                                                            <FormGroup validationState={ep.Z_TO_A.validationState}>
                                                                <InputGroup>
                                                                    <FormControl type='text'
                                                                                 placeholder='0-100000'
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

                                                                <HelpBlock>
                                                                    <small>
                                                                        <p>{ep.Z_TO_A.validationText}</p>
                                                                        <p>Reservable: {ep.Z_TO_A.available} Mbps</p>
                                                                        <ToggleDisplay show={(ep.ero.mode === 'fits')}>
                                                                            <p>Widest: {ep.Z_TO_A.widest} Mbps</p>
                                                                        </ToggleDisplay>
                                                                        <p>Baseline: {ep.Z_TO_A.baseline} Mbps</p>
                                                                    </small>
                                                                </HelpBlock>
                                                            </FormGroup>

                                                        </ToggleDisplay>
                                                        <ToggleDisplay show={ep.locked}>
                                                            <Well>{ep.Z_TO_A.bw} Mbps</Well>
                                                        </ToggleDisplay>
                                                    </Col>
                                                </Row>
                                            </Panel.Body>
                                        </Panel>
                                    </Col>
                                    <Col md={4} lg={4} sm={4}>
                                        <Panel>
                                            <Panel.Heading>
                                                <Panel.Title>{pipe.z}</Panel.Title>
                                            </Panel.Heading>
                                            <Panel.Body>
                                                <u>Fixtures:</u>
                                                <small>
                                                    <ListGroup>
                                                        {
                                                            zFixtures.map(f => {
                                                                return <ListGroupItem
                                                                    key={f.label}>{f.label} (i: {f.ingress}M /
                                                                    e: {f.egress}M)</ListGroupItem>
                                                            })
                                                        }
                                                    </ListGroup>
                                                </small>
                                                <p>Total ingress: <b>{zIngress} Mbps</b></p>
                                                <p>Total egress: <b>{zEgress} Mbps</b></p>
                                            </Panel.Body>
                                        </Panel>
                                    </Col>
                                </Row>

                                <Panel>
                                    <Panel.Heading>
                                        <Panel.Title>
                                            <PathSelectMode onSelectModeChange={this.onSelectModeChange}/>
                                        </Panel.Title>
                                    </Panel.Heading>
                                    <Panel.Body>

                                        <Row>
                                            <ToggleDisplay show={showEroControls}>
                                                <Col md={6} lg={6} sm={6}>
                                                    <h4>Your ERO</h4>
                                                    <EroSelect/>

                                                </Col>
                                            </ToggleDisplay>
                                            <Col md={6} lg={6} sm={6} smOffset={eroOffset} mdOffset={eroOffset}
                                                 lgOffset={eroOffset}>
                                                <h4>Computed ERO</h4>
                                                <ListGroup>
                                                    {
                                                        ep.ero.hops.map(urn => {
                                                            return <ListGroupItem key={urn}>{urn}</ListGroupItem>
                                                        })
                                                    }
                                                </ListGroup>
                                                <ToggleDisplay show={!ep.locked}>
                                                    <small>{ep.ero.message}</small>
                                                </ToggleDisplay>
                                            </Col>
                                        </Row>


                                    </Panel.Body>
                                </Panel>
                                <ToggleDisplay show={!ep.locked}>
                                    <Well>Select pipe parameters, then click "Lock".</Well>
                                </ToggleDisplay>

                                <ButtonToolbar>

                                    <Confirm
                                        onConfirm={this.deletePipe}
                                        body='Are you sure you want to delete?'
                                        confirmText='Confirm'
                                        title='Delete pipe'>
                                        <Button bsStyle='warning' className='pull-right'>Delete</Button>

                                    </Confirm>

                                    <ToggleDisplay show={!ep.locked}>
                                        <Button bsStyle='primary'
                                                disabled={disableLockBtn}
                                                className='pull-right'
                                                onClick={this.lockPipe}>Lock</Button>
                                    </ToggleDisplay>
                                    <ToggleDisplay show={ep.locked}>
                                        <Button bsStyle='warning'
                                                className='pull-right'
                                                onClick={this.unlockPipe}>Unlock</Button>
                                    </ToggleDisplay>
                                </ButtonToolbar>

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
        const helpTabs =
            <Panel>
                <Panel.Heading>
                    <Panel.Title>Path mode help</Panel.Title>
                </Panel.Heading>
                <Panel.Body>
                    <div style={{'width': 500, 'backgroundColor': 'white'}}>
                        <Tabs id='modes' defaultActiveKey={1}>
                            <Tab eventKey={1} title='Fully responsive'>
                                <p>These modes will re-calculate the path every time you change the bandwidth,
                                    as well as when you make changes to the ERO.
                                    Depending on your input and the state of the network, a path might not be
                                    found; in that case you won't be able to lock the pipe. </p>

                                <PanelGroup accordion id='accordion-fully' defaultActiveKey={'fits'}>
                                    <Panel eventKey='fits'>
                                        <Panel.Heading>
                                            <Panel.Title toggle>Fit to bandwidth</Panel.Title>
                                        </Panel.Heading>
                                        <Panel.Body collapsible>
                                            <p>In this mode OSCARS will calculate the shortest path (based on policy
                                                metric) that will fit the bandwidth you want. You will always be able
                                                to find a zero-bandwidth path; this will be the same as the shortest
                                                (by metric) mode.</p>
                                        </Panel.Body>
                                    </Panel>
                                </PanelGroup>
                            </Tab>
                            <Tab eventKey={2} title='Semi-responsive'>
                                <p>These modes will respond to changes in the ERO constraints, but will not take
                                    bandwidth into account for their calculations.
                                    They will try to find the widest path on the network that matches the ERO.</p>
                                <PanelGroup accordion id='accordion-semi' defaultActiveKey={'wo'}>>
                                    <Panel eventKey='wo'>
                                        <Panel.Heading>
                                            <Panel.Title toggle>Widest overall</Panel.Title>
                                        </Panel.Heading>
                                        <Panel.Body collapsible>
                                            <p> The path that has the maximum available bandwidth, considered as a sum
                                                of the available bandwidth in both directions. When you want the most
                                                possible bandwidth over the network maximizing flow in both directions.
                                            </p>
                                        </Panel.Body>
                                    </Panel>
                                    <Panel eventKey='wd'>
                                        <Panel.Heading>
                                            <Panel.Title toggle>Widest (direction)</Panel.Title>
                                        </Panel.Heading>
                                        <Panel.Body collapsible>
                                            <p> The path that has the maximum available bandwidth in a specific
                                                direction. Use when you want the greatest possible bandwidth over the
                                                network, maximizing flow in one direction only.
                                            </p>
                                        </Panel.Body>
                                    </Panel>
                                </PanelGroup>

                            </Tab>
                            <Tab eventKey={3} title='Fixed'>
                                <p> These modes will always provide the same path, given a specific schedule and
                                    start/end points. In this modes, if you change the bandwidth, the path will not
                                    change; rather, your input will be validated against previously calculated
                                    maximum values. If it exceeds those values, you won't be able to lock the pipe.</p>
                                <PanelGroup accordion id='accordion-fixed' defaultActiveKey={'sbm'}>
                                    <Panel eventKey='sbm'>
                                        <Panel.Heading>
                                            <Panel.Title toggle>Shortest (by metric)</Panel.Title>
                                        </Panel.Heading>
                                        <Panel.Body collapsible>
                                            <p> The shortest path on the network as calculated by the policy metric.
                                                Will be the most economical on resources and will maximize the overall
                                                network throughput, and minimize latency.</p>
                                        </Panel.Body>
                                    </Panel>
                                    <Panel eventKey='sbh'>
                                        <Panel.Heading>
                                            <Panel.Title toggle>Least hops</Panel.Title>
                                        </Panel.Heading>
                                        <Panel.Body collapsible>
                                            <p> The path that goes over the least amount of network devices and
                                                connections. This minimizes the chance that the path will be disrupted
                                                by outages.
                                            </p>
                                        </Panel.Body>
                                    </Panel>


                                </PanelGroup>

                            </Tab>
                        </Tabs>
                    </div>
                </Panel.Body>
            </Panel>;

        let helpPopover = <Tooltip
            title='Path Mode '
            position='bottom'
            trigger='click'
            interactive={true}
            html={helpTabs}>
            <h4><Glyphicon glyph='question-sign'/></h4>

        </Tooltip>;
        let ep = this.props.controlsStore.editPipe;


        const pathSelectModeOpts = [
            {value: 'fits', label: 'Fit to bandwidth'},
            {value: 'shortest', label: 'Shortest (by metric)'},
            {value: 'leastHops', label: 'Least hops'},
            {value: 'widestSum', label: 'Widest overall'},
            {value: 'widestAZ', label: 'Widest, priority =>'},
            {value: 'widestZA', label: 'Widest, priority <='},
        ];
        return <Row>
            <Col sm={4} md={4} lg={4}><b>Path</b></Col>

            <ToggleDisplay show={!ep.locked}>

                <Col sm={3} md={3} lg={3}>
                    <FormControl componentClass='select' className='pull-left' onChange={this.props.onSelectModeChange}>
                        {
                            pathSelectModeOpts.map((option, index) => {
                                return <option key={index} value={option.value}>{option.label}</option>
                            })
                        }
                    </FormControl>
                </Col>
                <Col sm={1} md={1} lg={1} componentClass={ControlLabel}>
                    {helpPopover}
                </Col>
            </ToggleDisplay>
        </Row>
    }
}

PathSelectMode.propTypes = {
    onSelectModeChange: PropTypes.func.isRequired
};
