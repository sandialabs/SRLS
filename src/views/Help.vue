<template>
    <div class="help">
        <v-container>
            <h1 class="mb-4">SRLS - Sandia RPM Lane Simulator</h1>
            <hr />
            <v-btn block color="primary" @click="openUserGuide()">Open the User
                Guide</v-btn>
            <h1>Overview</h1>
            <p>
                The Sandia RPM Lane Simulator (SRLS) simulates Rapiscan radiation portal monitors (RPMs)
                such as those deployed to a vehicle scanning lane. It allows you to define multiple
                "lanes", each of which will contain an RPM. Various types of
                radiation events can be triggered from individual lanes or from all lanes simultaneously.
            </p>
            <p>The SRLS user interface comprises four main pages:</p>
            <v-card>
                <v-card-title>
                    <v-icon color="primary">mdi-truck</v-icon>
                    Lanes
                </v-card-title>
                <v-card-text>
                    This is the main page where you will create and control the simulator.
                </v-card-text>
            </v-card>
            <v-card>
                <v-card-title>
                    <v-icon color="primary">mdi-cog</v-icon>
                    Settings
                </v-card-title>
                <v-card-text>
                    This page allows the user to modify global settings.
                </v-card-text>
            </v-card>
            <v-card>
                <v-card-title>
                    <v-icon color="primary">mdi-information</v-icon>
                    About
                </v-card-title>
                <v-card-text>
                    This page contains copyright and version information, as well as a list of the software libraries
                    that are used to build SRLS.
                </v-card-text>
            </v-card>
            <v-card>
                <v-card-title>
                    <v-icon color="primary">mdi-help</v-icon>
                    Help
                </v-card-title>
                <v-card-text>
                    This is what you are looking at right now.
                </v-card-text>
            </v-card>
            <hr />
            <v-card>
                <v-card-title>
                    <v-icon color='primary'>mdi-truck</v-icon>
                    The Lane Management Page
                </v-card-title>
                <v-card-text>
                    <p>
                        This page displays a list of all the scanning lanes that you have defined.
                        At the top of the page are a set of global lane controls. These trigger events
                        on all enabled lanes simultaneously. See the description of the <i>Action</i>
                        buttons below.
                    </p>
                    <p>
                        Each lane must have a unique name. The RPM can be enabled or disabled by toggling the
                        enabled/disabled switch
                        to the right of the lane name. On the right side of each lane are four icons for managing the
                        lane.
                    </p>
                    <v-card>
                        <v-card-title>
                            <v-icon color='primary'>mdi-pencil</v-icon>
                            Edit
                        </v-card-title>
                        <v-card-text>
                            Edit RPM settings
                        </v-card-text>
                    </v-card>
                    <v-card>
                        <v-card-title>
                            <v-icon color='primary'>mdi-content-copy</v-icon>
                            Duplicate
                        </v-card-title>
                        <v-card-text>
                            Create a new lane by duplicating this lane.
                        </v-card-text>
                    </v-card>
                    <v-card>
                        <v-card-title>
                            <v-icon color='primary'>mdi-tune</v-icon>
                            Levels
                        </v-card-title>
                        <v-card-text>
                            Interactively control the RPM simulator.
                        </v-card-text>
                    </v-card>
                    <v-card>
                        <v-card-title>
                            <v-icon color='red'>mdi-delete</v-icon>
                            Delete
                        </v-card-title>
                        <v-card-text>
                            Delete this lane.
                        </v-card-text>
                    </v-card>
                </v-card-text>
            </v-card>
            <v-card>
                <v-card-title>
                    To control each lane, use the <i>Action</i> buttons/switches.
                </v-card-title>
                <v-card-text>
                    <v-card>
                        <v-card-title>
                            Automatic mode
                        </v-card-title>
                        <v-card-text>
                            Toggle automatic mode for the RPM. This causes the RPM to simulate
                            radiation events at regular intervals. You can control what kinds of
                            events are simulated (innocent, gamma, neutron, and neutron/gamma) by
                            clicking on the lane <i>Levels</i><v-icon color='primary'>mdi-tune</v-icon> button.
                        </v-card-text>
                    </v-card>
                    <v-card>
                        <v-card-title>
                            <v-icon color='red'>mdi-truck</v-icon>
                            Gamma Alarm
                        </v-card-title>
                        <v-card-text>
                            Simulate a Gamma alarm.
                        </v-card-text>
                    </v-card>
                    <v-card>
                        <v-card-title>
                            <v-icon color='blue'>mdi-truck</v-icon>
                            Neutron Alarm
                        </v-card-title>
                        <v-card-text>
                            Simulate a Neutron alarm.
                        </v-card-text>
                    </v-card>
                   <v-card>
                        <v-card-title>
                            <v-icon color='cyan'>mdi-truck</v-icon>
                            Neutron/Gamma Alarm
                        </v-card-title>
                        <v-card-text>
                            Simulate a Neutron/Gamma alarm.
                        </v-card-text>
                    </v-card>
                    <v-card>
                        <v-card-title>
                            <v-icon color='green'>mdi-truck</v-icon>
                            Non-alarming occupancy
                        </v-card-title>
                        <v-card-text>
                            Simulate a non-alarming occupancy.
                        </v-card-text>
                    </v-card>
                    <v-card>
                        <v-card-title>
                            Case Tamper
                        </v-card-title>
                        <v-card-text>
                            Toggle switch to simulate a case tamper event.
                        </v-card-text>
                    </v-card>
                </v-card-text>
            </v-card>
        </v-container>
    </div>
</template>

<script lang="ts">
// const { ipcRenderer } = require("electron");
// import { ipcRenderer } from 'electron';

let helpview = {
    name: "Help",
    data: () => ({}),
    mounted: function () {
        console.log("In mounted");
    },
    methods: {
        openUserGuide(): void {
            window.electronAPI.openAsset('SRLS User Guide.docx');
        }
    },
};

export default helpview;
</script>


<style scoped>
p {
    font-size: 18px;
    margin-top: 1em;
}

.h1 {
    font-size: 20px;
    font-weight: bold;
}

li.spaced {
    margin-top: 1em;
    margin-left: 20px;
}

table {
    border: 1px solid gray;
}

table thead tr {
    background-color: lightgray;
}

table tbody tr:nth-child(even) {
    background: #eee;
}

table th,
td {
    padding: 10px;
    text-align: left;
    border: none;
}

.help {
    text-align: left;
}
</style>
