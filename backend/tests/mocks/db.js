module.exports = {
  // Minimal knex-like stub to avoid loading native sqlite bindings in tests
  raw: async () => ({}),
  migrate: {
    list: async () => [[], []],
    currentVersion: async () => 'none',
    latest: async () => {},
  },
  destroy: async () => {},
  query: async () => ({ rows: [], insertId: null }),
};
