<template>
    <v-container fluid>
        <LaneSettings ref="settingsdialog" />
        <Confirm ref="confirmdialog" />
        <Notify ref="notifydialog" />
        <RPMControl ref="rpmcontrol" />

        <!-- this hidden canvas is used for rendering animated trucks -->
        <canvas id="render-canvas" width="640" height="480" style="display: none;"></canvas>

        <v-row justify="space-between" style="margin-top: -1rem; margin-bottom: 1rem;">
            <v-col cols="12">
                <v-card>
                    <v-card-title>
                        <span class="page-title" style="margin-right: 20px;">{{ labeltext }}</span>
                        <div style="margin-top: 10px;">
                            <ActionIcon icon="repeat" color="red darken-2" tooltip="Toggle automatic mode" size="32px"
                                style="margin-right: 20px;" @icon-clicked="on_trigger_all('automode')" />
                            <ActionIcon icon="local_shipping" color="red" tooltip="Gamma Alarm" size="32px"
                                style="margin-right: 20px;" @icon-clicked="on_trigger_all('GA')" />
                            <ActionIcon icon="local_shipping" color="blue" tooltip="Neutron Alarm" size="32px"
                                style="margin-right: 20px;" @icon-clicked="on_trigger_all('NA')" />
                            <ActionIcon icon="local_shipping" color="cyan" tooltip="Neutron/Gamma Alarm" size="32px"
                                style="margin-right: 20px;" @icon-clicked="on_trigger_all('NG')" />
                            <ActionIcon icon="local_shipping" color="green" tooltip="Innocent Alarm" size="32px"
                                style="margin-right: 20px;" @icon-clicked="on_trigger_all('OC')" />
                            <ActionIcon icon="lock_open" color="red" tooltip="Toggle case tamper" size="32px"
                                style="margin-right: 20px;" @icon-clicked="on_trigger_all('TT')" />
                        </div>
                        <ActionIcon icon="add_circle" size="32px" @icon-clicked="on_add_lane()"
                            style="margin-top: 10px;" />
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
                                        <ActionIcon icon="create" color="primary" tooltip="Edit lane"
                                            @icon-clicked="on_trigger_lane(lane, 'editlane')" />
                                        <ActionIcon icon="content_copy" color="primary" tooltip="Clone lane"
                                            @icon-clicked="on_trigger_lane(lane, 'clone')" />
                                        <ActionIcon icon="tune" color="primary" tooltip="Adjust RPM setting"
                                            @icon-clicked="on_trigger_lane(lane, 'adjust')" />
                                        <ActionIcon icon="delete" color="red" tooltip="Delete lane"
                                            @icon-clicked="on_trigger_lane(lane, 'delete')" />
                                    </td>
                                    <td :class="lane.OccupancyState">
                                        {{ lane.LaneName }} {{ lane.OccupancyState }}
                                    </td>
                                    <td style="text-align: center;">
                                        <ActionIcon v-if="lane.Enabled" color="green" icon="wifi"
                                            @icon-clicked="on_toggle_lane(lane)" tooltip="Disable lane" />
                                        <ActionIcon v-else color="red" icon="do_not_disturb_alt"
                                            @icon-clicked="on_toggle_lane(lane)" tooltip="Enable lane" />
                                    </td>
                                    <td style="text-align:center;">{{ lane.ClientCount }}</td>
                                    <td>{{ lane.RPM.IPAddr }}:{{ lane.RPM.Port }}</td>
                                    <td>{{ camera_info(lane.Cameras[0]) }}</td>
                                    <td>{{ camera_info(lane.Cameras[1]) }}</td>
                                    <td>
                                        <ActionIcon icon="repeat" color="red darken-2" tooltip="Toggle automatic mode"
                                            :disabled="!lane.Enabled"
                                            @icon-clicked="on_trigger_lane(lane, 'automode')" />
                                        <ActionIcon icon="local_shipping" color="red" tooltip="Gamma Alarm"
                                            :disabled="!lane.Enabled" @icon-clicked="on_trigger_lane(lane, 'GA')" />
                                        <ActionIcon icon="local_shipping" color="blue" tooltip="Neutron Alarm"
                                            :disabled="!lane.Enabled" @icon-clicked="on_trigger_lane(lane, 'NA')" />
                                        <ActionIcon icon="local_shipping" color="cyan" tooltip="Neutron/Gamma Alarm"
                                            :disabled="!lane.Enabled" @icon-clicked="on_trigger_lane(lane, 'NG')" />
                                        <ActionIcon icon="local_shipping" color="green darken-1"
                                            tooltip="Innocent Alarm" :disabled="!lane.Enabled"
                                            @icon-clicked="on_trigger_lane(lane, 'OC')" />
                                        <ActionIcon icon="lock_open" color="red" tooltip="Toggle case tamper"
                                            :disabled="!lane.Enabled" @icon-clicked="on_trigger_lane(lane, 'TT')" />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">

import ActionIcon from "./ActionIcon.vue";
import LaneSettings from "./LaneSettings.vue";
import Confirm from "./Confirm.vue";
import Notify from "./Notify.vue";
import RPMControl from "./RPMControl.vue";
import { SettingsManager } from "../lib/SettingsManager";
import { ILaneSettings } from "../lib/ILaneSettings";
import { LaneSimulator } from "../lib/LaneSim";
import { banner } from "../lib/Utility";
import { CameraSimulator } from "../lib/CameraSimulator";
import { ICameraSettings } from "../lib/ICameraSettings";
import { Reactive, reactive, Ref, ref } from "vue";
import { UnaryExpression } from "typescript";

console.log("Lanes.vue loaded");

interface Headers {
    text: string;
    value: string;
}

export type LaneActions = "GA" | "NA" | "NG" | "OC" | "TT" | "automode";
export type LaneEvents = "editlane" | "clone" | "adjust" | "delete" | "automode" | "GA" | "NA" | "NG" | "OC" | "TT";

export default {
    props: {
        labeltext: String,
        settingsmgr: SettingsManager,
    },
    components: {
        ActionIcon: ActionIcon,
        LaneSettings: LaneSettings,
        Confirm: Confirm,
        Notify: Notify,
        RPMControl: RPMControl,
    },
    computed: {

    },
    setup: () => {
        let lanedata: ILaneSettings[] = reactive([]);
        let headers: Headers[] = reactive([
            { text: "Name", value: "LaneName" },
            { text: "Enabled", value: "Enabled" }            
        ]);
        let simMap: Reactive<Map<number, LaneSimulator>> = reactive(new Map<number, LaneSimulator>());

        return { lanedata, headers, simMap };
    },

    // data: () => ({
    //     lanedata: [] as ILaneSettings[],
    //     headers: [
    //         { text: "Name", value: "LaneName" },
    //         { text: "Enabled", value: "Enabled" }            
    //     ],
    // }),

    created: function () {
        let lanes = this.settingsmgr?.lanes;
        if (lanes) {
            this.lanedata = lanes;
            console.log("Lanes.vue created", this.lanedata);
        }
        setInterval(() => {
            this.poll();
        }, 500);
    },
    mounted: function () {
        // console.log("Lanes.vue mounted", this.lanedata);
        // create a LaneSimulator for each lane and save it in the
        // lanes LaneSettings.  If the lane is enabled, start the simulator.
        this.lanedata.forEach(lane => {
            // console.log("Lanes.vue.mounted -- looking for", lane);
            let sim = this.simMap.get(lane.LaneID);
            if (sim) {
                console.log("    simulator already exists");
            } else {
                // console.log("    creating new simulator", lane);
                let ls = new LaneSimulator(lane,
                    <HTMLCanvasElement>document.getElementById("render-canvas")
                );

                // console.log(`Lanes.vue.mounted -- adding to simMap ${lane.LaneID}`, ls);
                this.simMap.set(lane.LaneID, ls);
                lane.ClientCount = 0;
                if (lane.Enabled) {
                    this.start_simulator(lane);
                }
            }
        });
        console.log("Lanes.vue mounted -- map", this.simMap);
    },
    watch: {
        lanedata: function (newval, oldval) {
            console.log("Lanes.vue - lanedate changed");
        },
    },
    methods: {
        //-------------------------------------------------------
        // EVENT HANDLING
        //-------------------------------------------------------
        on_add_lane: function (): void {
            console.log("In on_add_lane");

            if (!this.settingsmgr) {
                console.error("on_add_lane: missing settingsmgr");
                return;
            }

            let self = this;
            let settings = self.settingsmgr?.default_lane_settings("New Lane", "127.0.0.1", 1600);
            console.log("Lane Settings", settings);
            (<typeof LaneSettings>this.$refs["settingsdialog"]).open("Add New Lane", settings, function (updated_settings: ILaneSettings) {
                updated_settings.Enabled = false;
                let rc = self.settingsmgr?.add_new_lane(updated_settings);
                if(rc) {
                    console.log("on_add_lane result: " + rc[1]);
                    if (rc[0])
                        self.settingsmgr?.save();
                }
            });
        },

        on_trigger_all: function (event_name: LaneActions): void {
            console.log("In on_trigger_all: " + event_name);

            this.lanedata?.forEach(lane => {
                if (lane.Enabled) {
                    let sim = this.simMap.get(lane.LaneID);
                    if(sim) {
                        if (
                            event_name === "GA" ||
                            event_name === "NA" ||
                            event_name === "NG" ||
                            event_name === "OC"
                        ) {
                            console.log("Generating " + event_name + " on " + lane.LaneName);
                            sim.GenerateAlarm(event_name);
                        }
                        if (event_name === "TT") {
                            console.log("Toggling case tamper on " + lane.LaneName);
                            sim.RPM?.ToggleTamper();
                        }
                        if (event_name === "automode") {
                            console.log("Toggling auto mode on " + lane.LaneName);
                            sim.ToggleAutoMode();
                        }
                    }
                    else {
                        console.error("on_trigger_all -- missing lane", lane);
                    }
                }
            });
        },

        on_trigger_lane: function (lane: ILaneSettings, event_name: LaneEvents): void {
            let sim = this.simMap.get(lane.LaneID);
            console.log("on_trigger_lane--simMap", this.simMap);
            console.log("on_trigger_lane--lane", lane);
            console.log("on_trigger_lane--sim", sim);

            //console.log("Lane Trigger " + event_name, lane);
            // if (lane.Enabled) {
            // }
            switch (event_name) {
                case "editlane":
                    this.edit_lane(lane);
                    break;
                case "clone":
                    this.clone_lane(lane);
                    break;
                case "adjust":
                    console.log("adjust", this.$refs);
                    console.log("adjustlane", lane);
                    
                    (<typeof RPMControl>this.$refs["rpmcontrol"]).show(lane, sim);
                    break;
                case "delete":
                    this.delete_lane(lane);
                    break;
                case "automode":
                    console.log("Toggling simulator");
                    if(sim)
                        sim.ToggleAutoMode();
                    else
                        console.error("on_trigger_lane-automode", lane);
                    break;
                case "GA":
                    console.log("Generating " + event_name);
                    if(sim)
                        sim.GenerateAlarm(event_name);
                    else
                        console.error("on_trigger_lane-GA", lane);
                    break;
                case "NA":
                    console.log("Generating " + event_name);
                    if(sim)
                        sim.GenerateAlarm(event_name);
                    else
                        console.error("on_trigger_lane-NA", lane);
                    break;
                case "NG":
                    console.log("Generating " + event_name);
                    if(sim)
                        sim.GenerateAlarm(event_name);
                    else
                        console.error("on_trigger_lane-NG", lane);
                    break;
                case "OC":
                    console.log("Generating innocent occupancy");
                    if(sim)
                        sim.GenerateAlarm(event_name);
                    else
                        console.error("on_trigger_lane-OC", lane);
                    break;
                case "TT":
                    console.log("Toggling case tamper");
                    if(sim)
                        sim.RPM?.ToggleTamper();
                    else
                        console.error("on_trigger_lane-TT", lane);
                    break;
            }
        },
        on_toggle_lane: function (lane: ILaneSettings): void {
            console.log("on_toggle_lane");
            lane.Enabled = !lane.Enabled;
            if (lane.Enabled) {
                this.start_simulator(lane);
            } else {
                this.stop_simulator(lane);
            }
            this.settingsmgr?.save();
        },

        //-------------------------------------------------------
        // HELPER METHODS
        //-------------------------------------------------------

        notify: function (title: string, text: string) {
            (<typeof Notify>this.$refs["notifydialog"]).show(title, text);
        },

        poll: function (): void {
            this.lanedata.forEach(lane => {
                let sim = this.simMap.get(lane.LaneID);
                sim?.Poll();
            });
            this.$forceUpdate();
        },

        camera_info: function (cam: ICameraSettings): string {
            if (cam.Enabled) {
                return (
                    cam.Manufacturer + " " + cam.Model + " (" + cam.IPAddr + ":" + cam.Port + ")"
                );
            } else {
                return "disabled";
            }
        },

        rpm_client_count: function (lane: ILaneSettings): string {
            let result = "";
            if (lane) {
                console.log("In rpm_client_count", lane);
                let sim = this.simMap.get(lane.LaneID);
                if(sim) {
                    console.log("Simulator", sim);
                    result = String(lane.ClientCount);
                }
            }
            return result;
        },

        show_lane: function (lane: ILaneSettings) {
            let rpm = lane.RPM;
            let lines = [];
            lines.push(`Lane ${lane.LaneName}`);
            lines.push(`    IP:   ${rpm.IPAddr}`);
            lines.push(`    Port: ${rpm.Port}`);
            banner(lines);
        },

        start_simulator: function (lane: ILaneSettings) {
            console.log("start_simulator", lane);
            let sim = this.simMap.get(lane.LaneID);
            if(!sim)
                return;
            console.log(`In start_simulator. IsEnabled = ${sim.IsEnabled}, IsRunning = ${sim.IsRunning}"`);
            // console.log("Lane data: ", lane);
            if (lane.Status == "running") {
                console.log("    Simulator is already enabled.");
            } else {
                console.log("    Starting simulator on " + lane.LaneName, lane);
                this.show_lane(lane);
                sim.IsEnabled = true;
                sim.Start();
            }
        },

        stop_simulator: function (lane: ILaneSettings): void {
            console.log("Stopping simulator on " + lane.LaneName, lane);
            let sim = this.simMap.get(lane.LaneID);
            if (sim) {
                sim.Stop();
                sim.IsEnabled = false;
            }
        },

        clone_lane: function (lane: ILaneSettings): void {
            if(!this.settingsmgr)
                return;

            console.log("In clone_lane", lane);
            let new_lane = SettingsManager.clone_lane(lane);
            new_lane.LaneName = lane.LaneName + " Copy";
            console.log("    New lane:", new_lane);
            let rc = this.settingsmgr?.add_new_lane(new_lane);
            if (rc[0])
                this.settingsmgr.save();
            else
                this.notify("Duplicate Lane", rc[1]);
        },

        delete_lane: function (lane: ILaneSettings): void {
            let settingsmgr = this.settingsmgr;

            if (!settingsmgr)
                return;

            console.log("delete_lane", lane);
            this.stop_simulator(lane);
            let dlg = (<typeof Confirm>this.$refs["confirmdialog"]);
            console.log("Refs", this.$refs, dlg);

            let self = this;
            dlg.show("Delete", "Delete " + lane.LaneName + "?", () => {
                console.log("In callback");
                settingsmgr.remove_lane_by_id(lane.LaneID);
                self.simMap.delete(lane.LaneID);
            });
        },

        edit_lane: function (lane: ILaneSettings): void {
            let self = this;
            let settingsmgr = this.settingsmgr;

            if(!settingsmgr)
                return;

            //console.log("In edit_lane", lane);
            let lane_index = -1;
            for (let ix = 0; ix < this.lanedata.length; ix++) {
                if (this.lanedata[ix].LaneID == lane.LaneID) lane_index = ix;
            }
            if (lane_index >= 0) {
                let settingsdlg = <typeof LaneSettings>this.$refs["settingsdialog"];
                settingsdlg.open("Edit Lane", lane, function (updated_settings: ILaneSettings) {
                    updated_settings.Enabled = false;
                    let rc = settingsmgr.update_lane(updated_settings);
                    if(rc) {
                        console.log("edit_lane result: " + rc[1]);
                        if (rc[0]) {
                            console.log("re-creating lane", lane);
                            settingsmgr.save();
                            // stop and delete simulator on existing lane object
                            self.simMap.delete(lane.LaneID);
                            self.stop_simulator(lane);
                            // lane.Simulator = undefined;
                            lane.Enabled = false;
                            let sim = new LaneSimulator(
                                updated_settings,
                                <HTMLCanvasElement>document.getElementById("render-canvas")
                            );
                            if (updated_settings.Enabled) {
                                self.start_simulator(updated_settings);
                                self.simMap.set(updated_settings.LaneID, sim);
                            }
                            self.lanedata[lane_index] = updated_settings;
                            console.log("Updated lanedata:", self.lanedata);
                            self.$forceUpdate();
                        }                        
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