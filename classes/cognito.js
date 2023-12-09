const AWS = require('aws-sdk');

const region = process.env.AWS_REGION;
const userPoolId = process.env.COGNITO_USER_POOL_ID;
const clientId = process.env.COGNITO_CLIENT_ID;
const aws_access_key_id = process.env.AWS_ACCESS_KEY_ID;
const aws_secret_access_key = process.env.AWS_SECRET_ACCESS_KEY;

const cognito = new AWS.CognitoIdentityServiceProvider({ region: region, accessKeyId: aws_access_key_id, secretAccessKey: aws_secret_access_key });


class Cognito {
    constructor() {
        this.userPoolId = userPoolId;
        this.clientId = clientId;
    }

    async signUp(email, password) {
        try {
            const params = {
                ClientId: this.clientId,
                Username: email,
                Password: password,
                UserAttributes: [
                    { Name: 'email', Value: email }
                    // Add other attributes as needed
                ]
            };
            return await cognito.signUp(params).promise();
        } catch (error) {
            console.error('Error in signUp:', error);
            throw error;
        }
    }
    

    async confirmSignUp(username, code) {
        try {
            const params = {
                ClientId: this.clientId,
                Username: username,
                ConfirmationCode: code,
            };
            return await cognito.confirmSignUp(params).promise();
        } catch (error) {
            // Handle error
            console.error('Error in confirmSignUp:', error);
            throw error; // Optionally rethrow to be handled by the caller
        }
    }

    async adminConfirmSignUp(email) {
        try {
            const params = {
                UserPoolId: this.userPoolId,
                Username: email,
            };
            return await cognito.adminConfirmSignUp(params).promise();
        } catch (error) {
            console.error('Error in adminConfirmSignUp:', error);
            throw error;
        }
    }

    async signIn(username, password) {
        try {
            const params = {
                AuthFlow: 'USER_PASSWORD_AUTH',
                ClientId: this.clientId,
                AuthParameters: {
                    USERNAME: username,
                    PASSWORD: password,
                },
            };
            return await cognito.initiateAuth(params).promise();
        } catch (error) {
            // Handle error
            console.error('Error in signIn:', error);
            throw error; // Optionally rethrow to be handled by the caller
        }
    }

    async signOut(accessToken) {
        try {
            const params = {
                AccessToken: accessToken
            };
            return await cognito.globalSignOut(params).promise();
        } catch (error) {
            // Handle error
            console.error('Error in signOut:', error);
            throw error; // Optionally rethrow to be handled by the caller
        }
    }

    async removeUser(username) {
        try {
            const params = {
                UserPoolId: this.userPoolId,
                Username: username,
            };
            return await cognito.adminDeleteUser(params).promise();
        } catch (error) {
            // Handle error
            console.error('Error in removeUser:', error);
            throw error; // Optionally rethrow to be handled by the caller
        }
    }
}

module.exports = Cognito;
