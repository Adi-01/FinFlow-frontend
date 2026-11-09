"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Settings,
  Download,
  Key,
  Shield,
  Trash2,
  Monitor,
  Smartphone,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import {
  useChangePasswordMutation,
  useRevokeSessionMutation,
  useRevokeOtherSessionsMutation,
  useDeleteAccountMutation,
} from "@/lib/hooks/mutations/useProfileMutations";
import { useProfileSessionsQuery } from "@/lib/hooks/queries/useProfileQueries";
import { formatRelativeTime, formatSessionSignIn } from "@/lib/utils";

export function AccountTabContent() {
  // 1. Password Dialog State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const changePasswordMutation = useChangePasswordMutation();

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError("Current password is required.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setPasswordSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordSuccess(null);
      }, 1500);
    } catch (err: unknown) {
      setPasswordError(
        err instanceof Error ? err.message : "Failed to change password.",
      );
    }
  };

  // 2. Export Dialog State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  const handleDownloadExport = async (format: "json" | "csv") => {
    setIsExporting(true);
    setExportError(null);
    setExportSuccess(null);

    try {
      const res = await fetch(`/api/profile/account/export?format=${format}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            (res.status === 429
              ? "Export rate limit reached (maximum 5 exports per hour). Please try again later."
              : "Failed to export data."),
        );
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `finflow-export-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setExportSuccess(`Export (${format.toUpperCase()}) completed.`);
      setTimeout(() => setExportSuccess(null), 3000);
    } catch (err: unknown) {
      setExportError(
        err instanceof Error ? err.message : "Export failed. Please try again.",
      );
    } finally {
      setIsExporting(false);
    }
  };

  // 3. Sessions Dialog State
  const [isSessionsModalOpen, setIsSessionsModalOpen] = useState(false);
  const { data: sessionsData, isLoading: isLoadingSessions } =
    useProfileSessionsQuery();
  const revokeSessionMutation = useRevokeSessionMutation();
  const revokeOtherSessionsMutation = useRevokeOtherSessionsMutation();

  const sessions = sessionsData?.sessions || [];

  // Helper device icon
  const getDeviceIcon = (ua: string) => {
    const uaLower = ua.toLowerCase();
    if (
      uaLower.includes("mobile") ||
      uaLower.includes("iphone") ||
      uaLower.includes("android")
    ) {
      return Smartphone;
    }
    return Monitor;
  };

  const formatDeviceName = (ua: string) => {
    if (!ua || ua === "node" || ua === "Unknown Device") return "Current Browser";
    const uaLower = ua.toLowerCase();

    let browser = "Browser";
    if (uaLower.includes("edg/")) browser = "Edge";
    else if (uaLower.includes("chrome") && !uaLower.includes("chromium")) browser = "Chrome";
    else if (uaLower.includes("safari") && !uaLower.includes("chrome")) browser = "Safari";
    else if (uaLower.includes("firefox")) browser = "Firefox";
    else if (uaLower.includes("opera") || uaLower.includes("opr/")) browser = "Opera";

    let os = "Device";
    if (uaLower.includes("macintosh") || uaLower.includes("mac os")) os = "macOS";
    else if (uaLower.includes("windows")) os = "Windows";
    else if (uaLower.includes("android")) os = "Android";
    else if (uaLower.includes("iphone") || uaLower.includes("ipad")) os = "iOS";
    else if (uaLower.includes("linux")) os = "Linux";

    return `${browser} on ${os}`;
  };

  // 4. Danger Zone Deletion State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const deleteAccountMutation = useDeleteAccountMutation();

  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);

    if (deleteConfirmation !== "DELETE") {
      setDeleteError("Confirmation must be exactly 'DELETE'.");
      return;
    }
    if (!deletePassword) {
      setDeleteError("Password is required to delete your account.");
      return;
    }

    try {
      await deleteAccountMutation.mutateAsync({
        confirmation: "DELETE",
        password: deletePassword,
      });
    } catch (err: unknown) {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete account.",
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Section 1: Account & Plan */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-none space-y-4">
        <div className="space-y-1">
          <h2 className="text-base font-bold tracking-[-0.015em] text-foreground">Account & Plan</h2>
          <p className="text-xs text-muted-foreground">
            Manage your subscription and data.
          </p>
        </div>

        <div className="flex flex-col divide-y">
          {/* Account Status */}
          <div className="flex items-center justify-between py-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">Account Status</span>
              <span className="text-xs text-muted-foreground">Account is active.</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
              <span className="size-1.5 rounded-full bg-emerald-500"></span>
              Active
            </div>
          </div>

          {/* Subscription Plan */}
          <div className="flex items-center justify-between py-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">Subscription Plan</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-muted-foreground">
                  Pro Plan - Free Early Access
                </span>
              </div>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 cursor-pointer sm:gap-2"
                >
                  <Settings className="size-4 sm:size-3" />
                  <span className="hidden sm:inline">Manage Plan</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Membership Plan</DialogTitle>
                  <DialogDescription>
                    You are currently enrolled in the FinFlow Early Access Pro membership with unlimited categories and accounts.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2 text-sm text-muted-foreground">
                  <p>• Unlimited transactions and monthly allowance tracking</p>
                  <p>• Advanced multi-filter ledger search</p>
                  <p>• Export in JSON and CSV formats</p>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Data Export */}
          <div className="flex items-center justify-between py-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">Data Management</span>
              <span className="text-xs text-muted-foreground">
                Download a complete copy of your financial data.
              </span>
            </div>
            <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 cursor-pointer sm:gap-2"
                >
                  <Download className="size-4 sm:size-3" />
                  <span className="hidden sm:inline">Export Data</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Export Data</DialogTitle>
                  <DialogDescription>
                    Choose a format to download all your transactions, categories, and preferences. (Limit: 5 exports/hour)
                  </DialogDescription>
                </DialogHeader>
                {exportError && (
                  <div className="flex items-center gap-2 text-xs font-medium text-destructive">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>{exportError}</span>
                  </div>
                )}
                {exportSuccess && (
                  <div className="flex items-center gap-2 text-xs font-medium text-emerald-600">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>{exportSuccess}</span>
                  </div>
                )}
                <div className="grid gap-3 py-4">
                  <Button
                    variant="outline"
                    onClick={() => handleDownloadExport("csv")}
                    disabled={isExporting}
                    className="justify-start gap-2 cursor-pointer"
                  >
                    {isExporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                    Export as CSV
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDownloadExport("json")}
                    disabled={isExporting}
                    className="justify-start gap-2 cursor-pointer"
                  >
                    {isExporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                    Export as JSON
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Section 2: Security */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-none space-y-4">
        <div className="space-y-1">
          <h2 className="text-base font-bold tracking-[-0.015em] text-foreground">Security</h2>
          <p className="text-xs text-muted-foreground">
            Keep your account safe and manage active device sessions.
          </p>
        </div>

        <div className="flex flex-col divide-y">
          {/* Change Password */}
          <div className="flex items-center justify-between py-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">Password</span>
              <span className="text-xs text-muted-foreground">
                Update password to keep your account protected.
              </span>
            </div>

            <Dialog
              open={isPasswordModalOpen}
              onOpenChange={(open) => {
                setIsPasswordModalOpen(open);
                if (!open) {
                  setPasswordError(null);
                  setPasswordSuccess(null);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 cursor-pointer sm:gap-2"
                >
                  <Key className="size-4 sm:size-3" />
                  <span className="hidden sm:inline">Change Password</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>
                    Enter your current password and choose a new secure password.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handlePasswordSubmit} className="space-y-4 py-4">
                  {passwordError && (
                    <div className="flex items-center gap-2 text-xs font-medium text-destructive">
                      <AlertCircle className="size-4 shrink-0" />
                      <span>{passwordError}</span>
                    </div>
                  )}
                  {passwordSuccess && (
                    <div className="flex items-center gap-2 text-xs font-medium text-emerald-600">
                      <CheckCircle2 className="size-4 shrink-0" />
                      <span>{passwordSuccess}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="current-pw">Current Password</Label>
                    <Input
                      id="current-pw"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-pw">New Password</Label>
                    <Input
                      id="new-pw"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-pw">Confirm New Password</Label>
                    <Input
                      id="confirm-pw"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      required
                    />
                  </div>

                  <DialogFooter className="pt-2">
                    <Button
                      type="submit"
                      disabled={changePasswordMutation.isPending}
                      className="cursor-pointer"
                    >
                      {changePasswordMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Active Sessions */}
          <div className="flex items-center justify-between py-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">Active Sessions</span>
              <span className="text-xs text-muted-foreground">
                Manage devices and browsers currently logged into FinFlow.
              </span>
            </div>
            <Dialog
              open={isSessionsModalOpen}
              onOpenChange={setIsSessionsModalOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 cursor-pointer sm:gap-2"
                >
                  <Shield className="size-4 sm:size-3" />
                  <span className="hidden sm:inline">Manage Sessions</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                  <DialogTitle>Active Sessions</DialogTitle>
                  <DialogDescription>
                    Review and revoke active devices logged into your account.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-4 max-h-[320px] overflow-y-auto">
                  {isLoadingSessions ? (
                    <div className="flex items-center justify-center py-6 text-xs text-muted-foreground">
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Loading sessions...
                    </div>
                  ) : sessions.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No session data found.
                    </p>
                  ) : (
                    sessions.map((sess) => {
                      const DeviceIcon = getDeviceIcon(sess.userAgent);
                      return (
                        <div
                          key={sess.sessionId}
                          className="flex items-center justify-between gap-3 rounded-lg border p-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <DeviceIcon className="size-5 text-muted-foreground shrink-0" />
                            <div className="space-y-0.5 min-w-0">
                              <p
                                className="text-xs font-medium truncate"
                                title={sess.userAgent}
                              >
                                {formatDeviceName(sess.userAgent)}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                Signed in: {formatSessionSignIn(sess.createdAt || sess.lastActive)}
                                {!sess.isCurrent && sess.lastActive && (
                                  <>
                                    {" "}• Last active: {formatRelativeTime(sess.lastActive)}
                                  </>
                                )}
                              </p>
                            </div>
                          </div>
                          {sess.isCurrent ? (
                            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 shrink-0">
                              Current
                            </span>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                revokeSessionMutation.mutate(sess.sessionId)
                              }
                              disabled={revokeSessionMutation.isPending}
                              className="h-7 text-xs text-destructive hover:text-destructive cursor-pointer shrink-0"
                            >
                              Revoke
                            </Button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => revokeOtherSessionsMutation.mutate()}
                    disabled={
                      revokeOtherSessionsMutation.isPending ||
                      sessions.filter((s) => !s.isCurrent).length === 0
                    }
                    className="w-full cursor-pointer text-xs"
                  >
                    {revokeOtherSessionsMutation.isPending
                      ? "Signing out..."
                      : "Sign out of all other sessions"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Section 3: Danger Zone */}
      <div className="rounded-xl border border-destructive/30 bg-card p-6 shadow-none space-y-4">
        <div className="space-y-1">
          <h2 className="text-base font-bold tracking-[-0.015em] text-destructive">Danger Zone</h2>
          <p className="text-xs text-muted-foreground">
            Permanently delete your account and all associated data.
          </p>
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Delete Account</span>
            <span className="text-xs text-muted-foreground">
              This action cannot be undone. All transactions will be permanently deleted.
            </span>
          </div>
          <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="h-8 cursor-pointer sm:gap-2"
              >
                <Trash2 className="size-4 sm:size-3" />
                <span className="hidden sm:inline">Delete Account</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-destructive">
                  Delete Account
                </DialogTitle>
                <DialogDescription>
                  This will permanently delete your user profile, transactions, budgets, and all account data.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleDeleteSubmit} className="space-y-4 py-4">
                {deleteError && (
                  <div className="flex items-center gap-2 text-xs font-medium text-destructive">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>{deleteError}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Please type{" "}
                    <span className="font-semibold text-foreground">DELETE</span> to confirm:
                  </p>
                  <Input
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="DELETE"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="del-password" className="text-xs">
                    Account Password
                  </Label>
                  <Input
                    id="del-password"
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter password"
                    required
                  />
                </div>

                <DialogFooter className="pt-2">
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={
                      deleteConfirmation !== "DELETE" ||
                      !deletePassword ||
                      deleteAccountMutation.isPending
                    }
                    className="cursor-pointer w-full"
                  >
                    {deleteAccountMutation.isPending
                      ? "Deleting Account..."
                      : "Permanently Delete Account"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

