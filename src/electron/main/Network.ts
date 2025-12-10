import { ipcMain } from "electron";
import * as net from "net";

export class NetworkConfig {
    constructor(private _ip: string, private _port: number) {
    }

    get ip(): string {
        return this._ip;
    }

    get port(): number {
        return this._port;
    }

    asString(): string {
        return `${this._ip}:${this._port}`;
    }

    static fromSocket(socket: net.Socket): NetworkConfig | null {
        let config: NetworkConfig | null = null;
        let addr = socket.localAddress;
        let port = socket.localPort;

        if(addr && port)
            config = new NetworkConfig(addr, port);

        return config;
    }
}

interface SocketMap {
    [key:string]: net.Socket;
}

export class Network {
    private _socketMap: SocketMap;
    private _listener: net.Server;

    constructor() {
        this._socketMap = {};

        let self = this;

        this._listener = net.createServer((socket: net.Socket) => {
            let config = NetworkConfig.fromSocket(socket);

            console.log(`Have connection from ${socket.remoteAddress}:${socket.remotePort}`);

            if(config) {
                let key = config.asString();

                console.log(`Connection to ${key}`);
                self._socketMap[key] = socket;
                
                socket.on("close", () => {
                    console.log(`Connection ${key} is closing`);
                    delete self._socketMap[key];
                });
                socket.on("end", () => {
                    console.log(`Connection ${key} is ending`);
                    delete self._socketMap[key];
                });
                socket.on("error", (error) => {
                    console.error(`Connection ${key} error: ${error}`);
                });
            }
        });

        console.log("Network.constructor -- listening for network-* items");

        ipcMain.handle('network-listen', (event: Electron.IpcMainInvokeEvent, port: number, ipaddr: string): Promise<boolean> => {
            let config = new NetworkConfig(ipaddr, port);
            return this.listen(config);
        });

        ipcMain.handle('network-stop-listening', (event: Electron.IpcMainInvokeEvent, port: number, ipaddr: string): boolean => {
            let config = new NetworkConfig(ipaddr, port);
            return this.stopListening(config);
        });

        ipcMain.handle("network-send-data", (event: Electron.IpcMainInvokeEvent, port: number, ipaddr: string, data: string): boolean => {
            let config = new NetworkConfig(ipaddr, port);
            return this.sendData(config, data);
        });
    }

    listen(config: NetworkConfig): Promise<boolean> {
        let self = this;

        let promise = new Promise<boolean>((resolve, reject) => {
            let key = config.asString();
            let sock = this._socketMap[key];

            if(sock) {
                console.error(`Network.listen -- ${key} already exists`);
                reject(false);
            }
            else {
                try {
                    self._listener.listen(config.port, config.ip);
                    resolve(true);
                }
                catch(error) {
                    console.error(`Network.listen error: ${error}`);
                    reject(false);
                }
            }
        });

        return promise;
    }

    stopListening(config: NetworkConfig): boolean {
        let key = config.asString();
        let sock = this._socketMap[key];

        if(sock) {
            sock.end();
            delete this._socketMap[key];
            return true;
        }
        else
            return false;
    }

    sendData(config: NetworkConfig, data: string): boolean {
        let key = config.asString();
        let sock = this._socketMap[key];

        if (sock) {
            sock.write(data);
            return true;
        }
        else
            return false;
    }
}