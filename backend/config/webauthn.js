import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";

/**
 * WebAuthn Configuration
 *
 * Passkey (WebAuthn) Flow:
 * 1. User wants to register a passkey
 * 2. Backend generates registration challenge
 * 3. User's browser shows biometric/security key prompt
 * 4. Browser generates credential (public key + credential ID)
 * 5. Backend verifies credential and stores it
 * 6. User can now login with passkey
 *
 * Security: Public key stored on server, private key never leaves user's device
 */

// Get config from environment variables
const rpID = process.env.RP_ID || "localhost";
const rpName = process.env.RP_NAME || "CartNest";
const origin = process.env.ORIGIN || "http://localhost:5173";

// ===== REGISTRATION HELPERS =====

/**
 * Step 1: Generate registration options
 * Frontend calls this to get a challenge
 *
 * @param userEmail - User's email (used as username in WebAuthn)
 * @returns Registration options with challenge
 */
export const generatePasskeyRegistrationOptions = async (userEmail) => {
  try {
    const options = await generateRegistrationOptions({
      rpID, // Relying Party ID (domain name)
      rpName, // Relying Party name (user-friendly name)
      userName: userEmail, // User identifier (email)
      userDisplayName: userEmail, // User-friendly name
      attestationType: "none", // We don't need strong attestation for consumer app
      authenticatorSelection: {
        authenticatorAttachment: "platform", // Allow platform authenticators (fingerprint, face, PIN)
        residentKey: "preferred", // Resident key (passkey stored on device)
      },
      timeout: 60000, // 60 seconds
    });

    return options;
  } catch (error) {
    throw new Error(
      `Failed to generate registration options: ${error.message}`,
    );
  }
};

/**
 * Step 2: Verify registration response
 * Frontend sends back the credential, we verify and store it
 *
 * @param response - Response from browser WebAuthn API
 * @param challenge - Original challenge we sent in step 1
 * @returns Verified credential with credentialID and publicKey
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

// ===== LOGIN HELPERS =====

/**
 * Step 1: Generate authentication options
 * Frontend calls this to get a login challenge
 *
 * @param allowedCredentialIDs - Array of user's registered credential IDs
 * @returns Authentication options with challenge
 */
export const generatePasskeyLoginOptions = async (allowedCredentialIDs) => {
  try {
    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: "preferred", // Ask for biometric if available
      timeout: 60000, // 60 seconds
      allowCredentials: allowedCredentialIDs.map((id) => ({
        id: Buffer.from(id, "base64"),
        type: "public-key",
        transports: ["internal"], // Touch ID, Face ID, etc.
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
 * Step 2: Verify authentication response
 * Frontend sends back the signed response, we verify it
 *
 * @param response - Response from browser WebAuthn API
 * @param challenge - Original challenge we sent
 * @param storedPublicKey - Public key we stored during registration
 * @param storedCounter - Counter we stored (prevents replay attacks)
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
