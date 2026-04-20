import pg from "pg";
const { Client } = pg;

const client = new Client({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "root", // ваш пароль
  database: "postgres",
});

client
  .connect()
  .then(() => {
    console.log("✅ Connected!");
    return client.query("SELECT current_user, version()");
  })
  .then((res) => {
    console.log(`User: ${res.rows[0].current_user}`);
    console.log(`Version: ${res.rows[0].version.substring(0, 50)}...`);
    client.end();
  })
  .catch((err) => {
    console.error("Error:", err.message);
    client.end();
  });
