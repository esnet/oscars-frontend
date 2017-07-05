import React, {Component} from 'react';
import {Button, FormControl, FormGroup, ControlLabel} from 'react-bootstrap';
import {observer, inject} from 'mobx-react';

@inject('controlsStore', 'sandboxStore')
@observer
export default class VlanSet extends Component {

    onPickClick = () => {
        this.props.controlsStore.setVlan('124');
    };

    onReleaseClick = () => {
        this.props.controlsStore.setVlan(null);

    };

    render() {
        const fixture = this.props.controlsStore.fixture;
        if (fixture === null) {
            return <div>No fixture.</div>
        }

        let pick = null;
        let release = <Button bsStyle='warning' onClick={this.onReleaseClick}>Release</Button>;

        let vlanDisplay = <FormGroup controlId='vlanDisplayControl'>
            <ControlLabel>Picked VLAN:</ControlLabel>
            {' '}

            <FormControl inputRef={ref => {
                this.vlanDisplayControl = ref;
            }}
                         defaultValue={fixture.vlan}
                         disabled={true}
                         type="text"/>
        </FormGroup>;

        if (fixture.vlan === null) {
            pick = <Button bsStyle='primary' onClick={this.onPickClick}>Pick</Button>;
            release = null;
            vlanDisplay = null;

        }


        return (
            <div>
                {vlanDisplay}
                { pick }
                {' '}
                { release }


            </div>
        );

    }
}
