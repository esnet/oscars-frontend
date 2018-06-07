import React, {Component} from 'react';

import {action, toJS} from 'mobx';
import {inject} from 'mobx-react';
import {
    Button
} from 'reactstrap';

import {withRouter} from 'react-router-dom'

import myClient from '../../agents/client';
import ConfirmModal from '../confirmModal';


@inject('controlsStore', 'designStore')
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
                // TODO: do some checking of response!

                this.props.controlsStore.clearEditConnection();
                this.props.controlsStore.clearEditDesign();
                this.props.designStore.clear();
                this.props.controlsStore.clearSessionStorage();
                this.props.designStore.clearSessionStorage();

                this.props.history.push('/pages/list');

            }));

        return false;
    };


    render() {
        return <div>

            <ConfirmModal body='Are you ready to commit this connection?'
                          header='Commit connection'
                          uiElement={<Button color='success'>{'Commit'}</Button>}
                          onConfirm={this.commit}/>

        </div>;


    }
}

export default withRouter(CommitButton);

