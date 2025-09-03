// Unified API client for all front-ends
export { createClient, setBaseURL, setTokenGetter, setUnauthorizedHandler } from './adapter.js'

// Optional resource factory
export function createResource(client, resource) {
  return {
    list: (params = {}) => client.get(`/${resource}`, { params }).then(r => r?.data ?? r),
    getById: (id) => client.get(`/${resource}/${id}`).then(r => r?.data ?? r),
    create: (data) => client.post(`/${resource}`, data).then(r => r?.data ?? r),
    update: (id, data) => client.put(`/${resource}/${id}`, data).then(r => r?.data ?? r),
    delete: (id) => client.delete(`/${resource}/${id}`).then(r => r?.data ?? r),
  }
}
