import React from 'react';

import {Glyphicon, Label} from 'react-bootstrap';


class Transformer {
    existingFixtureToEditParams(fixture) {
        let editParams = {
            fixtureId: fixture.id,
            label: fixture.label,
            port: fixture.port,
            device: fixture.device,
            vlan: fixture.vlan,
            ingress: fixture.ingress,
            egress: fixture.egress,

            availableVlans: '',
            vlanExpression: '',

            copiedVlan: '',
            showCopiedVlan: false,

            vlanSelectionMode: 'typeIn',
            vlanSelectionModeOptions: [],
            vlanCopyFromOptions: [],

            bwSelectionMode: 'typeIn',
            bwSelectionModeOptions: [],
            showCopiedBw: false,
            copiedIngress: 0,
            copiedEgress: 0,

        };

        if (fixture.vlan !== null) {
            editParams.showVlanReleaseControls = true;
            editParams.showVlanPickButton = false;
            editParams.showVlanPickControls = false;
        } else {
            editParams.showVlanReleaseControls = false;
            editParams.showVlanPickButton = true;
            editParams.showVlanPickControls = true;
        }

        if (fixture.bwPreviouslySet) {
            editParams.bwBeingEdited = false;
            editParams.showBwSetButton = false;
        } else {
            editParams.bwBeingEdited = true;
            editParams.showBwSetButton = true;

        }

        return editParams;

    }

    newFixtureToEditParams(fixture) {
        let editParams = {
            fixtureId: fixture.id,
            label: fixture.label,
            port: fixture.port,
            device: fixture.device,
            vlan: fixture.vlan,
            ingress: 0,
            egress: 0,

            vlanExpression: '',
            showVlanExpression: true,

            vlanSelectionMode: 'typeIn',
            copiedVlan: '',

            showVlanReleaseControls: false,
            showVlanPickButton: true,
            showVlanPickControls: true,

            bwSelectionMode: 'typeIn',
            bwSelectionModeOptions: [],
            showCopiedBw: false,
            copiedIngress: 0,
            copiedEgress: 0,
            bwBeingEdited: true,
            showBwSetButton: true,


        };


        return editParams;

    }

    existingPipeToEditParams(pipe) {
        return {
            pipeId: pipe.id,
            a: pipe.a,
            z: pipe.z,
            azBw: pipe.azBw,
            zaBw: pipe.zaBw,
            showUpdateButton: false
        };

    }
}
export default new Transformer();