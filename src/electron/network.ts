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
    [key:string]: net.Socket[];
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
                let sockets: net.Socket[] = self._socketMap[key];
                if(!sockets) {
                    sockets = [];
                    self._socketMap[key] = sockets;
                }
                sockets.push(socket);
                
                socket.on("close", () => {
                    console.log(`Connection ${key} is closing`);
                    self.removeSocket(config, socket);
                });
                socket.on("end", () => {
                    console.log(`Connection ${key} is ending`);
                    self.removeSocket(config, socket);
                });
                socket.on("error", (error) => {
                    console.error(`Connection ${key} error: ${error}`);
                });
            }
        });

        console.log("Network.constructor -- listening for network-* items");
    }

    private removeSocket(config: NetworkConfig, socket: net.Socket) {
        let key = config.asString();
        let sockets: net.Socket[] = this._socketMap[key];
        if (sockets) {
            let doomed = sockets.findIndex(s => s == socket);
            if (doomed)
                sockets.splice(doomed, 1);
        }
        if (sockets.length === 0)
            delete this._socketMap[key];
    }

    listen(config: NetworkConfig): Promise<boolean> {
        let self = this;
        let key = config.asString();
        let sockets: net.Socket[] = this._socketMap[key];

        console.log(`Network.listen -- starting listen on ${config.asString()}`);

        let promise = new Promise<boolean>((resolve, reject) => {
            if(sockets) {
                console.error(`Network.listen -- ${key} already exists`);
                reject(false);
            }
            else {
                try {
                    console.log(`Network.listen ${config}`);
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
        let sockets: net.Socket[] = this._socketMap[key];

        if(sockets) {
            console.log(`Network.stopListening -- stopping listen on ${config.asString()}`);

            let doomed: net.Socket[] = sockets;
            doomed.forEach(socket => {
                socket.end();
            });
            // As the sockets are closed, they should be automatically removed from _socketMap
            // due to the on("end") code set up when the listen came in.
            return true;
        }
        else
            return false;
    }

    sendData(config: NetworkConfig, data: string): boolean {
        let key = config.asString();
        let sockets: net.Socket[] = this._socketMap[key];
        
        console.log(`Network.sendData -- sending '${data}' to ${config.asString()}`);

        if (sockets) {
            sockets.forEach(socket => socket.write(data));
            return true;
        }
        else
            return false;
    }
}
