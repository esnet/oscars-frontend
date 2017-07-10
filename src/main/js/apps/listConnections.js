import React, {Component} from 'react';
import {Grid, Row, Col} from 'react-bootstrap';
import {inject} from 'mobx-react';


import NavBar from '../components/navbar'
import ConnectionsList from '../components/connectionsList';
import ConnectionModal from '../components/connectionModal';


@inject('mapStore')
export default class ListConnectionsApp extends Component {

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.props.mapStore.setColoredNodes([]);
        this.props.mapStore.setColoredEdges([]);
    }

    render() {
        return (
            <Grid fluid={true}>
                <Row>
                    <NavBar active='list'/>
                </Row>
                <Row>
                    <Col sm={4}>{' '}</Col>
                </Row>
                <Row>
                    <ConnectionsList/>

                </Row>
                <Row>
                    <ConnectionModal />
                </Row>

            </Grid>
        );
    }

}
