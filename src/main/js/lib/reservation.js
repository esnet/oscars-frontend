import Moment from 'moment';
import sandboxStore from '../stores/sandboxStore'
import controlsStore from '../stores/controlsStore'
import stateStore from '../stores/stateStore'
import {computed} from 'mobx';

class Reservation {
    @computed get reservation() {

        let reservation = {
            junctions: {},
            pipes: {},
            startAt: parseInt(Moment(controlsStore.connection.startAt).unix()),
            endAt: parseInt(Moment(controlsStore.connection.endAt).unix()),
            description: controlsStore.connection.description,
            connectionId: controlsStore.connection.connectionId,
            status: stateStore.connState
        };

        sandboxStore.sandbox.junctions.map((sj) => {
            let resFixtures = {};
            sandboxStore.sandbox.fixtures.map((sf) => {
                if (sf.device === sj.id) {
                    resFixtures[sf.id] = {
                        port: sf.port,
                        vlan: sf.vlan,
                        azbw: sf.ingress,
                        zabw: sf.egress
                    }
                }
            });

            reservation.junctions[sj.id] = {
                label: sj.id,
                fixtures: resFixtures
            }
        });

        let resPipes = {};
        sandboxStore.sandbox.pipes.map((p) => {
            resPipes[p.id] = {
                a: p.a,
                z: p.z,
                azbw: p.azBw,
                zabw: p.zaBw,
                azERO: [],
                zaERO: [],
                blacklist: [], //
                survivabilityType: 'NONE', // PARTIAL, TOTAL
                palindromicPath: true,
                numPaths: 1
            }
        });
        reservation.pipes = resPipes;

        return reservation;
    }

}

export default new Reservation();