import React, {Component} from 'react';
import {Row, Col, ListGroup, ListGroupItem, Panel, OverlayTrigger, Popover, Glyphicon} from 'react-bootstrap';
import {observer, inject} from 'mobx-react';
import {toJS, whyRun} from 'mobx';

import myClient from '../agents/client';


@inject('controlsStore', 'accountStore', 'commonStore')
@observer
export default class SelectDesign extends Component {

    constructor(props) {
        super(props);

    }

    componentDidMount() {
        this.props.commonStore.setActiveNav('selectDesign');
        this.loadDesigns();

    }


    loadDesigns() {
        myClient.submitWithToken('GET', '/protected/designs/', '')
            .then(
                (successResponse) => {
                    let designs = JSON.parse(successResponse);
                    this.props.controlsStore.setParamsForEditDesign({allDesigns: designs});
                }
                ,
                (failResponse) => {
                    console.log('Error: ' + failResponse.status + ' - ' + failResponse.statusText);
                }
            );
    }

    selectDesign = (id) => {
        this.props.controlsStore.setParamsForEditDesign({designId: id});
    };


    render() {
        let myDesigns = [];
        let otherDesigns = [];
        this.props.controlsStore.editDesign.allDesigns.map((d) => {
            if (d.username === this.props.accountStore.loggedin.username) {
                myDesigns.push(d);
            } else {
                otherDesigns.push(d);
            }
        });

        let myHelp = <Popover id='help-myDesigns' title='Help'>
            Click on a design from the list to copy its parameters into
            a new connection request.
            This list only includes designs you have previously saved.
        </Popover>;

        let myHeader = <h3>My designs
            <OverlayTrigger trigger="click" rootClose placement="left" overlay={myHelp}>
                <Glyphicon className='pull-right' glyph='question-sign'/>
            </OverlayTrigger>
        </h3>;

        let otherHelp = <Popover id='help-otherDesigns' title='Help'>
            Click on a design from the list to copy its parameters into
            a new connection request.
            This list includes all the the designs by everybody else.
        </Popover>;


        let otherHeader = <h3>Other designs
            <OverlayTrigger trigger="click" rootClose placement="left" overlay={otherHelp}>
                <Glyphicon className='pull-right' glyph='question-sign'/>
            </OverlayTrigger>
        </h3>;

        return (
            <Row>
                <Col xs={5} md={5} mdOffset={1} sm={5} smOffset={1} lg={5} lgOffset={1}>
                    <Panel header={myHeader}>
                        <ListGroup>
                            {
                                myDesigns.map((d) => {
                                    return <ListGroupItem
                                        onClick={(d) => {
                                            this.selectDesign(d.designId)
                                        }}
                                        key={d.designId}>
                                        {d.description}</ListGroupItem>
                                })
                            }
                        </ListGroup>
                    </Panel>
                </Col>
                <Col xs={5} md={5} sm={5} lg={5}>
                    <Panel header={otherHeader}>
                        <ListGroup >
                            {
                                otherDesigns.map((d) => {
                                    return <ListGroupItem
                                        onClick={(d) => {
                                            this.selectDesign(d.designId)
                                        }}
                                        key={d.designId}>
                                        {d.description}</ListGroupItem>
                                })
                            }
                        </ListGroup>
                    </Panel>

                </Col>

            </Row>
        );
    }

}
