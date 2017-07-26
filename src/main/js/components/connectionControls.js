import React, {Component} from 'react';

import {observer, inject} from 'mobx-react';
import {action, autorunAsync, toJS} from 'mobx';

import chrono from 'chrono-node';
import Moment from 'moment';

import ToggleDisplay from 'react-toggle-display';
import {HelpBlock, Form, Button, Panel, FormGroup, FormControl, ControlLabel} from 'react-bootstrap';

import myClient from '../agents/client';
import validator from '../lib/validation';
import {PrecheckButton, HoldButton, ReleaseButton, CommitButton} from './controlButtons';


@inject('controlsStore', 'stateStore', 'designStore')
@observer
export default class ConnectionControls extends Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {

        myClient.loadJSON({method: 'GET', url: '/resv/newConnectionId'})
            .then(
                action((response) => {
                    let connId = JSON.parse(response)['connectionId'];
                    let params = {
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
            junctions: this.props.designStore.design.junctions,
            pipes: this.props.designStore.design.pipes,
            fixtures: this.props.designStore.design.fixtures,
        };
        const result = validator.validateConnection(validationParams);
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

    render() {
        const conn = this.props.controlsStore.connection;
        const header = <span>Connection id: {conn.connectionId}</span>;
        const format = 'Y/MM/DD HH:mm';

        return (
            <Panel header={header}>
                <Form>
                    <FormGroup validationState={validator.descriptionControl(conn.description)}>
                        {' '}
                        <FormControl type='text' placeholder='description'
                                     defaultValue={conn.description}
                                     onChange={this.onDescriptionChange}/>
                    </FormGroup>
                    <FormGroup className='pull-right'>
                        <ToggleDisplay show={this.props.stateStore.st.errors.length > 0}>
                            <Button bsStyle='warning' className='pull-right'
                                    onClick={() => {
                                        this.props.controlsStore.openModal('connectionErrors');
                                    }}>Display errors</Button>{' '}
                        </ToggleDisplay>
                        <ToggleDisplay show={!this.isDisabled('precheck')}>
                            <PrecheckButton/>{' '}
                        </ToggleDisplay>

                        <ToggleDisplay show={!this.isDisabled('hold')}>
                            <HoldButton/>{' '}
                        </ToggleDisplay>

                        <ToggleDisplay show={!this.isDisabled('release')}>
                            <ReleaseButton/>{' '}
                        </ToggleDisplay>

                        <ToggleDisplay show={!this.isDisabled('commit')}>
                            <CommitButton/>{' '}
                        </ToggleDisplay>
                    </FormGroup>


                </Form>
            </ Panel>
        );
    }
}