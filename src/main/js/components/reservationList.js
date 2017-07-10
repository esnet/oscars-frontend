import React, {Component} from 'react';
import {Panel} from 'react-bootstrap';

import {observer, inject} from 'mobx-react';

import myClient from '../agents/client';

@inject('controlsStore')
@observer
export default class ReservationList extends Component {

    componentDidMount(){
        this.startReservationRefresh();
    }

    componentWillUnmount(){
        clearTimeout(this.refreshTimeout);
    }

    startReservationRefresh(){
        this.updateReservationList();
        this.refreshTimeout = setTimeout(this.startReservationRefresh, 30000); // we will update every 30 seconds
    }

    updateReservationList(){
        let combinedFilter = {
            numFilters: 0,
            userNames: [],
            connectionIds: [],
            minBandwidths: [],
            maxBandwidths: [],
            startDates: [],
            endDates: [],
            resvStates: [],
            provStates: [],
            operStates: []
        };
        myClient.submit('POST', '/resv/list/filter', combinedFilter)
            .then(
                (successResponse) => {
                    let resvs = JSON.parse(successResponse);
                    resvs.map((r) => {
                        console.log(r);
                    });
                }
                ,
                (failResponse) => {
                    console.log('Error: ' + failResponse.status + ' - ' + failResponse.statusText);
                }
            );
    };

    render() {
        return <Panel><h2>Reservation list</h2></Panel>


    }
}
