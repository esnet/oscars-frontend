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
    ControlLabel
} from 'react-bootstrap';
import {toJS} from 'mobx';
import myClient from '../agents/client';
import {observer, inject} from 'mobx-react';
import UserAdminModal from '../components/userAdminModal';
import {size} from 'lodash'


@inject('controlsStore')
@observer
export default class UsersAdminApp extends Component {

    constructor(props) {
        super(props);
    }

    componentWillMount() {
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


    render() {
        let editUser = this.props.controlsStore.editUser;

        let header = <h4>Users administration</h4>;
        return (
            <Row>
                <Col md={6} sm={6}>
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
                        <Form>
                            <FormGroup>
                                <ControlLabel>Username</ControlLabel>
                                {' '}
                                <FormControl type='text'
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
