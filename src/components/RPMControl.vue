<template>
    <v-dialog v-model="is_visible" width="800">
        <v-card>
            <v-card-title class="d-flex align-left">
                <span>{{ title }}</span>
                <!-- <v-icon class="ms-auto" color="green" icon="mdi-information"
                    v-on:click="info_visible = !info_visible"></v-icon> -->
            </v-card-title>

            <v-card-text>
                <v-card v-if="info_visible">
                    <p>
                        Use this popup to change the RPM detector values.
                        <i>Gamma Sum</i> and <i>Neutron Sum</i>
                        sliders control the sum of the four detectors and this total count will be distributed to
                        the detectors according to the global gamma or neutron detector distribution settings.
                        For the gamma detectors, you can control each detector individually as well using the
                        Master/Slave and Upper/Lower sliders.
                    </p>
                    <p>
                        Adjust the occupancy duration slider to update how long occupancies occur in seconds, and use
                        the
                        <i>Unoccupied/Occupied</i> switch to toggle the RPM's occupancy sensor.
                    </p>
                </v-card>
                <v-card>
                    <v-card-title>
                        Gamma
                    </v-card-title>
                    <v-card-text>
                        <v-row>
                            <v-col cols="12">
                                <v-slider v-model="gamma_sum" thumb-label min="0" max="2000" style="height: 20px"
                                    @update:modelValue="on_gamma_sum_change()">
                                    <template v-slot:prepend>
                                        Sum
                                    </template>
                                    <template v-slot:append>
                                        <v-chip>{{ format_number(gamma_sum) }}</v-chip>
                                    </template>
                                </v-slider>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="11" offset="1">
                                <v-slider v-model="gamma_vals[0]" thumb-label min="0" max="500" style="height: 20px"
                                    :thumb-color="gamma_thumb_color(0)" @update:modelValue="on_gamma_val_change(0)">
                                    <template v-slot:prepend>
                                        Master Lower
                                    </template>
                                    <template v-slot:append>
                                        <v-chip>{{ format_number(gamma_vals[0]) }}</v-chip>
                                    </template>
                                </v-slider>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="11" offset="1">
                                <v-slider v-model="gamma_vals[1]" thumb-label min="0" max="500" style="height: 20px"
                                    :thumb-color="gamma_thumb_color(1)" @update:modelValue="on_gamma_val_change(1)">
                                    <template v-slot:prepend>
                                        Master Upper
                                    </template>
                                    <template v-slot:append>
                                        <v-chip>{{ format_number(gamma_vals[1]) }}</v-chip>
                                    </template>
                                </v-slider>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="11" offset="1">
                                <v-slider v-model="gamma_vals[2]" thumb-label min="0" max="500" style="height: 20px"
                                    :thumb-color="gamma_thumb_color(2)" @update:modelValue="on_gamma_val_change(2)">
                                    <template v-slot:prepend>
                                        Slave Lower
                                    </template>
                                    <template v-slot:append>
                                        <v-chip>{{ format_number(gamma_vals[2]) }}</v-chip>
                                    </template>
                                </v-slider>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="11" offset="1">
                                <v-slider v-model="gamma_vals[3]" thumb-label min="0" max="500" style="height: 20px"
                                    :thumb-color="gamma_thumb_color(3)" @update:modelValue="on_gamma_val_change(3)">
                                    <template v-slot:prepend>
                                        Slave Upper
                                    </template>
                                    <template v-slot:append>
                                        <v-chip>{{ format_number(gamma_vals[3]) }}</v-chip>
                                    </template>
                                </v-slider>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
                <v-card>
                    <v-card-title>
                        Neutron
                    </v-card-title>
                    <v-card-text>
                        <v-row>
                            <v-col cols="12">
                                <v-slider v-model="neutron_sum" thumb-label min="0" max="50" style="height: 20px"
                                    :thumb-color="neutron_thumb_color()" @update:modelValue="on_neutron_sum_change()">
                                    <template v-slot:prepend>
                                        Sum
                                    </template>
                                    <template v-slot:append>
                                        <v-chip>{{ format_number(neutron_sum) }}</v-chip>
                                    </template>
                                </v-slider>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
                <v-card>
                    <v-card-title>
                        Occupancy
                    </v-card-title>
                    <v-card-text>
                        <v-row>
                            <v-col cols="12">
                                <v-range-slider v-model="occupancy_range" thumb-label min="5" max="50" style="height: 20px"
                                    strict @update:modelValue="on_occupancy_duration_change()">
                                    <template v-slot:prepend>
                                        Duration
                                    </template>
                                    <template v-slot:append>
                                        <v-chip>{{ format_number(occupancy_range[0]) }} to {{
                                            format_number(occupancy_range[1]) }}</v-chip> seconds
                                    </template>
                                </v-range-slider>
                            </v-col>
                        </v-row>
                        <v-row class="align-center">
                            <span>Unoccupied</span>
                            <v-switch hide-details inset :model-value="is_occupied"
                                @update:model-value="on_occupancy_change()">
                            </v-switch>
                            <span>Occupied</span>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-card-text>

            <v-card-actions>
                <v-btn v-if="!info_visible" color="secondary" text="Learn More" @click="info_visible = true"></v-btn>
                <v-btn v-else color="secondary" text="Hide Information" @click="info_visible = false"></v-btn>
                <v-btn color="primary" @click="is_visible = false" text="Close"></v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">

import { Reactive, reactive, Ref, ref } from "vue";
import { Distribution } from "../lib/RPMSimulator";
import { LaneSimulator } from "../lib/LaneSim";
import { LaneSettings } from "../lib/LaneSettings";
import { useSettingsStore } from "../store/settingsStore";

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
        const occupancy_range = ref([10, 20]);
        const current_gamma_distribution: Reactive<number[]> = reactive([]);
        const lane: Ref<LaneSettings | null> = ref(null);
        const lanesim: Ref<LaneSimulator | null> = ref(null);
        const settingsStore = useSettingsStore();

        return {
            title,
            is_visible,
            info_visible,
            is_occupied,
            gamma_sum,
            gamma_vals,
            neutron_sum,
            occupancy_range,
            current_gamma_distribution,
            lane,
            lanesim,
            settingsStore,
        };
    },
    created: function () {
    },
    methods: {
        show: function (lane: LaneSettings, sim: LaneSimulator) {
            console.log("RPMControl", lane, sim);

            this.lane = lane;
            this.lanesim = sim;
            this.title = lane.LaneName;
            this.is_visible = true;
            this.info_visible = false;

            this.current_gamma_distribution = this.lane.RPM.GammaDistribution.slice(0);    // duplicate
            this.set_gamma_sum(this.lane.RPM.GammaBG * 4);

            this.occupancy_range[0] = this.lane.AutoMinOccupancyDurationSeconds;
            this.occupancy_range[1] = this.lane.AutoMaxOccupancyDurationSeconds;
        },

        gamma_thumb_color(ix: number): string {
            let color = "green";

            if (this.lane) {
                let val = this.gamma_vals[ix];
                if (val < this.lane.RPM.GLThreshold)
                    color = "orange";
                if (val > this.lane.RPM.GHThreshold)
                    color = "red";
            }

            return color;
        },

        neutron_thumb_color(): string {
            let color = "green";

            if (this.lane) {
                let val = this.neutron_sum / 4;
                if (val > this.lane.RPM.NHThreshold)
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
            console.log(`set_gamma_val: ${ix}, ${val}`);

            this.gamma_vals[ix] = val;
            let sum = this.gamma_vals[0] + this.gamma_vals[1] + this.gamma_vals[2] + this.gamma_vals[3];

            this.current_gamma_distribution.forEach((_, index) => this.current_gamma_distribution[index] = this.gamma_vals[index] / sum);
            this.gamma_sum = sum;
        },

        on_gamma_sum_change: function () {
            console.log("on_gamma_sum_change", this.gamma_sum);

            this.set_gamma_sum(this.gamma_sum);
            this.lanesim?.RPM?.SetGammaBackground(Math.round(this.gamma_sum / 4));
        },

        on_gamma_val_change: function (ix: number) {
            console.log(`on_gamma_val_change: ${ix} -- `, this.lanesim?.RPM);

            let newval = this.gamma_vals[ix];
            this.set_gamma_val(ix, newval);

            const g_dist: number[] = this.current_gamma_distribution;
            const dist: Distribution = new Distribution(g_dist[0], g_dist[1], g_dist[2], g_dist[3]);

            this.lanesim?.RPM?.SetGammaDistribution(dist);
            this.lanesim?.RPM?.SetGammaBackground(Math.round(this.gamma_sum / 4));
        },

        on_neutron_sum_change: function () {
            let newval = Math.round(this.neutron_sum / 4);
            console.log("Setting neutron background to " + newval);
            this.lanesim?.RPM?.SetNeutronBackground(newval);
        },

        on_occupancy_change: function () {
            this.is_occupied = !this.is_occupied;
            console.log("Occupied: ", this.is_occupied);
            this.lanesim?.RPM?.SetOccupancy(this.is_occupied);
        },

        on_occupancy_duration_change: function () {
            console.log(`on_occupancy_duration_change ${this.occupancy_range}`);

            if (this.lane) {
                this.lane.set_occupancy_range(this.occupancy_range[0], this.occupancy_range[1]);
                this.lanesim?.UpdateSettings(this.lane);

                this.settingsStore.settingsManager.update_lane(this.lane);
                this.settingsStore.settingsManager.save();
            }
        },

        format_number(value: number): string {
            return value.toFixed(1);
        }
    },
};
</script>

<style></style>
