import React, {Component} from 'react';

import {observer, inject} from 'mobx-react';
import {action, autorunAsync, whyRun} from 'mobx';

import ToggleDisplay from 'react-toggle-display';
import {Button, Panel, FormGroup, FormControl, ControlLabel} from 'react-bootstrap';
import Datetime from 'react-datetime';

import 'react-datetime/css/react-datetime.css';

import myClient from '../agents/client';
import validator from '../lib/validation';
import {PrecheckButton, HoldButton, ReleaseButton, CommitButton} from './controlButtons';


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
        let connState = this.props.stateStore.st.connState;
        if (what === 'validate') {
            return connState !== 'INITIAL';
        }
        if (what === 'precheck') {
            return connState !== 'VALIDATE_OK';
        }
        if (what === 'hold') {
            return connState !== 'CHECK_OK';

        }
        if (what === 'release') {
            return true;
            // TODO: implement release, then
            // return connState !== 'HOLD_OK';
        }
        if (what === 'commit') {
            return connState !== 'HOLD_OK';
        }
    };

    disposeOfValidate = autorunAsync('validate', () => {
        let validationParams = {
            connection: this.props.controlsStore.connection,
            junctions: this.props.sandboxStore.sandbox.junctions,
            fixtures: this.props.sandboxStore.sandbox.fixtures,
            pipes: this.props.sandboxStore.sandbox.pipes,
        };
        const result = validator.validatePrecheck(validationParams);
        setTimeout(() => {
            this.props.stateStore.validate();
            this.props.stateStore.postValidate(result.ok, result.errors);
        }, 15);


    }, 1000);

    componentWillUnmount() {
        this.disposeOfValidate();
    }

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
                <FormGroup validationState={validator.descriptionControl(conn.description)}>
                    <ControlLabel>Description</ControlLabel>
                    {' '}
                    <FormControl type="text"
                                 defaultValue={conn.description}
                                 onChange={this.onDescriptionChange}/>
                </FormGroup>

                <FormGroup validationState={validator.startAtControl(conn.startAt)}>
                    <ControlLabel>Start:</ControlLabel>
                    <Datetime size="8" name="Start" value={conn.startAt}
                              onChange={this.onStartDateChange}
                    />
                </FormGroup>
                <FormGroup validationState={validator.endAtControl(conn.startAt, conn.endAt)}>
                    <ControlLabel>End:</ControlLabel>
                    <Datetime size="8" name="End" value={conn.endAt}
                              onChange={this.onEndDateChange}
                    />
                </FormGroup>
                <FormGroup>
                    <ToggleDisplay show={this.props.stateStore.st.errors.length > 0}>
                        <Button onClick={() => {
                            this.props.controlsStore.openModal('displayErrors');
                        }}>Display errors</Button>{' '}
                    </ToggleDisplay>

                    <ToggleDisplay show={!this.isDisabled('precheck')}>
                        <PrecheckButton />{' '}
                    </ToggleDisplay>

                    <ToggleDisplay show={!this.isDisabled('hold')}>
                        <HoldButton />{' '}
                    </ToggleDisplay>

                    <ToggleDisplay show={!this.isDisabled('release')}>
                        <ReleaseButton />{' '}
                    </ToggleDisplay>

                    <ToggleDisplay show={!this.isDisabled('commit')}>
                        <CommitButton />{' '}
                    </ToggleDisplay>
                </FormGroup>

            </Panel>
        );
    }
}