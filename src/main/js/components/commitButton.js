import React, {Component} from 'react';

import {action, toJS} from 'mobx';
import {inject} from 'mobx-react';

import {Button} from 'react-bootstrap';
import {withRouter} from 'react-router-dom';

import myClient from '../agents/client';
import Confirm from 'react-confirm-bootstrap';

@inject('controlsStore')
class CommitButton extends Component {
    constructor(props) {
        super(props);
    }

    commit = () => {

        myClient.submitWithToken('POST', '/protected/conn/commit', this.props.controlsStore.connection.connectionId)
            .then(action((response) => {
                const phase = response.replace(/"/g, '');

                this.props.controlsStore.setParamsForConnection({
                    phase: phase
                });
                this.props.history.push('/pages/list');

            }));

        return false;
    };


    render() {
        return <Confirm
            onConfirm={this.commit}
            body="Are you sure you want to commit this connection?"
            confirmText="Confirm"
            title="Commit connection">
            <Button bsStyle='success' className='pull-right'>Commit</Button>
        </Confirm>



    }
}

export default withRouter(CommitButton);

