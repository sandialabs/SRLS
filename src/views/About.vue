<template>
    <div class="about">
        <v-container>
            <v-layout>
                <v-flex style="font-size: 20px;">
                    <div class="text-md-center display-1 mb-4">SRLS - Sandia RPM Lane Simulator</div>
                    <hr />
                    <p class="mt-4 text-md-center">
                        Copyright 2025 National Technology & Engineering Solutions of Sandia, LLC (NTESS).
                        Under the terms of Contract DE-NA0003525 with NTESS, the U.S. Government retains
                        certain rights in this software.
                    </p>
                    <hr />
                    <div class="mt-4">
                        <table>
                            <tbody>
                                <tr>
                                    <td>Version:</td>
                                    <td>1.2.0</td>
                                </tr>
                                <tr>
                                    <td>Build date:</td>
                                    <td>November 24, 2025</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <v-expansion-panels>
                        <v-expansion-panel>
                            <v-expansion-panel-title>
                                {{ software_button_text }}
                            </v-expansion-panel-title>
                            <v-expansion-panel-text>
                                <p class="mt-4">The following software libraries are used by the Sandia RPM Lane Simulator.
                                </p>
                                <div class="mt-4">
                                    <table class="about-table">
                                        <thead>
                                            <tr>
                                                <th>Package</th>
                                                <th>Version</th>
                                                <th>Type</th>
                                                <th>URL</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="p in software" v-bind:key="p.name">
                                                <td>{{ p.name }}</td>
                                                <td>{{ p.version }}</td>
                                                <td>{{ p.license }}</td>
                                                <td>{{ p.url }}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </v-expansion-panel-text>
                        </v-expansion-panel>
                    </v-expansion-panels>
                </v-flex>
            </v-layout>
        </v-container>
    </div>
</template>

<style scoped>
.about-table {
    border: 1px solid gray;
}

.about-table thead tr {
    background-color: lightgray;
}

.about-table tbody tr:nth-child(even) {
    background: #eee;
}

.about-table th,
td {
    padding: 10px;
    text-align: left;
    border: none;
}
</style>

<script>
import { Attributions } from "../lib/Attributions";

export default {
    name: "about",
    data: () => ({
        software_button_text: "Show Software Attribution",
        software: new Attributions().attributions,
    })
};
</script>
