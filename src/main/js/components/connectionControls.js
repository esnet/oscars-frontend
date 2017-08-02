import React, {Component} from 'react';

import {observer, inject} from 'mobx-react';
import {action, autorunAsync, toJS} from 'mobx';


import ToggleDisplay from 'react-toggle-display';
import {Form, Button, Panel, FormGroup, FormControl } from 'react-bootstrap';

import myClient from '../agents/client';
import validator from '../lib/validation';
import {PrecheckButton, HoldButton, ReleaseButton, CommitButton} from './controlButtons';


@inject('controlsStore', 'designStore', 'modalStore')
@observer
export default class ConnectionControls extends Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {

        myClient.submitWithToken('GET', '/protected/conn/generateId')
            .then(
                action((response) => {
                    let params = {
                        description: '',
                        connectionId: response
                    };
                    this.props.controlsStore.setParamsForConnection(params);
                }));

    }



    disposeOfValidate = autorunAsync('validate', () => {
        let validationParams = {
            connection: this.props.controlsStore.connection,
            junctions: this.props.designStore.design.junctions,
            pipes: this.props.designStore.design.pipes,
            fixtures: this.props.designStore.design.fixtures,
        };


        const result = validator.validateConnection(validationParams);
        this.props.controlsStore.setParamsForConnection({
            validation: {
                errors: result.errors,
                acceptable: result.ok
            }
        });


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
        const header = <span>Connection : {conn.connectionId}</span>;

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
                        <ToggleDisplay show={!conn.validation.acceptable}>
                            <Button bsStyle='warning' className='pull-right'
                                    onClick={() => {
                                        this.props.modalStore.openModal('connectionErrors');
                                    }}>Display errors</Button>{' '}
                        </ToggleDisplay>

                        <ToggleDisplay show={conn.validation.acceptable}>
                            <CommitButton/>{' '}
                        </ToggleDisplay>
                    </FormGroup>


                </Form>
            </ Panel>
        );
    }
}