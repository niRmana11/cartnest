import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";

/**
 * WebAuthn Configuration
 *
 */

// Get config from environment variables
const rpID = process.env.RP_ID || "localhost";
const rpName = process.env.RP_NAME || "CartNest";
const origin = process.env.ORIGIN || "http://localhost:5173";

// REGISTRATION HELPERS

/**
 * Generate registration options
 *
 * @param userEmail
 * @returns
 */
export const generatePasskeyRegistrationOptions = async (userEmail) => {
  try {
    const options = await generateRegistrationOptions({
      rpID,
      rpName,
      userName: userEmail,
      userDisplayName: userEmail,
      attestationType: "none",
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        residentKey: "preferred",
        userVerification: "discouraged",
      },
      timeout: 60000,
    });

    return options;
  } catch (error) {
    throw new Error(
      `Failed to generate registration options: ${error.message}`,
    );
  }
};

/**
 * Verify registration response
 *
 * @param response
 * @param challenge
 * @returns
 */
export const verifyPasskeyRegistration = async (response, challenge) => {
  try {
    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (!verification.verified) {
      throw new Error("Passkey verification failed");
    }

    // Extract the credential info
    const credentialId = Buffer.from(
      verification.registrationInfo.credentialID,
    ).toString("base64");

    const publicKey = Buffer.from(
      verification.registrationInfo.credentialPublicKey,
    );

    return {
      credentialId,
      publicKey,
      counter: verification.registrationInfo.counter,
    };
  } catch (error) {
    throw new Error(`Failed to verify registration: ${error.message}`);
  }
};

// LOGIN HELPERS

/**
 * Generate authentication options
 *
 * @param allowedCredentialIDs
 * @returns
 */
export const generatePasskeyLoginOptions = async (allowedCredentialIDs) => {
  try {
    const options = await generateAuthenticationOptions({
      rpID: rpID,
      userVerification: "discouraged",
      timeout: 60000,
      allowCredentials: allowedCredentialIDs.map((id) => ({
        id: id,
        type: "public-key",
        transports: ["internal"],
      })),
    });

    return options;
  } catch (error) {
    throw new Error(
      `Failed to generate authentication options: ${error.message}`,
    );
  }
};

/**
 * Verify authentication response
 *
 * @param response
 * @param challenge
 * @param storedPublicKey
 * @param storedCounter
 * @returns { verified: boolean, newCounter: number }
 */
export const verifyPasskeyLogin = async (
  response,
  challenge,
  storedPublicKey,
  storedCounter,
  storedCredentialId,
) => {
  try {
    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credentialPublicKey: storedPublicKey,
      credentialID: Buffer.from(storedCredentialId, "base64"),
      signCount: storedCounter,
    });

    if (!verification.verified) {
      throw new Error("Passkey verification failed");
    }

    // Check counter to prevent replay attacks
    if (verification.authenticationInfo.newSignCount < storedCounter) {
      throw new Error("Potential replay attack detected");
    }

    return {
      verified: true,
      newCounter: verification.authenticationInfo.newSignCount,
    };
  } catch (error) {
    throw new Error(`Failed to verify authentication: ${error.message}`);
  }
};

export default {
  generatePasskeyRegistrationOptions,
  verifyPasskeyRegistration,
  generatePasskeyLoginOptions,
  verifyPasskeyLogin,
};
