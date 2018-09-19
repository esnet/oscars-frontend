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
                    this.ping();
                },
                logged_out => {
                    this.props.history.push('/pages/logout');
                }
            );

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
