<!-- ---------------------------------------------------------------------- -->
<!--                                                                        -->
<!--          Single File Component: ProfileTest                            -->
<!--                                                                        -->
<!-- ---------------------------------------------------------------------- -->
 
<template>
    <v-container>
        <v-layout text-xs-center wrap>
            <div id="testvue">
                Duration (seconds):
                <input
                    type="number"
                    min="1"
                    max="40"
                    step="1"
                    v-model="duration"
                    style="margin-right: 2em;"
                >
                N-Sigma:
                <input
                    type="number"
                    min="1"
                    max="100"
                    step="0.5"
                    v-model="sigma"
                    style="margin-right: 2em;"
                >
                Width (pct):
                <input
                    type="number"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    v-model="width_pct"
                    style="margin-right: 2em;"
                >
                Shift (pct):
                <input
                    type="number"
                    min="-1.0"
                    max="1.0"
                    step="0.1"
                    v-model="shift"
                    style="margin-right: 2em;"
                >
                <v-btn small class="success" v-on:click="generate_test_occupancy()">Generate</v-btn>
                <div class="xcanvas-wrapper" style="margin:10px;">
                    <canvas id="gamma-chart" width="1200" heigh="300"></canvas>
                </div>
            </div>
        </v-layout>
    </v-container>
</template>
 
<script>
var Chart = require("chart.js");

import { AppData } from "../main";
import { Settings, SettingsManager } from "../lib/settings";

export default {
    props: [],
    components: {},
    data: () => ({
        duration: 10.0,
        sigma: 10.0,
        width_pct: 0.5,
        shift: 0,
        humps: 1,
        chart: undefined,

        gamma_mu: [],
        gamma_ml: [],
        gamma_su: [],
        gamma_ll: [],
    }),

    mounted: function() {
        console.log("ProfileTest mounted");
        this.initialize_chart([]);
    },

    methods: {
        initialize_chart: function(gamma_points) {
            // gamma_counts is an array of [x, y]
            console.log("In initialize_chart");
            let counts = [];
            gamma_points.forEach(pair => {
                counts.push({ x: pair[0], y: pair[1] });
            });
            console.log("Gamma Counts", counts);
            this.gamma_mu = counts;
            let canvas = document.getElementById("gamma-chart").getContext("2d");
            console.log("Canvas", canvas);
            let config = {
                xresponsive: true,
                xmaintainAspectRatio: false,
                type: "scatter",
                data: {
                    datasets: [
                        {
                            label: "gamma1",
                            fill: false,
                            showLine: true,
                            lineTension: 0,
                            borderColor: "red",
                            borderWidth: 0.5,
                            data: this.gamma_mu,
                        },
                    ],
                },
                options: {
                    title: { display: true, text: "Gamma Counts" },
                },
            };
            this.chart = new Chart(canvas, config);
        },

        generate_random: function() {
            console.log("Generating random profile");
            let points = [];
            for (let i = 0; i < 50; i++) {
                let x = i * 200;
                let y = Math.trunc(200.0 + Math.random() * 200);
                points.push([x, y]);
            }
            this.initialize_chart([]);
        },

        generate_test_occupancy: function() {
            console.log("In generate_test_occupancy");
            let duration = parseFloat(this.duration);
            let generator_params = {
                duration: duration,
                stddev: parseFloat(this.width_pct) * duration,
                time_increment: 1,
                humps: 1,
                shift: parseFloat(this.shift),
                gamma_nsigma: parseFloat(this.sigma),
                neutron_amplitude: 1,
            };

            let bg = 100;
            let nsigma = parseFloat(this.sigma);
            // get [ [x0, y0], [x1, y1], ... ]
            let profile = AppData.testsim.GenerateFromModel(generator_params);
            let smoothed = profile.Smooth();
            let counts = smoothed.GammaCounts;
            console.log("    profile", profile);
            console.log("    gamma counts", counts);
            // scale the y values by n_sigma
            // n_sigma = (maxcount - bg) / sqrt(bg)
            // maxcount = n_sigma * sqrt(bg) + bg
            let sqrtbg = Math.sqrt(bg);
            let maxcount = nsigma * sqrtbg;
            console.log("    Max count: ", maxcount);
            this.gamma_mu.splice(0, this.gamma_mu.length);
            let self = this;
            for (let i = 0; i < counts.length; i++) {
                let dv = counts[i];
                let x = dv.TimeOffset / 1000.0;
                let y = dv.TotalCounts();
                let point = { x: x, y: y };
                self.gamma_mu.push(point);
            }
            this.chart.update();
        },
    },
    computed: {},
};
</script>
 
<style scoped>
</style>