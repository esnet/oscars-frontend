import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {toJS, action, autorun, computed, whyRun} from 'mobx';
import {
    OverlayTrigger, Glyphicon, Popover, Panel, FormGroup,
    FormControl, ControlLabel, HelpBlock, Well
} from 'react-bootstrap';
import ToggleDisplay from 'react-toggle-display';

import Validator from '../lib/validation';


@inject('designStore', 'controlsStore', 'topologyStore')
@observer
export default class VlanSelect extends Component {



    updateForm = () => {
        if (!this.props.controlsStore.connection.schedule.locked) {
            return;
        }

        const ef = this.props.controlsStore.editFixture;

        const baseline = this.props.topologyStore.baseline[ef.port];
        const baselineVlanExpression = baseline.vlanExpression;
        const baselineVlanRanges = baseline.vlanRanges;

        if (!(ef.port in this.props.topologyStore.available)) {
            console.error('internal error: port not found in topology.');
            return;
        }

        const available = this.props.topologyStore.available[ef.port];
        const availableVlanExpression = available.vlanExpression;
        const availableVlanRanges = available.vlanRanges;

        let lowest = 99999;
        availableVlanRanges.map((rng) => {
            if (lowest > rng.floor) {
                lowest = rng.floor;
            }
        });

        if (ef.locked) {
            return;
        }

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
                validationState: 'success',
                validationText: '',
                vlanId: lowest,
                acceptable: true
            }
        });


    };


    componentWillMount() {
        this.updateForm();
    }


    onTypeIn = (e) => {
        const vlanId = parseInt(e.target.value);
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
            valText = 'VLAN not in baseline.';
        } else {

            let inAvailable = false;
            ef.vlan.available.ranges.map((rng) => {
                if (rng.floor <= vlanId && rng.ceiling >= vlanId) {
                    inAvailable = true;
                }
            });
            if (!inAvailable) {
                hasError = true;
                valText = 'VLAN has been reserved by another connection.';

                let portVlans = this.props.designStore.vlansLockedOnPort(ef.port);
                console.log(portVlans);
                if (portVlans.includes(vlanId)) {
                    valText = 'VLAN is being used in this connection (by another fixture on this port).';
                }
            }
        }

        if (hasError) {
            valState = 'error';
        }


        this.props.controlsStore.setParamsForEditFixture({
            vlan: {
                acceptable: !hasError,
                validationState: valState,
                validationText: valText,
                vlanId: vlanId
            }
        });
    };

    render() {
        const ef = this.props.controlsStore.editFixture;

        let helpPopover = <Popover id='help-vlanSelect' title='VLAN selection'>
            <p>Here you can choose a VLAN id for this fixture. </p>

            <p>If the fixture is not locked, when the dialog opens the value will be set to the
                lowest available VLAN. You may type in a different value; if it is not available,
                you will receive feedback regarding why .</p>
            <p>The "Lock Fixture" button will lock in your selection.
                That button only appears when both the VLAN and bandwidth selections are valid/</p>
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
                        <HelpBlock>Available for your schedule: {ef.vlan.available.expression}</HelpBlock>
                        <HelpBlock>Baseline: {ef.vlan.baseline.expression}</HelpBlock>
                    </FormGroup>


                    {' '}
                    <FormGroup controlId="vlanChoice" validationState={ef.vlan.validationState}>
                        <ControlLabel>VLAN choice:</ControlLabel>
                        {' '}
                        <FormControl defaultValue={ef.vlan.available.lowest} type="text" onChange={this.onTypeIn}/>
                        <HelpBlock><p>{ef.vlan.validationText}</p></HelpBlock>
                        {' '}
                    </FormGroup>
                    {' '}
                    {Validator.label(ef.vlan.acceptable)}

                </ToggleDisplay>
                {' '}
                <ToggleDisplay show={ef.locked}>
                    <Well>Locked VLAN: {ef.vlan.vlanId}</Well>
                </ToggleDisplay>
            </Panel>

        );

    }
}

