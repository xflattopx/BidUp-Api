const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

async function accessSecret(secretName) {
  const client = new SecretManagerServiceClient();
  const [version] = await client.accessSecretVersion({ name: secretName });
  return version.payload.data.toString('utf8');
}

module.exports = accessSecret;
