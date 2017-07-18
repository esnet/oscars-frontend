import React, {Component} from 'react';
import {Row, Col, ListGroup, ListGroupItem, Panel, OverlayTrigger, Popover, Glyphicon} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import {observer, inject} from 'mobx-react';
import {toJS, whyRun} from 'mobx';

import myClient from '../agents/client';
import transformer from '../lib/transform';

@inject('controlsStore', 'accountStore', 'commonStore', 'designStore', 'mapStore')
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
//                    console.log(successResponse);
                    this.props.controlsStore.setParamsForEditDesign({allDesigns: designs});
                }
                ,
                (failResponse) => {
                    console.log('Error: ' + failResponse.status + ' - ' + failResponse.statusText);
                }
            );
    }

    selectDesign = (design) => {
        this.props.controlsStore.setParamsForEditDesign({designId: design.designId, description: design.description});
        let cmp = transformer.fromBackend(design.cmp);
        this.props.designStore.setComponents(cmp);
        let coloredNodes = [];
        cmp.junctions.map((j) => {
            coloredNodes.push({
                id: j.id,
                color: 'green',
            });
        });
        this.props.mapStore.setColoredNodes(coloredNodes);
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
                                    return <Link key={d.designId}
                                                 onClick={(e) => {
                                                     this.selectDesign(d)
                                                 }}
                                                 to='/pages/newDesign'>
                                        <ListGroupItem>{d.description}</ListGroupItem>
                                    </Link>
                                })
                            }
                        </ListGroup>
                    </Panel>
                </Col>
                <Col xs={5} md={5} sm={5} lg={5}>
                    <Panel header={otherHeader}>
                        <ListGroup>
                            {
                                otherDesigns.map((d) => {
                                    return <Link key={d.designId}
                                                 onClick={(e) => {
                                                     this.selectDesign(d)
                                                 }}
                                                 to='/pages/newDesign'>
                                        <ListGroupItem>{d.description}</ListGroupItem>
                                    </Link>
                                })
                            }
                        </ListGroup>
                    </Panel>

                </Col>

            </Row>
        );
    }

}
