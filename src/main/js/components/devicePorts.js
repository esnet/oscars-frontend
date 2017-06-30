import React, {Component} from 'react';
import {ListGroup, ListGroupItem} from 'react-bootstrap';
import {inject} from 'mobx-react';

export default class DevicePortList extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let portsNodes = this.props.ports.map((entry) => {
            let port = entry.port;
            let device = entry.device;

            return (<DevicePort key={port} device={device} port={port} onClick={() => {
            }}/>)
        });

        return <ListGroup>{portsNodes}</ListGroup>
    };
};


@inject('sandboxStore')
class DevicePort extends React.Component {
    constructor(props) {
        super(props);
    }

    onPortClicked = () => {
        this.props.sandboxStore.selectPort(this.props.port, this.props.device);
    };

    render() {
        return (
            <ListGroupItem onClick={this.onPortClicked} key={this.props.port}>{this.props.port}</ListGroupItem>
        )
    }
}