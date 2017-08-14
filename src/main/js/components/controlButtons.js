import React, {Component} from 'react';

import {action, toJS} from 'mobx';
import {inject} from 'mobx-react';

import {Button} from 'react-bootstrap';


import myClient from '../agents/client';
import reservation from '../lib/reservation';


@inject('controlsStore')
export class CommitButton extends Component {
    constructor(props) {
        super(props);
    }

    commit = () => {

        myClient.submitWithToken('POST', '/protected/conn/commit', reservation.reservation.connectionId)
            .then(action((response) => {
                const phase =  response.replace(/"/g, '');

                this.props.controlsStore.setParamsForConnection({
                    phase: phase
                });

//                console.log(toJS(this.props.controlsStore.connection));
            }));

        return false;
    };


    render() {
        return <Button bsStyle='success' className='pull-right' onClick={this.commit}>Commit</Button>
    }
}

@inject('controlsStore')
export class UncommitButton extends Component {
    constructor(props) {
        super(props);
    }

    commit = () => {

        myClient.submitWithToken('POST', '/protected/conn/uncommit', reservation.reservation.connectionId)
            .then(action((response) => {
                const phase =  response.replace(/"/g, '');

                this.props.controlsStore.setParamsForConnection({
                    phase: phase
                });
            }));

        return false;
    };


    render() {
        return <Button bsStyle='warning' className='pull-right' onClick={this.commit}>Uncommit</Button>
    }
}