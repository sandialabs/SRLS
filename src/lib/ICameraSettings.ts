
export interface ICameraSettings {
    Name: string;
    Enabled: boolean;
    Manufacturer: string;
    Model: string;
    IPAddr: string;
    Port: number;
    URL: string;
    CameraSimulatorType: "canned";
}

export class CameraSettings implements ICameraSettings {
    Name: string;
    Enabled: boolean;
    Manufacturer: string;
    Model: string;
    IPAddr: string;
    Port: number;
    URL: string;
    CameraSimulatorType: "canned";

    constructor(settings: ICameraSettings) {
        this.Name = settings.Name;
        this.Enabled = settings.Enabled;
        this.Manufacturer = settings.Manufacturer;
        this.Model = settings.Model;
        this.IPAddr = settings.IPAddr;
        this.Port = settings.Port;
        this.URL = settings.URL;
        this.CameraSimulatorType = settings.CameraSimulatorType;
    }

    clone(camera: CameraSettings): CameraSettings {
        return new CameraSettings(camera);
    }

    static default_settings(): CameraSettings[] {
        const cameras: ICameraSettings[] = [
            {
                Name: "Camera One",
                Enabled: false,
                Manufacturer: "unknown",
                Model: "unknown",
                IPAddr: "127.0.0.1",
                Port: 10101,
                URL: "",
                CameraSimulatorType: "canned",
            },
            {
                Name: "Camera Two",
                Enabled: false,
                Manufacturer: "unknown",
                Model: "unknown",
                IPAddr: "127.0.0.1",
                Port: 10102,
                URL: "",
                CameraSimulatorType: "canned",
            },
        ]

        return [new CameraSettings(cameras[0]), new CameraSettings(cameras[1])];
    }
}