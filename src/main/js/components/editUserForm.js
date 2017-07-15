import React, {Component} from 'react';
import {Row, Col, Panel, Form, FormControl, FormGroup, ControlLabel, Button, Checkbox} from 'react-bootstrap';
import {observer, inject} from 'mobx-react';
import {toJS, whyRun} from 'mobx';
import {size} from 'lodash'
import ToggleDisplay from 'react-toggle-display';


@inject('controlsStore')
@observer
export default class EditUserForm extends Component {
    constructor(props) {
        super(props);
    }

    // key presses
    handlePasswordKeyPress = (e) => {
        if (e.key === 'Enter') {
            this.props.submitPassword(this.passwordRef);
        }
    };
    handleParamKeyPress = (e) => {
        if (e.key === 'Enter') {
            this.props.submitUpdate();
        }
    };

    onParamChange = (key, val) => {
        let params = {};
        params[key] = val;
        this.props.controlsStore.setParamsForOneUser(params);

    };

    onPwdChange = (val) => {
        this.props.controlsStore.setPassword(val);
    };

    render() {
        let editUser = this.props.controlsStore.editUser;

        let allUsers = this.props.controlsStore.editUser.allUsers;

        if (Object.keys(this.props.controlsStore.editUser.user).length === 0) {
            return <div>Waiting to load..</div>;
        }


        let out = <Row>
            <Col md={6}>
                <Panel >

                    <Form>
                        <FormGroup>
                            <ControlLabel>Username</ControlLabel>
                            {' '}
                            <FormControl type='text'
                                         disabled={true}
                                         defaultValue={size(editUser.user.username) ? editUser.user.username : '' }
                                         onKeyPress={this.handleParamKeyPress}
                                         onChange={(e) => this.onParamChange('username', e.target.value)}/>
                        </FormGroup>
                        {' '}
                        {' '}
                        <FormGroup>
                            <ControlLabel>Full name</ControlLabel>
                            {' '}
                            <FormControl type='text'
                                         defaultValue={size(editUser.user.fullName) ? editUser.user.fullName : 'not set' }
                                         onKeyPress={this.handleParamKeyPress}
                                         onChange={(e) => this.onParamChange('fullName', e.target.value)}/>
                        </FormGroup>
                        {' '}
                        <FormGroup>
                            <ControlLabel>Email</ControlLabel>
                            {' '}
                            <FormControl type='text'
                                         defaultValue={size(editUser.user.email) ? editUser.user.email : 'not set' }
                                         onKeyPress={this.handleParamKeyPress}
                                         onChange={(e) => this.onParamChange('email', e.target.value)}/>
                        </FormGroup>
                        {' '}
                        <FormGroup>
                            <ControlLabel>Institution</ControlLabel>
                            {' '}
                            <FormControl type='text'
                                         defaultValue={size(editUser.user.institution) ? editUser.user.institution : 'not set' }
                                         onKeyPress={this.handleParamKeyPress}
                                         onChange={(e) => this.onParamChange('institution', e.target.value)}/>
                        </FormGroup>
                        {' '}
                        <FormGroup >
                            <Checkbox defaultChecked={editUser.user.permissions.adminAllowed} inline
                                      disabled={true}>Is admin?
                            </Checkbox>

                        </FormGroup>
                    </Form>
                    <div className='pull-right'>
                        <Button bsStyle='primary'
                                disabled={!size(editUser.user.username)}
                                onClick={this.props.submitUpdate}>Update</Button>

                        <ToggleDisplay show={this.props.allowDelete && size(allUsers) >= 2}>
                            <Button bsStyle='warning'
                                    disabled={!size(editUser.user.username)}
                                    onClick={this.props.submitDelete}>Delete</Button>
                        </ToggleDisplay>
                    </div>

                    <Form inline onSubmit={(e) => {
                        e.preventDefault()
                    }}>
                        <FormGroup>
                            <ControlLabel>Password</ControlLabel>
                            {' '}
                            <FormControl type='password'
                                         inputRef={(ref) => {
                                             this.passwordRef = ref
                                         }}
                                         defaultValue=''
                                         onKeyPress={this.handlePasswordKeyPress}
                                         onChange={(e) => this.onPwdChange(e.target.value)}/>
                            {' '}
                            <div className='pull-right'>
                                <Button bsStyle={size(editUser.password) ? 'primary' : 'default'}
                                        disabled={!size(editUser.password) || !size(editUser.user.username) }
                                        onClick={() => {
                                            this.props.submitPassword(this.passwordRef)
                                        }}>Set</Button>
                            </div>
                        </FormGroup>

                    </Form>
                </Panel>
            </Col>
        </Row>;

        return out;

    }
}