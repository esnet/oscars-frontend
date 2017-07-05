import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {toJS, action, autorun, computed, whyRun} from 'mobx';
import {FormGroup, FormControl, ControlLabel, HelpBlock} from 'react-bootstrap';

import myClient from '../agents/client';

import FixtureSelect from './fixtureSelect';
import VlanSelectMode from './vlanSelectMode';

@inject('sandboxStore', 'controlsStore')
@observer
export default class VlanExpression extends Component {
    state = {
        vlanSelectMode: 'typeIn'
    };

    fixturesAllowingSameVlan() {
        let result = {};
        const fixture = this.props.controlsStore.fixture;
        if (fixture === null) {
            return result;
        }

        // I can only choose to have the same VLAN if another fixture exists that is
        //    - either on a DIFFERENT device
        //    - or, if it is on the SAME device, NOT on the same port

        const port = fixture.port;
        const device = fixture.device;
        this.props.sandboxStore.sandbox.fixtures.map((f) => {
            if (f.device !== device) {
                result[f.id] = f;
            } else if (f.port !== port) {
                result[f.id] = f;
            }
        });
        return result;
    }


    setVlanExpression = (e) => {
        this.props.setModified(true);
        this.props.controlsStore.setVlanExpression(e.target.value);
    };

    componentWillMount() {
        const controlsStore = this.props.controlsStore;
        const fixture = controlsStore.fixture;


        if (fixture === null) {
            return;
        }
        this.props.controlsStore.setOtherFixtures(this.fixturesAllowingSameVlan());

        const port = fixture.port;

        let request = {
            'urns': [port],
            'startDate': this.props.controlsStore.selection.startAt,
            'endDate': this.props.controlsStore.selection.endAt,
        };
        myClient.submit('POST', '/vlan/port', request)
            .then(
                action((response) => {
                    let parsed = JSON.parse(response);
                    let vlanExpr = parsed['portVlans'][port]['vlanExpression'];
                    this.props.controlsStore.setAvailableVlans(vlanExpr);
                    if (this.props.controlsStore.fixture.vlan === null) {
                        this.vlanExpressionControl.value = vlanExpr;
                    }
                }));
    }

    updateVlanExpression = (params) => {
        this.vlanExpressionControl.value = params.vlanExpression;
        this.vlanExpressionControl.disabled = params.disableVlanExpression;
        this.setState({
            vlanSelectMode: params.vlanSelectMode
        });
    };

    fixtureSelected = (e) => {

        let newVlanExpression = '';

        if (e.target.value !== 'choose') {
            let fixture = JSON.parse(e.target.value);
            this.props.setModified(true);
            newVlanExpression = fixture.vlanExpression;
            if (fixture.vlan !== null) {
                newVlanExpression = fixture.vlan;
            }
        }

        this.props.controlsStore.setVlanExpression(newVlanExpression);
        this.vlanExpressionControl.value = newVlanExpression;
    };

    render() {

        let fixtureSelect = null;
        if (this.state.vlanSelectMode === 'sameAs') {
            fixtureSelect = <FixtureSelect onChange={this.fixtureSelected}/>;
        }

        let vlanExpression = this.props.controlsStore.fixture.vlanExpression;
        let availableVlans = this.props.controlsStore.fixture.availableVlans;
        let vlan = this.props.controlsStore.fixture.vlan;

        let result = <div />;
        if (vlan === null) {
            result = <div>
                <VlanSelectMode setModified={this.props.setModified}
                                updateVlanExpression={this.updateVlanExpression}/>
                {' '}
                { fixtureSelect }
                {' '}
                <FormGroup controlId="vlanExpression">
                    <ControlLabel>VLAN expression:</ControlLabel>
                    {' '}
                    <FormControl inputRef={ref => {
                        this.vlanExpressionControl = ref;
                    }}
                                 defaultValue={vlanExpression}
                                 type="text"
                                 onChange={this.setVlanExpression}/>
                    {' '}
                    <HelpBlock>Available: {availableVlans}</HelpBlock>
                </FormGroup>
            </div>;

        }


        return result;
    }
}