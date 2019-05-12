import { emit } from "cluster";

export enum ELogLevel { LOG_ALL, LOG_DEBUG, LOG_INFO, LOG_WARNING, LOG_ERROR, LOG_NONE };

export class Logger 
{
    constructor(public Name: string, public Level: ELogLevel) {

    }

    public Emit(msg: string, level: ELogLevel) : void {
        if (level >= this.Level) {
            let fullmsg = `[${this.Name}] ${msg}`;
            switch(level) {
                case ELogLevel.LOG_ERROR:
                    console.error(fullmsg);
                    break;
                case ELogLevel.LOG_WARNING:
                    console.warn(fullmsg);
                    break;            
                case ELogLevel.LOG_INFO:
                    console.info(fullmsg);
                    break;
                default:
                    console.log(fullmsg);
                    break;
            }
        }
    }

    public Log(msg: string, level: ELogLevel) {
        this.Emit(msg, level);
    }
    
    public Error(msg: string) : void {
        this.Emit(msg, ELogLevel.LOG_ERROR);
    }

    public Warning(msg: string) : void {
        this.Emit(msg, ELogLevel.LOG_WARNING);
    }

    public Info(msg: string) : void {
        this.Emit(msg, ELogLevel.LOG_INFO);
    }

    public Debug(msg: string) : void {
        this.Emit(msg, ELogLevel.LOG_DEBUG);
    }

    public Verbose(msg: string) : void {
        this.Emit(msg, ELogLevel.LOG_ALL);
    }


}