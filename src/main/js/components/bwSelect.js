import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {toJS, autorun, whyRun} from 'mobx';
import {
    FormGroup, Glyphicon, FormControl, Checkbox, ControlLabel, Form,
    Panel, Well, Popover, OverlayTrigger, HelpBlock, Row, Col
} from 'react-bootstrap';
import ToggleDisplay from 'react-toggle-display';


import Validator from '../lib/validation';


@inject('controlsStore', 'designStore', 'topologyStore')
@observer
export default class BwSelect extends Component {
    constructor(props) {
        super(props);
    }

    bwUpdateDispose = autorun('bwUpdate', () => {
        if (!this.props.controlsStore.connection.schedule.locked) {
            return;
        }

        const ef = this.props.controlsStore.editFixture;

        const baseline = this.props.topologyStore.baseline[ef.port];
        const baselineIngressBw = baseline.ingressBandwidth;
        const baselineEgressBw = baseline.egressBandwidth;

        if (!(ef.port in this.props.topologyStore.available)) {
            return;
        }

        const available = this.props.topologyStore.available[ef.port];
        const availableIngressBw = available.ingressBandwidth;
        const availableEgressBw = available.egressBandwidth;
//        console.log('bwUpdate ' +availableIngressBw+ ' / '+availableEgressBw);


        this.props.controlsStore.setParamsForEditFixture({
            bw: {
                baseline: {
                    ingress: baselineIngressBw,
                    egress: baselineEgressBw,
                },
                available: {
                    ingress: availableIngressBw,
                    egress: availableEgressBw
                }
            }
        });

    });

    componentWillMount() {
        const ef = this.props.controlsStore.editFixture;
        if (ef.locked) {
            return;
        }

        this.props.controlsStore.setParamsForEditFixture({
            bw: {
                acceptable: true,
                ingress: {
                    mbps: 0,
                    validationState: 'success',
                    validationText: ''
                },
                egress: {
                    mbps: 0,
                    validationState: 'success',
                    validationText: ''

                }
            }
        });
    }


    componentWillUnmount() {
        this.bwUpdateDispose();
    }

    symmetricalCheckboxClicked = (e) => {
        const ef = this.props.controlsStore.editFixture;

        const mustBecomeSymmetrical = e.target.checked;
        let params = {
            bw: {
                symmetrical: mustBecomeSymmetrical
            }
        };

        if (mustBecomeSymmetrical) {
            params.bw.egress = {
                mbps: ef.bw.ingress.mbps
            };
            this.egressControl.value = ef.bw.ingress.mbps;
            this.onEgressBwChange(
                {
                    target: {
                        value: ef.bw.ingress.mbps
                    }
                });
        }
        this.props.controlsStore.setParamsForEditFixture(params);
    };

    onIngressBwChange = (e) => {
        let inputStr = Validator.cleanBandwidth(e.target.value, this.ingressControl);

        const newIngress = Number(inputStr);
        const ef = this.props.controlsStore.editFixture;
        if (isNaN(newIngress) || e.target.value.length === 0) {
            this.props.controlsStore.setParamsForEditFixture({
                bw: {
                    acceptable: false,
                    ingress: {
                        validationState: 'error',
                        validationText: 'Not a number'
                    }
                }
            });
            return;
        } else if (newIngress < 0) {
            this.props.controlsStore.setParamsForEditFixture({
                bw: {
                    acceptable: false,
                    ingress: {
                        validationState: 'error',
                        validationText: 'Negative value'
                    }
                }
            });
            return;
        }

        let overInBaseline = newIngress > ef.bw.baseline.ingress;
        let overEgBaseline = newIngress > ef.bw.baseline.egress;
        let overInAvailable = newIngress > ef.bw.available.ingress;
        let overEgAvailable = newIngress > ef.bw.available.egress;

        if (ef.bw.symmetrical) {
            let ingressValidationState = 'success';
            let egressValidationState = 'success';
            let ingressValidationText = 'Bandwidth available';
            let egressValidationText = 'Bandwidth available';
            let error = false;

            this.egressControl.value = newIngress;

            if (overInBaseline) {
                ingressValidationState = 'error';
                egressValidationState = 'error';
                ingressValidationText = 'Ingress exceeds baseline';
                error = true;

            } else if (overInAvailable) {
                ingressValidationState = 'error';
                egressValidationState = 'error';
                ingressValidationText = 'Ingress exceeds available';
                error = true;
            }
            if (overEgBaseline) {
                ingressValidationState = 'error';
                egressValidationState = 'error';
                egressValidationText = 'Egress exceeds baseline';
                error = true;

            } else if (overEgAvailable) {
                ingressValidationState = 'error';
                egressValidationState = 'error';
                egressValidationText = 'Egress exceeds available';
                error = true;
            }

            this.props.controlsStore.setParamsForEditFixture({
                bw: {
                    acceptable: !error,
                    ingress: {
                        validationState: ingressValidationState,
                        validationText: ingressValidationText,
                    },
                    egress: {
                        validationState: egressValidationState,
                        validationText: egressValidationText,

                    }
                }
            });
            if (!error) {
                this.props.controlsStore.setParamsForEditFixture({
                    bw: {
                        ingress: {
                            mbps: newIngress
                        },
                        egress: {
                            mbps: newIngress
                        }
                    }
                });
            }
        } else {

            if (overInBaseline) {
                this.props.controlsStore.setParamsForEditFixture({
                    bw: {
                        acceptable: false,
                        ingress: {
                            validationState: 'error',
                            validationText: 'Ingress exceeds baseline'
                        }
                    }
                });

            } else if (overInAvailable) {
                this.props.controlsStore.setParamsForEditFixture({
                    bw: {
                        acceptable: false,
                        ingress: {
                            validationState: 'error',
                            validationText: 'Ingress exceeds available'
                        }
                    }
                });
            } else {
                let acceptable = true;
                if (ef.bw.egress.mbps > ef.bw.available.egress) {
                    acceptable = false;
                }
                this.props.controlsStore.setParamsForEditFixture({
                    bw: {
                        acceptable: acceptable,
                        ingress: {
                            mbps: newIngress,
                            validationState: 'success',
                            validationText: 'Bandwidth available'
                        }
                    }
                });
            }
        }
    };

    onEgressBwChange = (e) => {
        let inputStr = Validator.cleanBandwidth(e.target.value, this.egressControl);
        const newEgress = Number(inputStr);

        if (isNaN(newEgress) || e.target.value.length === 0) {
            this.props.controlsStore.setParamsForEditFixture({
                bw: {
                    acceptable: false,
                    egress: {
                        validationState: 'error',
                        validationText: 'Not a number'
                    }
                }
            });
            return;
        } else if (newEgress < 0) {
            this.props.controlsStore.setParamsForEditFixture({
                bw: {
                    acceptable: false,
                    egress: {
                        validationState: 'error',
                        validationText: 'Negative value'
                    }
                }
            });
            return;

        }

        const ef = this.props.controlsStore.editFixture;

        if (newEgress > ef.bw.baseline.egress) {
            this.props.controlsStore.setParamsForEditFixture({
                bw: {
                    acceptable: false,
                    egress: {
                        validationState: 'error',
                        validationText: 'Egress exceeds baseline'

                    }
                }
            });
        } else if (newEgress > ef.bw.available.egress) {
            this.props.controlsStore.setParamsForEditFixture({
                bw: {
                    acceptable: false,
                    egress: {
                        validationState: 'error',
                        validationText: 'Egress exceeds available'
                    }
                }
            });
        } else {
            let acceptable = true;
            if (ef.bw.ingress.mbps > ef.bw.available.ingress) {
                acceptable = false;
            }
            this.props.controlsStore.setParamsForEditFixture({
                bw: {
                    acceptable: acceptable,
                    egress: {
                        mbps: newEgress,
                        validationState: 'success',
                        validationText: 'Bandwidth available'
                    }
                }
            });

        }
    };


    render() {
        const ef = this.props.controlsStore.editFixture;

        let helpPopover = <Popover id='help-bwSelect' title='Ingress / egress bandwidth help'>

            <p>In 'unlocked' mode, when the dialog opens the values will be editable and set to zero, with the
                'symmetrical' option enabled.</p>
            <p>You can type in the number you want (in Mbps) in the bandwidth controls. There will be feedback to
                indicate whether the bandwidth is available. </p>
            <p>As a convenience feature, if you type 'g' or 'G', that character will be replaced by '000'.</p>
            <p>You will also see 'baseline' and 'available' ranges displayed.</p>
            <p>The <u>baseline</u> range is what would be available if there were no other reservations, and generally
                does not change.</p>
            <p>The <u>available</u> range is calculated by taking the baseline and removing any bandwidth used by other
                reservations overlapping the selected schedule.</p>
            <p>If the symmetrical option is set, changes to the ingress control will also update the egress control to
                match.
                Disable the checkbox to allow the values to be edited separately.</p>

            <p>When the fixture is locked, this will display the selected ingress and egress values, and will not be
                editable. Unlock the fixture to edit.</p>

        </Popover>;


        return (
            <Panel>
                <Panel.Heading>
                    <p>Bandwidth selection
                        <OverlayTrigger trigger='click' rootClose placement='bottom' overlay={helpPopover}>
                            <Glyphicon className='pull-right' glyph='question-sign'/>
                        </OverlayTrigger>
                    </p>
                </Panel.Heading>
                <Panel.Body>

                    <ToggleDisplay show={!ef.locked}>

                        <Row>
                            <Col sm={6} md={6} lg={6}>

                                <FormGroup controlId="ingress" validationState={ef.bw.ingress.validationState}>
                                    <ControlLabel>Ingress (Mbps):</ControlLabel>
                                    <FormControl defaultValue='0'
                                                 inputRef={ref => {
                                                     this.ingressControl = ref;
                                                 }}
                                                 type="text" placeholder="0-100000"
                                                 onChange={this.onIngressBwChange}/>
                                    <HelpBlock><p>{ef.bw.ingress.validationText}</p></HelpBlock>
                                    <HelpBlock>Reservable: {ef.bw.available.ingress} Mbps</HelpBlock>
                                    <HelpBlock>Baseline: {ef.bw.baseline.ingress} Mbps</HelpBlock>

                                </FormGroup>
                            </Col>
                            <Col sm={6} md={6} lg={6}>
                                <FormGroup controlId="egress" validationState={ef.bw.egress.validationState}>
                                    <ControlLabel>Egress (Mbps):</ControlLabel>
                                    <FormControl defaultValue='0'
                                                 disabled={ef.bw.symmetrical}
                                                 inputRef={ref => {
                                                     this.egressControl = ref;
                                                 }}
                                                 onChange={this.onEgressBwChange}
                                                 type="text" placeholder="0-10000"/>
                                    <HelpBlock><p>{ef.bw.egress.validationText}</p></HelpBlock>
                                    <HelpBlock>Reservable: {ef.bw.available.egress} Mbps</HelpBlock>
                                    <HelpBlock>Baseline: {ef.bw.baseline.egress} Mbps</HelpBlock>
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={6} md={6} lg={6}>
                                <FormGroup controlId="symmetrical">
                                    <Checkbox defaultChecked={ef.bw.symmetrical}
                                              inline
                                              onChange={this.symmetricalCheckboxClicked}>Symmetrical
                                    </Checkbox>
                                </FormGroup>
                            </Col>
                        </Row>

                        {' '}
                        {Validator.label(ef.bw.acceptable)}
                    </ToggleDisplay>
                    <ToggleDisplay show={ef.locked}>
                        <Well>Locked ingress: {ef.bw.ingress.mbps}</Well>
                        <Well>Locked egress: {ef.bw.egress.mbps}</Well>
                    </ToggleDisplay>
                </Panel.Body>

            </Panel>);
    }
}
