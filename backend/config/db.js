const knex = require('knex');
const knexfile = require('../knexfile');

const environment = process.env.NODE_ENV || 'development';
const config = knexfile[environment];

if (!config) {
  throw new Error(`Knex configuration for environment '${environment}' not found in knexfile.js`);
}

// In tests, stub knex to avoid loading native sqlite bindings
const db = (process.env.NODE_ENV === 'test') ? require('../tests/mocks/db') : knex(config);

// Add compatibility layer for old db.query() calls
db.query = async function(sql, params = []) {
  const result = await db.raw(sql, params);
  // MySQL returns results in format [rows, fields]
  // Knex raw query returns different formats based on database driver
  if (Array.isArray(result) && result.length >= 1) {
    return result;
  }
  // Handle MySQL driver - result is array with [rows, fields]
  if (result && Array.isArray(result[0])) {
    return result;
  }
  // Fallback for other formats
  return [result.rows || result || [], result.fields || []];
};

// Add compatibility for db.execute() calls
db.execute = async function(sql, params = []) {
  const result = await db.raw(sql, params);
  if (Array.isArray(result) && result.length >= 1) {
    return result;
  }
  if (result && Array.isArray(result[0])) {
    return result;
  }
  return [result.rows || result || [], result.fields || []];
};

// Add compatibility for db.getOne() calls
db.getOne = async function(sql, params = []) {
  const [rows] = await db.query(sql, params);
  return rows && rows.length > 0 ? rows[0] : null;
};

module.exports = db;
