import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {toJS, action, autorun, computed, whyRun} from 'mobx';
import {
    OverlayTrigger, Glyphicon, Popover, Panel, FormGroup, Label,
    Button, FormControl, ControlLabel, HelpBlock, Well
} from 'react-bootstrap';
import ToggleDisplay from 'react-toggle-display';

import myClient from '../agents/client';

import FixtureSelect from './fixtureSelect';
import VlanSelectMode from './vlanSelectMode';
import picker from '../lib/picking';


@inject('designStore', 'controlsStore')
@observer
export default class VlanSelect extends Component {

    onPickClick = () => {
        picker.pick();
    };

    onReleaseClick = () => {
        picker.release();

    };


    fixturesAllowingSameVlan() {
        let result = {};
        const ef = this.props.controlsStore.editFixture;

        // I can only choose to have the same VLAN if another fixture exists that is
        //    - either on a DIFFERENT device
        //    - or, if it is on the SAME device, NOT on the same port

        const port = ef.port;
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

    vlanUpdateDispose = autorun('availVlanUpdate', () => {
        const controlsStore = this.props.controlsStore;
        const ef = this.props.controlsStore.editFixture;
        let foo = ef.fixtureId + ef.bwSelectionMode + ef.vlan + +ef.bwBeingEdited;


        this.props.controlsStore.setParamsForEditFixture({
            retrievingAvailVlans: true
        });

        let request = {
            'urns': [ef.port],
            'startDate': controlsStore.connection.startAt,
            'endDate': controlsStore.connection.endAt,
        };

        myClient.submit('POST', '/vlan/port', request)
            .then(
                action((response) => {
                    let parsed = JSON.parse(response);
                    let availableVlans = parsed['portVlans'][ef.port]['vlanExpression'];
                    let availableVlanRanges = parsed['portVlans'][ef.port]['vlanRanges'];
//                    console.log(response);

                    this.props.controlsStore.setParamsForEditFixture({
                        retrievingAvailVlans: false,
                        availableVlans: availableVlans,
                        availableVlanRanges: availableVlanRanges,
                        vlanCopyFromOptions: this.fixturesAllowingSameVlan()
                    });

                }));

    });


    componentWillUnmount() {
        this.vlanUpdateDispose();
    }

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

        let helpPopover = <Popover id='help-vlanSelect' title='Help'>
            <p>Select the VLAN for this fixture. In a valid design, all fixtures
                must have a locked in VLAN id.</p>
            <p>In the default "Any from available" mode, you can just click the "Pick" button and
                the lowest VLAN available will be selected and locked in.</p>
            <p>In the "From text input" mode, you can type in a VLAN expression.
                Then, click the "Pick" button and the lowest VLAN available and matching
                your expression will be selected and locked in.</p>
            <p>If the design contains another fixture where a VLAN has been picked and is
                also available on this fixture, then the "Same as..."
                selection mode will be made available.</p>
            <p>When the "Same as..." mode is selected, a second dropdown
                will appear allowing you to select the fixture to copy the VLAN value from.
                Click the "Pick" button to lock in your selection</p>


        </Popover>;


        let header = <p>VLAN selection
            <OverlayTrigger trigger='click' rootClose placement='left' overlay={helpPopover}>
                <Glyphicon className='pull-right' glyph='question-sign'/>
            </OverlayTrigger>
        </p>;


        return (
            <Panel header={header}>
                <ToggleDisplay show={!ef.showVlanReleaseControls}>
                    <h3><Label bsStyle='warning'>Vlan not picked!</Label></h3>
                </ToggleDisplay>

                <ToggleDisplay show={ef.showVlanPickControls}>
                    <VlanSelectMode selectModeChanged={this.selectModeChanged}/>
                    {' '}
                    <ToggleDisplay show={ef.vlanSelectionMode === 'sameAs'}>
                        <FixtureSelect onRef={ref => {
                            this.fixtureSelect = ref
                        }} mode='vlan' onChange={this.fixtureSelected}/>
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
                    {' '}

                </ToggleDisplay>
                {' '}
                <ToggleDisplay show={ef.showVlanReleaseControls}>
                    <Well>Picked VLAN: {ef.vlan}</Well>
                    {' '}
                    <Button bsStyle='warning' className='pull-right' onClick={this.onReleaseClick}>Release</Button>
                </ToggleDisplay>
                {' '}
                <ToggleDisplay show={ef.showVlanPickButton && !ef.retrievingAvailVlans}>
                    <Button bsStyle='primary' className='pull-right' onClick={this.onPickClick}>Pick</Button>
                </ToggleDisplay>
            </Panel>

        );

    }
}