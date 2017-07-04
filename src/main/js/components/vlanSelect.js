import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {toJS, action} from 'mobx';
import {FormGroup, Button, FormControl, ControlLabel, HelpBlock} from 'react-bootstrap';

import myClient from '../agents/client';

import FixtureSelect from './fixtureSelect';

@inject('sandboxStore')
@observer
export default class VlanSelect extends Component {
    constructor(props) {
        super(props);
        this.setSelectedVlan = this.setSelectedVlan.bind(this);
        this.fixtureSelected = this.fixtureSelected.bind(this);
    }

    state = {
        vlanSelectMode: 'typeIn',
        textControlDisabled: false,
        availableVlans: '',
        currentVlan: '',
        fixtureIdToCopy: ''
    };

    fixtureSelected(e) {
        let fixtureId = e.target.value;
        this.props.setModified(true);
        this.props.sandboxStore.sandbox.fixtures.map((f) => {
            if (f.id === fixtureId) {
                this.props.sandboxStore.selection.vlan = f.vlan;
                this.vlanTextControl.value = f.vlan;
                this.setState({
                    fixtureIdToCopy: fixtureId
                })

            }
        });

    }

    getVlanSelectModeOps() {

        let vlanSelectModeOpts = [{value: 'typeIn', label: 'From text input..'}];

        let fixturesAllowingSameVlan = this.fixturesAllowingSameVlan();

        if (fixturesAllowingSameVlan.length > 0) {
            vlanSelectModeOpts.push(
                {value: 'sameAs', label: 'Same as..'}
            );
        }
        vlanSelectModeOpts.push(
            {value: 'chooseForMe', label: 'Choose one for me..'}
        );

        return vlanSelectModeOpts;
    }

    fixturesAllowingSameVlan() {

        let selectedPort = this.props.sandboxStore.selection.port;
        let selectedDevice = this.props.sandboxStore.selection.device;

        // I can only choose to have the same VLAN if another fixture exists that is
        //    - either on a DIFFERENT device
        //    - or, if it is on the SAME device, NOT on the same port

        let result = [];
        this.props.sandboxStore.sandbox.fixtures.map((f) => {
            if (f.device !== selectedDevice) {
                result.push(f);
            } else if (f.port !== selectedPort) {
                result.push(f);
            }
        });
        return result;
    }

    setSelectedVlan(e) {
        this.props.setModified(true);
        this.props.sandboxStore.selection.vlan = e.target.value;
    }

    componentWillMount() {
        if (this.props.modal === 'fixture') {
            this.setState({
                'currentVlan': this.props.sandboxStore.selection.vlan
            });
        }
        let selection = toJS(this.props.sandboxStore.selection);
        let request = {
            'urns': [selection.port],
            'startDate':selection.startAt,
            'endDate':selection.endAt,
        }
        myClient.submit('POST', '/vlan/port', request)
            .then(
                action((response) => {
                    let parsed = JSON.parse(response);
                    // TODO: make sure available vlans exist etc
                    this.setState({
                        availableVlans: parsed['portVlans'][selection.port]['vlanExpression']
                    });
                }));
    }

    render() {

        let fixtures = this.fixturesAllowingSameVlan();

        let vlanSelectModeOpts = this.getVlanSelectModeOps();

        let vlanSelectOptions =
            <FormControl componentClass="select" onChange={(e) => {
                this.props.setModified(true);
                let disableTextControl = e.target.value !== 'typeIn';
                this.setState({
                    vlanSelectMode: e.target.value,
                    textControlDisabled: disableTextControl
                });
                if (e.target.value === 'sameAs') {
                    let referredFixture = fixtures[0];
                    if (this.state.fixtureIdToCopy !== '') {
                        referredFixture = this.props.sandboxStore.findFixture(this.state.fixtureIdToCopy);
                    }
                    this.vlanTextControl.value = referredFixture.vlan;

                } else {
                    this.vlanTextControl.value = 0;
                }

            }}>
                {
                    vlanSelectModeOpts.map((option, index) => {
                        return <option key={index} value={option.value}>{option.label}</option>
                    })
                }
            </FormControl>;


        let fixtureSelect = null;
        if (this.state.vlanSelectMode === 'sameAs') {
            fixtureSelect = <FixtureSelect fixtures={fixtures} onChange={this.fixtureSelected}/>;
        }
        let buttons = <div>
            <Button bsStyle='primary'>Set</Button>{' '}<Button>Release</Button>

        </div>

            let vlanTextBox = <FormGroup controlId="typeVLAN">
            <ControlLabel>VLAN expression:</ControlLabel>
            {' '}
            <FormControl type="text" placeholder="2000-2999"
                         inputRef={ref => {
                             this.vlanTextControl = ref;
                         }}
                         disabled={this.state.textControlDisabled}
                         onChange={this.setSelectedVlan}
                         defaultValue={this.state.currentVlan}/>
            <HelpBlock>Available with your schedule: {this.state.availableVlans}</HelpBlock>
            { buttons }
        </FormGroup>;

        return (
            <FormGroup controlId="vlan">
                <ControlLabel>VLAN selection:</ControlLabel>
                {vlanSelectOptions}
                {fixtureSelect}
                {vlanTextBox}
            </FormGroup>
        );

    }
}