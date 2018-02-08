import React, {Component} from 'react';

import {observer, inject} from 'mobx-react';
import {action, autorunAsync, toJS} from 'mobx';

import {withRouter} from 'react-router-dom'

import {Button, Panel, FormGroup, ControlLabel, FormControl, HelpBlock} from 'react-bootstrap';
import PropTypes from 'prop-types';

@inject('connsStore', 'commonStore')
@observer
class DetailsControls extends Component {
    constructor(props) {
        super(props);
    }


    handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            this.load();
        }
    };

    load = () => {
        let connectionId = this.connectionIdRef.value;
        this.props.history.push('/pages/details/' + connectionId);
        this.props.load(connectionId);
    };


    render() {
        const pathConnectionId = this.props.match.params.connectionId;

        let connLoaded = false;
        if (this.props.connsStore.store.foundCurrent) {
            connLoaded = true;
        }

        return (
            <Panel>
                <Panel.Heading>
                    <div>Search</div>
                </Panel.Heading>
                <Panel.Body>

                    {/*
                <Button bsStyle='primary' className='pull-right'>Setup</Button>
                <Button bsStyle='warning' className='pull-right'>Teardown</Button>
                */}
                    <FormGroup controlId="connectionId">
                        <ControlLabel>Connection ID:</ControlLabel>
                        {' '}
                        <FormControl
                            type='text'
                            inputRef={(ref) => {
                                this.connectionIdRef = ref
                            }}
                            defaultValue={pathConnectionId}
                            onKeyPress={this.handleKeyPress}
                            placeholder='Connection ID ("Z0K2")'
                        />
                    </FormGroup>

                    <Button bsStyle='info'
                            disabled={!connLoaded}
                            onClick={() => {
                                this.props.refresh()
                            }}
                            className='pull-left'>Refresh</Button>

                    <Button bsStyle='primary'
                            onClick={() => {
                                this.load()
                            }}
                            className='pull-right'>Load</Button>

                </Panel.Body>

            </ Panel>
        );
    }
}

export default withRouter(DetailsControls);

DetailsControls.propTypes = {
    refresh: PropTypes.func.isRequired,
    load: PropTypes.func.isRequired,
};
