import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {toJS, action} from 'mobx';
import {FormGroup, Button, FormControl, ControlLabel, Panel, HelpBlock} from 'react-bootstrap';

import myClient from '../agents/client';

import FixtureSelect from './fixtureSelect';
import VlanExpression from './vlanExpression';

@inject('sandboxStore', 'controlsStore')
@observer
export default class VlanSelectMode extends Component {

    vlanSelectModeChanged = (e) => {
        let mode = e.target.value;
        let fixtures = this.props.fixturesAllowingSameVlan;
        this.props.setModified(true);

        let params = {
            vlanSelectMode: mode,
            vlanExpression: '',
            disableVlanExpression: false
        };

        if (mode !== 'typeIn') {
            params.disableVlanExpression = true;
        }

        let firstFixture = null;

        Object.keys(fixtures).map((fixtureId) => {
            let fixture = fixtures[fixtureId];
            if (firstFixture === null) {
                firstFixture = fixture;
            }
        });

        if (mode === 'sameAs') {
            params.vlanExpression = firstFixture.vlanExpression;
        } else if (mode === 'chooseForMe') {
            params.vlanExpression = this.props.controlsStore.fixture.availableVlans;
        } else {
            params.vlanExpression = '';
        }
        this.props.updateVlanExpression(params);
    };


    render() {
        let vlanSelectModeOpts = [{value: 'typeIn', label: 'From text input..'}];

        let fixturesAllowingSameVlan = this.props.fixturesAllowingSameVlan;

        if (Object.keys(fixturesAllowingSameVlan).length > 0) {
            vlanSelectModeOpts.push(
                {value: 'sameAs', label: 'Same as..'}
            );
        }
        vlanSelectModeOpts.push(
            {value: 'chooseForMe', label: 'Auto'}
        );

        return (
            <FormControl componentClass="select" onChange={this.vlanSelectModeChanged}>
                {
                    vlanSelectModeOpts.map((option, index) => {
                        return <option key={index} value={option.value}>{option.label}</option>
                    })
                }
            </FormControl>);


    }
}
