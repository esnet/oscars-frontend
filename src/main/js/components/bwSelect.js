import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {toJS, autorun, whyRun} from 'mobx';
import {
    FormGroup, Glyphicon, FormControl, Checkbox, ControlLabel, Form,
    Panel, Well, Popover, OverlayTrigger, HelpBlock, Row, Col
} from 'react-bootstrap';
import ToggleDisplay from 'react-toggle-display';
import PropTypes from 'prop-types';


import Validator from '../lib/validation';
import FixtureSelect from './fixtureSelect';


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

        let sameAsBwOptions = {};
        let oppositeOfBwOptions = {};

        this.props.designStore.design.fixtures.map((f) => {
            let option = {
                id: f.id,
                label: f.label,
                device: f.device,
                ingress: f.ingress,
                egress: f.egress,
            };
            if (f.id !== ef.fixtureId && f.locked) {
                if (f.egress <= availableIngressBw && f.ingress <= availableEgressBw) {
                    oppositeOfBwOptions[f.id] = option;
                }
                if (f.ingress <= availableIngressBw && f.egress <= availableEgressBw) {
                    sameAsBwOptions[f.id] = option;
                }
            }
        });


        this.props.controlsStore.setParamsForEditFixture({
            bw: {
                baseline: {
                    ingress: baselineIngressBw,
                    egress: baselineEgressBw,
                },
                available: {
                    ingress: availableIngressBw,
                    egress: availableEgressBw
                },
                copyFrom: {
                    sameAsOptions: sameAsBwOptions,
                    oppositeOfOptions: oppositeOfBwOptions,

                }
            }
        });

    });


    componentWillUnmount() {
        this.bwUpdateDispose();
    }

    symmetricalCheckboxClicked = (e) => {
        const ef = this.props.controlsStore.editFixture;

        const mustBecomeSymmetrical = e.target.checked;
        let params = {
            bw: {
                typeIn: {
                    symmetrical: mustBecomeSymmetrical,
                }
            }
        };
        if (mustBecomeSymmetrical) {
            params.bw.typeIn.egress = {choice: ef.bw.typeIn.ingress.choice};
            this.egressControl.value = ef.bw.typeIn.ingress.choice;
        }
        this.props.controlsStore.setParamsForEditFixture(params);
    };

    onIngressBwChange = (e) => {
        const newIngress = Number(e.target.value);
        const ef = this.props.controlsStore.editFixture;
        if (isNaN(newIngress) || e.target.value.length === 0) {
            this.props.controlsStore.setParamsForEditFixture({
                bw: {
                    acceptable: false,
                    typeIn: {
                        ingress: {
                            validationState: 'error',
                            validationText: 'Not a number'
                        }
                    }
                }
            });
            return;
        } else if (newIngress < 0 ) {
            this.props.controlsStore.setParamsForEditFixture({
                bw: {
                    acceptable: false,
                    typeIn: {
                        ingress: {
                            validationState: 'error',
                            validationText: 'Negative value'
                        }
                    }
                }
            });
            return;

        }

        let overInBaseline = newIngress > ef.bw.baseline.ingress;
        let overEgBaseline = newIngress > ef.bw.baseline.egress;
        let overInAvailable = newIngress > ef.bw.available.ingress;
        let overEgAvailable = newIngress > ef.bw.available.egress;

        if (ef.bw.typeIn.symmetrical) {
            let ingressValidationState = 'success';
            let egressValidationState = 'success';
            let ingressValidationText = '';
            let egressValidationText = '';
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
                    typeIn: {
                        ingress: {
                            validationState: ingressValidationState,
                            validationText: ingressValidationText,
                        },
                        egress: {
                            validationState: egressValidationState,
                            validationText: egressValidationText,

                        }
                    }
                }
            });
            if (!error) {
                this.props.controlsStore.setParamsForEditFixture({
                    bw: {
                        ingress: newIngress,
                        egress: newIngress,
                        typeIn: {
                            ingress: {
                                choice: newIngress
                            },
                            egress: {
                                choice: newIngress
                            }
                        }
                    }
                });
            }
        } else {

            if (overInBaseline) {
                this.props.controlsStore.setParamsForEditFixture({
                    bw: {
                        acceptable: false,
                        typeIn: {
                            ingress: {
                                validationState: 'error',
                                validationText: 'Ingress exceeds baseline'
                            },
                        }
                    }
                });

            } else if (overInAvailable) {
                this.props.controlsStore.setParamsForEditFixture({
                    bw: {
                        acceptable: false,
                        typeIn: {
                            ingress: {
                                validationState: 'error',
                                validationText: 'Ingress exceeds available'
                            },
                        }
                    }
                });
            } else {
                let acceptable = true;
                if (ef.bw.typeIn.egress.choice > ef.bw.available.egress) {
                    acceptable = false;
                }
                this.props.controlsStore.setParamsForEditFixture({
                    bw: {
                        acceptable: acceptable,
                        ingress: newIngress,
                        typeIn: {
                            ingress: {
                                choice: newIngress,
                                validationState: 'success',
                                validationText: ''
                            },
                        }
                    }
                });
            }
        }
    };

    onEgressBwChange = (e) => {
        const newEgress = Number(e.target.value);

        if (isNaN(newEgress) || e.target.value.length === 0) {
            this.props.controlsStore.setParamsForEditFixture({
                bw: {
                    acceptable: false,
                    typeIn: {
                        egress: {
                            validationState: 'error',
                            validationText: 'Not a number'
                        }
                    }
                }
            });
            return;
        } else if (newEgress < 0 ) {
            this.props.controlsStore.setParamsForEditFixture({
                bw: {
                    acceptable: false,
                    typeIn: {
                        egress: {
                            validationState: 'error',
                            validationText: 'Negative value'
                        }
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
                    typeIn: {
                        egress: {
                            validationState: 'error',
                            validationText: 'Egress exceeds baseline'

                        }
                    }
                }
            });
        } else if (newEgress > ef.bw.available.egress) {
            this.props.controlsStore.setParamsForEditFixture({
                bw: {
                    acceptable: false,
                    typeIn: {
                        egress: {
                            validationState: 'error',
                            validationText: 'Egress exceeds available'

                        }
                    }
                }
            });
        } else {
            let acceptable = true;
            if (ef.bw.typeIn.ingress.choice > ef.bw.available.ingress) {
                acceptable = false;
            }
            this.props.controlsStore.setParamsForEditFixture({
                bw: {
                    acceptable: acceptable,
                    egress: newEgress,
                    typeIn: {
                        egress: {
                            choice: newEgress,
                            validationState: 'success',
                            validationText: ''
                        },
                    }
                }
            });

        }
    };

    otherFixtureSelected = (e) => {
        const ef = this.props.controlsStore.editFixture;
        let params = {};
        if (e.target.value !== 'choose') {
            let otherFixture = JSON.parse(e.target.value);

            params.bw.copied.ingress = otherFixture.ingress;
            params.bw.copied.egress = otherFixture.egress;
            if (ef.bw.mode === 'oppositeOf') {
                params.bw.copied.ingress = otherFixture.egress;
                params.bw.copied.egress = otherFixture.ingress;
            }
            params.bw.acceptable = true;
        } else {
            params.bw.copied.ingress = '-';
            params.bw.copied.egress = '-';
            params.bw.acceptable = false;
        }


        this.props.controlsStore.setParamsForEditFixture(params);
    };

    onSelectModeChange = (e) => {

        const mode = e.target.value;

        let params = {
            bw: {
                mode: mode,
                copied: {
                    show: (mode === 'sameAs' || mode === 'oppositeOf')
                }
            },
        };

        if (mode === 'oppositeOf' || mode === 'sameAs') {
            params.bw.copyFrom.ingress = '-';
            params.bw.copyFrom.egress = '-';
            this.fixtureSelect.clearSelection()
        }

        this.props.controlsStore.setParamsForEditFixture(params);

    };


    render() {
        const ef = this.props.controlsStore.editFixture;
        let typeInMode = ef.bw.mode === 'typeIn';

        let helpPopover = <Popover id='help-bwSelect' title='Help'>
            <p>Select the bandwidth for this fixture. In a valid design, all fixtures
                must have set ingress and egress bandwith values.</p>
            <p>In the default "From text input" mode, you can just type in the bandwidth that you want.
                If the Symmetrical checkbox is unchecked, the Egress textbox will become enabled and
                you will be able to enter different values for Ingress and Egress.</p>
            <p>If the design contains another fixture, then the "Same as..." and "Opposite of..."
                selection modes will be available, allowing you to copy Ingress and Egress
                values to this one.</p>
            <p>When either "Same as..." or "Opposite from..." are selected, a second dropdown
                will appear allowing you to select the fixture to copy values from.</p>
            <p>Finally, click "Set" to lock in the values. Once set, click the "Release" button
                to edit again</p>

        </Popover>;


        let header = <p>Bandwidth selection
            <OverlayTrigger trigger='click' rootClose placement='left' overlay={helpPopover}>
                <Glyphicon className='pull-right' glyph='question-sign'/>
            </OverlayTrigger>
        </p>;


        return (
            <Panel header={header}>
                <ToggleDisplay show={!ef.locked}>
                    <Row>
                        <Col sm={12} md={12} lg={12}>
                            <Form inline>
                                <BwSelectModeOptions onSelectModeChange={this.onSelectModeChange}/>
                                {' '}
                                <ToggleDisplay show={typeInMode}>
                                    <FormGroup controlId="symmetrical">
                                        <Checkbox className='pull-right' defaultChecked={ef.bw.typeIn.symmetrical} inline
                                                  onChange={this.symmetricalCheckboxClicked}>Symmetrical
                                        </Checkbox>
                                    </FormGroup>
                                </ToggleDisplay>
                            </Form>
                        </Col>
                    </Row>


                    <ToggleDisplay show={!typeInMode}>
                        <FixtureSelect mode='bw' onRef={ref => {
                            this.fixtureSelect = ref
                        }} onChange={this.otherFixtureSelected}/>
                        <ToggleDisplay show={ef.bw.copied.show}>
                            <Well>Copied ingress: {ef.bw.copied.ingress}</Well>
                            {' '}
                            <Well>Copied egress: {ef.bw.copied.egress}</Well>
                        </ToggleDisplay>
                    </ToggleDisplay>
                    <ToggleDisplay show={typeInMode}>
                        <Row>
                            <Col sm={6} md={6} lg={6}>
                                <FormGroup controlId="ingress" validationState={ef.bw.typeIn.ingress.validationState}>
                                    <ControlLabel>Ingress:</ControlLabel>
                                    <FormControl defaultValue={ef.bw.typeIn.ingress.choice}
                                                 type="text" placeholder="0-100000 (Mbps)"
                                                 onChange={this.onIngressBwChange}/>
                                    <HelpBlock><p>{ef.bw.typeIn.ingress.validationText}</p></HelpBlock>
                                    <HelpBlock>Reservable: {ef.bw.available.ingress} Mbps</HelpBlock>
                                    <HelpBlock>Baseline: {ef.bw.baseline.ingress} Mbps</HelpBlock>

                                </FormGroup>
                            </Col>
                            <Col sm={6} md={6} lg={6}>
                                <FormGroup controlId="egress" validationState={ef.bw.typeIn.egress.validationState}>
                                    <ControlLabel>Egress:</ControlLabel>
                                    <FormControl defaultValue={ef.bw.typeIn.egress.choice}
                                                 disabled={ef.bw.typeIn.symmetrical}
                                                 inputRef={ref => {
                                                     this.egressControl = ref;
                                                 }}
                                                 onChange={this.onEgressBwChange}
                                                 type="text" placeholder="0-10000 (Mbps)"/>
                                    <HelpBlock><p>{ef.bw.typeIn.egress.validationText}</p></HelpBlock>
                                    <HelpBlock>Reservable: {ef.bw.available.egress} Mbps</HelpBlock>
                                    <HelpBlock>Baseline: {ef.bw.baseline.egress} Mbps</HelpBlock>
                                </FormGroup>
                            </Col>
                        </Row>
                    </ToggleDisplay>
                    {' '}
                    {Validator.label(ef.bw.acceptable)}
                </ToggleDisplay>
                <ToggleDisplay show={ef.locked}>
                    <Well>Locked ingress: {ef.bw.ingress}</Well>
                    <Well>Locked egress: {ef.bw.egress}</Well>
                </ToggleDisplay>

            </Panel>);
    }
}

@inject('controlsStore', 'designStore')
@observer
class BwSelectModeOptions extends Component {

    render() {
        const ef = this.props.controlsStore.editFixture;

        let bwSelectModeOpts = [{value: 'typeIn', label: 'From text input..'}];

        if (Object.keys(ef.bw.copyFrom.sameAsOptions).length > 0) {
            bwSelectModeOpts.push(
                {value: 'sameAs', label: 'Same as..'}
            );
        }
        if (Object.keys(ef.bw.copyFrom.oppositeOfOptions).length > 0) {
            bwSelectModeOpts.push(
                {value: 'oppositeOf', label: 'Opposite of..'}
            )
        }

        return <FormControl componentClass="select" onChange={this.props.onSelectModeChange}>
            {
                bwSelectModeOpts.map((option, index) => {
                    return <option key={index} value={option.value}>{option.label}</option>
                })
            }
        </FormControl>;
    }
}

BwSelectModeOptions.propTypes = {
    onSelectModeChange: PropTypes.func.isRequired
};
