import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {toJS, action, autorun, computed, whyRun} from 'mobx';
import {
    OverlayTrigger, Glyphicon, Popover, Panel, FormGroup, Label,
    Button, FormControl, ControlLabel, HelpBlock, Well
} from 'react-bootstrap';
import ToggleDisplay from 'react-toggle-display';


import FixtureSelect from './fixtureSelect';
import VlanSelectMode from './vlanSelectMode';


@inject('designStore', 'controlsStore', 'topologyStore')
@observer
export default class VlanSelect extends Component {

    fixturesAllowingSameVlan() {
        let result = {};
        const ef = this.props.controlsStore.editFixture;

        // I can only choose to have the same VLAN if another fixture exists that is
        //    - either on a DIFFERENT device
        //    - or, if it is on the SAME device, NOT on the same port
        // and it can't be a vlan locked by another fixture on this port

        const port = ef.port;
        const portVlans = this.props.designStore.vlansLockedOnPort(port);


        const device = ef.device;
        this.props.designStore.design.fixtures.map((f) => {
            let maybeAdd = false;
            if (f.id !== ef.fixtureId && f.vlan !== null) {
                if (f.device !== device) {
                    maybeAdd = true;
                } else if (f.port !== port) {
                    maybeAdd = true;
                }
            }

            if (portVlans.indexOf(f.vlan) !== -1) {
                maybeAdd = false;
            }

            let add = false;
            if (maybeAdd) {
                ef.availableVlanRanges.map((r) => {
                    if (f.vlan >= r.floor && f.vlan <= r.ceiling) {
                        add = true;
                    }
                });
            }
            if (add) {
                result[f.id] = {
                    id: f.id,
                    label: f.label,
                    device: f.device,
                    vlan: f.vlan,
                };
            }
        });
        return result;
    }

    vlanUpdateDispose = autorun('vlanUpdate', () => {
        const ef = this.props.controlsStore.editFixture;


        const baseline = this.props.topologyStore.baseline[ef.port];
        const baselineVlanExpression = baseline.vlanExpression;
        const baselineVlanRanges = baseline.vlanRanges;
        const available = this.props.topologyStore.available[ef.port];
        const availableVlanExpression = available.vlanExpression;
        const availableVlanRanges = available.vlanRanges;

        const portVlans = this.props.designStore.vlansLockedOnPort(ef.port);

        const lockedVlans = portVlans.join(',');

        this.props.controlsStore.setParamsForEditFixture({
            baselineVlanExpression: baselineVlanExpression,
            baselineVlanRanges: baselineVlanRanges,
            availableVlanExpression: availableVlanExpression,
            availableVlanRanges: availableVlanRanges,
            lockedVlans: lockedVlans,
            vlanCopyFromOptions: this.fixturesAllowingSameVlan()
        });


    });


    componentWillUnmount() {
        this.vlanUpdateDispose();
    }

    selectModeChanged = (e) => {
        const mode = e.target.value;

        let params = {
            showCopiedVlan: false,
            showVlanLockButton: false,
            vlanSelectionMode: mode,
        };

        if (mode === 'sameAs') {
            this.fixtureSelect.clearSelection()
        }

        if (mode === 'typeIn') {
            params.showVlanLockButton = false;
        }

        if (mode === 'fromAvailable') {
            params.showVlanLockButton = true;
            params.vlanLockText = 'Choose and lock.';
        }

        this.props.controlsStore.setParamsForEditFixture(params);

    };

    fixtureSelected = (e) => {

        let params = {
            copiedVlan: '',
            showCopiedVlan: false,
            showVlanLockButton: false,
        };

        if (e.target.value !== 'choose') {
            params.copiedVlan = JSON.parse(e.target.value).vlan;
            params.showCopiedVlan = true;
            params.showVlanLockButton = true;
            params.vlanLockText = 'Copy VLAN and lock.';
        }

        this.props.controlsStore.setParamsForEditFixture(params);
    };

    setVlanChoice = (e) => {
        const vlanId = e.target.value;
        const ef = this.props.controlsStore.editFixture;

        let valText = '';
        let valState = 'success';
        let hasError = false;

        let inBaseline = false;
        ef.baselineVlanRanges.map((rng) => {
            if (rng.floor <= vlanId && rng.ceiling >= vlanId) {
                inBaseline = true;
            }
        });
        if (!inBaseline) {
            hasError = true;
            valText = 'VLAN not available in baseline.';
        } else {

            let inAvailable = false;
            ef.availableVlanRanges.map((rng) => {
                if (rng.floor <= vlanId && rng.ceiling >= vlanId) {
                    inAvailable = true;
                }
            });
            if (!inAvailable) {
                hasError = true;
                valText = 'VLAN being used by another connection.';
            } else {
                let portVlans = this.props.designStore.vlansLockedOnPort(ef.port);
                if (portVlans.includes(vlanId)) {
                    hasError = true;
                    valText = 'VLAN being used by another fixture on the same port.';
                }
            }
        }

        if (hasError) {
            valState = 'error';
        }


        this.props.controlsStore.setParamsForEditFixture({
            vlanChoice: e.target.value,
            vlanChoiceValidationState: valState,
            vlanChoiceValidationText: valText,
            vlanLockText: 'Lock',
            showVlanLockButton: !hasError
        });
    };

    onLock = () => {
        const ef = this.props.controlsStore.editFixture;

        let vlan = ef.vlanChoice;
        let portVlans = this.props.designStore.vlansLockedOnPort(ef.port);


        if (ef.vlanSelectionMode === 'fromAvailable') {
            vlan = 99999;
            ef.availableVlanRanges.map((rng) => {
                if (vlan > rng.floor) {
                    vlan = rng.floor;
                    while (portVlans.indexOf(vlan) !== -1 && vlan < rng.ceiling) {
                        vlan = vlan + 1;
                    }
                }
            });
        } else if (ef.vlanSelectionMode === 'sameAs') {
            vlan = ef.copiedVlan;
        }

        let label = this.props.designStore.lockFixtureVlan(ef.fixtureId, vlan);

        const params = {
            vlan: vlan,
            showVlanLockButton: false,
            vlanLocked: true,
            label: label
        };

        this.props.controlsStore.setParamsForEditFixture(params);
    };

    onUnlock = () => {
        const ef = this.props.controlsStore.editFixture;
        let label = this.props.designStore.unlockFixtureVlan(ef.fixtureId);

        const params = {
            vlan: null,
            showVlanLockButton: true,
            vlanSelectionMode: 'fromAvailable',
            vlanLockText: 'Choose and lock',
            vlanLocked: false,
            label: label
        };
        this.props.controlsStore.setParamsForEditFixture(params);
    };


    render() {
        const ef = this.props.controlsStore.editFixture;

        let helpPopover = <Popover id='help-vlanSelect' title='Help'>
            <p>Select the VLAN for this fixture. In a valid design, all fixtures
                must have a locked VLAN id.</p>
            <p>In the default "Auto (lowest from available)" mode, click the "Choose and lock," button and
                the lowest VLAN available will be selected and locked in.</p>
            <p>In the "From text input" mode, you can type in a VLAN id. If it is available, the
                Lock button will allow you to lock it. Otherwise, you will
                receive feedback regarding why the input is not acceptable.</p>
            <p>If the design contains another fixture, where a VLAN has already been locked and that VLAN is
                also available on this fixture, then the "Same as..."
                selection mode will be made available.</p>
            <p>When the "Same as..." mode is selected, a second dropdown
                will appear allowing you to select the fixture to copy the VLAN value from.
                Click the "Copy VLAN and lock." button to lock in your selection.</p>


        </Popover>;


        let header = <p>VLAN selection
            <OverlayTrigger trigger='click' rootClose placement='left' overlay={helpPopover}>
                <Glyphicon className='pull-right' glyph='question-sign'/>
            </OverlayTrigger>
        </p>;


        return (
            <Panel header={header}>
                <ToggleDisplay show={!ef.vlanLocked}>
                    <h3><Label bsStyle='warning'>Vlan not locked!</Label></h3>

                    <FormGroup controlId="vlanExpression">
                        <VlanSelectMode selectModeChanged={this.selectModeChanged}/>

                        <HelpBlock>Available for your schedule: {ef.availableVlanExpression}</HelpBlock>
                        <HelpBlock>Baseline: {ef.baselineVlanExpression}</HelpBlock>
                        <HelpBlock>Locked by other fixtures: {ef.lockedVlans}</HelpBlock>
                    </FormGroup>

                    {' '}
                    <ToggleDisplay show={ef.vlanSelectionMode === 'sameAs'}>
                        <FixtureSelect onRef={ref => { this.fixtureSelect = ref }} mode='vlan' onChange={this.fixtureSelected}/>
                    </ToggleDisplay>

                    {' '}
                    <ToggleDisplay show={ef.vlanSelectionMode === 'typeIn'}>
                        <FormGroup controlId="vlanChoice"  validationState={ef.vlanChoiceValidationState}>
                            <ControlLabel>VLAN choice:</ControlLabel>
                            {' '}
                            <FormControl defaultValue={ef.vlanChoice} type="text"  onChange={this.setVlanChoice}/>
                            <HelpBlock><p>{ef.vlanChoiceValidationText}</p></HelpBlock>
                            {' '}
                        </FormGroup>
                    </ToggleDisplay>
                    {' '}

                    <ToggleDisplay show={ef.showCopiedVlan}>
                        <Well>Copied VLAN id: {ef.copiedVlan}</Well>
                    </ToggleDisplay>
                    {' '}
                    <ToggleDisplay show={ef.showVlanLockButton}>
                        <Button bsStyle='primary' className='pull-right' onClick={this.onLock}>{ef.vlanLockText}</Button>
                    </ToggleDisplay>

                </ToggleDisplay>
                {' '}
                <ToggleDisplay show={ef.vlanLocked}>
                    <Well>Locked VLAN: {ef.vlan}</Well>
                    {' '}
                    <Button bsStyle='warning' className='pull-right' onClick={this.onUnlock}>Unlock</Button>
                </ToggleDisplay>
            </Panel>

        );

    }
}