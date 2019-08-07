import { emit } from "cluster";
import moment from "moment";
import * as fs from "fs";

export enum ELogLevel {
    LOG_ALL,
    LOG_DEBUG,
    LOG_INFO,
    LOG_WARNING,
    LOG_ERROR,
    LOG_NONE,
}

export interface LogEmitter {
    Emit(level: ELogLevel, text: string, ...args: any[]): void;
}

export class NullEmitter implements LogEmitter {
    public Emit(level: ELogLevel, text: string, ...args: any[]): void {}
}

export class ConsoleEmitter implements LogEmitter {
    public Emit(level: ELogLevel, text: string, ...args: any[]): void {
        switch (level) {
            case ELogLevel.LOG_ERROR:
                if (args.length > 0) console.error(text, args);
                else console.error(text);
                break;
            case ELogLevel.LOG_WARNING:
                if (args.length > 0) console.warn(text, args);
                else console.warn(text);
                break;
            case ELogLevel.LOG_INFO:
                if (args.length > 0) console.info(text, args);
                else console.info(text);
                break;
            default:
                if (args.length > 0) console.log(text, args);
                else console.log(text);
                break;
        }
    }
}

export class FileEmitter implements LogEmitter {
    public Emit(level: ELogLevel, text: string, ...args: any[]): void {
        const outputstr = this.format(level, text);
        const datestr = moment().format("YYMMDD");
        const filename = "rpmsim-" + datestr + ".log";
        fs.appendFile(filename, outputstr + "\r\n", function(err) {
            return;
        });
    }

    private format(level: ELogLevel, text: string): string {
        let levelstr = "[E]";
        switch (level) {
            case ELogLevel.LOG_WARNING:
                levelstr = "[W]";
                break;
            case ELogLevel.LOG_INFO:
                levelstr = "[I]";
                break;
            default:
                levelstr = "[D]";
                break;
        }
        const now = moment();
        const timestamp = now.format("HH:mm:ss");
        return `{timestamp}{levelstr}: {text}`;
    }
}

export class Logger {
    static s_emitters: LogEmitter[] = [new ConsoleEmitter()];
    Level: ELogLevel;

    static UseTheseEmitters(...emitters: LogEmitter[]): void {
        Logger.s_emitters = emitters.slice(0);
    }

    constructor(public Name: string, public level: ELogLevel) {
        this.Level = level;
    }

    private DoEmit(msg: string, level: ELogLevel) {
        for (let emitter of Logger.s_emitters) {
            emitter.Emit(level, msg);
        }
    }

    public Emit(msg: string, level: ELogLevel): string {
        let result = "";
        if (level >= this.Level) {
            let level_char = "ADIWEN".substr(level, 1);
            let fullmsg = `[${this.Name}][${level_char}] ${msg}`;
            this.DoEmit(fullmsg, level);
            result = fullmsg;
        }
        return result;
    }

    public Log(msg: string, level: ELogLevel): string {
        return this.Emit(msg, level);
    }

    public Error(msg: string): string {
        return this.Emit(msg, ELogLevel.LOG_ERROR);
    }

    public Warning(msg: string): string {
        return this.Emit(msg, ELogLevel.LOG_WARNING);
    }

    public Info(msg: string): string {
        return this.Emit(msg, ELogLevel.LOG_INFO);
    }

    public Debug(msg: string): string {
        return this.Emit(msg, ELogLevel.LOG_DEBUG);
    }

    public Verbose(msg: string): string {
        return this.Emit(msg, ELogLevel.LOG_ALL);
    }
}
