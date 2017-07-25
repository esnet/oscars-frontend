import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {
    FormGroup, Label, Glyphicon, FormControl, Checkbox, ControlLabel,
    Panel, Button, Well, Popover, OverlayTrigger, HelpBlock
} from 'react-bootstrap';
import ToggleDisplay from 'react-toggle-display';
import FixtureSelect from './fixtureSelect';

import {toJS, autorun, whyRun} from 'mobx';


@inject('controlsStore', 'designStore', 'topologyStore')
@observer
export default class BwSelect extends Component {
    constructor(props) {
        super(props);
    }


    bwUpdateDispose = autorun('bwUpdate', () => {
        const ef = this.props.controlsStore.editFixture;

        const baseline = this.props.topologyStore.baseline[ef.port];
        const baselineIngressBw = baseline.ingressBandwidth;
        const baselineEgressBw = baseline.egressBandwidth;
        const available = this.props.topologyStore.available[ef.port];
        const availableIngressBw = available.ingressBandwidth;
        const availableEgressBw = available.egressBandwidth;
        const locked = this.props.designStore.bwLockedOnPort(ef.port);


        this.props.controlsStore.setParamsForEditFixture({
            baselineIngressBw: baselineIngressBw,
            baselineEgressBw: baselineEgressBw,
            availableIngressBw: availableIngressBw,
            availableEgressBw: availableEgressBw,
            lockedIngressBw: locked.ingress,
            lockedEgressBw: locked.egress,

        });

    });


    componentWillUnmount() {
        this.bwUpdateDispose();
    }

    symmetricalCheckboxClicked = (e) => {
        const ef = this.props.controlsStore.editFixture;

        const mustBecomeSymmetrical = e.target.checked;
        let params = {
            symmetrical: mustBecomeSymmetrical,

        };
        if (mustBecomeSymmetrical) {
            params.egress = ef.ingress;
            this.egressControl.value = ef.ingress;
        }
        this.props.controlsStore.setParamsForEditFixture(params);
    };

    onIngressBwChange = (e) => {
        const newIngress = Number(e.target.value);
        const ef = this.props.controlsStore.editFixture;
        if (isNaN(newIngress)) {
            this.props.controlsStore.setParamsForEditFixture({
                ingressValidationState: 'error',
                ingressValidationText: 'Not a number',
                showBwLockButton: false
            });
            return;
        }

        let overInBaseline = newIngress + ef.lockedIngressBw > ef.baselineIngressBw;
        let overEgBaseline = newIngress + ef.lockedEgressBw > ef.baselineEgressBw;
        let overInAvailable = newIngress + ef.lockedIngressBw > ef.availableIngressBw;
        let overEgAvailable = newIngress + ef.lockedEgressBw > ef.availableEgressBw;

        if (ef.symmetrical) {
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
                ingressValidationState: ingressValidationState,
                ingressValidationText: ingressValidationText,
                egressValidationState: egressValidationState,
                egressValidationText: egressValidationText,
                showBwLockButton: !error
            });
            if (!error) {
                this.props.controlsStore.setParamsForEditFixture({
                    ingress: newIngress,
                    egress: newIngress,
                });
            }
        } else {

            if (overInBaseline) {
                this.props.controlsStore.setParamsForEditFixture({
                    ingressValidationText: 'Ingress exceeds baseline',
                    showBwLockButton: false
                });

            } else if (overInAvailable) {
                this.props.controlsStore.setParamsForEditFixture({
                    ingressValidationState: 'error',
                    ingressValidationText: 'Ingress exceeds available',
                    showBwLockButton: false
                });
            } else {
                this.props.controlsStore.setParamsForEditFixture({
                    ingressValidationState: 'success',
                    ingressValidationText: '',
                    showBwLockButton: true,
                    ingress: newIngress
                });
            }
        }
    };

    onEgressBwChange = (e) => {
        const newEgress = Number(e.target.value);

        if (isNaN(newEgress)) {
            this.props.controlsStore.setParamsForEditFixture({
                egressValidationState: 'error',
                egressValidationText: 'Not a number',
                showBwLockButton: false
            });
            return;
        }

        const ef = this.props.controlsStore.editFixture;

        if (newEgress + ef.lockedEgressBw > ef.baselineEgressBw) {
            this.props.controlsStore.setParamsForEditFixture({
                egressValidationState: 'error',
                egressValidationText: 'Egress exceeds baseline',
                showBwLockButton: false
            });
        } else if (newEgress + ef.lockedEgressBw > ef.availableEgressBw) {
            this.props.controlsStore.setParamsForEditFixture({
                egressValidationState: 'error',
                egressValidationText: 'Egress exceeds available',
                showBwLockButton: false
            });
        } else {
            this.props.controlsStore.setParamsForEditFixture({
                egressValidationState: 'success',
                egressValidationText: '',
                showBwLockButton: true,
                egress: newEgress
            });
        }
    };

    otherFixtureSelected = (e) => {
        const ef = this.props.controlsStore.editFixture;
        let params = {};
        if (e.target.value !== 'choose') {
            let otherFixture = JSON.parse(e.target.value);

            params.copiedIngress = otherFixture.ingress;
            params.copiedEgress = otherFixture.egress;
            if (ef.bwSelectionMode === 'oppositeOf') {
                params.copiedIngress = otherFixture.egress;
                params.copiedEgress = otherFixture.ingress;
            }
            params.showBwLockButton = true;
        } else {
            params.copiedEgress = '-';
            params.copiedIngress = '-';
            params.showBwLockButton = false;
        }


        this.props.controlsStore.setParamsForEditFixture(params);
    };

    otherFixtures() {
        const ef = this.props.controlsStore.editFixture;

        // can only choose to have the same / different bandwidth with some other fixture
        let result = {};
        this.props.designStore.design.fixtures.map((f) => {
            if (f.id !== ef.fixtureId && f.bwLocked) {
                result[f.id] = {
                    id: f.id,
                    label: f.label,
                    device: f.device,
                    ingress: f.ingress,
                    egress: f.egress,
                };
            }
        });
        return result;
    }


    lockBw = () => {
        const ef = this.props.controlsStore.editFixture;
        let newIngress = ef.ingress;
        let newEgress = ef.egress;
        if (ef.showCopiedBw) {
            newIngress = ef.copiedIngress;
            newEgress = ef.copiedEgress;
        }
        let sbParams = {
            ingress: newIngress,
            egress: newEgress,
        };

        this.props.designStore.lockFixtureBandwidth(ef.fixtureId, sbParams);
        let efParams = {
            ingress: newIngress,
            egress: newEgress,
            showBwSetButton: false,
            bwLocked: true,
        };

        this.props.controlsStore.setParamsForEditFixture(efParams);
    };

    unlockBw = () => {
        const fixtureId = this.props.controlsStore.editFixture.fixtureId;
        this.props.designStore.unlockFixtureBandwidth(fixtureId);
        this.props.controlsStore.setParamsForEditFixture({
            showBwSetButton: true,
            bwLocked: false,

        });

    };


    componentWillMount() {
        this.props.controlsStore.setParamsForEditFixture({
            bwCopyFromOptions: this.otherFixtures()
        });
    }


    onSelectModeChange = (e) => {

        const mode = e.target.value;

        let params = {
            bwSelectionMode: mode,
            showCopiedBw: (mode === 'sameAs' || mode === 'oppositeOf')
        };

        if (mode === 'oppositeOf' || mode === 'sameAs') {
            params.showBwSetButton = false;
            params.copiedEgress = '-';
            params.copiedIngress = '-';

            this.fixtureSelect.clearSelection()
        }

        this.props.controlsStore.setParamsForEditFixture(params);

    };


    render() {
        const ef = this.props.controlsStore.editFixture;
        let showFixtureSelect = ef.bwSelectionMode === 'sameAs' || ef.bwSelectionMode === 'oppositeOf';

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
                <ToggleDisplay show={!ef.bwLocked}>
                    <h3><Label bsStyle='warning'>Bandwidth not locked!</Label></h3>
                    <BwSelectModeOptions onSelectModeChange={this.onSelectModeChange}/>
                    {' '}
                    <ToggleDisplay show={showFixtureSelect}>
                        <FixtureSelect mode='bw' onRef={ref => {
                            this.fixtureSelect = ref
                        }} onChange={this.otherFixtureSelected}/>
                        <ToggleDisplay show={ef.showCopiedBw}>
                            <Well>New ingress: {ef.copiedIngress}</Well>
                            {' '}
                            <Well>New egress: {ef.copiedEgress}</Well>
                        </ToggleDisplay>
                    </ToggleDisplay>
                    <ToggleDisplay show={!showFixtureSelect}>
                        <FormGroup controlId="ingress" validationState={ef.ingressValidationState}>
                            <ControlLabel>Ingress:</ControlLabel>
                            <FormControl defaultValue={ef.ingress}
                                         type="text" placeholder="0-100000"
                                         onChange={this.onIngressBwChange}/>
                            <HelpBlock><p>{ef.ingressValidationText}</p></HelpBlock>
                            <HelpBlock>Available for your schedule: {ef.availableIngressBw}</HelpBlock>
                            <HelpBlock>Baseline: {ef.baselineIngressBw}</HelpBlock>
                            <HelpBlock>Locked by other fixtures: {ef.lockedIngressBw}</HelpBlock>

                        </FormGroup>
                        <FormGroup controlId="egress" validationState={ef.egressValidationState}>
                            <ControlLabel>Egress:</ControlLabel>
                            <FormControl defaultValue={ef.egress}
                                         disabled={ef.symmetrical}
                                         inputRef={ref => {
                                             this.egressControl = ref;
                                         }}
                                         onChange={this.onEgressBwChange}
                                         type="text" placeholder="0-10000"/>
                            <HelpBlock><p>{ef.egressValidationText}</p></HelpBlock>
                            <HelpBlock>Available for your schedule: {ef.availableEgressBw}</HelpBlock>
                            <HelpBlock>Baseline: {ef.baselineEgressBw}</HelpBlock>
                            <HelpBlock>Locked by other fixtures: {ef.lockedEgressBw}</HelpBlock>
                        </FormGroup>
                        <FormGroup controlId="symmetrical">
                            <Checkbox defaultChecked={ef.symmetrical} inline
                                      onChange={this.symmetricalCheckboxClicked}>Symmetrical
                            </Checkbox>
                        </FormGroup>
                    </ToggleDisplay>

                    <ToggleDisplay show={ef.showBwLockButton}>
                        <Button bsStyle='primary' className='pull-right' onClick={this.lockBw}>Lock bandwidth</Button>
                    </ToggleDisplay>
                </ToggleDisplay>
                <ToggleDisplay show={ef.bwLocked}>
                    <Well>Locked ingress: {ef.ingress}</Well>
                    <Well>Locked egress: {ef.egress}</Well>
                    <Button bsStyle='warning' className='pull-right' onClick={this.unlockBw}>Unlock</Button>
                </ToggleDisplay>

            </Panel>);
    }
}

@inject('controlsStore')
@observer
class BwSelectModeOptions extends Component {
    render() {

        let bwSelectModeOpts = [{value: 'typeIn', label: 'From text input..'}];
        let fixtures = this.props.controlsStore.editFixture.bwCopyFromOptions;

        if (Object.keys(fixtures).length > 0) {
            bwSelectModeOpts.push(
                {value: 'sameAs', label: 'Same as..'}
            );
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
    onSelectModeChange: React.PropTypes.func.isRequired
};
