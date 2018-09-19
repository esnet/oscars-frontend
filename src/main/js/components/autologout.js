import React, {Component} from 'react';


import myClient from '../agents/client';
import {withRouter} from 'react-router-dom';

class Autologout extends Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.ping();
    }

    ping() {
        this.timeout = setTimeout(() => {
            myClient.submitWithToken('GET', '/protected/ping').then(
                logged_in => {
                },
                logged_out => {
                    if (logged_out.status !== 0) {
                        // status of 0 is a timeout
                        this.props.history.push('/pages/logout');
                    }
                }
            );
            this.ping();


        }, 5000);
    }


    componentWillUnmount() {
        clearTimeout(this.timeout);
    }

    render() {
        return null;
    }
}

export default withRouter(Autologout);
