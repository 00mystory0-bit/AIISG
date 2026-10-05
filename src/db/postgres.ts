import {Pool, type PoolConfig} from "pg";
import type {Database, DatabaseHealth} from "./index.js";

export class PostgresDatabase implements Database {
  readonly pool:Pool;

  constructor(config:PoolConfig={connectionString:process.env.DATABASE_URL}) {
    if(!config.connectionString) throw new Error("DATABASE_URL is required for PostgreSQL");
    this.pool=new Pool({
      ...config,
      max:Number(process.env.DB_POOL_MAX??10),
      idleTimeoutMillis:Number(process.env.DB_IDLE_TIMEOUT_MS??30000),
      connectionTimeoutMillis:Number(process.env.DB_CONNECTION_TIMEOUT_MS??5000),
      ssl:process.env.DB_SSL==="true"?{rejectUnauthorized:true}:config.ssl
    });
  }

  async health():Promise<DatabaseHealth>{
    const result=await this.pool.query("select 1 as ok");
    return {ok:result.rows[0]?.ok===1,provider:"postgres"};
  }

  async close(){await this.pool.end();}
}
