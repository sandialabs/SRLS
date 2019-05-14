import { RPMProfile } from "./RPMProfile";
import { ProfileGenerator2 } from "./ProfileGenerator2";
import { RPMSimulator } from "./RPMSimulator";
import { CameraSimulator } from "./CameraSimulator";
import { CannedImageSimulator } from "./CannedImageSimulator";
import { AnimatedTruckSimulator } from "./AnimatedTruckSimulator";
import { Settings, LaneSettings, RPMSettings, CameraSettings } from "./settings";
import { Logger, ELogLevel } from "./Logger";

var NextLaneID = 1;

export class LaneSimulator {
    Settings: LaneSettings;
    Name: string;
    IsEnabled: boolean = false;
    m_is_paused: boolean = false;
    OccupancyState: string = "normal";
    IsInAutoMode: boolean = false;
    RPM: RPMSimulator;
    Cameras: CameraSimulator[];
    LaneID: number = 0;
    Status: string = "new";
    CanvasElement: HTMLCanvasElement;
    Log: Logger;

    get IsPaused(): boolean {
        return this.m_is_paused;
    }
    set IsPaused(val: boolean) {
        console.log("Setting paused state of " + this.Name + " to " + val);
        this.m_is_paused = val;
        this.RPM.m_is_paused = val;
    }

    constructor(settings: LaneSettings, canvas: HTMLCanvasElement) {
        this.Log = new Logger(settings.LaneName, ELogLevel.LOG_INFO);
        //console.log("Creating LaneSimulator", settings);
        this.Settings = settings;
        this.CanvasElement = canvas;
        this.LaneID = NextLaneID;
        NextLaneID += 1;
        this.Name = settings.LaneName;
        this.IsEnabled = settings.Enabled;
        this.create_rpm(settings);
        this.Cameras = [];
        let imagedir = "Front";
        let camnum = 1;
        for (let cam of settings.Cameras) {
            let camsim = this.create_camera(cam, this.Name + " Camera " + camnum, imagedir);
            this.Cameras.push(camsim);
            imagedir = "Rear";
            camnum += 1;
        }
    }

    public Clone() {
        let result = new LaneSimulator(this.Settings, this.CanvasElement);
        return result;
    }

    public static CreateLanes(settings: Settings, canvas: HTMLCanvasElement): LaneSimulator[] {
        let result: LaneSimulator[] = [];
        for (let lanedef of settings.Lanes) {
            let lane = new LaneSimulator(lanedef, canvas);
            result.push(lane);
        }
        return result;
    }

    // public UpdateGlobalSettings(global_settings: Settings) {
    //     console.log("LaneSim.UpdateGlobalSettings: ", global_settings);
    //     this.RPM.UpdateGlobalSettings(global_settings.GammaBG, global_settings.NeutronBG, global_settings.GammaNSigma, global_settings.NeutronThreshold);
    // }

    public Start(): void {
        console.log("Starting " + this.Name);
        this.RPM.Start();
        for (let cam of this.Cameras) {
            if (cam.m_is_enabled) cam.Start();
        }
    }

    public Stop(): void {
        console.log("Stopping " + this.Name);
        this.RPM.Stop();
        for (let cam of this.Cameras) {
            cam.Stop();
        }
    }

    public GenerateRPMData(
        alarmtype: string,
        duration: number,
        save: boolean,
        algorithm: string = "computed"
    ): RPMProfile {
        let result: RPMProfile = null;
        if (this.RPM) {
            let gamma_nsigma = 0;
            let neutron_amplitude = 0;
            if (alarmtype == "GA" || alarmtype == "NG")
                gamma_nsigma = this.RPM.m_gamma_nsigma + Math.random() * this.RPM.m_gamma_nsigma;
            if (alarmtype == "NA" || alarmtype == "NG")
                neutron_amplitude =
                    this.RPM.m_neutron_threshold + Math.random() * this.RPM.m_neutron_threshold;
            //console.log("RPM n-sigma: " + this.RPM.m_gamma_nsigma);
            //console.log("Model n-sigma: " + gamma_nsigma);
            this.Log.Debug(
                "Generating " + alarmtype + " alarm in " + this.Name + " with duration " + duration
            );
            let model = {
                type: alarmtype,
                duration: duration,
                stddev: Math.random() * duration * 1.0,
                time_increment: 1,
                humps: 1,
                xshift: 1.0 - Math.random() * 2.0,
                shift: 0.5 - Math.random(),
                gamma_nsigma: gamma_nsigma,
                neutron_amplitude: neutron_amplitude,
            };
            result = this.RPM.GenerateFromModel(model, save);
        }
        return result;
    }

    public GenerateAlarm(alarmtype: string, algorithm: string = "computed"): void {
        if (this.RPM) {
            let duration = 7.0 + Math.random() * 10; // 7 to 17 second duration
            this.Log.Debug("Checking " + this.Cameras.length + " cameras");
            let container_number = this.generate_container_number();
            for (let ix = 0; ix < this.Cameras.length; ix++) {
                let cam = this.Cameras[ix];
                if (cam.m_is_enabled) {
                    this.Log.Debug(
                        "Queuing images on " + cam.m_name + " for container " + container_number
                    );
                    cam.GenerateOccupancy(duration, container_number);
                } else console.log("    " + cam.m_name + " is not enabled");
            }
            if (algorithm == "files") this.RPM.GenerateFromFile(alarmtype);
            else this.GenerateRPMData(alarmtype, duration, true, algorithm);
        } else {
            console.log(this.Name + " is not active");
        }
    }

    public Poll(): void {
        let result = false;
        this.OccupancyState = this.RPM.OccupancyState();
        this.Settings.OccupancyState = this.OccupancyState;
        if (this.RPM.m_clients.length > 0) {
            this.Settings.ClientCount = this.RPM.m_clients.length.toString();
        } else {
            this.Settings.ClientCount = "";
        }
    }

    public SetAutoMode(val: boolean): void {
        if (this.IsEnabled) {
            this.IsInAutoMode = val;
            if (val) {
                this.Log.Debug("Starting auto mode");
                this.RPM.StartAutoMode();
            } else {
                this.Log.Debug("Stopping auto mode");
                this.RPM.StopAutoMode();
            }
        }
    }

    public ToggleAutoMode(): void {
        if (this.IsEnabled) {
            this.SetAutoMode(!this.IsInAutoMode);
        }
    }

    private create_camera(
        settings: CameraSettings,
        camera_name: string,
        imagedir: string
    ): CameraSimulator {
        let result: CameraSimulator = null;
        if (settings) {
            if (settings.CameraSimulatorType === "animated") {
                result = new AnimatedTruckSimulator(settings, camera_name, this.CanvasElement);
                //result = new CannedImageSimulator(settings, camera_name, "./Assets/ContainerImages/" + imagedir);
            } else {
                result = new CannedImageSimulator(
                    settings,
                    camera_name,
                    "./Assets/ContainerImages/" + imagedir
                );
            }
        }
        return result;
    }

    private create_rpm(settings: LaneSettings): void {
        if (this.RPM != null) {
            this.RPM.Stop();
            this.RPM = null;
        }
        this.RPM = new RPMSimulator(
            settings.RPM.IPAddr,
            settings.RPM.Port,
            settings.LaneName + " RPM",
            new ProfileGenerator2()
        );
        this.RPM.UpdateFromSettings(settings);
        this.RPM.SetOwner(this);
    }

    private generate_container_number(): string {
        let prefixes = ["MSCU", "PONU", "TRLU", "HKLU", "CAMU"];
        let prefix = prefixes[Math.trunc(Math.random() * prefixes.length)];
        let number = Math.trunc(10000000 * Math.random());
        return prefix + " " + this.pad_number(number, 7);
    }

    private pad_number(val: number, digits: number): string {
        return ("00000000000000000000" + val).substr(-digits);
    }
}
