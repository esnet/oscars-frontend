import React, {Component} from 'react';

import {observer, inject} from 'mobx-react';
import {action, toJS} from 'mobx';


import {Button, Panel} from 'react-bootstrap';
import myClient from '../agents/client';
import PropTypes from 'prop-types';



@inject('connsStore')
@observer
export default class DetailsControls extends Component {
    constructor(props) {
        super(props);
    }


    cancel = () => {
        let current = this.props.connsStore.store.current;

        myClient.submitWithToken('POST', '/protected/conn/cancel', current.connectionId)
            .then(action((response) => {
                current.phase = response.replace(/"/g, '');

            }));

        return false;
    };


    render() {
        const conn = this.props.connsStore.store.current;
        let cancelAllowed = true;
        if (conn.phase !== 'RESERVED') {
            cancelAllowed = false;
        }
        const header = <div>Controls</div>;

        return (
            <Panel header={header}>
                {/*
                <Button bsStyle='primary' className='pull-right'>Setup</Button>
                <Button bsStyle='warning' className='pull-right'>Teardown</Button>
                */}
                <Button bsStyle='info' onClick={this.props.refresh} className='pull-left'>Refresh</Button>

                <Button bsStyle='danger' disabled={!cancelAllowed} onClick={this.cancel} className='pull-right'>Cancel</Button>

            </ Panel>
        );
    }
}



DetailsControls.propTypes = {
    refresh: PropTypes.func.isRequired,
};