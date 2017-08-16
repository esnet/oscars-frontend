import React, {Component} from 'react';
import {Row} from 'react-bootstrap';
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
                <ConnectionsList/>

            </Row>
        );
    }

}
