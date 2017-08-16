import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {toJS, action} from 'mobx';
import {Row, Col} from 'react-bootstrap';
import {Redirect} from 'react-router-dom';
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
        this.props.commonStore.setActiveNav('list');
    }

    refresh = () => {
        const current = this.props.connsStore.store.current;


        myClient.submitWithToken('GET', '/api/conn/info/'+current.connectionId)
            .then(action((response) => {

                let conn = JSON.parse(response);
                transformer.fixSerialization(conn);

                this.props.connsStore.setCurrent(conn);

            }));
    };

    render() {
        let conn = this.props.connsStore.store.current;
        if (typeof conn.archived === 'undefined') {
            return <Redirect to='/pages/list'/>;
        }

        return (
            <Row>
                <Col sm={3} md={3} lg={3}>
                    <DetailsControls refresh={this.refresh}/>
                    <DetailsDrawing/>
                </Col>
                <Col sm={6} md={6} lg={6}>
                    <DetailsInfo refresh={this.refresh}/>
                </Col>
                <Col sm={3} md={3} lg={3}>
                    <DetailsComponents />
                </Col>
            </Row>
        );
    }

}
