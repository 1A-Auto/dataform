import { Credentials } from "@dataform/api/commands/credentials";
import { DbAdapter, OnCancel } from "@dataform/api/dbadapters/index";
import { dataform } from "@dataform/protos";
import { config, IPool, IOptions, ConnectionPool } from "mssql";

export class SQLDataWarehouseDBAdapter implements DbAdapter {
  private pool: Promise<ConnectionPool>;

  constructor(credentials: Credentials) {
    const sqlDataWarehouseCredentials = credentials as dataform.ISQLDataWarehouse;
    const options: IOptions = {
      encrypt: true
    };

    const config: config = {
      server: sqlDataWarehouseCredentials.server,
      port: sqlDataWarehouseCredentials.port,
      user: sqlDataWarehouseCredentials.username,
      password: sqlDataWarehouseCredentials.password,
      database: sqlDataWarehouseCredentials.databaseName,
      options: options
    };

    this.pool = new Promise(resolve => {
      const conn = new ConnectionPool(config).connect();
      conn.then(pool => {
        pool.on("error", err => {
          throw new Error(err);
        });
        resolve(conn);
      });
    });
  }

  public async execute(statement: string, onCancel?: OnCancel) {
    const pool = await this.pool;
    const request = pool.request();

    if (onCancel) {
      onCancel(() => {
        request.cancel();
      });
    }

    const result = await request.query(statement);
    return result.recordset;
  }

  public async evaluate(statement: string) {
    const pool = await this.pool;
    const request = pool.request();

    const result = await request.query(`explain ${statement}`);
  }

  public async tables(): Promise<dataform.ITarget[]> {
    let result = await this.execute(
      `select table_name, table_schema from information_schema.tables`
    );
    return result.map(row => ({
      schema: row.table_schema,
      name: row.table_name
    }));
  }

  public table(target: dataform.ITarget): Promise<dataform.ITableMetadata> {
    return Promise.all([
      this.execute(
        `select column_name, data_type, is_nullable
       from information_schema.columns
       where table_schema = '${target.schema}' AND table_name = '${target.name}'`
      ),
      this.execute(
        `select table_type from information_schema.tables 
          where table_schema = '${target.schema}' AND table_name = '${target.name}'`
      )
    ]).then(results => {
      if (results[1].length > 0) {
        // The table exists.
        return {
          target,
          type: results[1][0].table_type == "VIEW" ? "view" : "table",
          fields: results[0].map(row => ({
            name: row.column_name,
            primitive: row.data_type,
            flags: row.is_nullable && row.is_nullable == "YES" ? ["nullable"] : []
          }))
        };
      } else {
        throw new Error(`Could not find relation: ${target.schema}.${target.name}`);
      }
    });
  }

  public async prepareSchema(schema: string): Promise<void> {
    await this.execute(
      `if not exists ( select schema_name from information_schema.schemata where schema_name = '${schema}' ) 
            begin
              exec sp_executesql N'create schema ${schema}'
            end `
    );
  }
}