import React, {Component} from 'react';
import {
    Row,
    Col,
    Panel,
    ListGroup,
    ListGroupItem,
    Button,
    Form,
    FormGroup,
    FormControl,
    ControlLabel,
    Popover,
    OverlayTrigger,
    Glyphicon
} from 'react-bootstrap';
import {toJS} from 'mobx';
import myClient from '../agents/client';
import {observer, inject} from 'mobx-react';
import UserAdminModal from '../components/userAdminModal';
import {size} from 'lodash'


@inject('controlsStore', 'commonStore')
@observer
export default class UsersAdminApp extends Component {

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.props.commonStore.setActiveNav('admin');
        this.props.controlsStore.setParamsForEditUser({user: {username: ''}});
        this.refreshUserList();
    }

    refreshUserList = () => {
        myClient.submitWithToken('GET', '/admin/users', '')
            .then(
                (response) => {
                    let parsed = JSON.parse(response);
                    this.props.controlsStore.setParamsForEditUser({allUsers: parsed});
                }
                ,
                (failResponse) => {
                    console.log('Error: ' + failResponse.status + ' - ' + failResponse.statusText);
                }
            );

    };

    clickUsername = (username) => {

        this.props.controlsStore.editUser.allUsers.map((u) => {
            if (u.username === username) {
                this.props.controlsStore.setParamsForEditUser({user: toJS(u)});
                this.props.controlsStore.openModal('userAdmin');
            }
        });
    };

    addUser = () => {
        let user = this.props.controlsStore.editUser.user;
        if (!size(user.username)) {
            console.log('empty username');
            return;
        }
        let existing = false;
        this.props.controlsStore.editUser.allUsers.map((u) => {
            if (u.username === user.username) {
                existing = true;
            }
        });
        if (existing) {
            console.log('existing username');
            return;
        }


        this.props.controlsStore.setParamsForOneUser({
            fullName: 'Joe D. Newuser',
            email: 'email@domain.com',
            institution: 'default',
            permissions: {
                isAdmin: false
            },
        });

        // add a user
        myClient.submitWithToken('POST', '/admin/users/' + user.username, user)
            .then(
                (response) => {
                    let parsed = JSON.parse(response);
                    this.props.controlsStore.setParamsForEditUser({user: parsed});

                    // set a random password
                    myClient.submitWithToken('POST', '/admin/users/' + user.username + '/password', Math.random() + '')
                        .then(
                            (response) => {
                            }
                            ,
                            (failResponse) => {
                                console.log('Error: ' + failResponse.status + ' - ' + failResponse.statusText);
                            }
                        );
                }
                ,
                (failResponse) => {
                    console.log('Error: ' + failResponse.status + ' - ' + failResponse.statusText);
                }
            );
        this.refreshUserList();

        this.props.controlsStore.openModal('userAdmin');
    };


    onUsernameChange = (val) => {
        this.props.controlsStore.setParamsForOneUser({username: val});
    };

    // key presses
    handleAddUsernameKeyPress = (e) => {
        if (e.key === 'Enter' && this.props.controlsStore.editUser.user.username.length > 0) {
            this.addUser();
        }
    };

    render() {
        let editUser = this.props.controlsStore.editUser;

        let adminHelp = <Popover id='help-adminusers' title='Help'>
            <p>This is the users administration form. The list shows all the users registered in the system.</p>
                <p>Click on a username on the list to edit user details.</p>
                <p>To add a new user, type a username in the box then click "Add new user" or press Enter.</p>
        </Popover>;

        let header = <div>Users administration
            <div className='pull-right'>
                <OverlayTrigger trigger="click" rootClose placement="left" overlay={adminHelp}>
                    <Glyphicon glyph='question-sign'/>
                </OverlayTrigger>
            </div>
        </div>;

        return (
            <Row>
                <Col xs={8} xsOffset={2} md={6} mdOffset={3} sm={6} smOffset={3} lg={6} lgOffset={3}>
                    <Panel header={header}>
                        <ListGroup>
                            {
                                editUser.allUsers.map((u) => {
                                    return <ListGroupItem onClick={
                                        () => {
                                            this.clickUsername(u.username)
                                        }
                                    } key={u.username}>
                                        {u.fullName + ' : ' + u.username}
                                    </ListGroupItem>
                                })
                            }
                        </ListGroup>
                        <Form onSubmit={(e) => {
                            e.preventDefault()
                        }}>
                            <FormGroup>
                                <ControlLabel>Username</ControlLabel>
                                {' '}
                                <FormControl type='text'
                                             onKeyPress={this.handleAddUsernameKeyPress}
                                             onChange={(e) => this.onUsernameChange(e.target.value)}/>
                            </FormGroup>
                            <Button className='pull-right'
                                    disabled={!size(editUser.user.username)}
                                    onClick={this.addUser}>Add new user</Button>
                        </Form>

                    </Panel>

                </Col>
                <UserAdminModal refresh={this.refreshUserList}/>
            </Row>
        );
    }

}
