import React, {Component} from 'react';
import {Panel } from 'react-bootstrap';

import VlanExpression from './vlanExpression';
import VlanSet from './vlanSet';

export default class VlanSelect extends Component {

    render() {
        let header = <span>VLAN selection</span>;
        return (
            <Panel header={header}>
                <VlanExpression setModified={this.props.setModified}/>
                <VlanSet />


            </Panel>
        );

    }
}
