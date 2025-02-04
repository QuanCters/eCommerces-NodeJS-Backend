import mysql from "mysql2";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root123",
  database: "shopdev",
});

const batchSize = 100000;
const totalSize = 100000000;

let currentId = 1;

const insertBatch = async () => {
  const values = [];
  for (let i = 0; i < batchSize && currentId <= totalSize; i++) {
    const name = `name-${currentId}`;
    const age = currentId;
    const address = `address-${currentId}`;
    values.push([currentId, name, age, address]);
    currentId += 1;
  }

  if (!values.length) {
    pool.end((err) => {
      if (err) {
        console.log(`error occurred while running batch`);
      } else {
        console.log(`connection pool closed successfully`);
      }
    });
    return;
  }

  const sql = `INSERT INTO test_table (id, name, age, address) VALUES ?`;

  pool.query(sql, [values], async function (err, results) {
    if (err) throw err;
    console.log(`Inserted ${results.affectedRows} records`);
    await insertBatch();
  });
};

insertBatch().catch((err) => console.log(err));
