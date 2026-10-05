export * from "./types.js";

export interface DatabaseHealth {
  ok:boolean;
  provider:"postgres";
}

export interface Database {
  health():Promise<DatabaseHealth>;
}
