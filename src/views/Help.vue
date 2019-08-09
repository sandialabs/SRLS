<template>
    <div class="help">
        <v-container>
            <v-layout>
                <v-flex>
                    <div class="text-md-center display-1 mb-4">Sandia RPM Lane Simulator</div>
                    <hr />
                    <v-btn
                        block
                        color="primary"
                        @click="send_ipc('open-asset', 'SRLS User Guide.docx')"
                    >Open the User Guide</v-btn>
                    <h1>Overview</h1>
                    <p>
                        The RPM Lane Simulator (SRLS) simulates Rapiscan radiation portal monitors (RPMs) and IP camers
                        such as those deployed to a vehicle scanning lane. It allows you to define multiple
                        "lanes", each of which will contain an RPM and up to two cameras. Various types of
                        radiation events can be triggered from individual lanes or from all lanes simultaneously.
                    </p>
                    <p>
                        The SRLS user interface comprises four main pages:
                        <ul>
                            <li class='spaced'>Lanes
                                &nbsp;
                                <v-icon color='primary'>local_shipping</v-icon>
                                <br>This is the main page where you will create and control the simulator.
                            </li>
                            <li class='spaced'>Settings
                                &nbsp;
                                <v-icon color='primary'>settings</v-icon>
                                <br>This pages allows the user to modify global settings.
                            </li>
                            <li class='spaced'>Help
                                &nbsp;
                                <v-icon color='primary'>help</v-icon>
                                <br>This is what you are looking at right now.
                            </li>
                            <li class='spaced'>About
                                &nbsp;
                                <v-icon color='primary'>info</v-icon>
                                <br>This page contains copyright and version information, as well as
                                a list of the software libraries that are used to build SRLS.
                            </li>
                        </ul>
                    </p>
                    <div class='h1'>The Lane Management Page <v-icon color='primary' style='margin-top: 10px;'>local_shipping</v-icon>
                    </div>
                    <p>This page displays a list of all the scanning lanes that you have defined.
                       At the top of the page are a set of global lane controls.  These trigger events
                       on all enabled lanes simultaneously.  See the description of the <i>Action</i>
                       buttons below.
                    </p>
                    <p> Each lane  must have a unique name and consists of an RPM and two cameras.  
                        The RPM and cameras can be enabled or disabled by clicking the 
                        <v-icon color="green">wifi</v-icon> or
                        <v-icon color="red">do_not_disturb</v-icon>
                        icon to the right of
                        the lane name.  On the left side of each lane are four icons for managing the lane.
                        <ul>
                            <li class='spaced'>Edit&nbsp;<v-icon color='primary'>create</v-icon>
                                <br>Edit RPM and camera settings.
                            </li>
                            <li class='spaced'>Duplicate&nbsp;<v-icon color='primary'>content_copy</v-icon>
                                <br>Create a new lane by duplicating this lane.
                            </li>
                            <li class='spaced'>Levels&nbsp;<v-icon color='primary'>tune</v-icon>
                                <br>Interactively control the RPM simulator.
                            </li>
                            <li class='spaced'>Delete&nbsp;<v-icon color='red'>delete</v-icon>
                                <br>Delete this lane.
                            </li>
                        </ul>
                    </p>
                    <p>
                        To control each lane, use the <i>Action</i> buttons at the right of the lane.
                        <ul>
                            <li class='spaced'>AutoMode&nbsp;<v-icon color='red'>repeat</v-icon>
                                <br>Toggle <i>Auto</i> mode for the RPM.  This causes the RPM to simulate
                                radiation events at regular intervals.  You can control what kinds of
                                events are simulated (innocent, gamma, neutron, and neutron/gamma) by
                                clicking on the lane <i>Edit</i> button.&nbsp;<v-icon color='primary'>create</v-icon>
                            </li>
                            <li class='spaced'>Gamma Alarm&nbsp;<v-icon color='red'>local_shipping</v-icon>
                                <br>Simulate a Gamma alarm.
                            </li>
                            <li class='spaced'>Neutron Alarm&nbsp;<v-icon color="blue darken-2">local_shipping</v-icon>
                                <br>Simulate a Neutron alarm.
                            </li>
                            <li class='spaced'>Neutron/Gamma Alarm&nbsp;<v-icon color="cyan lighten-2">local_shipping</v-icon>
                                <br>Simulate a Neutron/Gamma alarm.
                            </li>
                            <li class='spaced'>Occupancy&nbsp;<v-icon color="green darken-1">local_shipping</v-icon>
                                <br>Simulate a non-alarming occupancy.
                            </li>
                            <li class='spaced'>Tamper&nbsp;<v-icon color='red' style="margin-left: -120px;">open_lock</v-icon>
                                <br>Simulate a case tamper event.
                            </li>
                        </ul>
                    </p>
                </v-flex>
            </v-layout>
        </v-container>
    </div>
</template>

<script>
import { Attributions } from "../lib/Attributions";
const { ipcRenderer } = require("electron");

let helpview = {
    name: "about",
    data: () => ({}),
    mounted: function() {
        console.log("In mounted");
    },
    methods: {
        send_ipc: function(msg, arg) {
            console.log("SENDING IPC: " + msg, arg);
            ipcRenderer.send(msg, arg);
        },
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
</style>

