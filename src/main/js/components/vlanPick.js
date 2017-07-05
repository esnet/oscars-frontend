import React, {Component} from 'react';
import {Button, FormControl, FormGroup, ControlLabel} from 'react-bootstrap';
import {observer, inject} from 'mobx-react';
import myClient from '../agents/client';
import {action} from 'mobx';

@inject('controlsStore', 'sandboxStore')
@observer
export default class VlanPick extends Component {

    onPickClick = () => {
        let request = {
            'connectionId': this.props.controlsStore.selection.connectionId,
            'port': this.props.controlsStore.fixture.port,
            'vlanExpression': this.props.controlsStore.fixture.vlanExpression,
            'startDate': this.props.controlsStore.selection.startAt,
            'endDate': this.props.controlsStore.selection.endAt,
        };
//        console.log(request);

        myClient.submit('POST', '/vlan/pick', request)
            .then(
                action((response) => {
                    let parsed = JSON.parse(response);
                    this.props.controlsStore.setVlan(parsed.vlanId);
                    this.props.sandboxStore.setFixtureVlan(this.props.controlsStore.fixture.id, parsed.vlanId);
                }));
    };

    onReleaseClick = () => {
        let request = {
            'connectionId': this.props.controlsStore.selection.connectionId,
            'port': this.props.controlsStore.fixture.port,
            'vlanId': this.props.controlsStore.fixture.vlan,
        };
//        console.log(request);

        myClient.submit('POST', '/vlan/release', request)
            .then(
                action(() => {
                    this.props.controlsStore.setVlan(null);
                    this.props.sandboxStore.unsetFixtureVlan(this.props.controlsStore.fixture.id);
                }));


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
            <FormControl defaultValue={fixture.vlan} disabled={true} type="text"/>
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
