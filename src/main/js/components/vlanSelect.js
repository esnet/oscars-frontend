import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {toJS, action, autorun, computed, whyRun} from 'mobx';
import {Panel, FormGroup, Button, FormControl, ControlLabel, HelpBlock, Well} from 'react-bootstrap';
import ToggleDisplay from 'react-toggle-display';

import myClient from '../agents/client';
import validator from '../lib/validation'

import FixtureSelect from './fixtureSelect';
import VlanSelectMode from './vlanSelectMode';

@inject('sandboxStore', 'controlsStore')
@observer
export default class VlanSelect extends Component {

    onPickClick = () => {
        const ef = this.props.controlsStore.editFixture;
        const conn = this.props.controlsStore.connection;

        let requestExpression = ef.vlanExpression;

        if (ef.vlanSelectionMode === 'fromAvailable') {
            requestExpression = ef.availableVlans;
        } else if (ef.vlanSelectionMode === 'sameAs') {
            requestExpression = ef.copiedVlan;
        }

        const request = toJS({
            'connectionId': conn.connectionId,
            'port': ef.port,
            'vlanExpression': requestExpression,
            'startDate': conn.startAt,
            'endDate': conn.endAt,
        });

        console.log(ef.bwSelectionMode);
        console.log(request);

        myClient.submit('POST', '/vlan/pick', request)
            .then(
                action((response) => {
                    const parsed = JSON.parse(response);

                    let label = this.props.sandboxStore.setFixtureVlan(ef.fixtureId, parsed.vlanId);
                    const params = {
                        vlan: parsed.vlanId,
                        showVlanPickButton: false,
                        showVlanPickControls: false,
                        showVlanReleaseControls: true,
                        label: label,
                    };

                    this.props.controlsStore.setParamsForEditFixture(params);
                }));
    };

    onReleaseClick = () => {
        const ef = this.props.controlsStore.editFixture;
        const conn = this.props.controlsStore.connection;

        const request = {
            'connectionId': conn.connectionId,
            'port': ef.port,
            'vlanId': ef.vlan,
        };
//        console.log(request);

        myClient.submit('POST', '/vlan/release', request)
            .then(
                action(() => {
                    let label = this.props.sandboxStore.unsetFixtureVlan(ef.fixtureId);

                    const params = {
                        vlan: null,
                        showVlanPickButton: true,
                        showVlanPickControls: true,
                        showVlanReleaseControls: false,
                        label: label,
                    };
                    this.props.controlsStore.setParamsForEditFixture(params);
                }));


    };


    fixturesAllowingSameVlan() {
        let result = {};
        const ef = this.props.controlsStore.editFixture;

        // I can only choose to have the same VLAN if another fixture exists that is
        //    - either on a DIFFERENT device
        //    - or, if it is on the SAME device, NOT on the same port

        const port = ef.port;
        const device = ef.device;
        this.props.sandboxStore.sandbox.fixtures.map((f) => {
            let maybeAdd = false;
            if (f.id !== ef.fixtureId && f.vlan !== null) {
                if (f.device !== device) {
                    maybeAdd = true;
                } else if (f.port !== port) {
                    maybeAdd = true;
                }
            }
            let add = false;
            if (maybeAdd) {
//                console.log(toJS(f));
//                console.log(toJS(ef.availableVlanRanges));
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

    updateAvailableVlans = autorun(() => {
        const controlsStore = this.props.controlsStore;
        const ef = this.props.controlsStore.editFixture;
        let foo = ef.fixtureId + ef.bwSelectionMode + ef.vlan +  + ef.bwBeingEdited;
        


        let request = {
            'urns': [ef.port],
            'startDate': controlsStore.connection.startAt,
            'endDate': controlsStore.connection.endAt,
        };
        console.log(request);

        myClient.submit('POST', '/vlan/port', request)
            .then(
                action((response) => {
                    let parsed = JSON.parse(response);
                    let availableVlans = parsed['portVlans'][ef.port]['vlanExpression'];
                    let availableVlanRanges = parsed['portVlans'][ef.port]['vlanRanges'];
//                    console.log(response);

                    this.props.controlsStore.setParamsForEditFixture({
                        availableVlans: availableVlans,
                        availableVlanRanges: availableVlanRanges,
                        vlanCopyFromOptions: this.fixturesAllowingSameVlan()
                    });

                }));

    });


    selectModeChanged = (e) => {
        const mode = e.target.value;

        let params = {
            vlanSelectionMode: mode,
        };

        if (mode === 'sameAs') {
            params.showCopiedVlan = false;
            params.showVlanPickButton = false;
            this.fixtureSelect.clearSelection()
        }

        if (mode === 'typeIn') {
            params.showCopiedVlan = false;
            params.vlanExpression = '';
            params.showVlanPickButton = true;
        }

        if (mode === 'fromAvailable') {
            params.showCopiedVlan = false;
            params.vlanExpression = '';
            params.showVlanPickButton = true;
        }

        this.props.controlsStore.setParamsForEditFixture(params);

    };

    fixtureSelected = (e) => {

        let copiedVlan = '';
        let showCopiedVlan = false;
        let showVlanPickButton = false;

        if (e.target.value !== 'choose') {
            copiedVlan = JSON.parse(e.target.value).vlan;
            showCopiedVlan = true;
            showVlanPickButton = true;
        }

        this.props.controlsStore.setParamsForEditFixture({
            vlanExpression: copiedVlan,
            copiedVlan: copiedVlan,
            showCopiedVlan: showCopiedVlan,
            showVlanPickButton: showVlanPickButton,
        });
    };

    setVlanExpression = (e) => {
        this.props.controlsStore.setParamsForEditFixture({
            vlanExpression: e.target.value
        });
    };


    render() {
        const ef = this.props.controlsStore.editFixture;
        const validationLabel = validator.fixtureVlanLabel(ef);
        const header = <span>VLAN selection <span className='pull-right'>{validationLabel}</span></span>;


        return (
            <Panel header={header}>

                <ToggleDisplay show={ef.showVlanPickControls}>
                    <VlanSelectMode selectModeChanged={this.selectModeChanged}/>
                    {' '}
                    <ToggleDisplay show={ef.vlanSelectionMode === 'sameAs'}>
                        <FixtureSelect onRef={ref => {this.fixtureSelect = ref}} mode='vlan' onChange={this.fixtureSelected}/>
                    </ToggleDisplay>
                    {' '}
                    <ToggleDisplay show={ef.vlanSelectionMode === 'typeIn'}>
                        <FormGroup controlId="vlanExpression">
                            <ControlLabel>VLAN expression:</ControlLabel>
                            {' '}
                            <FormControl defaultValue={ef.vlanExpression}
                                         placeholder='1:2,4,6:10,14'
                                         type="text"
                                         onChange={this.setVlanExpression}/>
                            {' '}
                            <HelpBlock>Available: {ef.availableVlans}</HelpBlock>
                        </FormGroup>
                    </ToggleDisplay>
                    {' '}

                    <ToggleDisplay show={ef.showCopiedVlan}>
                        <Well>Copied VLAN id {ef.copiedVlan}</Well>
                    </ToggleDisplay>

                    {' '}
                    <ToggleDisplay show={ef.vlanSelectionMode === 'fromAvailable'}>
                        <Well>Available for your schedule: <b>{ef.availableVlans}</b></Well>
                    </ToggleDisplay>

                </ToggleDisplay>
                <ToggleDisplay show={ef.showVlanReleaseControls}>
                    <Well>Picked VLAN: {ef.vlan}</Well>
                    <Button bsStyle='warning' onClick={this.onReleaseClick}>Release</Button>
                </ToggleDisplay>
                {' '}
                <ToggleDisplay show={ef.showVlanPickButton}>
                    <Button bsStyle='primary' onClick={this.onPickClick}>Pick</Button>
                </ToggleDisplay>
            </Panel>

        );

    }
}