import React, {Component} from 'react';

import {observer, inject} from 'mobx-react';
import {action, autorunAsync, toJS} from 'mobx';


import ToggleDisplay from 'react-toggle-display';
import {Form, Glyphicon, Button, Panel, FormGroup, FormControl, Well } from 'react-bootstrap';

import myClient from '../agents/client';
import validator from '../lib/validation';
import CommitButton from './commitButton';

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
                        phase: 'HELD',
                        connectionId: response
                    };
                    this.props.controlsStore.setParamsForConnection(params);
                }));

    }


    // TODO: make sure you can't uncommit past start time


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

        return (
            <Panel>
                <Form>
                    <Well bsSize='small' onClick={() => { this.props.modalStore.openModal('designHelp')}}>
                        <h3>Help me! <Glyphicon  className='pull-right' glyph='question-sign' /></h3>
                    </Well>
                    <FormGroup validationState={validator.descriptionControl(conn.description)}>
                        {' '}
                        <FormControl type='text' placeholder='description'
                                     defaultValue={conn.description}
                                     onChange={this.onDescriptionChange}/>
                    </FormGroup>
                    <FormGroup className='pull-right'>
                        <ToggleDisplay show={!conn.validation.acceptable} >
                            <Button bsStyle='warning' className='pull-right'
                                    onClick={() => {
                                        this.props.modalStore.openModal('connectionErrors');
                                    }}>Display errors</Button>{' '}
                        </ToggleDisplay>
                        {/*
                            <ToggleDisplay show={conn.phase === 'RESERVED' && conn.schedule.start.at > new Date()}>
                                <UncommitButton/>{' '}
                            </ToggleDisplay>
                            */
                        }

                        <ToggleDisplay show={conn.validation.acceptable && conn.phase === 'HELD'}>
                            <CommitButton/>
                        </ToggleDisplay>
                    </FormGroup>


                </Form>
            </ Panel>
        );
    }
}
