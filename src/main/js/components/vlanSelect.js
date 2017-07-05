import React, {Component} from 'react';
import {Panel} from 'react-bootstrap';

import VlanExpression from './vlanExpression';
import VlanPick from './vlanPick';

export default class VlanSelect extends Component {

    render() {
        let header = <span>VLAN selection</span>;
        return (
            <Panel header={header}>
                <VlanExpression setModified={this.props.setModified}/>
                {' '}
                <VlanPick setModified={this.props.setModified}/>
            </Panel>
        );

    }
}
