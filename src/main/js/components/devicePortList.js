import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
    ListGroup,
    ListGroupItem,
    Glyphicon,
    Panel,
    Accordion
} from 'react-bootstrap';

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
                        <ListGroupItem key={idx}>{tag}</ListGroupItem>
                    )
                });
            }
            return <Panel key={port.urn} eventKey={port.urn}>
                    <Panel.Heading>
                        <div>{portLabel}
                            <Glyphicon className='pull-right' glyph='plus' onClick={clickHandler}/>
                        </div>
                    </Panel.Heading>
                    <Panel.Body>
                        <ListGroup>
                            {tags}
                        </ListGroup>
                    </Panel.Body>
                </Panel>;


        });

        return <Accordion id='device-portsaccordion'>{portsNodes}</Accordion>
    };
}

DevicePortList.propTypes = {
    onAddClicked: PropTypes.func.isRequired,
    ports: PropTypes.array.isRequired,
};
