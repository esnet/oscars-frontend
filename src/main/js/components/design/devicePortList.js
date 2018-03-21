import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
    ListGroup,
    ListGroupItem,
    Row, Col, Container,
    Card, CardBody, CardSubtitle,
    Button
} from 'reactstrap';



export default class DevicePortList extends Component {
    constructor(props) {
        super(props);
    }

    portSort = (a, b) => {
        if (a.port.urn < b.port.urn)
            return -1;
        if (a.port.urn > b.port.urn)
            return 1;
        return 0;
    };

    render() {
        let portsNodes = this.props.ports.sort(this.portSort).map((entry, portIdx) => {
            let port = entry.port;
            let device = entry.device;
            let portLabel = port.urn.split(':')[1];

            let clickHandler = () => {
                this.props.onAddClicked(device, port);
            };

            let tags = <ListGroupItem/>;
            if ('tags' in port) {
                tags = port.tags.map((tag, idx) => {
                    return (
                        <ListGroupItem className='p-0' key={idx}>{tag}</ListGroupItem>
                    )
                });
            }
            return <ListGroupItem key={port.urn}>
                <Container>
                    <Row>
                        <Col>
                            {portLabel}
                            {' '}
                            <Button color='primary' className='float-right' onClick={clickHandler}>Add</Button>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <small>
                                <ListGroup className='p-0'>
                                    {tags}
                                </ListGroup>
                            </small>
                        </Col>
                    </Row>
                </Container>
            </ListGroupItem>;


        });

        return <ListGroup>{portsNodes}</ListGroup>
    };
}

DevicePortList.propTypes = {
    onAddClicked: PropTypes.func.isRequired,
    ports: PropTypes.array.isRequired,
};
