import React, {Component} from 'react';

import {observer, inject} from 'mobx-react';
import {Button, Panel, FormGroup, ControlLabel} from 'react-bootstrap';
import myClient from '../agents/client';
import {action} from 'mobx';

import Datetime from 'react-datetime';

import 'react-datetime/css/react-datetime.css';


@inject('sandboxStore')
@observer
export default class SandboxControls extends Component {
    constructor(props) {
        super(props);
        this.isDisabled = this.isDisabled.bind(this);

        this.validate = this.validate.bind(this);
        this.preCheck = this.preCheck.bind(this);
        this.hold = this.hold.bind(this);
        this.commit = this.commit.bind(this);
        this.reset = this.reset.bind(this);
    }


    componentWillMount() {
        let startAt = new Date();
        startAt.setTime(startAt.getTime() + 5000 * 60);

        let endAt = new Date();
        endAt.setDate(endAt.getDate() + 1);
        endAt.setTime(endAt.getTime() + 15000 * 60);
        this.props.sandboxStore.setStartAt(startAt);
        this.props.sandboxStore.setEndAt(endAt);
        myClient.loadJSON({method: 'GET', url: '/resv/newConnectionId'})
            .then(
                action((response) => {
                    let connId = JSON.parse(response)['connectionId'];
                    this.props.sandboxStore.setConnectionId(connId);
                }));

    }

    isDisabled(what) {
        let connState = this.props.sandboxStore.connState;
        if (what === 'validate') {
            return connState !== 'INITIAL';
        }
        if (what === 'precheck') {
            return connState !== 'VALIDATE_OK';
        }
        if (what === 'hold') {
            return connState !== 'CHECK_OK';

        }
        if (what === 'commit') {
            return connState !== 'HOLD_OK';
        }
    }

    validate() {
        this.props.sandboxStore.validate();
        setTimeout(() => {
            this.props.sandboxStore.postValidate(true)
        }, 1000);
        return false;

    }

    preCheck() {
        this.props.sandboxStore.check();
        setTimeout(() => {
            this.props.sandboxStore.postCheck(true)
        }, 1000);
        return false;
    }

    hold() {
        this.props.sandboxStore.hold();
        setTimeout(() => {
            this.props.sandboxStore.postHold(true)
        }, 1000);
        return false;

    }

    commit() {
        this.props.sandboxStore.commit();
        setTimeout(() => {
            this.props.sandboxStore.postCommit(true)
        }, 1000);
        return false;
    }

    reset() {
        this.props.sandboxStore.reset();
        return false;
    }

    handleStartDateChange = (newMoment) => {
        this.props.sandboxStore.setStartAt(newMoment.toDate());

    };

    handleEndDateChange = (newMoment) => {
        this.props.sandboxStore.setEndAt(newMoment.toDate());

    };

    render() {
        let header = <span>Connection id: {this.props.sandboxStore.selection.connectionId}</span>

        return (
            <Panel header={header}>
                <FormGroup>
                    <ControlLabel>Start:</ControlLabel>
                    <Datetime
                        size="8"
                        name="Start"
                        value={this.props.sandboxStore.selection.startAt}
                        onChange={this.handleStartDateChange}
                    />
                </FormGroup>
                <FormGroup>
                    <ControlLabel>End:</ControlLabel>
                    <Datetime
                        size="8"
                        name="End"
                        value={this.props.sandboxStore.selection.endAt}
                        onChange={this.handleEndDateChange}
                    />
                </FormGroup>
                <FormGroup>

                    <Button disabled={this.isDisabled('validate')} onClick={this.validate}>Validate</Button>{' '}
                    <Button disabled={this.isDisabled('precheck')} onClick={this.preCheck}>Precheck</Button>{' '}
                    <Button disabled={this.isDisabled('hold')} onClick={this.hold}>Hold</Button>{' '}
                    <Button disabled={this.isDisabled('commit')} onClick={this.commit}>Commit</Button>{' '}
                    <Button onClick={this.reset}>Reset</Button>
                </FormGroup>

            </Panel>
        );
    }
}