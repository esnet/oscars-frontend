import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {toJS, action} from 'mobx';
import {FormControl} from 'react-bootstrap';


@inject('sandboxStore', 'controlsStore')
@observer
export default class VlanSelectMode extends Component {



    render() {
        let vlanSelectModeOpts = [{value: 'fromAvailable', label    : 'Any from available'}];
        let fixtures = this.props.controlsStore.editFixture.vlanCopyFromOptions;

        if (Object.keys(fixtures).length > 0) {
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
