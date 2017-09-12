import React, {Component} from 'react';

import {observer, inject} from 'mobx-react';
import {action, toJS} from 'mobx';

import {withRouter} from 'react-router-dom'

import {Button, Panel, FormGroup, ControlLabel, FormControl, HelpBlock} from 'react-bootstrap';
import myClient from '../agents/client';
import PropTypes from 'prop-types';


@inject('connsStore')
@observer
class DetailsControls extends Component {
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

    onTypeIn = (e) => {

        const connectionId = e.target.value;
        if (typeof connectionId === 'undefined' || connectionId.length === 0) {
            return false;
        }

        myClient.submitWithToken('GET', '/api/conn/info/' + connectionId)
            .then(
                action((response) => {
                    if (response !== null  && response.length > 0) {
                        this.props.history.push('/pages/details/' + connectionId);
                        this.props.refresh(connectionId);
                    }
                }));
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
                <FormGroup controlId="connectionId">
                    <ControlLabel>Connection ID:</ControlLabel>
                    {' '}
                    <FormControl defaultValue={conn.connectionId} type="text" onChange={this.onTypeIn}/>
                </FormGroup>

                <Button bsStyle='info' onClick={() => {
                    this.props.refresh(conn.connectionId)
                }} className='pull-left'>Refresh</Button>

                <Button bsStyle='danger' disabled={!cancelAllowed} onClick={this.cancel}
                        className='pull-right'>Cancel</Button>

            </ Panel>
        );
    }
}

export default withRouter(DetailsControls);

DetailsControls.propTypes = {
    refresh: PropTypes.func.isRequired,
};
