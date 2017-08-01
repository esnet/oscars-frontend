import React, {Component} from 'react';

import {action} from 'mobx';
import {inject} from 'mobx-react';

import {Button} from 'react-bootstrap';


import myClient from '../agents/client';
import reservation from '../lib/reservation';


export class CommitButton extends Component {
    constructor(props) {
        super(props);
    }

    commit = () => {

        myClient.submit('POST', '/resv/commit', reservation.reservation.connectionId)
            .then(action((response) => {
                console.log(response);
            }));

        return false;
    };


    render() {
        return <Button bsStyle='success' className='pull-right' onClick={this.commit}>Commit</Button>
    }
}