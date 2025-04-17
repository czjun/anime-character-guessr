/**
 * 生成开发环境下的自签名SSL证书
 * 注意：此脚本仅用于开发测试，不要在生产环境中使用此生成的证书
 * 在实际部署时，应使用樱花内网穿透提供的正式SSL证书
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 确保ssl目录存在
const sslDir = path.join(__dirname, 'ssl');
if (!fs.existsSync(sslDir)) {
  fs.mkdirSync(sslDir, { recursive: true });
}

// 检查是否已存在证书
const keyPath = path.join(sslDir, 'private.key');
const certPath = path.join(sslDir, 'certificate.crt');

if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  console.log('证书文件已存在，如需重新生成，请先删除ssl目录下的证书文件');
  process.exit(0);
}

console.log('生成自签名SSL证书中...');

try {
  // 使用OpenSSL生成自签名证书
  // 注意：Windows用户需要安装OpenSSL
  // 如果没有OpenSSL，会生成一个简单的测试证书
  try {
    // 尝试使用OpenSSL
    execSync(
      `openssl req -x509 -newkey rsa:2048 -keyout ${keyPath} -out ${certPath} -days 365 -nodes -subj "/CN=localhost"`,
      { stdio: 'inherit' }
    );
    console.log('SSL证书生成成功！');
  } catch (e) {
    console.log('OpenSSL不可用，生成简单测试证书...');
    
    // 简单的自签名证书（仅用于测试，不安全）
    const key = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDZ4hX1qBIQjtDQ
V/MvXAN5Im0BCZZxApPvK3aJV0GwJs+6K0UDcBBrhof8Y1CUvKBXpGwaE4CDpe2+
nNYdljY7zPfBeD7T3NdIyY3NZDfY5rSnCt9flSuTDUdYJfQO0CdLsH3zBYB3y+/S
xi51Mq9f8ZJ6lsScTxgbJJZokJXu7KQosOGx5xQQyRyW2a5vfflr0nnlKRXbNVW6
87jGl1pZyPDCXXxPvYxq/WHLSK6dIAeB5wPQmN9WUOLuYZCvPRDzLElQSSPYwFOq
9I7eMSIwl7h+e3ZMbvGdovDsP87lmECmXEPmb7ILMbKIB1MkxJszBXSKcNnU3SE0
c2FO+4afAgMBAAECggEAA2Qe4VRSQzrwoYMGa35UL+GsSIcH68B1wPp8ydYJ0k7H
rVVxoLSgXTHm3VJvVIiE7iryXJIGqP5oXrU7fPr0YCQtKUomX8xFhzQj+RlQ0KWr
DPoOdQoJYA1axvySGxjPaHzxuVKFIOyLLYA+YZjGw1iCxcJAzw/nik8ZuCxP19sW
OGxJn33zuXxQL7eVtYmMz6XN2ywrLea1y0L9YcJsaMJLYjLCnqHz9Y6Qk6igmK2w
FyM+OIqCZiUQmZLTQnQmNAMRr/b6jrFBZ+ACGZhCFcKKmB+x/9k1Q4JMB3Nkhki3
UVD5LoW1NmBWQKGjtY8iYGZQNEytbkHTMUHKBr/lAQKBgQD0FpFr/Iy7yMwPpbud
8fb8pvCV/Qf+sKhJccHcUQ6uD8zHlG07GwU4zpPDY0pu1Lma7q05Kx5JUDnK7F/m
YveGeQDKEFoTeZD9in+LJ5n3Jkk54KkD9n7h6+OILQKCafRysCWKJHw6L3Ftg78X
zD4vlB/0CtZPp9LgJl0kYFgOgQKBgQDkPMNth4aMsyz6XyJfOJmyVtFGcYm2Fmg3
bRnqclkzBUvqdEd55VGbPG5SSc0MUr2qv0DBcaoaODqAuaLwvXKfOPZ3/9s6H9yz
aD4BBJDhuTVXfOV3SjY6mI2IKPMzAUFRCgMPQDZlX2E5gzH7KMRCjtxh7wY54nF7
sYBPmxjBHwKBgQDsG7z4YGIgGpJkRyhZwXOWw7HqKQQIYwzNBBQOQvGa9YJQhUUF
GTnVnvUiQpUB3JXStsr0CunPzJ+ZL2QG4t+13VjdVFTWjN7t9okLW9aaXIgyjowC
zYeZqSsZVO1K2TIQOiEBKAW+fGLvVpcMWBfhiF2AX1yP+J1mUmIEhAdNgQKBgQCq
/K9hGKMRHR63C16lGS+VOXYp6L2MZpbuQwjzm5fGCVlTJ2Y+btfYJqJrG8+HYvQY
zT695o/Lx1sd0BrSP7lwEzAOWSkVbNGzXKQvpD1ZzMDcI3cYPZrIxlFKF2+i7TQw
Jd1LB5HzbXlvfn43BXYd6w0xI7zGKoNKQfn43Ts3YQKBgEfX3h7fYvXMOrz5MQdK
vHjvmL1gy3Yd3/K5hbJVBzHau0FpV9RtjXwQfG0MLwJQZQLnx8Mc0nDqY9xzhkje
kXO7GnHVz33XDbgjkLDHww+AkUC/A2eCVkgG9PuisM5vCv8YZWVeWUVk7BZwQdW1
ptWNbWR8QAo27SVVYNd7MBZQ
-----END PRIVATE KEY-----`;

    const cert = `-----BEGIN CERTIFICATE-----
MIIDtDCCApygAwIBAgIUCvK2cj+amfI1ZYUeSbM2Vri7KoEwDQYJKoZIhvcNAQEL
BQAwajELMAkGA1UEBhMCQ04xETAPBgNVBAgMCFNoYW5naGFpMREwDwYDVQQHDAhT
aGFuZ2hhaTERMA8GA1UECgwIQW5pbWVBcHAxETAPBgNVBAsMCEFuaW1lQXBwMQ8w
DQYDVQQDDAZBbmltZUgwHhcNMjQwNDAxMTYyNTUyWhcNMjUwNDAxMTYyNTUyWjBq
MQswCQYDVQQGEwJDTjERMA8GA1UECAwIU2hhbmdoYWkxETAPBgNVBAcMCFNoYW5n
aGFpMREwDwYDVQQKDAhBbmltZUFwcDERMA8GA1UECwwIQW5pbWVBcHAxDzANBgNV
BAMMBkFuaW1lSDB3MA0GCSqGSIb3DQEBAQUAA4BnMDQGCSqGSIb3DQEBAQUAA4GP
ADCCA9sCggODAoIBgQDZ4hX1qBIQjtDQV/MvXAN5Im0BCZZxApPvK3aJV0GwJs+6
K0UDcBBrhof8Y1CUvKBXpGwaE4CDpe2+nNYdljY7zPfBeD7T3NdIyY3NZDfY5rSn
Ct9flSuTDUdYJfQO0CdLsH3zBYB3y+/Sxi51Mq9f8ZJ6lsScTxgbJJZokJXu7KQo
sOGx5xQQyRyW2a5vfflr0nnlKRXbNVW687jGl1pZyPDCXXxPvYxq/WHLSK6dIAeB
5wPQmN9WUOLuYZCvPRDzLElQSSPYwFOq9I7eMSIwl7h+e3ZMbvGdovDsP87lmECm
XEPmb7ILMbKIB1MkxJszBXSKcNnU3SE0c2FO+4afAgMBAAGjUzBRMB0GA1UdDgQW
BBQ5a3voGKiYyT3bCcfcEj4pQ96C9jAfBgNVHSMEGDAWgBQ5a3voGKiYyT3bCcfc
Ej4pQ96C9jAPBgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3DQEBCwUAA4IBAQBESlST
xRtvpIk9NZZ0LVRgDHKEPUEROvHjbgXVYsw6XDASzqZZ9a9EFq6xTVgbjiU8Jqaz
1oRJQasddORDFmiWfFRBNNDoRTKVnw35Gqr1EULnRkh8692Nzl9rjQTKxYOArN1G
Y9CrT4DFrKPFQlHwdT2GIwTiwjlDSmHcBenT9R4T32y3KqMG1NHc8wb5x6iVZBxR
aD8giN7siK/8YPm8Xtq6QfTQ5+B2Df99I+mI7WgbMzpHeu36XrMYQR97XFYWy3Q2
HuMPdP26V8Bc2h2awHjv0QZTijbcLZPpfNppE6vgcjKk6XwICIMYiEqD1HV8fFIH
vQJ1XNXZcMw0O+CG
-----END CERTIFICATE-----`;

    fs.writeFileSync(keyPath, key);
    fs.writeFileSync(certPath, cert);
    console.log('测试证书生成成功！');
  }
} catch (error) {
  console.error('生成SSL证书失败：', error);
  process.exit(1);
}

console.log(`
证书文件已创建:
- 私钥: ${keyPath}
- 证书: ${certPath}

注意：这些是自签名证书，仅用于开发测试。
在生产环境中，请使用樱花提供的SSL证书。
`); 