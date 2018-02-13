import React, {Component} from 'react';
import {Row, Col} from 'react-bootstrap';


import NetworkMap from '../components/networkMap';
import {inject, observer} from 'mobx-react';

@inject('commonStore')
@observer
export default class MapApp extends Component {

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.props.commonStore.setActiveNav('map');

    }

    render() {
        return (
            <Row>
                <Col md={10} mdOffset={1}>
                    <NetworkMap />
                </Col>
            </Row>
        );
    }

}
