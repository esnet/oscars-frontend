import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {toJS, action, whyRun} from 'mobx';
import {Row, Col} from 'react-bootstrap';
import DetailsControls from '../components/detailsControls';
import DetailsDrawing from '../components/detailsDrawing';
import DetailsComponents from '../components/detailsComponents';
import DetailsInfo from '../components/detailsInfo';
import myClient from '../agents/client';
import transformer from '../lib/transform';

@inject('connsStore', 'commonStore')
@observer
export default class DetailsApp extends Component {

    constructor(props) {
        super(props);
    }

    componentWillMount() {

        this.props.commonStore.setActiveNav('details');
        const connectionId = this.props.match.params.connectionId;
        this.refresh(connectionId);
    }

    refresh = (connectionId) => {
        if (typeof connectionId === 'undefined') {
            return;
        }

        myClient.submitWithToken('GET', '/api/conn/info/' + connectionId)
            .then(action((response) => {
                if (response !== null && response.length > 0) {
                    let conn = JSON.parse(response);
                    transformer.fixSerialization(conn);
                    this.props.connsStore.setCurrent(conn);
                }
            }));
    };

    render() {
        const connectionId = this.props.match.params.connectionId;
        const conn = this.props.connsStore.store.current;

        if (typeof connectionId === 'undefined') {
            return (
                <Row>
                <Col >
                    <DetailsControls refresh={this.refresh}/>
                </Col>
                </Row>

            )
        } else if (conn === null || typeof conn === 'undefined' || typeof conn.archived === 'undefined') {
            return <div>Loading...</div>;
        } else {
            return <Row>
                <Col sm={3} md={3} lg={3}>
                    <DetailsControls refresh={this.refresh}/>
                    <DetailsDrawing/>
                </Col>
                <Col sm={6} md={6} lg={6}>
                    <DetailsInfo refresh={this.refresh}/>
                </Col>
                <Col sm={3} md={3} lg={3}>
                    <DetailsComponents/>
                </Col>
            </Row>
        }
    }

}
