<template>
    <v-dialog v-model="is_visible" width="600">
        <v-card>
            <v-card-title class="headline grey lighten-2" primary-title>
                <v-layout row justify-space-between>
                    {{ title }}
                    <v-icon medium class="green--text" v-on:click="info_visible = !info_visible">info</v-icon>
                </v-layout>
            </v-card-title>

            <v-card-text>
                <p v-if="info_visible">
                    Use this popup to change the RPM detector values.
                    <i>Gamma Sum</i> and
                    <i>Neutron Sum</i>
                    sliders control the sum of the four detectors and this total count will be distributed to
                    the detectors according to the global gamma or neutron detector distribution settings.
                    For the gamma detectors, you can control each detector individually as well using the
                    Master/Slave Upper/Lower sliders.
                </p>
                <p v-if="info_visible">
                    Use the
                    <i>Unoccupied/Occupied</i> radio buttons
                    to toggle the RPM's occupancy sensor.
                </p>
                <v-row>
                    <v-col cols="12">
                        <v-slider v-model="gamma_sum" label="Gamma Sum" thumb-label min="0" max="2000"
                            style="height: 30px;" v-on:input="on_gamma_sum_change()"></v-slider>
                        <v-slider v-model="gamma_vals[0]" label="Master Lower:" thumb-label min="0" max="500"
                            :thumb-color="gamma_thumb_color(0)" style="margin-left: 1rem; height: 20px;"
                            v-on:input="on_gamma_val_change(0)"></v-slider>
                        <v-slider v-model="gamma_vals[1]" label="Master Upper" thumb-label min="0" max="500"
                            :thumb-color="gamma_thumb_color(1)" style="margin-left: 1rem; height: 20px;"
                            v-on:input="on_gamma_val_change(1)"></v-slider>
                        <v-slider v-model="gamma_vals[2]" label="Slave Lower" thumb-label min="0" max="500"
                            :thumb-color="gamma_thumb_color(2)" style="margin-left: 1rem; height: 20px;"
                            v-on:input="on_gamma_val_change(2)"></v-slider>
                        <v-slider v-model="gamma_vals[3]" label="Slave Upper" thumb-label min="0" max="500"
                            :thumb-color="gamma_thumb_color(3)" style="margin-left: 1rem; height: 20px;"
                            v-on:input="on_gamma_val_change(3)"></v-slider>
                        <v-slider v-model="neutron_sum" label="Neutron Sum" thumb-label min="0" max="50"
                            :thumb-color="neutron_thumb_color()" style="height: 30px; margin-top: 30px;"
                            v-on:input="on_neutron_sum_change()"></v-slider>
                    </v-col>
                </v-row>
                <v-radio-group v-model="is_occupied" row v-on:change="on_occupancy_change()">
                    <v-radio label="Unoccupied" :value="false"></v-radio>
                    <v-radio label="Occupied" :value="true"></v-radio>
                </v-radio-group>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="is_visible = false">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">

import { Reactive, reactive, Ref, ref } from "vue";
import { ILaneSettings } from "../lib/ILaneSettings";
import { IRPMSettings } from "../lib/IRPMSettings";
import { RPMSimulator } from "../lib/RPMSimulator";

console.log("Loading RPMControl");
export default {
    props: [],

    setup: () => {
        const title = ref("LANE");
        const is_visible = ref(false);
        const info_visible = ref(false);
        const is_occupied = ref(false);
        const gamma_sum = ref(200);
        const gamma_vals: Reactive<number[]> = reactive([50, 50, 50, 50]);
        const neutron_sum = ref(6);
        const current_gamma_distribution: Reactive<number[]> = reactive([]);
        const rpmsim: Ref<RPMSimulator | null> = ref(null);
        const lane: Ref<ILaneSettings | null> = ref(null);

        return {
            title,
            is_visible,
            info_visible,
            is_occupied,
            gamma_sum,
            gamma_vals,
            neutron_sum,
            current_gamma_distribution,
            rpmsim,
            lane
        };
    },

    // data: function () {
    //     return {
    //         title: "LANE" as string,
    //         is_visible: false as boolean,
    //         info_visible: false as boolean,
    //         is_occupied: false,
    //         gamma_sum: 200, // gamma count order is ml, mu, sl, su
    //         gamma_vals: [50, 50, 50, 50],
    //         neutron_sum: 6,
    //         current_gamma_distribution: [] as number[],
    //         rpmsim: null as IRPMSettings | null,
    //         lane: null as ILaneSettings | null,
    //     };
    // },
    created: function () {
    },
    methods: {
        show: function (lane: ILaneSettings) {
            console.log("RPMControl", lane);

            this.lane = lane;
            this.rpmsim = lane.Simulator.RPM;
            this.title = lane.LaneName;
            this.is_visible = true;

            if (this.rpmsim) {
                this.current_gamma_distribution = this.rpmsim.GammaDistribution.slice(0);    // duplicate
                this.set_gamma_sum(this.rpmsim.GammaBG * 4);
            }
        },

        gamma_thumb_color(ix: number): string {
            let color = "green";

            if (this.rpmsim) {
                let val = this.gamma_vals[ix];
                if (val < this.rpmsim.GLThreshold)
                    color = "orange";
                if (val > this.rpmsim.GHThreshold)
                    color = "red";
            }

            return color;
        },

        neutron_thumb_color(): string {
            let color = "green";

            if (this.rpmsim) {
                let val = this.neutron_sum / 4;
                if (val > this.rpmsim.NHThreshold)
                    color = "red";
            }

            return color;
        },

        set_gamma_sum: function (val: number) {
            // gamma count order is ml, mu, sl, su
            let dist = this.current_gamma_distribution;
            console.log("set_gamma_sum  value=" + val + ":", dist);
            this.gamma_sum = val;
            for (let i = 0; i < 4; i++) {
                this.gamma_vals[i] = Math.round(val * dist[i]);
                console.log(i, dist[i], this.gamma_vals[i]);
            }
            console.log("Values", this.gamma_vals);
        },

        set_gamma_val: function (ix: number, val: number) {
            let vals = this.gamma_vals;

            // dist doesn't do anything to set the gamma value
            // let dist = this.current_gamma_distribution.slice(0);

            vals[ix] = val;
            let sum = vals[0] + vals[1] + vals[2] + vals[3];

            // dist is a local variable, and it's not returned,
            // and this loop doesn't appear to do anything,
            // so just comment it out
            // for (let i = 0; i < 4; i++) {
            //     dist[i] = (vals[i] / sum).toFixed(4);
            // }
            this.gamma_sum = sum;
        },

        on_gamma_sum_change: function () {
            this.set_gamma_sum(this.gamma_sum);
            this.rpmsim?.SetGammaBackground(Math.round(this.gamma_sum / 4));
        },

        on_gamma_val_change: function (ix: number) {
            let newval = this.gamma_vals[ix];
            this.set_gamma_val(ix, newval);
            this.rpmsim?.SetGammaDistribution(this.current_gamma_distribution);
            this.rpmsim?.SetGammaBackground(Math.round(this.gamma_sum / 4));
        },

        on_neutron_sum_change: function () {
            let newval = Math.round(this.neutron_sum / 4);
            console.log("Setting neutron background to " + newval);
            this.rpmsim?.SetNeutronBackground(newval);
        },

        on_occupancy_change: function () {
            console.log("Occupied: ", this.is_occupied);
            this.rpmsim?.SetOccupancy(this.is_occupied);
        },
    },
};
</script>

<style></style>
