import { useRef, useState, useEffect } from "react";
import {
  User as UserIcon,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Camera,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";

interface ProfileHeaderCardProps {
  name: string;
  email: string;
  profileImage?: string | null;
  joinedAt?: string;
  isChanged: boolean;
  isSaving: boolean;
  onSave: () => void;
  onReset: () => void;
  errorMessage: string | null;
  successMessage: string | null;
  onAvatarUpload?: (file: File) => void;
  onAvatarRemove?: () => void;
  isUploadingAvatar?: boolean;
  isRemovingAvatar?: boolean;
}

export function ProfileHeaderCard({
  name,
  email,
  profileImage,
  joinedAt,
  isChanged,
  isSaving,
  onSave,
  onReset,
  errorMessage,
  successMessage,
  onAvatarUpload,
  onAvatarRemove,
  isUploadingAvatar,
  isRemovingAvatar,
}: ProfileHeaderCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  // Automatically close confirmation dialog once photo is removed
  useEffect(() => {
    if (!profileImage) {
      setIsConfirmDeleteOpen(false);
    }
  }, [profileImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onAvatarUpload) {
      onAvatarUpload(file);
    }
    // Reset file input so re-selecting same file triggers change
    if (e.target) {
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Top Header Card */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar with image or fallback + upload overlay */}
            <div className="group relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={name || "User Avatar"}
                  className="size-full object-cover"
                />
              ) : (
                <UserIcon className="size-7 text-muted-foreground" />
              )}

              {/* Uploading loading overlay */}
              {isUploadingAvatar ? (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-xs">
                  <Loader2 className="size-5 animate-spin text-primary" />
                </div>
              ) : (
                /* Hover button overlay */
                onAvatarUpload && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Change profile photo"
                    className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
                  >
                    <Camera className="size-5" />
                  </button>
                )
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-[-0.015em] text-foreground">
                  {name || "User Profile"}
                </h1>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  Pro
                </span>
                {profileImage && onAvatarRemove && (
                  <button
                    type="button"
                    onClick={() => setIsConfirmDeleteOpen(true)}
                    disabled={isRemovingAvatar}
                    className="ml-1 inline-flex items-center gap-1 rounded text-[11px] text-muted-foreground hover:text-destructive cursor-pointer transition-colors"
                    title="Remove profile photo"
                  >
                    {isRemovingAvatar ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <Trash2 className="size-3" />
                    )}
                    <span className="hidden lg:inline">Remove photo</span>
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-muted-foreground">
                <div className="flex items-center">
                  {email}
                </div>
                {joinedAt && (
                  <div className="flex items-center gap-1">
                    Joined {formatDate(joinedAt, { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              disabled={!isChanged || isSaving}
              className="h-8 gap-1 text-xs cursor-pointer"
            >
              <RotateCcw className="size-3" />
              Reset
            </Button>
            <Button
              size="sm"
              onClick={onSave}
              disabled={!isChanged || isSaving}
              className="h-8 min-w-[90px] text-xs font-medium cursor-pointer"
            >
              {isSaving ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {errorMessage && (
        <div className="flex items-center gap-2 text-xs font-medium text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Confirmation Dialog for Avatar Removal */}
      <Dialog
        open={isConfirmDeleteOpen}
        onOpenChange={(open) => {
          if (!isRemovingAvatar) setIsConfirmDeleteOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Remove profile photo?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to remove your profile photo? Your avatar will revert to your default initials.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isRemovingAvatar}
              onClick={() => setIsConfirmDeleteOpen(false)}
              className="text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isRemovingAvatar}
              onClick={() => {
                onAvatarRemove?.();
              }}
              className="text-xs cursor-pointer gap-1.5"
            >
              {isRemovingAvatar ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove Photo"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

