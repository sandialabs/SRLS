/// <reference types="node" />

import { Component } from "./Component";
import { RPMProfile, DetectorValues } from "./RPMProfile";
import * as net from "net";
import * as fs from "fs";
import * as path from "path";
//import { ProfileGenerator1 } from "./ProfileGenerator1";
import { ProfileGenerator2 } from "./ProfileGenerator2";
import { LaneSettings } from "./settings";
import { ELogLevel, Logger } from "./Logger";

const ONE_YEAR = 60 * 60 * 24 * 365 * 1000;

interface ProfileGenerator {
    generate_profile(settings: any): any[];
    generate_random_profile(): any[];
}

//############################################################
//
// RPMSimulator
//
//############################################################
export class RPMSimulator extends Component {
    static ga_files: string[] = [];
    static na_files: string[] = [];
    static ng_files: string[] = [];

    m_owner: any; // the LaneSimulator that created us

    m_ga_file_cursor = 0;
    m_na_file_cursor = 0;
    m_ng_file_cursor = 0;

    m_is_tamper_active = false;
    m_name = "RPMSim";
    m_profile_generator: ProfileGenerator = null;

    m_queued_profiles: RPMProfile[] = [];
    m_current_profile: RPMProfile = null;
    m_ipaddr: string;
    m_rpm_port: number; // the port we are talking on
    m_listener: any; // the TCP/IP server
    m_clients: any[] = []; // connected clients
    m_gamma_background = 220; // mean single gamma detector background count
    m_neutron_background = 2; // mean single neutron detector background count

    // Alarm thresholds
    m_gamma_nsigma = 2; // sigma > this value is alarm
    m_neutron_threshold = 2;

    // fault thresholds - these will be updated from RPMSettings
    m_gamma_low_threshold = 50;
    m_gamma_high_threshold = 400;
    m_neutron_high_threshold = 20;

    m_gx_counter = 0;
    // distribution of counts: ML, MU, SL, SU
    m_gamma_distribution = [0.25, 0.25, 0.25, 0.25]; // ml, mu, sl, su
    m_neutron_distribution = [0.25, 0.25, 0.25, 0.25]; // mu, ml, su, sl
    m_current_gamma_counts: number[];
    m_current_neutron_counts: number[];
    m_gamma_count_randomization = 0.1;
    m_neutron_count_randomization = 1.0;
    m_next_background_time: number;
    m_background_interval = 5000;
    m_is_occupied = false;
    m_next_gs_time = new Date().getTime() + ONE_YEAR; // used when m_is_occupied is on
    m_next_ns_time = new Date().getTime() + ONE_YEAR; // used when m_is_occupied is on
    m_timer: NodeJS.Timer;

    // Automatic profile generation
    m_auto_mode_active = false;
    m_auto_mode_gamma_probability = 0.044;
    m_auto_mode_neutron_probability = 0.044;
    m_auto_mode_interval_seconds = 30.44;
    m_auto_mode_next_occupancy_time: number;

    m_is_paused = false;

    get Name(): string {
        return this.m_name;
    }
    set Name(val: string) {
        this.m_name = val;
    }

    //------------------------------------------------------------
    //
    // Function:    constructor
    // Author:      Pete Humphrey
    // Description: construct an instance of RPMSimulator
    //
    // param port:  the port number the RPM will send data to
    //
    //------------------------------------------------------------
    /** construct an instance of RPMSimulator  */
    public constructor(
        ipaddr: string,
        port: number,
        name: string,
        profile_generator: ProfileGenerator,
        debug: boolean = false
    ) {
        super("RPMSimulator");
        if (debug) this.m_logger.Level = ELogLevel.LOG_DEBUG;
        this.LogDebug("    Creating RPM simulator " + name);
        this.m_ipaddr = ipaddr;
        this.m_rpm_port = port;
        this.m_name = name;
        this.m_profile_generator =
            profile_generator == null ? new ProfileGenerator2() : profile_generator;
        this.m_next_background_time = this.current_time();
        this.m_current_profile = null;
        this.m_listener = null;
        this.m_gamma_background = 212;
        this.m_neutron_background = 5;
        this.m_gamma_nsigma = 5;
        this.m_neutron_threshold = 7;
    }

    public SetOwner(owner: any) {
        this.m_owner = owner;
    }

    public UpdateGlobalSettings(
        gamma_bg: number,
        neutron_bg: number,
        gamma_nsigma: number,
        neutron_threshold: number
    ) {
        this.m_gamma_background = gamma_bg;
        this.m_neutron_background = neutron_bg;
        this.m_gamma_nsigma = gamma_nsigma;
        this.m_neutron_threshold = neutron_threshold;
        this.LogInfo(
            "Have new settings: GammaGB=" +
                gamma_bg +
                ", NeutronBG=" +
                neutron_bg +
                ", GammaNSigma=" +
                gamma_nsigma +
                ", NeutronThreshold=" +
                neutron_threshold
        );
    }

    public Start(): void {
        this.Reset();
        if (this.m_listener == null) {
            this.LogDebug("Starting listener on " + this.m_ipaddr + ":" + this.m_rpm_port);
            let self = this; // "this" will be something different in callback
            this.m_listener = net
                .createServer(socket => {
                    // this is called every time a client connects
                    this.LogDebug(
                        "Have connection from " + socket.remoteAddress + ":" + socket.remotePort
                    );
                    if (self.m_clients.length == 0) {
                        let now = this.current_time();
                        this.m_next_background_time = now + 200;
                    }
                    self.m_clients.push(socket);
                    socket.on("end", () => {
                        // this is called when a client disconnects
                        this.LogDebug("Client disconnected");
                        self.delete_client(socket);
                    });
                    socket.on("error", err => {
                        // error on client connection - possible disconnect
                        self.delete_client(socket);
                        this.LogDebug("Error on client connection: " + err.message);
                    });
                    socket.on("data", data => {
                        // some client has sent me something
                        this.LogDebug("Received " + data);
                    });
                })
                .listen(this.m_rpm_port, this.m_ipaddr);
            this.LogDebug("RPM server created.");
            this.m_timer = setInterval(() => {
                self.on_timer();
            }, 10);
        }
    }

    public Stop(): void {
        this.Reset();
        if (this.m_listener) {
            this.LogDebug("Shutting down RPM simulator on port " + this.m_rpm_port);
            clearInterval(this.m_timer);
            let clients = this.m_clients;
            this.m_clients = [];
            for (let client of clients) {
                this.LogDebug("    Closing client connection: " + client);
                client.destroy();
            }
            this.LogDebug("    Closing listener");
            this.m_listener.close(() => this.LogDebug("    CLOSED"));
            this.m_listener = null;
            clearInterval(this.m_timer);
            this.m_timer = undefined;
        }
    }

    //------------------------------------------------------------
    //
    // Function:    StartAutoMode
    // Author:      Pete Humphrey
    // Description: Start generating occupancies automatically
    //
    // param gamma_probability:     the probability (0 - 1.0) of having a gamma alarm
    // param neutron_probability:   the probability (0 - 1.0) of having a neutron alarm
    // param interval_seconds:      the number of seconds between ocupancies
    //
    //------------------------------------------------------------
    /** Start generating occupancies automatically */
    public StartAutoMode(): void {
        if (!this.m_auto_mode_active) {
            this.m_auto_mode_next_occupancy_time = new Date().getTime();
            this.m_auto_mode_active = true;
            this.LogDebug("Auto mode started on lane " + this.m_name);
            this.LogDebug("    Gamma probability:        " + this.m_auto_mode_gamma_probability);
            this.LogDebug("    Neutron probability:      " + this.m_auto_mode_neutron_probability);
            this.LogDebug("    Time between occupancies: " + this.m_auto_mode_interval_seconds);
        }
    }

    //------------------------------------------------------------
    //
    // Function:    StopAutoMode
    // Author:      Pete Humphrey
    // Description: StopGenerating occupancies automatically
    //
    //------------------------------------------------------------
    /** StopGenerating occupancies automatically */
    public StopAutoMode(): void {
        this.m_auto_mode_active = false;
        this.m_auto_mode_next_occupancy_time = new Date().getTime() + 1000 * 60 * 60 * 24 * 365;
    }

    public Reset(): void {
        this.m_current_profile = null;
        this.m_queued_profiles = [];
        this.m_is_paused = false;
    }

    public UpdateFromSettings(settings: LaneSettings): void {
        this.LogDebug("RPMSimulator.UpdateFromSettings:");
        this.m_gamma_background = settings.RPM.GammaBG;
        this.m_neutron_background = settings.RPM.NeutronBG;
        this.m_gamma_nsigma = settings.RPM.GammaNSigma;
        this.m_neutron_threshold = settings.RPM.NeutronThreshold;
        this.m_gamma_high_threshold = settings.RPM.GHThreshold;
        this.m_gamma_low_threshold = settings.RPM.GLThreshold;
        this.m_neutron_high_threshold = settings.RPM.NHThreshold;
        this.m_auto_mode_gamma_probability = settings.AutoGammaProbability;
        this.m_auto_mode_neutron_probability = settings.AutoNeutronProbability;
        this.m_auto_mode_interval_seconds = settings.AutoInterval;
    }

    public DumpSettings(): void {
        console.log("RPM Settings");
        console.log("    Gamma BG:          ", this.m_gamma_background);
        console.log("    Neutron BG:        ", this.m_neutron_background);
        console.log("    Gamma NSigma:      ", this.m_gamma_nsigma);
        console.log("    Neutron Threshold: ", this.m_neutron_threshold);
        console.log("    GH Threshold:      ", this.m_gamma_high_threshold);
        console.log("    GL Threshold:      ", this.m_gamma_low_threshold);
        console.log("    NH Threshold:      ", this.m_neutron_high_threshold);
        console.log("    Auto Gamma Prob:   ", this.m_auto_mode_gamma_probability);
        console.log("    Auto Neutron Prob: ", this.m_auto_mode_neutron_probability);
        console.log("    Auto Interval:     ", this.m_auto_mode_interval_seconds);
    }

    public ToggleTamper(): boolean {
        this.m_is_tamper_active = !this.m_is_tamper_active;
        if (this.m_is_tamper_active) this.say("TT,000000,000000,000000,000000\r\n");
        else this.say("TC,111111,111111,111111,111111\r\n");
        return this.m_is_tamper_active;
    }

    public IsOccupied(): boolean {
        return this.m_is_occupied || this.m_current_profile != null;
    }

    public OccupancyState(): string {
        let result = "unoccupied";
        if (this.m_current_profile != null) {
            result = this.m_current_profile.Type;
        }
        return result;
    }

    public SetOccupancy(state: boolean): void {
        if (this.m_is_occupied != state) {
            this.m_is_occupied = state;
            let now = this.current_time();
            if (state) {
                // we are turning occupancy mode on
                this.m_next_gs_time = now + 100;
                this.m_next_ns_time = now + 100;
                this.m_next_background_time = now + ONE_YEAR;
            } else {
                // we are turning occupancy mode off
                this.m_next_gs_time = now + ONE_YEAR;
                this.m_next_ns_time = now + ONE_YEAR;
                this.m_next_background_time = now + 1000;
                this.send_gx();
            }
        }
    }

    public SetGammaBackground(value: number) {
        this.m_gamma_background = value;
    }

    public SetNeutronBackground(value: number) {
        this.m_neutron_background = value;
    }

    public SetGammaCounts(counts: number[]): void {
        this.m_current_gamma_counts = counts;
        if (this.m_logger.Level >= ELogLevel.LOG_DEBUG)
            console.log("New gamma background counts: " + counts);
    }

    public SetGammaDistribution(weights: number[]): void {
        this.m_gamma_distribution = weights;
        if (this.m_logger.Level >= ELogLevel.LOG_DEBUG)
            console.log("New gamma distribution: ", weights);
    }

    public GenerateFromFile(alarmtype: string): RPMProfile {
        let result: RPMProfile = null;
        let filename = undefined;
        switch (alarmtype) {
            case "GA":
                filename = RPMSimulator.ga_files[this.m_ga_file_cursor];
                this.m_ga_file_cursor = (this.m_ga_file_cursor + 1) % RPMSimulator.ga_files.length;
                break;
            case "NA":
                filename = RPMSimulator.na_files[this.m_na_file_cursor];
                this.m_na_file_cursor = (this.m_na_file_cursor + 1) % RPMSimulator.na_files.length;
                break;
            case "NG":
                filename = RPMSimulator.ng_files[this.m_ng_file_cursor];
                this.m_ng_file_cursor = (this.m_ng_file_cursor + 1) % RPMSimulator.ng_files.length;
                break;
        }
        if (filename) {
            result = new RPMProfile();
            let self = this;
            result.InitializeFromFile(filename, rc => {
                this.LogDebug("Queuing new profile");
                self.m_queued_profiles.push(result);
            });
        }
        return result;
    }

    //------------------------------------------------------------
    //
    // Function:    GenerateFromModel
    // Author:      Pete Humphrey
    // Description: Generate a profile
    //
    // param model:  a structure containing parameters for profile
    // return:       an RPMProfile instance
    //
    // The model structure contains the following values:
    //     duration: duration of profile, in seconds
    //     stddev: width of profile (1 standard deviation)
    //     time_increment: spacing of x values (in 200 ms)
    //     humps: how many sources to model
    //     shift: how much to shift profile from center (-1 to 1)
    //     gamma_nsigma: target max gamma sigma value
    //     neutron_amplitude: amplitude of neutron profile

    //
    //------------------------------------------------------------
    /** Generate a profile */
    public GenerateFromModel(model: any, save: boolean = true): RPMProfile {
        this.LogDebug("GenerateFromModel");
        if (this.m_logger.Level >= ELogLevel.LOG_DEBUG) console.log(model);

        // since we are modifying the model values, make a copy of it
        model = Object.assign({}, model);

        // get two arrays that looks like [[time, count], [time, count] ...]
        // where time goes from 1 to n and count ranges from 0 to 1.0
        //console.log("RPMSimulator.GenerateFromModel  Gamma BG: " + gamma_bg + "  Neutron BG: " + neutron_bg);
        let gamma_counts = this.m_profile_generator.generate_profile(model);
        console.log("Gamma counts from profile generator", gamma_counts);
        model.time_increment = 5;
        let neutron_counts = this.m_profile_generator.generate_profile(model);

        // we want values that go from background to background + offset,
        // where background + offset will result in the desired max sigma

        // compute max_gamma_count: the gamma count that will produce the desired max n-sigma
        //                  offset: how much above background max_gamma_count is
        //
        // nsigma = (5*c - bg) / sqrt(bg)     where c is a 200ms count and bg is a 1-second background
        // c = 0.2 * (bg + nsigma * sqrt(bg))
        let gamma_bg = this.m_gamma_background;
        let sqrtbg = Math.sqrt(gamma_bg);
        let max_gamma_count = (model.gamma_nsigma * sqrtbg + gamma_bg) / 5;
        let offset = max_gamma_count - gamma_bg / 5;

        console.log("gamma_bg", gamma_bg);
        console.log("RPM n-sigma", this.m_gamma_nsigma);
        console.log("Model n-sigma", model.gamma_nsigma);
        console.log("Max gamma count", max_gamma_count);
        console.log("Offset", offset);
        this.LogInfo("########################################################################");
        this.LogInfo("#");
        this.LogInfo("# Model");
        this.LogInfo(`#     Duration: ${model.duration}`);
        this.LogInfo(`#     Stddev:   ${model.stddev}`);
        this.LogInfo(`#     Shift:    ${model.shift}`);
        this.LogInfo(`#     N-sigma:  ${model.gamma_nsigma}`);
        this.LogInfo("# Computed");
        this.LogInfo(`#     gamma_bg:         ${gamma_bg}, ${sqrtbg}`);
        this.LogInfo(`#     RPM n-sigma:      ${this.m_gamma_nsigma}`);
        this.LogInfo(`#     max_gamma_count:  ${max_gamma_count} = ${gamma_bg / 5} + ${offset}`);

        // GS/GA and NS/NA are determined using our threshold values
        let gamma_threshold = this.m_gamma_high_threshold;
        let neutron_threshold = this.m_neutron_threshold;
        this.LogInfo(`# gamma alarm thresh:   ${gamma_threshold}`);
        this.LogInfo(`# neutron alarm thresh: ${neutron_threshold}`);

        // insert the initial set of 5 gamma counts
        let gamma1 = gamma_counts[0];
        for (let i = 0; i < 5; i++) {
            gamma_counts.unshift(gamma1);
        }

        let neutron_bg = this.m_neutron_background / 4.0;
        let gamma_cursor = 0;
        let neutron_cursor = 0;
        let result = new RPMProfile();
        let min_gcount = 9999;
        let max_gcount = 0;
        while (gamma_cursor < gamma_counts.length || neutron_cursor < neutron_counts.length) {
            if (gamma_cursor < gamma_counts.length) {
                // we still have some gamma counts to process
                let gdata = gamma_counts[gamma_cursor];
                if (neutron_cursor < neutron_counts.length) {
                    // we also have some neutron counts to process - which is next up?
                    let ndata = neutron_counts[neutron_cursor];
                    if (gdata[0] < ndata[0]) {
                        // the gamma count comes before the neutron count

                        // xval = the time index * 200 ms
                        // yval = the single-detector gamma count for this time
                        let xval = gdata[0] * 200;
                        let yval = gamma_bg / 5.0 + gdata[1] * offset;
                        //let yval = max_gamma_count * gdata[1];
                        //console.log('yval', gamma_bg/5.0, gdata[1], offset, yval);
                        // remember our min and max single-detector gamma values
                        if (yval < min_gcount) min_gcount = yval;
                        if (yval > max_gcount) max_gcount = yval;
                        // create a set of counts with yval as the mean
                        let dv = this.convert_count_to_detector_values(
                            "G",
                            xval,
                            yval,
                            gamma_threshold
                        );
                        result.AddSample(dv);
                        gamma_cursor += 1;
                        if (gamma_cursor % 6 == 0)
                            result.AddSample(new DetectorValues("SP", xval, [0, 0, 0, 0]));
                    } else {
                        let xval = ndata[0] * 200;
                        let yval = neutron_bg + ndata[1] * model.neutron_amplitude;
                        let dv = this.convert_count_to_detector_values(
                            "N",
                            xval,
                            yval,
                            neutron_threshold
                        );
                        result.AddSample(dv);
                        neutron_cursor += 1;
                    }
                } else {
                    // there are no neutron counts left to process
                    let xval = gdata[0] * 200;
                    //let yval = gamma_bg + gdata[1] * max_gamma_count;
                    let yval = gamma_bg / 5.0 + gdata[1] * offset;
                    let dv = this.convert_count_to_detector_values(
                        "G",
                        xval,
                        yval,
                        gamma_threshold
                    );
                    result.AddSample(dv);
                    gamma_cursor += 1;
                }
            } else if (neutron_cursor < neutron_counts.length) {
                let ndata = neutron_counts[neutron_cursor];
                let xval = ndata[0] * 200;
                let yval = neutron_bg + ndata[1] * model.neutron_amplitude;
                let dv = this.convert_count_to_detector_values("N", xval, yval, neutron_threshold);
                result.AddSample(dv);
                neutron_cursor += 1;
            }
        }
        this.LogInfo(`# min/max gamma: ${min_gcount}, ${max_gcount}`);
        this.LogInfo("#");
        this.LogInfo("########################################################################");
        // results contains merged gamma and neutron counts
        // add a GX
        this.m_gx_counter += 1;
        result.AddGX(this.m_gx_counter);
        if (save) this.m_queued_profiles.push(result);
        //this.LogDebug("Occupancy:", result);
        return result;
    }

    public GenerateOccupancy(alarmtype: string): void {
        this.m_owner.GenerateAlarm(alarmtype);
    }

    private convert_count_to_detector_values(
        count_type: string,
        time_offset: number,
        summed_counts: number,
        alarm_threshold: number
    ): DetectorValues {
        // summed_counts is the sum of the detectors
        let counts = [];
        let is_alarm = false;
        let detector_threshold = alarm_threshold / 4.0;
        // generate individual detector counts based on distribution
        for (let w of this.m_gamma_distribution) {
            let detector_value = w * summed_counts;
            is_alarm = is_alarm || detector_value >= detector_threshold;
            counts.push(Math.round(detector_value));
        }
        let msgtype = is_alarm ? count_type + "A" : count_type + "S";
        return new DetectorValues(msgtype, time_offset, counts);
    }

    public static read_alarm_files(dir: string): void {
        if (RPMSimulator.ga_files.length == 0) {
            RPMSimulator.ga_files = [];
            RPMSimulator.na_files = [];
            RPMSimulator.ng_files = [];

            fs.readdir(dir, (err, files) => {
                if (err) console.error(err);
                else {
                    for (let file of files) {
                        let full_path = path.resolve(dir + "/" + file);
                        //console.log(file, full_path);
                        if (file.indexOf("ga_") == 0) RPMSimulator.ga_files.push(full_path);
                        if (file.indexOf("na_") == 0) RPMSimulator.na_files.push(full_path);
                        if (file.indexOf("ng_") == 0) RPMSimulator.ng_files.push(full_path);
                    }
                    console.log(
                        "Read " +
                            RPMSimulator.ga_files.length +
                            " gamma alarms, " +
                            RPMSimulator.na_files.length +
                            " neutron alarm, and " +
                            RPMSimulator.ng_files.length +
                            " neutron/gamma alarms"
                    );
                }
            });
        }
    }

    private delete_client(client: any): void {
        let clients = this.m_clients;
        let ix = clients.indexOf(client);
        if (ix >= 0) {
            clients.splice(clients.indexOf(client), 1);
            this.m_clients = clients;
            this.LogDebug("Client removed.  " + this.m_clients.length + " remaining.");
        } else console.error("delete_client error: client not found");
    }

    //------------------------------------------------------------
    //
    // Function:    on_timer
    // Author:      Pete Humphrey
    // Description: Handle timer tick
    //
    // <remark>
    // This function will transmit the next occupancy message if an
    // occupancy has been queued or if m_is_occupied is set.
    // Otherwise the next background messages will be sent.
    // </remark>
    //
    //------------------------------------------------------------
    /** Handle timer tick */
    private on_timer() {
        let now = this.current_time();

        if (this.m_current_profile == null && this.m_queued_profiles.length > 0) {
            this.LogDebug("Selecting next queued profile");
            // if an occupancy has been triggered manually, stop it now
            this.SetOccupancy(false);
            this.m_current_profile = this.m_queued_profiles.shift();
            this.m_current_profile.AddTimeOffset(now);
            this.m_current_profile.m_cursor = 0;
        }
        if (this.m_current_profile == null) {
            // has the user turned on the is_occupied flag?
            if (this.m_is_occupied) {
                // send appropriate occupancy messages if it is time
                if (now >= this.m_next_ns_time) {
                    this.m_next_ns_time += 1000;
                    let counts = this.generate_neutron_bg();
                    let msg = this.generate_count_msg(
                        ["NS", "NS", "NA"],
                        counts,
                        0,
                        this.m_neutron_high_threshold
                    );
                    this.say(msg + "\r\n");
                }
                if (now >= this.m_next_gs_time) {
                    this.m_next_gs_time += 200;
                    let counts = this.generate_gamma_bg();
                    this.scale_counts(counts, 0.2);
                    let msg = this.generate_count_msg(
                        ["GS", "GS", "GA"],
                        counts,
                        this.m_gamma_low_threshold / 5,
                        this.m_gamma_high_threshold / 5
                    );
                    this.say(msg + "\r\n");
                }
            } else {
                if (this.m_auto_mode_active && now > this.m_auto_mode_next_occupancy_time) {
                    // prevent another alarm from firing until this one finishes
                    this.m_auto_mode_next_occupancy_time +=
                        this.m_auto_mode_interval_seconds * 1000 * 60 * 60 * 24;
                    let is_gamma = Math.random() <= this.m_auto_mode_gamma_probability;
                    let is_neutron = Math.random() <= this.m_auto_mode_neutron_probability;
                    let alarmtype = "OC";
                    if (is_gamma) {
                        alarmtype = is_neutron ? "NG" : "GA";
                    } else if (is_neutron) {
                        alarmtype = "NA";
                    }
                    this.GenerateOccupancy(alarmtype);
                } else {
                    // send a background count if it's time
                    if (now > this.m_next_background_time) {
                        this.m_next_background_time += this.m_background_interval;
                        if (this.m_clients.length > 0) {
                            let counts = this.generate_neutron_bg();
                            let msg = this.generate_count_msg(
                                ["NB", "NB", "NH"],
                                counts,
                                0,
                                this.m_neutron_high_threshold
                            );
                            this.say(msg + "\r\n");
                            counts = this.generate_gamma_bg();
                            msg = this.generate_count_msg(
                                ["GB", "GL", "GH"],
                                counts,
                                this.m_gamma_low_threshold,
                                this.m_gamma_high_threshold
                            );
                            this.say(msg + "\r\n");
                        }
                    }
                }
            }
        } else {
            // send all pending occupancy messages
            let counts = this.m_current_profile.GetNextMessage(now);
            let msgs: string = "";
            while (counts != null) {
                let msg = counts.ToString();
                //this.LogDebug("Sending next profile message: " + msg);
                msgs += msg + "\r\n";
                counts = this.m_current_profile.GetNextMessage(now);
            }
            if (msgs.length > 0) this.say(msgs);
            if (this.m_current_profile.IsEOF()) {
                this.LogInfo("At end of current profile");
                //this.LogDebug("    Counts: ", this.m_current_profile.m_counts.length);
                //this.LogDebug("    Cursor: ", this.m_current_profile.m_cursor);
                this.m_current_profile = null;
                this.m_next_background_time = now + 2000;
                if (this.m_auto_mode_active) {
                    let delay = this.m_auto_mode_interval_seconds * 1000;
                    this.m_auto_mode_next_occupancy_time = now + delay;
                    console.log(
                        this.m_name +
                            ": next alarm in " +
                            this.m_auto_mode_interval_seconds +
                            " seconds"
                    );
                }
            }
        }
    }

    //------------------------------------------------------------
    //
    // Function:    generate_count_msg
    // Author:      Pete Humphrey
    // Description: Generate a gamma or neutron count message
    //
    // param msgtypes:      message identifiers for normal, low, and high
    // param counts:        detector counts
    // param low_threshold  threshold for GL, NL
    // param high_threshold threshold for GH, NH, GA, NA
    // return:              an rpm message
    //
    // <remarks>
    // E.g. generate_count_msg(['GS', 'GS', 'GA'], counts, 10, 60)
    //      generate_count_msg(['GB', 'GL', 'GH'], counts, 100, 600)
    // </remarks>
    //
    //------------------------------------------------------------
    /** Generate a gamma or neutron count message */
    private generate_count_msg(
        msgtypes: string[],
        counts: number[],
        low_threshold: number,
        high_threshold: number
    ): string {
        let msgindex = 0; // 0 = normal, 1 = low, 2 = high
        counts.forEach(count => {
            if (count < low_threshold) msgindex = 1;
        });
        counts.forEach(count => {
            if (count > high_threshold) msgindex = 2;
        });
        let parts = [msgtypes[msgindex]];
        for (let count of counts) parts.push(this.pad_number(count, 6));
        return parts.join(",");
    }

    private generate_bg(bgval: number, weights: number[], randomization: number): number[] {
        let counts = [];
        //console.log("RPMSimulator.generate_bg  bgval:" + bgval + "  weights:" + weights);
        for (let w of weights) {
            let count = bgval * w;
            count = Math.round(count + count * (0.5 - Math.random()) * randomization);
            counts.push(Math.max(0, count));
        }
        //Sconsole.log("    " + counts);
        return counts;
    }

    private generate_gamma_bg(): number[] {
        let counts;
        //console.log("Current counts:", this.m_current_gamma_counts);
        if (this.m_current_gamma_counts) {
            // make a copy of the counts
            counts = this.m_current_gamma_counts.slice(0);
            console.log("Counts: " + counts);
            let r = this.m_gamma_count_randomization / 4; // 4 detectors
            for (let i = 0; i < 4; i++) {
                let inc = r - Math.random() * 2 * r; // -r <= x <= r
                let scale = 1.0 + inc; // (1 - r) <= scale <= (1 + r)
                counts[i] = Math.max(0, Math.round(scale * counts[i]));
            }
        } else {
            counts = this.generate_bg(
                this.m_gamma_background * 4, // m_gamma_background is the level for a single detector
                this.m_gamma_distribution,
                this.m_gamma_count_randomization
            );
        }
        return counts;
    }

    private generate_neutron_bg(): number[] {
        let counts;
        if (this.m_current_neutron_counts) {
            counts = this.m_current_neutron_counts.slice(0);
            let r = this.m_neutron_count_randomization / 4; // 4 detectors
            for (let i = 0; i < 4; i++) {
                let inc = r - Math.random() * 2 * r; // -r <= x <= r
                let scale = 1.0 + inc; // (1 - r) <= scale <= (1 + r)
                counts[i] = Math.max(0, Math.round(scale * counts[i]));
            }
        } else {
            counts = this.generate_bg(
                this.m_neutron_background * 4,
                this.m_neutron_distribution,
                this.m_neutron_count_randomization
            );
        }
        return counts;
    }

    //------------------------------------------------------------
    //
    // Function:    say
    // Author:      Pete Humphrey
    // Description: send some text to every connected client
    //
    // param text:  the text to send
    //
    //------------------------------------------------------------
    /** send some text to every connected client */
    say(text: string): void {
        if (this.m_is_paused) return;

        if (this.m_clients.length > 0) {
            //console.log("Sending to " + this.m_clients.length + " clients.");
            let doomed = [];
            for (let client of this.m_clients) {
                try {
                    client.write(text);
                } catch (e) {
                    console.error("Error writing to client: ", e.message);
                    doomed.push(client);
                }
            }
            for (let client of doomed) this.delete_client(client);
        }
    }

    private current_time(): number {
        return new Date().getTime();
    }

    private scale_counts(counts: number[], scaler: number) {
        for (let i = 0; i < counts.length; i++) counts[i] = Math.round(counts[i] * scaler);
    }

    private send_gx(): void {
        this.m_gx_counter += 1;
        let counter = this.pad_number(this.m_gx_counter, 6);
        this.say("GX," + counter + ",004741,000000,000000\r\n");
    }

    private pad_number(val: number, digits: number): string {
        return ("00000000000000000000" + val).substr(-digits);
    }
}
