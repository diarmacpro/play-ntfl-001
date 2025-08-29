export class UpstashRedis {
  constructor(url, token) {
    this.baseUrl = url;
    this.headers = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    };
  }

  // Helper function untuk parse JSON jika memungkinkan
  tryParse(value) {
    if (typeof value !== 'string') return value;
    
    try {
      return JSON.parse(value);
    } catch {
      return value; // Return sebagai string jika bukan JSON valid
    }
  }

  // Set key-value (upsert operation)
  async set(key, value) {
    const parsedValue = this.tryParse(value);
    
    const response = await fetch(`${this.baseUrl}/set/${key}`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(parsedValue)
    });

    if (!response.ok) {
      throw new Error(`Failed to set key: ${response.statusText}`);
    }

    return await response.json();
  }

  // Get value by key
  async get(key) {
    const response = await fetch(`${this.baseUrl}/get/${key}`, {
      method: "GET",
      headers: this.headers
    });

    if (!response.ok) {
      throw new Error(`Failed to get key: ${response.statusText}`);
    }

    const data = await response.json();
    return this.tryParse(data.result);
  }

  // Delete key
  async del(key) {
    const response = await fetch(`${this.baseUrl}/del/${key}`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify([key])
    });

    if (!response.ok) {
      throw new Error(`Failed to delete key: ${response.statusText}`);
    }

    return await response.json();
  }

  // Check if key exists
  async exists(key) {
    const response = await fetch(`${this.baseUrl}/exists/${key}`, {
      method: "GET",
      headers: this.headers
    });

    if (!response.ok) {
      throw new Error(`Failed to check key existence: ${response.statusText}`);
    }

    const data = await response.json();
    return data.result === 1;
  }

  // Get all keys matching pattern
  async keys(pattern = "*") {
    const response = await fetch(`${this.baseUrl}/keys/${pattern}`, {
      method: "GET",
      headers: this.headers
    });

    if (!response.ok) {
      throw new Error(`Failed to get keys: ${response.statusText}`);
    }

    const data = await response.json();
    return data.result || [];
  }
}