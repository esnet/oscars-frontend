import React, {Component} from 'react';

import {observer, inject } from 'mobx-react';
import {Button} from 'react-bootstrap';

@inject('sandboxStore')
@observer
export default class SandboxControls extends Component {
    constructor(props) {
        super(props);
        this.preCheck = this.preCheck.bind(this);
        this.isDisabled = this.isDisabled.bind(this);
        this.hold = this.hold.bind(this);
        this.commit = this.commit.bind(this);
        this.reset = this.reset.bind(this);
    }

    isDisabled(what) {
        let connState = this.props.sandboxStore.connState;
        if (what === 'precheck') {
            return connState !== 'INITIAL';
        }
        if (what === 'hold') {
            return connState !== 'CHECK_OK';

        }
        if (what === 'commit') {
            return connState !== 'HOLD_OK';
        }
    }

    preCheck() {
        this.props.sandboxStore.check();
        setTimeout(() => {this.props.sandboxStore.postCheck(true)}, 1000)
        return false;

    }
    hold() {
        this.props.sandboxStore.hold();
        setTimeout(() => {this.props.sandboxStore.postHold(true)}, 1000)
        return false;

    }
    commit() {
        this.props.sandboxStore.commit();
        setTimeout(() => {this.props.sandboxStore.postCommit(true)}, 1000)
        return false;
    }
    reset() {
        this.props.sandboxStore.reset();
        return false;
    }

    render() {

        return (
            <div>
                <p>connectionId</p>
                <p>date and time</p>

                <Button disabled={this.isDisabled('precheck')} onClick={this.preCheck}>Precheck</Button>
                <Button disabled={this.isDisabled('hold')} onClick={this.hold}>Hold</Button>
                <Button disabled={this.isDisabled('commit')}  onClick={this.commit}>Commit</Button>
                <Button onClick={this.reset}>Reset</Button>

            </div>
        );
    }
}