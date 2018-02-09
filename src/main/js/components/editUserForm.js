import React, {Component} from 'react';
import {
    Row,
    Col,
    Panel,
    Form,
    OverlayTrigger,
    Popover,
    Glyphicon,
    FormControl,
    FormGroup,
    ControlLabel,
    HelpBlock,
    Button,
    Checkbox
} from 'react-bootstrap';
import {observer, inject} from 'mobx-react';
import {toJS, whyRun, autorunAsync} from 'mobx';
import {size} from 'lodash-es'
import ToggleDisplay from 'react-toggle-display';
import PropTypes from 'prop-types';
import Confirm from 'react-confirm-bootstrap';

@inject('controlsStore', 'userStore')
@observer
export default class EditUserForm extends Component {
    constructor(props) {
        super(props);
    }

    // key presses
    handlePasswordKeyPress = (e) => {
        const editUser = this.props.userStore.editUser;
        if (!editUser.passwordOk) {
            return;
        }
        if (e.key === 'Enter') {
            this.props.submitPassword(this.passwordRef, this.passwordAgainRef);
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
        this.props.userStore.setParamsForOneUser(params);

    };

    changePwd = () => {
        this.props.userStore.setParamsForEditUser({changingPwd: true});
    };

    onPwdChange = (val) => {
        this.props.userStore.setPassword(val);
    };

    onPwdAgainChange = (val) => {
        this.props.userStore.setPasswordAgain(val);
    };
    onOldPwdChange = (val) => {
        this.props.userStore.setOldPassword(val);
    };

    componentWillUnmount() {
        this.disposeOfPwdValidate();
        this.props.userStore.setParamsForEditUser({changingPwd: false});
        clearTimeout(this.refreshTimeout);
    }

    disposeOfPwdValidate = autorunAsync('password validation', () => {
        const editUser = this.props.userStore.editUser;
        let passwordHelpText = '';
        let passwordOk = false;
        let passwordValidationState = 'error';
        if (editUser.password.length < 6) {
            passwordHelpText = 'Password too short'
        } else if (editUser.password !== editUser.passwordAgain) {
            passwordHelpText = 'Passwords different'
        } else {
            passwordOk = true;
            passwordValidationState = 'success';
            passwordHelpText = '';
        }
        this.props.userStore.setParamsForEditUser({
            'passwordOk': passwordOk,
            'passwordValidationState': passwordValidationState,
            'passwordHelpText': passwordHelpText
        });

    }, 500);

    render() {
        let colOffset = 2;
        let colWidth = 4;
        if (this.props.inModal) {
            colOffset = 0;
            colWidth = 6;
        }

        let editUser = this.props.userStore.editUser;

        let allUsers = this.props.userStore.editUser.allUsers;

        if (Object.keys(this.props.userStore.editUser.user).length === 0) {
            return <div>Waiting to load..</div>;
        }


        let detailsHelp = <Popover id='help-userdetails' title='Help'>
            Make changes, then press Enter in a textbox or click Update to apply.

        </Popover>;


        let passwordHelp = <Popover id='help-password' title='Help'>
            <p>Click "Change" to show the password input form.</p>
            <p>Type in the new password then click Set to apply.</p>
        </Popover>;



        return <div>
            <Row>
                <Col xs={colWidth} xsOffset={colOffset}
                     md={colWidth} mdOffset={colOffset}
                     sm={colWidth} smOffset={colOffset}
                     lg={colWidth} lgOffset={colOffset}>
                    <Panel>
                        <Panel.Heading>
                            <div>Edit user details
                                <div className='pull-right'>
                                    <OverlayTrigger trigger="click" rootClose placement="left" overlay={detailsHelp}>
                                        <Glyphicon glyph='question-sign'/>
                                    </OverlayTrigger>
                                </div>
                            </div>
                        </Panel.Heading>
                        <Panel.Body>

                            <Form>
                                <FormGroup>
                                    <ControlLabel>Username</ControlLabel>
                                    {' '}
                                    <FormControl type='text'
                                                 disabled={true}
                                                 defaultValue={size(editUser.user.username) ? editUser.user.username : ''}
                                                 onKeyPress={this.handleParamKeyPress}
                                                 onChange={(e) => this.onParamChange('username', e.target.value)}/>
                                </FormGroup>
                                {' '}
                                {' '}
                                <FormGroup>
                                    <ControlLabel>Full name</ControlLabel>
                                    {' '}
                                    <FormControl type='text'
                                                 defaultValue={size(editUser.user.fullName) ? editUser.user.fullName : 'not set'}
                                                 onKeyPress={this.handleParamKeyPress}
                                                 onChange={(e) => this.onParamChange('fullName', e.target.value)}/>
                                </FormGroup>
                                {' '}
                                <FormGroup>
                                    <ControlLabel>Email</ControlLabel>
                                    {' '}
                                    <FormControl type='text'
                                                 defaultValue={size(editUser.user.email) ? editUser.user.email : 'not set'}
                                                 onKeyPress={this.handleParamKeyPress}
                                                 onChange={(e) => this.onParamChange('email', e.target.value)}/>
                                </FormGroup>
                                {' '}
                                <FormGroup>
                                    <ControlLabel>Institution</ControlLabel>
                                    {' '}
                                    <FormControl type='text'
                                                 defaultValue={size(editUser.user.institution) ? editUser.user.institution : 'not set'}
                                                 onKeyPress={this.handleParamKeyPress}
                                                 onChange={(e) => this.onParamChange('institution', e.target.value)}/>
                                </FormGroup>
                                {' '}
                                <FormGroup>
                                    <Checkbox defaultChecked={editUser.user.permissions.adminAllowed} inline
                                              disabled={true}>Is admin?
                                    </Checkbox>

                                </FormGroup>
                            </Form>
                            <div>
                                <span className='pull-left'>{editUser.status}</span>
                                <div className='pull-right'>
                                    <Button bsStyle='primary'
                                            disabled={!size(editUser.user.username)}
                                            onClick={this.props.submitUpdate}>Update</Button>




                                    <ToggleDisplay show={this.props.adminMode && size(allUsers) >= 2}>
                                        <Confirm
                                            onConfirm={this.props.submitDelete}
                                            body="Are you sure you want to delete this user?"
                                            confirmText="Confirm"
                                            title="Delete user">
                                            <Button bsStyle='warning' className='pull-right'>Delete</Button>
                                        </Confirm>
                                    </ToggleDisplay>
                                </div>
                            </div>
                        </Panel.Body>


                    </Panel>
                </Col>
                <Col xs={colWidth}
                     md={colWidth}
                     sm={colWidth}
                     lg={colWidth} >
                    <Panel>
                        <Panel.Heading>
                            <div>Password
                                <div className='pull-right'>
                                    <OverlayTrigger trigger="click" rootClose placement="left" overlay={passwordHelp}>
                                        <Glyphicon glyph='question-sign'/>
                                    </OverlayTrigger>
                                </div>
                            </div>
                        </Panel.Heading>
                        <Panel.Body>


                            <Form onSubmit={(e) => {
                                e.preventDefault()
                            }}>
                                <ToggleDisplay show={!editUser.changingPwd}>
                                    <Button onClick={this.changePwd}>Change Password</Button>
                                </ToggleDisplay>
                                <ToggleDisplay show={editUser.changingPwd}>

                                    <ToggleDisplay show={!this.props.adminMode}>

                                        <FormGroup>
                                            <ControlLabel>Old Password</ControlLabel>
                                            {' '}
                                            <FormControl type='password'
                                                         placeholder='old password'
                                                         inputRef={(ref) => {
                                                             this.oldPasswordRef = ref
                                                         }}
                                                         onChange={(e) => this.onOldPwdChange(e.target.value)}/>
                                        </FormGroup>
                                    {' '}
                                    </ToggleDisplay>


                                    <FormGroup validationState={editUser.passwordValidationState}>
                                        <ControlLabel>New Password</ControlLabel>
                                        {' '}
                                        <FormControl type='password'
                                                     inputRef={(ref) => {
                                                         this.passwordRef = ref
                                                     }}
                                                     placeholder='password'
                                                     onKeyPress={this.handlePasswordKeyPress}
                                                     onChange={(e) => this.onPwdChange(e.target.value)}/>
                                        <HelpBlock>
                                            <p>{editUser.passwordHelpText}</p>
                                        </HelpBlock>
                                    </FormGroup>
                                    {' '}
                                    <FormGroup validationState={editUser.passwordValidationState}>
                                        <ControlLabel>Confirm</ControlLabel>
                                        {' '}
                                        <FormControl type='password'
                                                     inputRef={(ref) => {
                                                         this.passwordAgainRef = ref
                                                     }}
                                                     placeholder='password (again)'
                                                     onKeyPress={this.handlePasswordKeyPress}
                                                     onChange={(e) => this.onPwdAgainChange(e.target.value)}/>

                                    </FormGroup>
                                    <div className='pull-right'>
                                        <Button
                                            bsStyle={editUser.passwordOk ? 'primary' : 'default'}
                                            disabled={!editUser.passwordOk || !size(editUser.user.username)}
                                            onClick={() => {
                                                this.props.submitPassword(this.passwordRef, this.passwordAgainRef, this.oldPasswordRef);
                                                this.props.userStore.setParamsForEditUser({changingPwd: false});
                                            }}>Set</Button>
                                    </div>
                                </ToggleDisplay>

                            </Form>
                        </Panel.Body>

                    </Panel>
                </Col>
            </Row>
        </div>;


    }
}

EditUserForm.propTypes = {
    submitPassword: PropTypes.func.isRequired,
    submitUpdate: PropTypes.func.isRequired,
    submitDelete: PropTypes.func.isRequired,
    adminMode: PropTypes.bool.isRequired,
    inModal: PropTypes.bool.isRequired
};
