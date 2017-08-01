import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {toJS, action, autorun, computed, whyRun} from 'mobx';
import {
    OverlayTrigger, Glyphicon, Popover, Panel, FormGroup,
    FormControl, ControlLabel, HelpBlock, Well
} from 'react-bootstrap';
import ToggleDisplay from 'react-toggle-display';

import Validator from '../lib/validation';

import FixtureSelect from './fixtureSelect';


@inject('designStore', 'controlsStore', 'topologyStore')
@observer
export default class VlanSelect extends Component {

    fixturesAllowingSameVlan() {
        let result = {};
        const ef = this.props.controlsStore.editFixture;

        // I can only choose to have the same VLAN if another fixture exists that:
        // - is locked,
        //    - and, either on a DIFFERENT device
        //    - or, if it is on the SAME device, NOT on the same port
        //  - and the VLAN is not already locked by another fixture on this same port

        const port = ef.port;
        const portVlans = this.props.designStore.vlansLockedOnPort(port);


        const device = ef.device;
        this.props.designStore.design.fixtures.map((f) => {
            let maybeAdd = false;
            if (f.id !== ef.fixtureId && f.vlan !== null && f.locked) {
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
                ef.vlan.available.ranges.map((r) => {
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
        if (!this.props.controlsStore.connection.schedule.locked) {
            return;
        }

        const ef = this.props.controlsStore.editFixture;

        const baseline = this.props.topologyStore.baseline[ef.port];
        const baselineVlanExpression = baseline.vlanExpression;
        const baselineVlanRanges = baseline.vlanRanges;

        if (!(ef.port in this.props.topologyStore.available)) {
            return;
        }

        const available = this.props.topologyStore.available[ef.port];

        const availableVlanExpression = available.vlanExpression;
        const availableVlanRanges = available.vlanRanges;
//        console.log('vlanUpdate '+availableVlanExpression);


        let lowest = 99999;
        availableVlanRanges.map((rng) => {
            if (lowest > rng.floor) {
                lowest = rng.floor;
            }
        });


        this.props.controlsStore.setParamsForEditFixture({
            vlan: {
                available: {
                    expression: availableVlanExpression,
                    ranges: availableVlanRanges,
                    lowest: lowest
                },
                baseline: {
                    expression: baselineVlanExpression,
                    ranges: baselineVlanRanges

                },
                copyFrom: {
                    options: this.fixturesAllowingSameVlan()
                }
            }
        });


    });


    componentWillUnmount() {
        this.vlanUpdateDispose();
    }

    selectModeChanged = (e) => {
        const mode = e.target.value;

        let params = {
            vlan: {
                acceptable: false,
                copied: {
                    show: false,
                },
                mode: mode
            }
        };

        if (mode === 'sameAs') {
            params.vlan.acceptable = true;
            this.fixtureSelect.clearSelection()
        }
        if (mode === 'fromAvailable') {
            params.vlan.acceptable = true;
        }

        this.props.controlsStore.setParamsForEditFixture(params);

    };

    fixtureSelected = (e) => {
        let params = {
            vlan: {
                acceptable: false,
                copied: {
                    show: false,
                }
            }
        };

        if (e.target.value !== 'choose') {
            const vlanId = JSON.parse(e.target.value).vlan;
            params.vlan.acceptable = true;
            params.vlan.vlanId = vlanId;
            params.vlan.copied.choice = vlanId;
        }

        this.props.controlsStore.setParamsForEditFixture(params);
    };

    onTypeIn = (e) => {
        const vlanId = e.target.value;
        const ef = this.props.controlsStore.editFixture;

        let valText = '';
        let valState = 'success';
        let hasError = false;

        let inBaseline = false;
        ef.vlan.baseline.ranges.map((rng) => {
            if (rng.floor <= vlanId && rng.ceiling >= vlanId) {
                inBaseline = true;
            }
        });
        if (!inBaseline) {
            hasError = true;
            valText = 'VLAN not available in baseline.';
        } else {

            let inAvailable = false;
            ef.vlan.available.ranges.map((rng) => {
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
            vlan: {
                acceptable: !hasError,
                typeIn: {
                    choice: vlanId,
                    validationState: valState,
                    validationText: valText
                }
            }
        });
    };

    render() {
        const ef = this.props.controlsStore.editFixture;

        let helpPopover = <Popover id='help-vlanSelect' title='VLAN selection'>
            <p>In a valid design, all fixtures must have a VLAN id. That ID must
                not be in use on this port, either by fixtures of other connections
                that are overlapping the proposed schedule, or by other fixtures in this design.</p>
            <p>In the default "Auto (lowest from available)" mode, the lowest VLAN available
                will be selected and locked in when you click the "Lock Fixture" button.</p>
            <p>In the "From text input" mode, you can type in a VLAN id. If it is available, the
                "Lock Fixture" button will be activated. Otherwise, the button will not appear
                and you will receive feedback regarding why the input is not acceptable.</p>
            <p>If the design contains at least one more (locked) fixture, and its VLAN could
                potentially be used on this fixture, then the "Same as..." selection mode
                will be made available, allowing you to copy that VLAN to this.</p>
            <p>When the "Same as..." mode is selected, a second dropdown
                will appear allowing you to select the fixture to copy the VLAN value from.
                Again, the "Lock Fixture" button will lock in your selection.</p>


        </Popover>;


        let header = <p>VLAN selection
            <OverlayTrigger trigger='click' rootClose placement='bottom' overlay={helpPopover}>
                <Glyphicon className='pull-right' glyph='question-sign'/>
            </OverlayTrigger>
        </p>;


        return (
            <Panel header={header}>
                <ToggleDisplay show={!ef.locked}>
                    <FormGroup controlId="vlanExpression">
                        <VlanSelectMode selectModeChanged={this.selectModeChanged}/>
                        <HelpBlock>Available for your schedule: {ef.vlan.available.expression}</HelpBlock>
                        <HelpBlock>Baseline: {ef.vlan.baseline.expression}</HelpBlock>
                    </FormGroup>

                    {' '}
                    <ToggleDisplay show={ef.vlan.mode === 'sameAs'}>
                        <FixtureSelect onRef={ref => {
                            this.fixtureSelect = ref
                        }} mode='vlan' onChange={this.fixtureSelected}/>
                    </ToggleDisplay>

                    {' '}
                    <ToggleDisplay show={ef.vlan.mode === 'typeIn'}>
                        <FormGroup controlId="vlanChoice" validationState={ef.vlan.typeIn.validationState}>
                            <ControlLabel>VLAN choice:</ControlLabel>
                            {' '}
                            <FormControl defaultValue={ef.vlan.typeIn.choice} type="text" onChange={this.onTypeIn}/>
                            <HelpBlock><p>{ef.vlan.typeIn.validationText}</p></HelpBlock>
                            {' '}
                        </FormGroup>
                    </ToggleDisplay>
                    {' '}
                    {Validator.label(ef.vlan.acceptable)}

                    <ToggleDisplay show={ef.vlan.copied.show}>
                        <Well>Copied VLAN id: {ef.vlan.copied.vlanId}</Well>
                    </ToggleDisplay>

                </ToggleDisplay>
                {' '}
                <ToggleDisplay show={ef.locked}>
                    <Well>Locked VLAN: {ef.vlan.vlanId}</Well>
                </ToggleDisplay>
            </Panel>

        );

    }
}


@inject('designStore', 'controlsStore')
@observer
class VlanSelectMode extends Component {



    render() {
        const ef = this.props.controlsStore.editFixture;

        let vlanSelectModeOpts = [{value: 'fromAvailable', label    : 'Auto (   lowest: '+ef.vlan.available.lowest+')'}];
        let options = this.props.controlsStore.editFixture.vlan.copyFrom.options;

        if (Object.keys(options).length > 0) {
            vlanSelectModeOpts.push(
                {value: 'sameAs', label: 'Copy from...'}
            );
        }
        vlanSelectModeOpts.push({value: 'typeIn', label: 'From text input..'});

        return (
            <FormControl componentClass="select" onChange={this.props.selectModeChanged}>
                {
                    vlanSelectModeOpts.map((option, index) => {
                        return <option key={index} value={option.value}>{option.label}</option>
                    })
                }
            </FormControl>);


    }
}