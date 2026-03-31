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

class SocketsManager {
    private _server: net.Server;
    private _listener: net.Server;
    private _sockets: net.Socket[];

    constructor(private config: NetworkConfig) {
        let self = this;

        this._sockets = [];
        this._server = net.createServer((socket: net.Socket) => {
            console.log(`Have connection from ${socket.remoteAddress}:${socket.remotePort}`);

            let config = NetworkConfig.fromSocket(socket);
            if (config) {
                let key = config.asString();

                console.log(`Connection to ${key}`);
                self.add(socket);

                socket.on("close", () => {
                    console.log(`Connection ${key} is closing`);
                    self.remove(socket);
                });
                socket.on("end", () => {
                    console.log(`Connection ${key} is ending`);
                    self.remove(socket);
                });
                socket.on("error", (error) => {
                    console.error(`Connection ${key} error: ${error}`);
                    self.remove(socket);
                });
            }
        });
        this._listener = this._server.listen(config.port, config.ip);
    }

    private add(socket: net.Socket): void {
        this._sockets.push(socket);
    }

    private remove(socket: net.Socket): void {
        let doomed = this._sockets.findIndex(s => s == socket);
        if (doomed)
            this._sockets.splice(doomed, 1);
    }

    close(): void {
        this._sockets.forEach(s => s.end());
        this._listener.close();
        this._server.close();
    }

    send(text: string): void {
        this._sockets.forEach(s => s.write(text));
    }
}

interface SocketMap {
    [key:string]: SocketsManager;
}

export class Network {
    private _socketMap: SocketMap;

    constructor() {
        this._socketMap = {};
    }

    listen(config: NetworkConfig): Promise<boolean> {
        let self = this;
        let key = config.asString();
        let sockets: SocketsManager = this._socketMap[key];

        console.log(`Network.listen -- starting listen on ${key}`);

        let promise = new Promise<boolean>((resolve, reject) => {
            if(sockets) {
                console.error(`Network.listen -- ${key} already exists`);
                reject(false);
            }
            else {
                try {
                    console.log(`Network.listen ${config}`);
                    let sockets: SocketsManager = new SocketsManager(config);
                    self._socketMap[key] = sockets;
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
        console.log(`Network.stopListening -- stopping listen on ${key}`);

        let sockets: SocketsManager = this._socketMap[key];

        // Regardless of if there are clients connected or not,
        // remove the key from the socket map
        delete this._socketMap[key];

        if(sockets) {
            sockets.close();
            return true;
        }
        else
            return false;
    }

    sendData(config: NetworkConfig, data: string): boolean {
        let key = config.asString();
        let sockets: SocketsManager = this._socketMap[key];
        
        console.log(`Network.sendData -- sending '${data}' to ${key}`);

        if (sockets) {
            sockets.send(data);
            return true;
        }
        else
            return false;
    }
}
