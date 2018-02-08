import React, {Component} from 'react';
import {Row, Col} from 'react-bootstrap';
import {inject} from 'mobx-react';


import ConnectionsList from '../components/connectionsList';


@inject('mapStore', 'commonStore')
export default class ListConnectionsApp extends Component {

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.props.mapStore.setColoredNodes([]);
        this.props.mapStore.setColoredEdges([]);
        this.props.commonStore.setActiveNav('list');
    }

    render() {
        return (
            <Row>
                <Col mdOffset={1} md={10}><ConnectionsList/></Col>

            </Row>
        );
    }

}
