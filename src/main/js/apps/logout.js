import React from 'react'
import {observer, inject} from 'mobx-react'
import {observable, whyRun} from 'mobx'
import {Redirect} from 'react-router-dom'

@inject('accountStore')
@observer
export default class Logout extends React.Component {

    componentDidMount() {
        this.props.accountStore.clearAttempt();
        this.props.accountStore.logout();
        console.log('logging out')
    }

    render() {
        return (<Redirect to='/'/>);

    }
}

