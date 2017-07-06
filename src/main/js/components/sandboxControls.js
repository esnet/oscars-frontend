import React, {Component} from 'react';

import {observer, inject} from 'mobx-react';
import {Button, Panel, FormGroup, ControlLabel} from 'react-bootstrap';
import myClient from '../agents/client';
import {action} from 'mobx';

import Datetime from 'react-datetime';

import 'react-datetime/css/react-datetime.css';


@inject('controlsStore', 'stateStore')
@observer
export default class SandboxControls extends Component {
    constructor(props) {
        super(props);
    }


    componentWillMount() {
        let startAt = new Date();
        startAt.setTime(startAt.getTime() + 5000 * 60);

        let endAt = new Date();
        endAt.setDate(endAt.getDate() + 1);
        endAt.setTime(endAt.getTime() + 15000 * 60);
        myClient.loadJSON({method: 'GET', url: '/resv/newConnectionId'})
            .then(
                action((response) => {
                    let connId = JSON.parse(response)['connectionId'];
                    let params = {
                        startAt: startAt,
                        endAt: endAt,
                        connectionId: connId
                    };
                    this.props.controlsStore.setParamsForConnection(params);
                }));

    }

    isDisabled = (what) => {
        let connState = this.props.stateStore.connState;
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

    validate = () => {
        let conn = this.props.controlsStore.connection;
        console.log(conn);
        this.props.stateStore.validate();
        setTimeout(() => {
            this.props.stateStore.postValidate(true)
        }, 1000);
        return false;

    }

    preCheck = () => {
        this.props.stateStore.check();
        setTimeout(() => {
            this.props.stateStore.postCheck(true)
        }, 1000);
        return false;
    }

    hold = () => {
        this.props.stateStore.hold();
        setTimeout(() => {
            this.props.stateStore.postHold(true)
        }, 1000);
        return false;

    }

    commit = () => {
        this.props.stateStore.commit();
        setTimeout(() => {
            this.props.stateStore.postCommit(true)
        }, 1000);
        return false;
    }

    reset = () => {
        this.props.stateStore.reset();
        return false;
    }

    handleStartDateChange = (newMoment) => {
        let params = {
            startAt: newMoment.toDate()
        };
        this.props.controlsStore.setConnection(params);

    };

    handleEndDateChange = (newMoment) => {
        let params = {
            endAt: newMoment.toDate()
        };
        this.props.controlsStore.setConnection(params);
    };

    render() {
        let conn = this.props.controlsStore.connection;
        let header = <span>Connection id: {conn.connectionId}</span>;

        return (
            <Panel header={header}>
                <FormGroup>
                    <ControlLabel>Start:</ControlLabel>
                    <Datetime
                        size="8"
                        name="Start"
                        value={conn.startAt}
                        onChange={this.handleStartDateChange}
                    />
                </FormGroup>
                <FormGroup>
                    <ControlLabel>End:</ControlLabel>
                    <Datetime
                        size="8"
                        name="End"
                        value={conn.endAt}
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