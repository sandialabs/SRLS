import { Logger, ELogLevel } from './Logger';

export class Component
{
    protected m_component_name : string;
    protected m_logger : Logger;

    constructor(name: string, loglevel: ELogLevel = ELogLevel.LOG_INFO) {
        this.m_component_name = name;
        this.m_logger = new Logger(name, loglevel);
    }

    public LogAs(name: string) : void {
        this.m_logger.Name = name;
    }
    
    public LogError(msg: string) : void {
        this.m_logger.Log(msg, ELogLevel.LOG_ERROR);
    }

    public LogWarning(msg: string) : void {
        this.m_logger.Log(msg, ELogLevel.LOG_WARNING);
    }

    public LogInfo(msg: string) : void {
        this.m_logger.Log(msg, ELogLevel.LOG_INFO);
    }

    public LogDebug(msg: string) : void {
        this.m_logger.Log(msg, ELogLevel.LOG_DEBUG);
    }

    public LogVerbose(msg: string) : void {
        this.m_logger.Log(msg, ELogLevel.LOG_ALL);
    }

}