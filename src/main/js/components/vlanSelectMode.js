import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {toJS, action} from 'mobx';
import {FormControl} from 'react-bootstrap';


@inject('sandboxStore', 'controlsStore')
@observer
export default class VlanSelectMode extends Component {

    vlanSelectModeChanged = (e) => {
        let mode = e.target.value;
        this.props.setModified(true);

        let params = {
            vlanSelectMode: mode,
            vlanExpression: '',
            disableVlanExpression: false
        };

        if (mode !== 'typeIn') {
            params.disableVlanExpression = true;
        }

        if (mode === 'sameAs') {
            params.vlanExpression = '';
        } else if (mode === 'chooseForMe' || mode === 'typeIn') {
            params.vlanExpression = this.props.controlsStore.fixture.availableVlans;
        } else {
            params.vlanExpression = '';
        }
        this.props.controlsStore.setVlanExpression(params.vlanExpression);

        this.props.updateVlanExpression(params);
    };


    render() {
        let vlanSelectModeOpts = [{value: 'typeIn', label: 'From text input..'}];
        let fixtures = this.props.controlsStore.selection.otherFixtures;

        if (Object.keys(fixtures).length > 0) {
            vlanSelectModeOpts.push(
                {value: 'sameAs', label: 'Same as..'}
            );
        }
        vlanSelectModeOpts.push(
            {value: 'chooseForMe', label    : 'Auto'}
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
