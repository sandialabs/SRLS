<template>
    <v-dialog v-model="is_visible" width="600">
        <v-card>
            <v-card-title class="headline grey lighten-2" primary-title>
                <v-layout row justify-space-between>
                    {{title}}
                    <v-icon
                        medium
                        class="green--text"
                        v-on:click="info_visible = !info_visible"
                    >info</v-icon>
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
                <v-flex xs12>
                    <v-slider
                        v-model="gamma_sum"
                        label="Gamma Sum"
                        thumb-label
                        min="0"
                        max="2000"
                        style="height: 30px;"
                        v-on:input="on_gamma_sum_change()"
                    ></v-slider>
                    <v-slider
                        v-model="gamma_vals[0]"
                        label="Master Lower:"
                        thumb-label
                        min="0"
                        max="500"
                        :thumb-color="gamma_thumb_color(0)"
                        style="margin-left: 1rem; height: 20px;"
                        v-on:input="on_gamma_val_change(0)"
                    ></v-slider>
                    <v-slider
                        v-model="gamma_vals[1]"
                        label="Master Upper"
                        thumb-label
                        min="0"
                        max="500"
                        :thumb-color="gamma_thumb_color(1)"
                        style="margin-left: 1rem; height: 20px;"
                        v-on:input="on_gamma_val_change(1)"
                    ></v-slider>
                    <v-slider
                        v-model="gamma_vals[2]"
                        label="Slave Lower"
                        thumb-label
                        min="0"
                        max="500"
                        :thumb-color="gamma_thumb_color(2)"
                        style="margin-left: 1rem; height: 20px;"
                        v-on:input="on_gamma_val_change(2)"
                    ></v-slider>
                    <v-slider
                        v-model="gamma_vals[3]"
                        label="Slave Upper"
                        thumb-label
                        min="0"
                        max="500"
                        :thumb-color="gamma_thumb_color(3)"
                        style="margin-left: 1rem; height: 20px;"
                        v-on:input="on_gamma_val_change(3)"
                    ></v-slider>
                    <v-slider
                        v-model="neutron_sum"
                        label="Neutron Sum"
                        thumb-label
                        min="0"
                        max="50"
                        :thumb-color="neutron_thumb_color()"
                        style="height: 30px; margin-top: 30px;"
                        v-on:input="on_neutron_sum_change()"
                    ></v-slider>
                </v-flex>
                <v-radio-group v-model="is_occupied" row v-on:change="on_occupancy_change()">
                    <v-radio label="Unoccupied" :value="false"></v-radio>
                    <v-radio label="Occupied" :value="true"></v-radio>
                </v-radio-group>
                <v-layout row></v-layout>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="is_visible=false">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
console.log("Loading RPMControl");
module.exports = {
    props: [],
    data: function() {
        return {
            title: "LANE",
            is_visible: false,
            info_visible: false,
            is_occupied: false,
            gamma_sum: 200, // gamma count order is ml, mu, sl, su
            gamma_vals: [50, 50, 50, 50],
            neutron_sum: 6,
            current_gamma_distribution: [],
        };
    },
    created: function() {
        this.rpmsim = {};
    },
    methods: {
        show: function(lane) {
            console.log("RPMControl", lane);
            let rpmsim = lane.simulator.RPM;
            this.title = lane.LaneName;
            this.is_visible = true;
            this.rpmsim = rpmsim;
            this.current_gamma_distribution = rpmsim.m_gamma_distribution.slice(0);
            this.set_gamma_sum(this.rpmsim.m_gamma_background * 4);
        },

        gamma_thumb_color(ix) {
            let val = this.gamma_vals[ix];
            let color = "green";
            if (val < this.rpmsim.m_gamma_low_threshold) color = "orange";
            if (val > this.rpmsim.m_gamma_high_threshold) color = "red";
            return color;
        },

        neutron_thumb_color() {
            let val = this.neutron_sum / 4;
            let color = "green";
            if (val > this.rpmsim.m_neutron_high_threshold) color = "red";
            return color;
        },

        set_gamma_sum: function(val) {
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
        set_gamma_val: function(ix, val) {
            let vals = this.gamma_vals;
            let dist = this.current_gamma_distribution;
            vals[ix] = val;
            let sum = vals[0] + vals[1] + vals[2] + vals[3];
            for (let i = 0; i < 4; i++) {
                dist[i] = (vals[i] / sum).toFixed(4);
            }
            this.gamma_sum = sum;
        },
        on_gamma_sum_change: function() {
            this.set_gamma_sum(this.gamma_sum);
            this.rpmsim.SetGammaBackground(Math.round(this.gamma_sum / 4));
        },
        on_gamma_val_change: function(i) {
            let newval = this.gamma_vals[i];
            this.set_gamma_val(i, newval);
            this.rpmsim.SetGammaDistribution(this.current_gamma_distribution);
            this.rpmsim.SetGammaBackground(Math.round(this.gamma_sum / 4));
        },
        on_neutron_sum_change: function() {
            let newval = Math.round(this.neutron_sum / 4);
            console.log("Setting neutron background to " + newval);
            this.rpmsim.SetNeutronBackground(newval);
        },

        on_occupancy_change: function() {
            console.log("Occupied: ", this.is_occupied);
            this.rpmsim.SetOccupancy(this.is_occupied);
        },
    },
};
</script>

<style>
</style>
