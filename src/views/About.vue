<template>
    <div class="about">
        <v-container>
            <v-layout>
                <v-flex style="font-size: 20px;">
                    <div class="text-md-center display-1 mb-4">Sandia RPM Lane Simulator</div>
                    <hr />
                    <p class="mt-4 text-md-center">
                        Copyright 2019 National Technology & Engineering Solutions of Sandia, LLC (NTESS).
                        Under the terms of Contract DE-NA0003525 with NTESS, the U.S. Government retains
                        certain rights in this software.
                    </p>
                    <hr />
                    <div class="mt-4">
                        <table>
                            <tbody>
                                <tr>
                                    <td>Version:</td>
                                    <td>1.0.0</td>
                                </tr>
                                <tr>
                                    <td>Build date:</td>
                                    <td>August 12, 2019</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="text-lg-center">
                        <v-btn
                            block
                            small
                            class="primary rounded"
                            @click="toggle_software()"
                        >{{software_button_text}}</v-btn>
                    </div>
                    <div v-if="show_software">
                        <p
                            class="mt-4"
                        >The following software libraries are used by the Sandia RPM Lane Simulator.</p>
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
                                        <td>{{p.name}}</td>
                                        <td>{{p.version}}</td>
                                        <td>{{p.license}}</td>
                                        <td>{{p.url}}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
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
        show_software: false,
        software_button_text: "Show Software Attribution",
        software: new Attributions().direct,
    }),
    methods: {
        toggle_software() {
            this.show_software = !this.show_software;
            if (this.show_software) this.software_button_text = "Hide Software Attribution";
            else this.software_button_text = "Show Software Attribution";
        },
    },
};
</script>
