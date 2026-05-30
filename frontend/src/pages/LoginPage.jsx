import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Fingerprint, AlertCircle, Loader, ShoppingCart } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

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

  const handleGoogleLogin = () => {
    setIsLoading(true);
    window.location.href = `${API_URL}/api/auth/google`;
  };

  const handleFacebookLogin = () => {
    setIsLoading(true);
    window.location.href = `${API_URL}/api/auth/facebook`;
  };

  const handlePasskeyLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const email = prompt("Enter your email for passkey login:");
      if (!email) {
        setIsLoading(false);
        return;
      }

      const optionsResponse = await axiosInstance.post(
        "/auth/passkey/login/options",
        { email },
      );
      const options = optionsResponse.data.options;

      const decodeBase64 = (str) => {
        const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++)
          bytes[i] = binaryString.charCodeAt(i);
        return bytes;
      };

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: decodeBase64(options.challenge),
          allowCredentials: options.allowCredentials?.map((c) => ({
            ...c,
            id: decodeBase64(c.id),
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

      const uint8ArrayToBase64url = (array) => {
        let binary = "";
        for (let i = 0; i < array.byteLength; i++)
          binary += String.fromCharCode(array[i]);
        return btoa(binary)
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=/g, "");
      };

      const verifyResponse = await axiosInstance.post(
        "/auth/passkey/login/verify",
        {
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
        },
      );

      if (verifyResponse.data.success) {
        toast.success("Logged in with passkey!");
        await checkAuth(axiosInstance);
        navigate("/", { replace: true });
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || "Passkey login failed.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasskeyRegistration = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const email = prompt("Enter your email for passkey registration:");
      if (!email) {
        setIsLoading(false);
        return;
      }
      if (!email.includes("@")) {
        setError("Please enter a valid email address");
        setIsLoading(false);
        return;
      }

      const optionsResponse = await axiosInstance.post(
        "/auth/passkey/register/options",
        { email },
      );
      const options = optionsResponse.data.options;

      const decodeBase64 = (str) => {
        const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++)
          bytes[i] = binaryString.charCodeAt(i);
        return bytes;
      };

      const stringToUint8Array = (str) =>
        new Uint8Array(str.split("").map((c) => c.charCodeAt(0)));

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: decodeBase64(options.challenge),
          rp: { name: "CartNest", id: options.rp?.id || "localhost" },
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

      const uint8ArrayToBase64url = (array) => {
        let binary = "";
        for (let i = 0; i < array.byteLength; i++)
          binary += String.fromCharCode(array[i]);
        return btoa(binary)
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=/g, "");
      };

      const verifyResponse = await axiosInstance.post(
        "/auth/passkey/register/verify",
        {
          email,
          id: uint8ArrayToBase64url(new Uint8Array(credential.rawId)),
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
        },
      );

      if (verifyResponse.data.success) {
        toast.success("Passkey registered! You can now login with it.");
        await checkAuth(axiosInstance);
        navigate("/", { replace: true });
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Passkey registration failed.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-[#f5f9f5]">
      {/* Background pattern */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Large soft blobs */}
        <div className="absolute -top-32 -right-32 w-125 h-125 rounded-full bg-primary-100 opacity-50" />
        <div className="absolute -bottom-40 -left-24 w-105 h-105 rounded-full bg-primary-200 opacity-30" />

        {/* Subtle grid */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.035]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#16a34a"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Floating leaf dots */}
        {[
          { top: "12%", left: "8%", size: 6 },
          { top: "30%", left: "92%", size: 4 },
          { top: "60%", left: "5%", size: 8 },
          { top: "78%", left: "88%", size: 5 },
          { top: "90%", left: "40%", size: 4 },
        ].map((dot, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-primary-400 opacity-20"
            style={{
              top: dot.top,
              left: dot.left,
              width: dot.size,
              height: dot.size,
            }}
          />
        ))}
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-105">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-5">
            <div
              className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center shadow-md"
              style={{ transform: "rotate(-8deg)" }}
            >
              <ShoppingCart
                className="w-6 h-6 text-white"
                style={{ transform: "rotate(8deg)" }}
              />
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold text-gray-900 leading-none">
                CartNest
              </p>
              <p className="text-xs text-primary-600 font-medium mt-0.5">
                Fresh finds, fast.
              </p>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">
            Sign in to continue shopping
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex gap-3 items-start">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* White card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5 text-center">
            Choose sign-in method
          </p>

          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full mb-3 py-3 px-4 bg-white border border-gray-200 rounded-xl font-medium text-sm text-gray-700
                       hover:border-primary-400 hover:bg-primary-50 hover:text-primary-700
                       active:scale-[0.98] transition-all duration-150
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center gap-3"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" /> Signing in...
              </>
            ) : (
              "Continue with Google"
            )}
          </button>

          {/* Facebook */}
          <button
            onClick={handleFacebookLogin}
            disabled={isLoading}
            className="w-full mb-3 py-3 px-4 bg-[#1877F2] hover:bg-[#1467d6]
                       rounded-xl font-medium text-sm text-white
                       active:scale-[0.98] transition-all duration-150
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center gap-3"
          >
            <svg
              className="w-4 h-4 shrink-0"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" /> Signing in...
              </>
            ) : (
              "Continue with Facebook"
            )}
          </button>

          {/* Passkey login */}
          <button
            onClick={handlePasskeyLogin}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600
                       rounded-xl font-medium text-sm text-white
                       active:scale-[0.98] transition-all duration-150
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center gap-3"
          >
            <Fingerprint className="w-4 h-4 shrink-0" />
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" /> Authenticating...
              </>
            ) : (
              "Login with Passkey"
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Passkey registration */}
          <div className="rounded-xl border border-primary-100 bg-primary-50 p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                <Fingerprint className="w-4 h-4 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  New to passkeys?
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  More secure than passwords — set one up in seconds.
                </p>
              </div>
            </div>
            <button
              onClick={handlePasskeyRegistration}
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-white border border-primary-200 hover:border-primary-400 hover:bg-primary-50
                         text-primary-700 rounded-lg font-medium text-sm
                         active:scale-[0.98] transition-all duration-150
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" /> Registering...
                </>
              ) : (
                "Register a Passkey"
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          By signing in, you agree to our{" "}
          <a href="#" className="text-primary-600 hover:underline font-medium">
            Terms
          </a>{" "}
          and{" "}
          <a href="#" className="text-primary-600 hover:underline font-medium">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
