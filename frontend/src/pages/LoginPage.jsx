import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, Fingerprint, AlertCircle, Loader } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";

/**
 * LoginPage Component
 *
 * Features:
 * - Google OAuth button
 * - Facebook OAuth button
 * - Passkey/WebAuthn button
 * - Professional gradient background
 * - Mobile responsive
 * - Loading states
 * - Error handling
 * - Eye-catching design for internship evaluation
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ===== REDIRECT IF ALREADY LOGGED IN =====
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // ===== CHECK FOR AUTH ERRORS =====
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      const errorMessages = {
        auth_failed: "Authentication failed. Please try again.",
        token_generation_failed: "Token generation failed. Please try again.",
      };
      setError(errorMessages[errorParam] || "An error occurred during login.");
      toast.error(errorMessages[errorParam] || "Login failed");
    }
  }, [searchParams]);

  // ===== HANDLE GOOGLE OAUTH =====
  const handleGoogleLogin = () => {
    setIsLoading(true);
    // Redirect to backend Google OAuth endpoint
    // Backend will handle OAuth flow and redirect back
    window.location.href = `${API_URL}/api/auth/google`;
  };

  // ===== HANDLE FACEBOOK OAUTH =====
  const handleFacebookLogin = () => {
    setIsLoading(true);
    // Redirect to backend Facebook OAuth endpoint
    window.location.href = `${API_URL}/api/auth/facebook`;
  };

  // ===== HANDLE PASSKEY LOGIN =====
  const handlePasskeyLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const email = prompt("Enter your email for passkey login:");
      if (!email) {
        setIsLoading(false);
        return;
      }

      // Step 1: Get passkey login options
      const optionsResponse = await axiosInstance.post(
        "/auth/passkey/login/options",
        { email },
      );

      const options = optionsResponse.data.options;

      // Helper: Convert base64url to Uint8Array (handles both base64 and base64url)
      const decodeBase64 = (str) => {
        try {
          // Handle base64url format (replace - with + and _ with /)
          const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
          const binaryString = atob(base64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          return bytes;
        } catch (e) {
          console.error("Failed to decode base64:", e);
          throw new Error("Failed to decode challenge");
        }
      };

      // Step 2: Use browser WebAuthn to authenticate
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: decodeBase64(options.challenge),
          allowCredentials: options.allowCredentials?.map((credential) => ({
            ...credential,
            id: decodeBase64(credential.id),
          })),
          timeout: options.timeout || 60000,
          userVerification: "discouraged",
          rpId: options.rpId,
        },
      });

      if (!assertion) {
        setError("Passkey authentication cancelled");
        setIsLoading(false);
        return;
      }

      // Helper: Convert Uint8Array to base64url
      const uint8ArrayToBase64url = (array) => {
        let binary = "";
        for (let i = 0; i < array.byteLength; i++) {
          binary += String.fromCharCode(array[i]);
        }
        return btoa(binary)
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=/g, "");
      };

      // Step 3: Send to backend for verification
      const payloadData = {
        id: assertion.id,
        rawId: uint8ArrayToBase64url(new Uint8Array(assertion.rawId)),
        response: {
          clientDataJSON: uint8ArrayToBase64url(
            new Uint8Array(assertion.response.clientDataJSON),
          ),
          authenticatorData: uint8ArrayToBase64url(
            new Uint8Array(assertion.response.authenticatorData),
          ),
          signature: uint8ArrayToBase64url(
            new Uint8Array(assertion.response.signature),
          ),
        },
        type: assertion.type,
      };

      console.log("Sending passkey login payload:", payloadData);

      const verifyResponse = await axiosInstance.post(
        "/auth/passkey/login/verify",
        payloadData,
      );

      if (verifyResponse.data.success) {
        toast.success("Logged in with passkey!");

        await checkAuth(axiosInstance);
        navigate("/", { replace: true });
      }
    } catch (err) {
      console.error("Passkey login error:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Passkey login failed. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // ===== HANDLE PASSKEY REGISTRATION =====
  const handlePasskeyRegistration = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Step 1: Get user email
      const email = prompt("Enter your email for passkey registration:");
      if (!email) {
        setIsLoading(false);
        return;
      }

      // Check if valid email
      if (!email.includes("@")) {
        setError("Please enter a valid email address");
        setIsLoading(false);
        return;
      }

      // Step 2: Get registration options from backend
      const optionsResponse = await axiosInstance.post(
        "/auth/passkey/register/options",
        { email },
      );

      const options = optionsResponse.data.options;

      // Helper: Convert base64url to Uint8Array (handles both base64 and base64url)
      const decodeBase64 = (str) => {
        try {
          // Handle base64url format (replace - with + and _ with /)
          const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
          const binaryString = atob(base64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          return bytes;
        } catch (e) {
          console.error("Failed to decode base64:", e);
          throw new Error("Failed to decode challenge");
        }
      };

      // Helper: Convert string to Uint8Array
      const stringToUint8Array = (str) => {
        return new Uint8Array(str.split("").map((c) => c.charCodeAt(0)));
      };

      // Step 3: Create credential using browser WebAuthn API
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: decodeBase64(options.challenge),
          rp: {
            name: "CartNest",
            id: options.rp?.id || "localhost",
          },
          user: {
            id: stringToUint8Array(email),
            name: email,
            displayName: email,
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          timeout: 60000,
          attestation: "none",
          userVerification: "discouraged",
        },
      });

      if (!credential) {
        setError("Passkey registration cancelled");
        setIsLoading(false);
        return;
      }

      // Helper: Convert Uint8Array to base64url
      const uint8ArrayToBase64url = (array) => {
        let binary = "";
        for (let i = 0; i < array.byteLength; i++) {
          binary += String.fromCharCode(array[i]);
        }
        return btoa(binary)
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=/g, "");
      };

      // Step 4: Send credential to backend for verification
      const payloadData = {
        email,
        id: uint8ArrayToBase64url(new Uint8Array(credential.rawId)), // Ensure base64url format
        rawId: uint8ArrayToBase64url(new Uint8Array(credential.rawId)),
        response: {
          clientDataJSON: uint8ArrayToBase64url(
            new Uint8Array(credential.response.clientDataJSON),
          ),
          attestationObject: uint8ArrayToBase64url(
            new Uint8Array(credential.response.attestationObject),
          ),
        },
        type: credential.type,
      };

      console.log("Sending passkey registration payload:", payloadData);
      console.log("credential.id type:", typeof credential.id);
      console.log("credential.id value:", credential.id);
      console.log("credential.rawId type:", credential.rawId.constructor.name);

      const verifyResponse = await axiosInstance.post(
        "/auth/passkey/register/verify",
        payloadData,
      );

      if (verifyResponse.data.success) {
        toast.success(
          "Passkey registered successfully! You can now login with it.",
        );

        // Auto-login user
        await checkAuth(axiosInstance);
        navigate("/", { replace: true });
      }
    } catch (err) {
      console.error("Passkey registration error:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Passkey registration failed. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary-50 via-blue-50 to-purple-50 px-4 py-12">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Brand Section */}
        <div className="text-center mb-8">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg mb-6 hover:scale-110 transition-transform">
            <Mail className="w-8 h-8 text-white" />
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 mb-2">CartNest</h1>
          <p className="text-gray-600 text-lg">Fresh Shopping Experience</p>
          <p className="text-gray-500 text-sm mt-2">
            Sign in to your account to continue
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800">Login Failed</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm border border-gray-100">
          {/* Divider with text */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500 font-medium">
                Choose your login method
              </span>
            </div>
          </div>

          {/* Google OAuth Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full mb-4 py-3 px-4 bg-white border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 hover:border-primary-300 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              "Continue with Google"
            )}
          </button>

          {/* Facebook OAuth Button */}
          <button
            onClick={handleFacebookLogin}
            disabled={isLoading}
            className="w-full mb-4 py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium text-white active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              "Continue with Facebook"
            )}
          </button>

          {/* Passkey Button */}
          <button
            onClick={handlePasskeyLogin}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-xl font-medium text-white active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <Fingerprint className="w-5 h-5" />
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Authenticating...
              </>
            ) : (
              "Login with Passkey"
            )}
          </button>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500">or</span>
            </div>
          </div>

          {/* Passkey Registration */}
          <div className="p-4 bg-linear-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200">
            <p className="text-sm text-gray-700 mb-3">
              🎯 <span className="font-semibold">First time with passkey?</span>
            </p>
            <p className="text-xs text-gray-600 mb-4">
              Passkeys are more secure than passwords.
            </p>
            <button
              onClick={handlePasskeyRegistration}
              disabled={isLoading}
              className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin inline mr-2" />
                  Registering...
                </>
              ) : (
                "Register a Passkey"
              )}
            </button>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            By signing in, you agree to our{" "}
            <a
              href="#"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
