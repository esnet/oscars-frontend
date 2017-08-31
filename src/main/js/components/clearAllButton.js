import React, {Component} from 'react';

import {action, toJS} from 'mobx';
import {inject} from 'mobx-react';

import {Button} from 'react-bootstrap';


@inject('designStore')
export default class ClearAllButton extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <Button bsStyle='warning' className='pull-right' onClick={() => {
            this.props.designStore.clear()
        }}>Clear all</Button>
    }
}

