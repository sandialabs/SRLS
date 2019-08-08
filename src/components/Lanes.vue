<template>
    <v-container fluid>
        <LaneSettings ref="settingsdialog"></LaneSettings>
        <Confirm ref="confirmdialog"></Confirm>
        <Notify ref="notifydialog"></Notify>
        <RPMControl ref="rpmcontrol"></RPMControl>

        <!-- this hidden canvas is used for rendering animated trucks -->
        <canvas id="render-canvas" width="640" height="480" style="display:none;"></canvas>

        <v-layout row justify-space-between style="margin-top: -1rem; margin-bottom: 1rem;">
            <v-flex xs12>
                <v-card>
                    <v-card-title>
                        <span class="page-title" style="margin-right: 20px;">{{labeltext}}</span>
                        <v-flex style="margin-top: 10px;">
                            <ActionIcon
                                icon="repeat"
                                color="red darken-2"
                                tooltip="Toggle automatic mode"
                                size="32px"
                                style="margin-right: 20px;"
                                v-on:icon-clicked="on_trigger_all('automode')"
                            ></ActionIcon>
                            <ActionIcon
                                icon="local_shipping"
                                color="red"
                                tooltip="Gamma Alarm"
                                size="32px"
                                style="margin-right: 20px;"
                                v-on:icon-clicked="on_trigger_all('GA')"
                            ></ActionIcon>
                            <ActionIcon
                                icon="local_shipping"
                                color="blue darken-2"
                                tooltip="Neutron Alarm"
                                size="32px"
                                style="margin-right: 20px;"
                                v-on:icon-clicked="on_trigger_all('NA')"
                            ></ActionIcon>
                            <ActionIcon
                                icon="local_shipping"
                                color="cyan lighten-2"
                                tooltip="Neutron/Gamma Alarm"
                                size="32px"
                                style="margin-right: 20px;"
                                v-on:icon-clicked="on_trigger_all('NG')"
                            ></ActionIcon>
                            <ActionIcon
                                icon="local_shipping"
                                color="green darken-1"
                                tooltip="Innocent Alarm"
                                size="32px"
                                style="margin-right: 20px;"
                                v-on:icon-clicked="on_trigger_all('OC')"
                            ></ActionIcon>
                            <ActionIcon
                                icon="lock_open"
                                color="red"
                                tooltip="Toggle case tamper"
                                size="32px"
                                style="margin-right: 20px;"
                                v-on:icon-clicked="on_trigger_all('TT')"
                            ></ActionIcon>
                        </v-flex>
                        <ActionIcon
                            icon="add_circle"
                            size="32px"
                            v-on:icon-clicked="on_add_lane()"
                            style="margin-top: 10px;"
                        ></ActionIcon>
                    </v-card-title>
                    <v-card-text>
                        <table style="width: 100%;">
                            <thead class="white--text">
                                <tr>
                                    <th>&nbsp;</th>
                                    <th>Name</th>
                                    <th style="text-align: center">
                                        <v-icon class="white--text">wifi</v-icon>
                                    </th>
                                    <th style="text-align: center">
                                        <v-icon class="white--text">people</v-icon>
                                    </th>
                                    <th>RPM</th>
                                    <th>Camera 1</th>
                                    <th>Camera 2</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="lane in lanedata" :key="lane.LaneID">
                                    <td>
                                        <ActionIcon
                                            icon="create"
                                            color="primary"
                                            v-on:icon-clicked="on_trigger_lane(lane, 'editlane')"
                                        ></ActionIcon>
                                        <ActionIcon
                                            icon="content_copy"
                                            color="primary"
                                            v-on:icon-clicked="on_trigger_lane(lane, 'clone')"
                                        ></ActionIcon>
                                        <ActionIcon
                                            icon="tune"
                                            color="primary"
                                            v-on:icon-clicked="on_trigger_lane(lane, 'adjust')"
                                        ></ActionIcon>
                                        <ActionIcon
                                            icon="delete"
                                            color="red"
                                            v-on:icon-clicked="on_trigger_lane(lane, 'delete')"
                                        ></ActionIcon>
                                    </td>
                                    <td
                                        v-bind:class="lane.OccupancyState"
                                    >{{lane.LaneName}} {{lane.OccupancyState}}</td>
                                    <td style="text-align: center;">
                                        <ActionIcon
                                            v-if="lane.Enabled"
                                            color="green"
                                            icon="wifi"
                                            v-on:icon-clicked="on_toggle_lane(lane)"
                                        />
                                        <ActionIcon
                                            color="red"
                                            v-if="!lane.Enabled"
                                            icon="do_not_disturb_alt"
                                            v-on:icon-clicked="on_toggle_lane(lane)"
                                        />
                                    </td>
                                    <td style="text-align:center;">{{lane.ClientCount}}</td>
                                    <td>{{lane.RPM.IPAddr}}:{{lane.RPM.Port}}</td>
                                    <td>{{camera_info(lane.Cameras[0])}}</td>
                                    <td>{{camera_info(lane.Cameras[1])}}</td>
                                    <td>
                                        <ActionIcon
                                            icon="repeat"
                                            color="red darken-2"
                                            tooltip="Toggle automatic mode"
                                            :disabled="!lane.Enabled"
                                            v-on:icon-clicked="on_trigger_lane(lane, 'automode')"
                                        ></ActionIcon>
                                        <ActionIcon
                                            icon="local_shipping"
                                            color="red"
                                            tooltip="Gamma Alarm"
                                            :disabled="!lane.Enabled"
                                            v-on:icon-clicked="on_trigger_lane(lane, 'GA')"
                                        ></ActionIcon>
                                        <ActionIcon
                                            icon="local_shipping"
                                            color="blue darken-2"
                                            tooltip="Neutron Alarm"
                                            :disabled="!lane.Enabled"
                                            v-on:icon-clicked="on_trigger_lane(lane, 'NA')"
                                        ></ActionIcon>
                                        <ActionIcon
                                            icon="local_shipping"
                                            color="cyan lighten-2"
                                            tooltip="Neutron/Gamma Alarm"
                                            :disabled="!lane.Enabled"
                                            v-on:icon-clicked="on_trigger_lane(lane, 'NG')"
                                        ></ActionIcon>
                                        <ActionIcon
                                            icon="local_shipping"
                                            color="green darken-1"
                                            tooltip="Innocent Alarm"
                                            :disabled="!lane.Enabled"
                                            v-on:icon-clicked="on_trigger_lane(lane, 'OC')"
                                        ></ActionIcon>
                                        <ActionIcon
                                            icon="lock_open"
                                            color="red"
                                            tooltip="Toggle case tamper"
                                            :disabled="!lane.Enabled"
                                            v-on:icon-clicked="on_trigger_lane(lane, 'TT')"
                                        ></ActionIcon>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </v-card-text>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
import { Component, Vue } from "vue-property-decorator";
import ActionIcon from "./ActionIcon";
import LaneSettings from "./LaneSettings";
import Confirm from "./Confirm";
import Notify from "./Notify";
import RPMControl from "./RPMControl";
import { SettingsManager } from "../lib/settings";
import { LaneSimulator } from "../lib/LaneSim";
import { banner } from "../lib/Utility";

console.log("Lanes.vue loaded");

export default {
    props: ["labeltext", "settingsmgr"],
    components: {
        ActionIcon: ActionIcon,
        LaneSettings: LaneSettings,
        Confirm: Confirm,
        Notify: Notify,
        RPMControl: RPMControl,
    },
    computed: {},
    data: () => ({
        lanedata: undefined,
        headers: [{ text: "Name", value: "LaneName" }, { text: "Enabled", value: "Enabled" }],
    }),
    created: function() {
        this.lanedata = this.settingsmgr.Data.Lanes;
        console.log("Lanes.vue created", this.lanedata);
        setInterval(() => {
            this.poll();
        }, 500);
    },
    mounted: function() {
        console.log("Lanes.vue mounted", this.lanedata);
        // create a LaneSimulator for each lane and save it in the
        // lanes LaneSettings.  If the lane is enabled, start the simulator.
        this.lanedata.forEach(lane => {
            if (lane["simulator"]) {
                console.log("    simulator already exists");
            } else {
                console.log("    creating new simulator");
                lane["simulator"] = new LaneSimulator(
                    lane,
                    document.getElementById("render-canvas")
                );
                lane["ClientCount"] = 0;
                if (lane.Enabled) {
                    this.start_simulator(lane);
                }
            }
        });
    },
    watch: {
        lanedata: function(newval, oldval) {
            console.log("Lanes.vue - lanedate changed");
        },
    },
    methods: {
        //-------------------------------------------------------
        // EVENT HANDLING
        //-------------------------------------------------------
        on_add_lane: function() {
            console.log("In on_add_lane");
            let settings = this.settingsmgr.default_lane_settings("New Lane", "127.0.0.1", 1600);
            settings.LaneName = "New Lane";
            console.log("Lane Settings", settings);
            let self = this;
            this.$refs["settingsdialog"].open("Add New Lane", settings, function(updated_settings) {
                updated_settings.Enabled = false;
                let rc = self.settingsmgr.add_new_lane(updated_settings);
                console.log("on_add_lane result: " + rc.message);
                if (rc.success) self.settingsmgr.save();
            });
        },

        on_trigger_all: function(event_name) {
            console.log("In on_trigger_all: " + event_name);

            this.lanedata.forEach(lane => {
                if (lane.Enabled) {
                    if (
                        event_name == "GA" ||
                        event_name == "NA" ||
                        event_name == "NG" ||
                        event_name == "OC"
                    ) {
                        console.log("Generating " + event_name + " on " + lane.LaneName);
                        lane.simulator.GenerateAlarm(event_name);
                    }
                    if (event_name == "TT") {
                        console.log("Toggling case tamper on " + lane.LaneName);
                        lane.simulator.RPM.ToggleTamper();
                    }
                    if (event_name == "automode") {
                        console.log("Toggling auto mode on " + lane.LaneName);
                        lane.simulator.ToggleAutoMode();
                    }
                }
            });
        },

        on_trigger_lane: function(lane, event_name) {
            //console.log("Lane Trigger " + event_name, lane);
            if (lane.Enabled) {
            }
            switch (event_name) {
                case "editlane":
                    this.edit_lane(lane);
                    break;
                case "clone":
                    this.clone_lane(lane);
                    break;
                case "adjust":
                    console.log("adjust", this.$refs);
                    this.$refs["rpmcontrol"].show(lane);
                    break;
                case "delete":
                    this.delete_lane(lane);
                    break;
                case "automode":
                    console.log("Toggling simulator");
                    lane.simulator.ToggleAutoMode();
                    break;
                case "GA":
                    console.log("Generating " + event_name);
                    lane.simulator.GenerateAlarm(event_name);
                    break;
                case "NA":
                    console.log("Generating " + event_name);
                    lane.simulator.GenerateAlarm(event_name);
                    break;
                case "NG":
                    console.log("Generating " + event_name);
                    lane.simulator.GenerateAlarm(event_name);
                    break;
                case "OC":
                    console.log("Generating innocent occupancy");
                    lane.simulator.GenerateAlarm(event_name);
                    break;
                case "TT":
                    console.log("Toggling case tamper");
                    lane.simulator.RPM.ToggleTamper();
                    break;
            }
        },
        on_toggle_lane: function(lane) {
            console.log("on_toggle_lane");
            lane.Enabled = !lane.Enabled;
            if (lane.Enabled) {
                this.start_simulator(lane);
            } else {
                this.stop_simulator(lane);
            }
            this.settingsmgr.save();
        },

        //-------------------------------------------------------
        // HELPER METHODS
        //-------------------------------------------------------

        notify: function(title, text) {
            this.$refs["notifydialog"].show(title, text);
        },

        poll: function() {
            this.lanedata.forEach(lane => {
                lane.simulator.Poll();
            });
            this.$forceUpdate();
        },

        camera_info: function(cam) {
            if (cam.Enabled) {
                return (
                    cam.Manufacturer + " " + cam.Model + " (" + cam.IPAddr + ":" + cam.Port + ")"
                );
            } else {
                return "disabled";
            }
        },

        rpm_client_count: function(lane) {
            let result = "";
            if (lane) {
                console.log("In rpm_client_count", lane);
                if (lane.simulator) {
                    console.log("Simulator", lane.simulator);
                    result = String(lane.ClientCount);
                }
            }
            return result;
        },

        show_lane: function(lane) {
            let rpm = lane.RPM;
            let lines = [];
            lines.push(`Lane ${lane.LaneName}`);
            lines.push(`    IP:   ${rpm.IPAddr}`);
            lines.push(`    Port: ${rpm.Port}`);
            banner(lines);
        },

        start_simulator: function(lane) {
            let sim = lane["simulator"];
            console.log(
                "In start_simulator.  IsEnabled = " +
                    sim.IsEnabled +
                    "  Is Running = " +
                    sim.IsRunning
            );
            console.log("Lane data: ", lane);
            if (lane.Status == "running") {
                console.log("    Simulator is already enabled.");
            } else {
                console.log("    Starting simulator on " + lane.LaneName, lane);
                this.show_lane(lane);
                sim.IsEnabled = true;
                sim.Start();
            }
        },

        stop_simulator: function(lane) {
            console.log("Stopping simulator on " + lane.LaneName, lane);
            let sim = lane["simulator"];
            if (sim) {
                sim.Stop();
                sim.IsEnabled = false;
            }
        },

        clone_lane: function(lane) {
            console.log("In clone_lane", lane);
            let new_lane = SettingsManager.clone_lane(lane);
            new_lane.LaneName = lane.LaneName + " Copy";
            console.log("    New lane:", new_lane);
            let rc = this.settingsmgr.add_new_lane(new_lane);
            if (rc.success) this.settingsmgr.save();
            else this.notify("Duplicate Lane", rc.message);
        },

        delete_lane: function(lane) {
            console.log("delete_lane", lane);
            this.stop_simulator(lane);
            let dlg = this.$refs["confirmdialog"];
            console.log("Refs", this.$refs, dlg);
            dlg.show("Delete", "Delete " + lane.LaneName + "?", () => {
                console.log("In callback");
                this.settingsmgr.remove_lane_by_id(lane.LaneID);
            });
        },

        edit_lane: function(lane) {
            //console.log("In edit_lane", lane);
            let lane_index = -1;
            for (let ix = 0; ix < this.lanedata.length; ix++) {
                if (this.lanedata[ix].LaneID == lane.LaneID) lane_index = ix;
            }
            if (lane_index >= 0) {
                let self = this;
                this.$refs["settingsdialog"].open("Edit Lane", lane, function(updated_settings) {
                    updated_settings.Enabled = false;
                    let rc = self.settingsmgr.update_lane(updated_settings);
                    console.log("edit_lane result: " + rc.message);
                    if (rc.success) {
                        self.settingsmgr.save();
                        // stop and delete simulator on existing lane object
                        self.stop_simulator(lane);
                        lane.simulator = undefined;
                        lane.Enabled = false;
                        updated_settings["simulator"] = new LaneSimulator(
                            updated_settings,
                            document.getElementById("render-canvas")
                        );
                        if (updated_settings.Enabled) {
                            self.start_simulator(updated_settings);
                        }
                        self.lanedata[lane_index] = updated_settings;
                        console.log("Updated lanedata:", self.lanedata);
                        self.$forceUpdate();
                    }
                });
            }
        },
    },
};
</script>


<style scoped>
.page-title {
    font-size: 28px;
}

.table-container {
    border: 1px solid gray;
    border-radius: 12px;
    padding: 10px;
}

table {
    border: none;
}

thead tr {
    background-color: #3277d5;
}

tbody tr:nth-child(even) {
    background: #eee;
}

th,
td {
    padding: 10px;
    text-align: left;
    border: none;
}

.action-icon {
    margin-right: 10px;
}

/* ################################################################# */
/* RPM Alarm Styles                                                  */
/* ################################################################# */

.oc {
    color: black;
    background-color: lightgreen;
}

.ga {
    color: white;
    background-color: red;
}

.na {
    color: white;
    background-color: blue;
}

.ng {
    color: black;
    background-color: cyan;
}

.disabled {
    background-color: pink;
    color: red;
    font-weight: bold;
}

.autoactive {
    background-color: yellow;
}
</style>