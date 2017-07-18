import React from 'react'
import {observer, inject} from 'mobx-react'
import {observable, whyRun} from 'mobx'
import {Redirect} from 'react-router-dom'
import {Row, Col, Panel, Button, Form, FormGroup, FormControl, ControlLabel} from 'react-bootstrap';
import ToggleDisplay from 'react-toggle-display';

@inject('accountStore', 'commonStore')
@observer
export default class Login extends React.Component {


    handleChangeUsername = (e) => {
        this.props.accountStore.setAttemptUsername(e.target.value);
    };
    handleChangePassword = (e) => {
        this.props.accountStore.setAttemptPassword(e.target.value);
    };
    handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            this.handleLogin();
        }
    };


    componentWillMount() {
        this.props.accountStore.clearAttempt();
        this.props.commonStore.setActiveNav('login');
    }

    handleLogin = () => {
        this.props.accountStore.login()
            .then(() => {
            })
            .catch(error => {
                this.props.accountStore.setAttemptPassword('');
                this.props.accountStore.setAttemptError(error);
            });
    };

    render() {
        if (this.props.accountStore.isLoggedIn()) {
            return (<Redirect to='/'/>);
        }

        return <Row>
                <Col md={4}>
                    <Panel>
                        <h4>Welcome to OSCARS. Please log in:</h4>
                        <Form onSubmit={this.handleLogin}>
                            <FormGroup controlId="vlanExpression">

                                <ControlLabel>Username:</ControlLabel>
                                {' '}
                                <FormControl type="text"
                                             onChange={this.handleChangeUsername}/>
                            </FormGroup>
                            <FormGroup controlId="vlanExpression">

                                <ControlLabel>Password:</ControlLabel>
                                {' '}
                                <FormControl
                                             type="password"
                                             onKeyPress={this.handleKeyPress}
                                             onChange={this.handleChangePassword}/>
                            </FormGroup>
                            <Button bsStyle='primary' className='pull-right' onClick={this.handleLogin}>Login</Button>
                        </Form>
                        <ToggleDisplay show={this.props.accountStore.attempt.error.length > 0}>
                            <div>{this.props.accountStore.attempt.error}</div>
                        </ToggleDisplay>
                    </Panel>
                </Col>
            </Row>;

    }
}
