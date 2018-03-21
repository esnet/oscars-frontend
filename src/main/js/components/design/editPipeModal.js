import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {
    Modal, ModalBody, ModalHeader,
    Button, Input, Container, FormGroup,
    Card, CardBody, CardHeader, CardSubtitle,
    Alert, Label,
    Row, Col,
    ButtonToolbar,
    ListGroup, ListGroupItem,
    FormText, FormFeedback,
    InputGroup, InputGroupText, InputGroupAddon
} from 'reactstrap';

import {autorun, toJS} from 'mobx';


import ToggleDisplay from 'react-toggle-display';
import EroSelect from './eroSelect';
import DeviceFixtures from './deviceFixtures';
import PathModeSelect from './pathModeSelect';
import myClient from '../../agents/client';
import Validator from '../../lib/validation';
import ConfirmModal from '../confirmModal';
import HelpPopover from '../helpPopover';


const modalName = 'editPipe';

@inject('designStore', 'controlsStore', 'topologyStore', 'modalStore')
@observer
export default class EditPipeModal extends Component {
    constructor(props) {
        super(props);
    }

    protectClicked = (e) => {
    };

    pathUpdateDispose = autorun(() => {
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
                if (ep.ero.mode === '') {
                    console.log('no mode set; updating to fits');
                    this.props.controlsStore.setParamsForEditPipe({
                        ero: {
                            mode: 'fits'
                        }
                    });
                }

                // the selected mode was just synced from the server; update the ERO.
                // the validate() call that comes later will take care of the bandwidth validation

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

    }, {delay: 1000});


    validationDispose = autorun(() => {
        this.validate();

    }, {delay: 1000});

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
        this.props.controlsStore.setParamsForEditPipe({ero: {include: [], exclude: []}});

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

    toggleModal = () => {
        if (this.props.modalStore.modals.get(modalName)) {
            this.closeModal();
        } else {
            this.props.modalStore.openModal(modalName);

        }
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


        const helpHeader = <span>Pipe controls</span>;
        const helpBody = <span>
            <p>Here you can edit the pipe parameters. Every pipe in a design
                must have locked in A-Z and Z-A bandwidth quantities, as well as
                an Explicit Route Object (ERO).</p>
            <p>Use the textboxes to input the bandwidth you want, and click "Lock" to lock
                the values in.</p>
            <p>As a convenience feature, if you type 'g' or 'G' in the bandwidth controls,
                that character will be replaced by '000'.</p>
            <p>Alternatively, you may click the "Delete" button to remove this pipe from the design.</p>
        </span>;

        const help = <span className='float-right'>
            <HelpPopover header={helpHeader} body={helpBody} placement='bottom' popoverId='editPipeHelp'/>
        </span>;

        const bwHelpHeader = <span>Pipe controls</span>;
        const bwHelpBody = <span>
            <p>Here you can set your desired bandwidth in each direction. Type in the desired number in Mbps.
                You can type in the 'g' character to add three 0s quickly. </p>
            <p>Changing the desired bandwidth will cause the computed ERO to be recalculated. A path might
                not be available for the new value.</p>
        </span>;

        const bwHelp = <span className='float-right'>
            <HelpPopover header={bwHelpHeader} body={bwHelpBody} placement='bottom' popoverId='pipeBwHelp'/>
        </span>;

        return (
            <Modal style={{maxWidth: '95%'}} isOpen={showModal}
                   toggle={this.toggleModal} fade={false} onExit={this.closeModal}>

                <ModalHeader className='p-2' toggle={this.toggleModal}>
                    Pipe controls for {pipeTitle} {' '} {help}
                </ModalHeader>

                <ModalBody>
                    <ToggleDisplay show={!conn.schedule.locked}>
                        <Alert color='info'>Schedule must be locked to edit pipe parameters.</Alert>
                    </ToggleDisplay>

                    <ToggleDisplay show={conn.schedule.locked}>
                        <Container fluid={true}>
                            <Row noGutters>
                                <Col xs={4} sm={4} md={4} lg={4}>
                                    <DeviceFixtures fixtures={aFixtures}
                                                    junction={pipe.a}
                                                    ingress={aIngress}
                                                    egress={aEgress}/>

                                </Col>
                                <Col xs={4} sm={4} md={4} lg={4}>
                                    <Card>
                                        <CardHeader className='p-1'>Bandwidth {' '} {bwHelp}</CardHeader>
                                        <CardBody>
                                            <Container fluid>
                                                <Row>
                                                    <Col sm={10} md={10} lg={10}>
                                                        <ToggleDisplay show={!ep.locked}>
                                                            <FormGroup>
                                                                <InputGroup>
                                                                    <InputGroupAddon addonType='prepend'>
                                                                        <InputGroupText>
                                                                            &gt;
                                                                        </InputGroupText>
                                                                    </InputGroupAddon>
                                                                    <Input type='text'
                                                                           placeholder='0-100000'
                                                                           defaultValue={ep.A_TO_Z.bw}
                                                                           innerRef={ref => {
                                                                               this.azBwControl = ref;
                                                                           }}
                                                                           invalid={ep.A_TO_Z.validationState === 'error'}
                                                                           disabled={ep.locked}
                                                                           onChange={this.onAzBwChange}/>
                                                                </InputGroup>
                                                                <FormFeedback>
                                                                    <small>{ep.A_TO_Z.validationText}</small>
                                                                </FormFeedback>
                                                            </FormGroup>
                                                            <FormGroup>
                                                                <FormText className='m-0 p-0'>
                                                                    <small>
                                                                        <p className='m-0'>Reservable: {ep.A_TO_Z.available} Mbps</p>
                                                                        <ToggleDisplay show={(ep.ero.mode === 'fits')}>
                                                                            <p className='m-0'>Widest: {ep.A_TO_Z.widest} Mbps</p>
                                                                        </ToggleDisplay>
                                                                        <p className='m-0'>Baseline: {ep.A_TO_Z.baseline} Mbps</p>
                                                                    </small>
                                                                </FormText>

                                                            </FormGroup>
                                                        </ToggleDisplay>
                                                        <ToggleDisplay show={ep.locked}>
                                                            <Alert color='info'>{ep.A_TO_Z.bw} Mbps</Alert>
                                                        </ToggleDisplay>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col sm={{size: 10, offset: 2}} md={{size: 10, offset: 2}}>
                                                        <ToggleDisplay show={!ep.locked}>
                                                            <FormGroup>
                                                                <InputGroup>
                                                                    <Input type='text'
                                                                           placeholder='0-100000'
                                                                           defaultValue={ep.Z_TO_A.bw}
                                                                           innerRef={ref => {
                                                                               this.zaBwControl = ref;
                                                                           }}
                                                                           invalid={ep.Z_TO_A.validationState === 'error'}
                                                                           disabled={ep.locked}
                                                                           onChange={this.onZaBwChange}/>
                                                                    <InputGroupAddon addonType='append'>
                                                                        <InputGroupText>
                                                                            &lt;
                                                                        </InputGroupText>
                                                                    </InputGroupAddon>

                                                                </InputGroup>
                                                                <FormFeedback>{ep.Z_TO_A.validationText}</FormFeedback>
                                                            </FormGroup>
                                                            <FormGroup>
                                                                <FormText>
                                                                    <small>
                                                                        <p className='m-0'>Reservable: {ep.Z_TO_A.available} Mbps</p>
                                                                        <ToggleDisplay show={(ep.ero.mode === 'fits')}>
                                                                            <p className='m-0'>Widest: {ep.Z_TO_A.widest} Mbps</p>
                                                                        </ToggleDisplay>
                                                                        <p className='m-0'>Baseline: {ep.Z_TO_A.baseline} Mbps</p>
                                                                    </small>
                                                                </FormText>
                                                            </FormGroup>
                                                        </ToggleDisplay>
                                                        <ToggleDisplay show={ep.locked}>
                                                            <Alert color='info'>{ep.Z_TO_A.bw} Mbps</Alert>
                                                        </ToggleDisplay>
                                                    </Col>
                                                </Row>
                                            </Container>
                                        </CardBody>
                                    </Card>
                                </Col>
                                <Col xs={4} sm={4} md={4} lg={4}>
                                    <DeviceFixtures fixtures={zFixtures}
                                                    junction={pipe.z}
                                                    ingress={zIngress}
                                                    egress={zEgress}/>

                                </Col>
                            </Row>
                        </Container>
                        <hr/>
                        <Container fluid={true}>
                            <Row noGutters>
                                <Col xs={2} sm={2} md={2} lg={2}><strong>Path</strong></Col>
                                <Col xs={2} sm={2} md={2} lg={2}>
                                    <FormGroup>
                                        <Label>
                                            <Input type='checkbox' defaultChecked={ep.protect}
                                                   disabled={ep.locked}
                                                   onChange={this.protectClicked}/>
                                            Protect
                                        </Label>
                                    </FormGroup>
                                </Col>

                                <ToggleDisplay show={!ep.locked}>
                                    <Col>
                                        <PathModeSelect onSelectModeChange={this.onSelectModeChange}/>
                                    </Col>
                                </ToggleDisplay>
                            </Row>
                        </Container>
                        <hr/>
                        <Container fluid={true}>

                            <Row noGutters={true}>
                                <ToggleDisplay show={showEroControls}>
                                    <Col>
                                        <EroSelect/>
                                    </Col>
                                </ToggleDisplay>
                                <Col>
                                    <Card>
                                        <CardBody>
                                            <p><strong>ERO</strong></p>
                                            <ToggleDisplay show={!ep.locked}>
                                                <small>{ep.ero.message}</small>
                                            </ToggleDisplay>
                                            <ListGroup>
                                                {
                                                    ep.ero.hops.map(urn => {
                                                        return <ListGroupItem className='p-1' key={urn}>
                                                            <small>{urn}</small>
                                                        </ListGroupItem>
                                                    })
                                                }
                                            </ListGroup>

                                        </CardBody>
                                    </Card>
                                </Col>
                            </Row>
                        </Container>
                    </ToggleDisplay>
                    <hr/>
                    <ButtonToolbar className='float-right'>

                        <ConfirmModal body='Are you ready to delete this pipe?'
                                      header='Delete pipe'
                                      buttonText='Delete'
                                      onConfirm={this.deletePipe}/>

                        <ToggleDisplay show={!ep.locked}>
                            {' '}
                            <Button color='primary'
                                    disabled={disableLockBtn}
                                    onClick={this.lockPipe}>Lock</Button>
                        </ToggleDisplay>
                        <ToggleDisplay show={ep.locked}>
                            {' '}
                            <Button color='warning'
                                    onClick={this.unlockPipe}>Unlock</Button>
                        </ToggleDisplay>
                    </ButtonToolbar>
                </ModalBody>
            </Modal>);
    }
}

