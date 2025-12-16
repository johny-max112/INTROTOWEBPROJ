require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('../db');

async function main(){
  const name = process.argv[2] || 'Admin';
  const email = process.argv[3] || 'hani@gmail.com';
  const password = process.argv[4] || 'admin123';
  const hashed = await bcrypt.hash(password, 10);
  const [res] = await pool.query('INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)', [name,email,hashed,'admin']);
  console.log('Created admin id:', res.insertId);
  process.exit(0);
}

main().catch(err=>{console.error(err); process.exit(1)});
