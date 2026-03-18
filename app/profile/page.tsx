"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/contexts/auth-context";
import { updateProfile, updateEmail, updatePassword } from "firebase/auth";
import { LogOut } from "lucide-react";
import {
  CheckCircleIcon,
  UserIcon,
  KeyIcon,
  LinkIcon,
  UnlinkIcon,
  AlertCircleIcon,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react";

export default function Profile() {
  const {
    currentUser,
    logout,
    linkWithGoogle,
    linkWithFacebook,
    unlinkProvider,
  } = useAuth();
  const router = useRouter();

  // Profile form state
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isLinking, setIsLinking] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<
    "profile" | "security" | "accounts"
  >("profile");

  // Connected accounts state
  const [connectedProviders, setConnectedProviders] = useState<string[]>([]);

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || "");
      setEmail(currentUser.email || "");

      // Get connected providers
      const providers = currentUser.providerData.map(
        (provider) => provider.providerId
      );
      setConnectedProviders(providers);
    }
  }, [currentUser]);

  const showMessage = (message: string, isError = false) => {
    if (isError) {
      setError(message);
      setSuccessMessage("");
    } else {
      setSuccessMessage(message);
      setError("");
    }
    setTimeout(() => {
      setError("");
      setSuccessMessage("");
    }, 5000);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsLoading(true);

    try {
      await updateProfile(currentUser, {
        displayName: displayName,
      });

      if (email !== currentUser.email) {
        await updateEmail(currentUser, email);
      }

      showMessage("Profile updated successfully!");
    } catch (err: any) {
      showMessage(err.message || "Failed to update profile", true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (newPassword !== confirmPassword) {
      showMessage("New passwords do not match", true);
      return;
    }

    if (newPassword.length < 6) {
      showMessage("Password must be at least 6 characters long", true);
      return;
    }

    setIsLoading(true);

    try {
      await updatePassword(currentUser, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showMessage("Password updated successfully!");
    } catch (err: any) {
      showMessage(err.message || "Failed to update password", true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkAccount = async (provider: "google" | "facebook") => {
    setIsLinking(provider);

    try {
      if (provider === "google") {
        await linkWithGoogle();
      } else {
        await linkWithFacebook();
      }

      // Refresh connected providers
      const providers =
        currentUser?.providerData.map((p) => p.providerId) || [];
      setConnectedProviders(providers);

      showMessage(
        `${
          provider.charAt(0).toUpperCase() + provider.slice(1)
        } account linked successfully!`
      );
    } catch (err: any) {
      showMessage(err.message || `Failed to link ${provider} account`, true);
    } finally {
      setIsLinking(null);
    }
  };

  const handleUnlinkAccount = async (providerId: string) => {
    if (connectedProviders.length <= 1) {
      showMessage("Cannot unlink the last authentication method", true);
      return;
    }

    try {
      await unlinkProvider(providerId);

      // Refresh connected providers
      const providers =
        currentUser?.providerData.map((p) => p.providerId) || [];
      setConnectedProviders(providers);

      const providerName = providerId === "google.com" ? "Google" : "Facebook";
      showMessage(`${providerName} account unlinked successfully!`);
    } catch (err: any) {
      showMessage(err.message || "Failed to unlink account", true);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (err: any) {
      showMessage(err.message || "Failed to log out", true);
    }
  };

  const isGoogleConnected = connectedProviders.includes("google.com");
  const isFacebookConnected = connectedProviders.includes("facebook.com");
  const hasPasswordProvider = connectedProviders.includes("password");

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white">
        <Navbar />

        <main className="container mx-auto px-6 pt-24 pb-16">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="relative mx-auto h-24 w-24 rounded-full overflow-hidden bg-gray-900 mb-4">
                {currentUser?.photoURL ? (
                  <Image
                    src={currentUser.photoURL || "/placeholder.svg"}
                    alt="Profile"
                    fill
                    className="object-cover"
                    sizes="(max-width: 96px) 100vw, 96px"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-800">
                    <UserIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              <h1 className="text-3xl font-bold">Profile Settings</h1>
              <p className="text-gray-400 mt-2">{currentUser?.email}</p>
            </div>

            {/* Messages */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-md mb-6 flex items-center gap-2">
                <AlertCircleIcon size={20} />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-md mb-6 flex items-center gap-2">
                <CheckCircleIcon size={20} />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Tabs */}
            <div className="flex space-x-1 mb-8 bg-gray-900 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "profile"
                    ? "bg-teal-500 text-black"
                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                }`}
              >
                <UserIcon className="inline-block w-4 h-4 mr-2" />
                Profile
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "security"
                    ? "bg-teal-500 text-black"
                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                }`}
              >
                <KeyIcon className="inline-block w-4 h-4 mr-2" />
                Security
              </button>
              <button
                onClick={() => setActiveTab("accounts")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "accounts"
                    ? "bg-teal-500 text-black"
                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                }`}
              >
                <LinkIcon className="inline-block w-4 h-4 mr-2" />
                Connected Accounts
              </button>
            </div>

            {/* Tab Content */}
            <div className="grid gap-6">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <UserIcon className="h-5 w-5" />
                      Profile Information
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Update your personal information and email address.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <div className="space-y-2 text-white">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input
                          id="displayName"
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="bg-gray-800 border-gray-700 focus:border-teal-500 text-white"
                          placeholder="Enter your display name"
                        />
                      </div>

                      <div className="space-y-2 text-white">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-gray-800 border-gray-700 focus:border-teal-500 text-white"
                          placeholder="Enter your email"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-teal-500 text-black hover:bg-teal-400"
                      >
                        {isLoading ? "Updating..." : "Update Profile"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <KeyIcon className="h-5 w-5" />
                      Security Settings
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      {hasPasswordProvider
                        ? "Change your password to keep your account secure."
                        : "You're signed in with a social account. Connect a password to enable password login."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {hasPasswordProvider ? (
                      <form
                        onSubmit={handleUpdatePassword}
                        className="space-y-6"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">
                            Current Password
                          </Label>
                          <div className="relative">
                            <Input
                              id="currentPassword"
                              type={showCurrentPassword ? "text" : "password"}
                              value={currentPassword}
                              onChange={(e) =>
                                setCurrentPassword(e.target.value)
                              }
                              className="bg-gray-800 border-gray-700 focus:border-teal-500 text-white pr-10"
                              placeholder="Enter current password"
                              required
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowCurrentPassword(!showCurrentPassword)
                              }
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                              {showCurrentPassword ? (
                                <EyeOffIcon size={18} />
                              ) : (
                                <EyeIcon size={18} />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <div className="relative">
                            <Input
                              id="newPassword"
                              type={showNewPassword ? "text" : "password"}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="bg-gray-800 border-gray-700 focus:border-teal-500 text-white pr-10"
                              placeholder="Enter new password"
                              required
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowNewPassword(!showNewPassword)
                              }
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                              {showNewPassword ? (
                                <EyeOffIcon size={18} />
                              ) : (
                                <EyeIcon size={18} />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">
                            Confirm New Password
                          </Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              value={confirmPassword}
                              onChange={(e) =>
                                setConfirmPassword(e.target.value)
                              }
                              className="bg-gray-800 border-gray-700 focus:border-teal-500 text-white pr-10"
                              placeholder="Confirm new password"
                              required
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                              {showConfirmPassword ? (
                                <EyeOffIcon size={18} />
                              ) : (
                                <EyeIcon size={18} />
                              )}
                            </button>
                          </div>
                        </div>

                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="bg-teal-500 text-black hover:bg-teal-400"
                        >
                          {isLoading ? "Updating..." : "Update Password"}
                        </Button>
                      </form>
                    ) : (
                      <div className="text-center py-8">
                        <KeyIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 mb-4">
                          You're currently signed in with a social account. To
                          enable password login, you'll need to set up a
                          password.
                        </p>
                        <Button
                          onClick={() => setActiveTab("accounts")}
                          variant="outline"
                          className="bg-teal-500 text-black hover:bg-teal-400"
                        >
                          Manage Connected Accounts
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Connected Accounts Tab */}
              {activeTab === "accounts" && (
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <LinkIcon className="h-5 w-5" />
                      Connected Accounts
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Link your social accounts to sign in with multiple
                      methods.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Google Account */}
                    <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6" viewBox="0 0 24 24">
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
                        </div>
                        <div>
                          <h3 className="text-white font-medium">Google</h3>
                          <p className="text-gray-400 text-sm">
                            {isGoogleConnected ? "Connected" : "Not connected"}
                          </p>
                        </div>
                      </div>
                      {isGoogleConnected ? (
                        <Button
                          onClick={() => handleUnlinkAccount("google.com")}
                          variant="outline"
                          size="sm"
                          className="border-red-500 text-red-500 hover:bg-red-500/10"
                          disabled={connectedProviders.length <= 1}
                        >
                          <UnlinkIcon className="w-4 h-4 mr-2" />
                          Disconnect
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleLinkAccount("google")}
                          size="sm"
                          className="bg-teal-500 text-black hover:bg-teal-400"
                          disabled={isLinking === "google"}
                        >
                          <LinkIcon className="w-4 h-4 mr-2" />
                          {isLinking === "google" ? "Connecting..." : "Connect"}
                        </Button>
                      )}
                    </div>

                    {/* Facebook Account */}
                    <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#1877F2] rounded-full flex items-center justify-center">
                          <svg
                            className="w-6 h-6"
                            fill="white"
                            viewBox="0 0 24 24"
                          >
                            <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-white font-medium">Facebook</h3>
                          <p className="text-gray-400 text-sm">
                            {isFacebookConnected
                              ? "Connected"
                              : "Not connected"}
                          </p>
                        </div>
                      </div>
                      {isFacebookConnected ? (
                        <Button
                          onClick={() => handleUnlinkAccount("facebook.com")}
                          variant="outline"
                          size="sm"
                          className="border-red-500 text-red-500 hover:bg-red-500/10"
                          disabled={connectedProviders.length <= 1}
                        >
                          <UnlinkIcon className="w-4 h-4 mr-2" />
                          Disconnect
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleLinkAccount("facebook")}
                          size="sm"
                          className="bg-teal-500 text-black hover:bg-teal-400"
                          disabled={isLinking === "facebook"}
                        >
                          <LinkIcon className="w-4 h-4 mr-2" />
                          {isLinking === "facebook"
                            ? "Connecting..."
                            : "Connect"}
                        </Button>
                      )}
                    </div>

                    {connectedProviders.length <= 1 && (
                      <div className="bg-yellow-500/10 border border-yellow-500/50 text-yellow-400 px-4 py-3 rounded-md flex items-start gap-2">
                        <AlertCircleIcon
                          size={20}
                          className="mt-0.5 flex-shrink-0"
                        />
                        <div>
                          <p className="font-medium">Security Notice</p>
                          <p className="text-sm">
                            We recommend connecting at least two authentication
                            methods to ensure you can always access your
                            account.
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Danger Zone */}
              <Card className="bg-gray-900 border-red-500/50">
                <CardHeader>
                  <CardTitle className="text-red-400">Danger Zone</CardTitle>
                  <CardDescription className="text-gray-400">
                    Actions that will affect your account permanently.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="text-gray-300 hover:text-teal-400 hover:bg-black/20"
                  >
                    <LogOut size={18} className="mr-2" />
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-gray-950 to-transparent -z-10"></div>
      </div>
    </ProtectedRoute>
  );
}
