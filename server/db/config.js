let dbUrl;
const host = process.env.RDS_HOSTNAME;
const db = process.env.RDS_DB_NAME;
const username = process.env.RDS_USERNAME;
const password = process.env.RDS_PASSWORD;

if (process.env.DATABASE_URL){
  dbUrl = process.env.DATABASE_URL;
}else if(host && db && username && password){
  dbUrl = `postgresql://${username}:${password}@${host}:5432/${db}`;
}
if(!dbUrl)
  throw new Error("Missing environmental variable DATABASE_URL");

export const connectionString = dbUrl;
