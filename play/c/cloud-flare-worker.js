// 🛡️ Masukkan kredensial langsung di sini
const CLIENT_EMAIL = "drive-uploader@sinuous-axiom-414209.iam.gserviceaccount.com";
const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDqgD3qow6EoJwp
gZKcaP1tFHrol6o9oyU1aMJ+Dcl79jdY6/GZMqzHG4Tdg3nZnTzEz83Ad5yZ07FH
PxaBOmDQgHEqAcXBVA4Lzv92FwLCsekredJea8pGL73e6elTIwYRpQJ8WceAxxvK
VirIAmJuZOJZIbGa573K1LYjY7+M76YQxjfu1EL24JQL5JmJdw1SYmTouc3OIfeF
6h70AjQJ6wi87EZCiw0xXJhApR2Tb0DHezkBLaYibuAhXpQGhQlmzj8lCY9ceXWF
+4Qr9hmMgjmqFXaBkcdXB9QhxvL/5v3fHZkxgicbGAhEWZ7hUX1ogxjlofdZqRAC
l+QyJEwTAgMBAAECggEAA5vKmCA/OnJARPE+ANMqxzFv/MFMuNsYWPyONaNfrN0q
l981ng5mE0BMqJ3704n0Y/DwsRwGGGXmDfseDQoJcFvxodxaHzH8b1kVnEsZW0ai
mG0s/A/7kl3stY/y67kXwFDCO4ikJcqqllACI4bJ3foGc6mtkn0rcgIY9W11BqWn
5WC1HXwl4faOWoph4ANBD1kwuNOiQH27mg+U76/syD8+ALJFci6eI9uJSrDC9tQn
QMLuWhF1WC6Cf5uLkmkpitq8hn2UrOpTRLVR+GQUkhk/POjSkFuh/iHsbkWmtKNv
HdXkH2ziGawTgijc+By9+IMz6spjTYERlEfE2rj5OQKBgQD4yVxL3EPGN2QpBFKB
maC4PDJws7wDTlo+RrRh8HNaHvhTZ4mlk5tltUnU01j2K3l9100iYBi/Y5RVWfCj
V+3+ECelG8X5CcA/FCCicyEC4gFX5PylGRUmsdIzNBgzwo/wTPfabrMnt/5pTN2L
kXeOJbdI0Xo1Rjy6PIVfH8iL2QKBgQDxTNhYahK99Q/ybhAlzEQ6R7/92UOT5C2+
oUX8JwEWitzQgqBm8jAs4pSxWLkDVmpBHpYij1xhUNmboTcQjOV+Uyc0D5VIRIIV
DlOJ1sXeJANl+2djk1YU1nnlao1fVzJO3erdRMY7yZuK2nPK+RxLFlRl2O6/Lx/o
R3GMsGs/ywKBgQCMy2AZanlMlxJvCAwtXiUPvrmJAJ65fEEkF12EQ9D0Qqykfubu
Np/uKm+zKzygbDAgYJU9jAbVYWST/QdrWZrNepUFIreiXbtXt2tUpDUdbYv3ExdL
0+sdb+sWoTfFKynMg7KNArMPGli3fRGwJ83yOzQD2NEBj1NUzmVoVRNo2QKBgQC/
wqQDz3hJgaFEtfcbMrPd5PtMzwaHV0SLRDsL4itZMM2+3rB+X2Wtpfso3Sta3aff
TGFf4bI2nDvzFDFgc7hFpet30hJ+tgLynMoCtq3UlaYlu580YPh94txIV182L2OJ
jY6CfY9UICn+NRDkcwfrHDnCHp3NTbP7shspBWKV9QKBgQC1/b5XsQ3LkpFx4Ibn
oo4ecwfjo+GaFxRnAR3lGQn43c2TUI42SAtra2POXPAxAIpGK3ESxsvZ1DKiiVv/
5a1EAwnDOTEIwKw6kjLZVk6Fh2nsz6UHLdEAe/yNGLCTWFiwF4A9IRfJ0uvA+Qdu
OlqaM3bWUoC261ZIk1HXQMx78w==
-----END PRIVATE KEY-----`;

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: "Only POST allowed" }), {
        status: 405,
        headers: corsHeaders({ "Content-Type": "application/json" })
      });
    }

    try {
      const formData = await request.formData();
      const file = formData.get("file");
      const folderId = formData.get("folder");

      if (!file || !folderId) {
        throw new Error("Missing 'file' or 'folder' in form data");
      }

      const arrayBuffer = await file.arrayBuffer();

      const jwt = await createJWT(CLIENT_EMAIL, PRIVATE_KEY);
      const token = await fetchAccessToken(jwt);

      const metadata = {
        name: file.name,
        parents: [folderId]
      };

      const boundary = "boundary_" + Math.random().toString(36).slice(2);
      const body = new Blob([
        `--${boundary}\r\n`,
        "Content-Type: application/json; charset=UTF-8\r\n\r\n",
        JSON.stringify(metadata) + "\r\n",
        `--${boundary}\r\n`,
        `Content-Type: ${file.type || "application/octet-stream"}\r\n\r\n`,
        new Uint8Array(arrayBuffer), "\r\n",
        `--${boundary}--`
      ]);

      const uploadRes = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,webContentLink,size,createdTime,modifiedTime,iconLink,version,shared,trashed", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": `multipart/related; boundary=${boundary}`
        },
        body
      });

      if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        throw new Error("Upload failed: " + errText);
      }

      const uploaded = await uploadRes.json();

      return new Response(JSON.stringify({ success: true, file: uploaded }), {
        headers: corsHeaders({ "Content-Type": "application/json" })
      });

    } catch (err) {
      return new Response(JSON.stringify({ success: false, error: err.message }), {
        status: 500,
        headers: corsHeaders({ "Content-Type": "application/json" })
      });
    }
  }
}

// 🔧 CORS
function corsHeaders(extra = {}) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    ...extra
  };
}

// 🔐 Buat JWT
// Base64URL encoder yang sesuai RFC 7515
function base64urlEncode(buffer) {
  return btoa(buffer)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function createJWT(clientEmail, privateKeyPEM) {
  const header = {
    alg: "RS256",
    typ: "JWT"
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/drive",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now
  };

  const base64Header = base64urlEncode(JSON.stringify(header));
  const base64Payload = base64urlEncode(JSON.stringify(payload));
  const unsignedToken = `${base64Header}.${base64Payload}`;

  // 🛠️ Sign menggunakan Web Crypto API
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(privateKeyPEM),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsignedToken)
  );

  const signature = base64urlEncode(
    String.fromCharCode(...new Uint8Array(signatureBuffer))
  );

  return `${unsignedToken}.${signature}`;
}

// 📥 Ambil access_token dari Google
async function fetchAccessToken(jwt) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });

  const data = await res.json();
  if (!res.ok) throw new Error("Auth error: " + JSON.stringify(data));
  return data.access_token;
}

// 🧱 Konversi PEM ke ArrayBuffer
function pemToArrayBuffer(pem) {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s+/g, "");
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}
