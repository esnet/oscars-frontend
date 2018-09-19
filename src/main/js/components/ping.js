import React, {Component} from 'react';


import myClient from '../agents/client';
import {withRouter} from 'react-router-dom';

class Ping extends Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.ping();
    }

    ping() {

        this.timeout = setTimeout(() => {
            myClient.submitWithToken('GET', '/api/ping').then(
                connected => {
                    this.ping();
                },
                disconnected => {
                    this.props.history.push('/pages/disconnected');
                }
            );

        }, 500);
    }


    componentWillUnmount() {
        clearTimeout(this.timeout);
    }

    render() {
        return null;
    }
}

export default withRouter(Ping);
