import React, {Component} from 'react';

import {action} from 'mobx';
import {observer, inject} from 'mobx-react';

import ToggleDisplay from 'react-toggle-display';
import {Button, Panel, ListGroup, ListGroupItem, FormGroup, FormControl, ControlLabel} from 'react-bootstrap';
import Datetime from 'react-datetime';

import 'react-datetime/css/react-datetime.css';

import myClient from '../agents/client';
import reservation from '../lib/reservation';
import validator from '../lib/validation';
import PrecheckButton from './prechecker';


@inject('controlsStore', 'stateStore', 'sandboxStore')
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
                        description: '',
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
    };

    validate = () => {
        let validationParams = {
            connection: this.props.controlsStore.connection,
            junctions: this.props.sandboxStore.sandbox.junctions,
            fixtures: this.props.sandboxStore.sandbox.fixtures,
            pipes: this.props.sandboxStore.sandbox.pipes,
        };
        this.props.stateStore.clearErrors();
        this.props.stateStore.validate();

        const result = validator.validatePrecheck(validationParams);
        this.props.stateStore.postValidate(result.ok, result.errors);
        return false;
    };

    hold = () => {
        this.props.stateStore.hold();
        setTimeout(() => {
            this.props.stateStore.postHold(true)
        }, 1000);
        return false;

    };

    commit = () => {
        this.props.stateStore.commit();
        setTimeout(() => {
            this.props.stateStore.postCommit(true)
        }, 1000);
        return false;
    };

    reset = () => {
        this.props.stateStore.reset();
        return false;
    };

    onDescriptionChange = (e) => {
        const params = {
            description: e.target.value
        };
        this.props.controlsStore.setParamsForConnection(params);
    };

    onStartDateChange = (newMoment) => {
        const params = {
            startAt: newMoment.toDate()
        };
        this.props.controlsStore.setParamsForConnection(params);
    };

    onEndDateChange = (newMoment) => {
        const params = {
            endAt: newMoment.toDate()
        };
        this.props.controlsStore.setParamsForConnection(params);
    };

    render() {
        const conn = this.props.controlsStore.connection;
        const header = <span>Connection id: {conn.connectionId}</span>;

        return (
            <Panel header={header}>
                <FormGroup>
                    <ControlLabel>Description</ControlLabel>
                    {' '}
                    <FormControl type="text"
                                 defaultValue={conn.description}
                                 onChange={this.onDescriptionChange}/>
                </FormGroup>

                <FormGroup>
                    <ControlLabel>Start:</ControlLabel>
                    <Datetime
                        size="8"
                        name="Start"
                        value={conn.startAt}
                        onChange={this.onStartDateChange}
                    />
                </FormGroup>
                <FormGroup>
                    <ControlLabel>End:</ControlLabel>
                    <Datetime
                        size="8"
                        name="End"
                        value={conn.endAt}
                        onChange={this.onEndDateChange}
                    />
                </FormGroup>
                <FormGroup>
                    <Button disabled={this.isDisabled('validate')} onClick={this.validate}>Validate</Button>{' '}
                    <PrecheckButton disabled={this.isDisabled('precheck')} />

                    <Button disabled={this.isDisabled('hold')} onClick={this.hold}>Hold</Button>{' '}
                    <Button disabled={this.isDisabled('commit')} onClick={this.commit}>Commit</Button>{' '}
                    <Button onClick={this.reset}>Reset</Button>
                </FormGroup>
                <ToggleDisplay show={this.props.stateStore.errors.length > 0}>
                    <Panel header='Errors'>
                        <ListGroup>{
                            this.props.stateStore.errors.map((error, idx) => {
                                return (
                                    <ListGroupItem key={idx}>{error}</ListGroupItem>
                                )

                            })
                        }
                        </ListGroup>
                    </Panel>

                </ToggleDisplay>

            </Panel>
        );
    }
}