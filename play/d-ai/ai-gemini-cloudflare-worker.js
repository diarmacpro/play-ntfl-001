export default {
  async fetch(request) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    // Ambil isi permintaan
    let reqBody;
    try {
      reqBody = await request.json();
    } catch (err) {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Modifikasi setiap part.text untuk tambahkan instruksi singkat
    if (reqBody?.contents?.[0]?.parts?.[0]?.text) {
      reqBody.contents[0].parts[0].text +=
        "\n\nJawab secara ringkas dan padat sesuai konteks, dengan maksimal 50 kata.";
    }

    // Kirim ke Google Gemini API
    const apiKey = "AIzaSyAMcoyICFt9TovKovaMg0mr5R6S64F4SIM";
    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(geminiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(reqBody)
    });

    const result = await geminiResponse.text();

    return new Response(result, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }
};
