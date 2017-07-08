import React from 'react';



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
            bwPreviouslySet: fixture.bwPreviouslySet,

            availableVlans: '',
            vlanExpression: '',
            retrievingAvailVlans: false,

            copiedVlan: '',
            showCopiedVlan: false,
            vlanSelectionMode: 'fromAvailable',
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
            bwPreviouslySet: false,

            vlanExpression: '',
            showVlanExpression: true,

            vlanSelectionMode: 'fromAvailable',
            copiedVlan: '',
            showCopiedVlan: false,

            showVlanReleaseControls: false,
            showVlanPickButton: true,
            showVlanPickControls: true,
            retrievingAvailVlans: false,

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
            showUpdateButton: !pipe.bwPreviouslySet
        };

    }
}
export default new Transformer();
