import React, {Component} from 'react';

import {action, toJS} from 'mobx';
import {inject} from 'mobx-react';

import {Button} from 'react-bootstrap';
import {withRouter} from 'react-router-dom';

import myClient from '../agents/client';

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
        return <Button bsStyle='success' className='pull-right' onClick={this.commit}>Commit</Button>
    }
}

export default withRouter(CommitButton);

