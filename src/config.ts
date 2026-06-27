import fs from "fs";
import os from "os";
import path from "path";

type Config = {
    dbUrl: string;
    currentUserName?: string;
};

function getConfigFilePath(): string {
    return path.join(os.homedir(), '.gatorconfig.json');
}
function writeConfig(cfg: Config) {
    const configPath = getConfigFilePath();
    
    // Map camelCase keys to snake_case keys
    const snakeCaseCfg = {
        db_url: cfg.dbUrl,
        current_user_name: cfg.currentUserName
    };
    
    fs.writeFileSync(configPath, JSON.stringify(snakeCaseCfg, null, 2), 'utf8');
}

function validateConfig(rawConfig: any): Config {
    if (!rawConfig || typeof rawConfig.db_url !== 'string') {
        throw new Error('Invalid config: dbUrl must be a string');
    }
  
    return {
        dbUrl: rawConfig.db_url,
        currentUserName: rawConfig.current_user_name,
    };
}

export function setUser(username:string) {
    const c = readConfig();

    c.currentUserName = username;
    writeConfig(c);
}

export function readConfig(): Config {
    const configPath = getConfigFilePath();
    
    // Check if the file exists before reading it
    if (!fs.existsSync(configPath)) {
        return {
            dbUrl: "",
            currentUserName: ""
        };
    }

  
    const rawConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return validateConfig(rawConfig);
   
}

