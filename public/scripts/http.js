class HTTP {
  async get(endpoint) {
    return await fetch(endpoint);
  }

  async getSingle(endpoint, param) {
    return await fetch(`${endpoint}${param}`);
  }

  async post(endpoint, body) {
    return await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify(body)
    });
  }

  async delete(endpoint, param) {
    return await fetch(`${endpoint}${param}`, {
      method: 'DELETE',
      headers: { 'Content-type': 'application/json' }
    });
  }
}

export default HTTP;