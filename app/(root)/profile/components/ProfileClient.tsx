"use client";

import { useState, useRef, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useProfile } from "@/lib/hooks/queries/useProfileQueries";
import {
  useUpdateProfile,
  useUploadAvatarMutation,
  useRemoveAvatarMutation,
} from "@/lib/hooks/mutations/useProfileMutations";
import { usePaymentMethods } from "@/lib/hooks/queries/usePaymentMethodQueries";
import { ProfileHeaderCard } from "./ProfileHeaderCard";
import { PersonalTabContent } from "./PersonalTabContent";
import { AccountTabContent } from "./AccountTabContent";
import { CollectionsTabContent } from "./CollectionsTabContent";
import { ImageCropModal } from "./ImageCropModal";

export function ProfileClient() {
  const { data: profile } = useProfile();
  const { data: paymentMethodsData } = usePaymentMethods();
  const { mutate: updateProfile, isPending: isSaving } = useUpdateProfile();
  const { mutate: uploadAvatar, isPending: isUploadingAvatar } = useUploadAvatarMutation();
  const { mutate: removeAvatar, isPending: isRemovingAvatar } = useRemoveAvatarMutation();

  const [name, setName] = useState<string>("");
  const [dob, setDob] = useState<string>("");
  const [currencySymbol, setCurrencySymbol] = useState<string>("$");
  const [startingAllowance, setStartingAllowance] = useState<string>("0");
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState<string>("");

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [cropModalOpen, setCropModalOpen] = useState<boolean>(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<string>("personal");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Sync state when profile loads or updates
  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setDob(profile.dob ? profile.dob.split("T")[0] : "");
      setCurrencySymbol(profile.settings?.currencySymbol || "$");
      setStartingAllowance(
        profile.settings?.monthlyStartingAllowance !== undefined
          ? String(profile.settings.monthlyStartingAllowance)
          : "0",
      );
      setDefaultPaymentMethod(profile.settings?.defaultPaymentMethod || "");
    }
  }, [profile]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  const handleReset = () => {
    if (profile) {
      setName(profile.name || "");
      setDob(profile.dob ? profile.dob.split("T")[0] : "");
      setCurrencySymbol(profile.settings?.currencySymbol || "$");
      setStartingAllowance(
        profile.settings?.monthlyStartingAllowance !== undefined
          ? String(profile.settings.monthlyStartingAllowance)
          : "0",
      );
      setDefaultPaymentMethod(profile.settings?.defaultPaymentMethod || "");
    }
    setErrorMessage(null);
    setSuccessMessage("Changes reset.");
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  const handleSave = () => {
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Full name cannot be empty.");
      return;
    }
    if (!dob) {
      setErrorMessage("Date of birth is required.");
      return;
    }
    if (!currencySymbol) {
      setErrorMessage("Base currency is required.");
      return;
    }

    const numericAllowance = Number(startingAllowance);
    if (isNaN(numericAllowance) || numericAllowance < 0) {
      setErrorMessage("Monthly starting allowance must be a valid positive number.");
      return;
    }

    updateProfile(
      {
        name: name.trim(),
        dob,
        currencySymbol,
        monthlyStartingAllowance: numericAllowance,
        defaultPaymentMethod: defaultPaymentMethod ? defaultPaymentMethod.trim() : null,
      },
      {
        onSuccess: () => {
          setSuccessMessage("Profile preferences saved successfully.");
          setTimeout(() => setSuccessMessage(null), 3000);
        },
        onError: (err) => {
          setErrorMessage(err.message || "Failed to update profile.");
        },
      },
    );
  };

  const handleAvatarUpload = (file: File) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setErrorMessage("Invalid file format. Only JPEG, PNG, and WEBP images are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("File size exceeds the 5MB limit.");
      return;
    }

    // Open image cropper modal with file preview
    const objectUrl = URL.createObjectURL(file);
    setCropImageSrc(objectUrl);
    setCropModalOpen(true);
  };

  const handleCropConfirm = (croppedFile: File) => {
    const formData = new FormData();
    formData.append("avatar", croppedFile);

    uploadAvatar(formData, {
      onSuccess: () => {
        setSuccessMessage("Profile image updated successfully.");
        setTimeout(() => setSuccessMessage(null), 3000);
        handleCropClose();
      },
      onError: (err) => {
        setErrorMessage(err.message || "Failed to upload profile image.");
      },
    });
  };

  const handleCropClose = () => {
    setCropModalOpen(false);
    if (cropImageSrc) {
      URL.revokeObjectURL(cropImageSrc);
      setCropImageSrc(null);
    }
  };

  const handleAvatarRemove = () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    removeAvatar(undefined, {
      onSuccess: () => {
        setSuccessMessage("Profile image removed successfully.");
        setTimeout(() => setSuccessMessage(null), 3000);
      },
      onError: (err) => {
        setErrorMessage(err.message || "Failed to remove profile image.");
      },
    });
  };

  const isChanged = Boolean(
    profile &&
      (name.trim() !== (profile.name || "").trim() ||
        dob !== (profile.dob ? profile.dob.split("T")[0] : "") ||
        currencySymbol !== (profile.settings?.currencySymbol || "$") ||
        Number(startingAllowance) !==
          (profile.settings?.monthlyStartingAllowance ?? 0) ||
        (defaultPaymentMethod || "") !==
          (profile.settings?.defaultPaymentMethod || "")),
  );

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col">
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex flex-1 min-h-0 flex-col"
      >
        {/* Fixed Top Section: Header Card, Messages, and Tabs Navigation */}
        <div className="sticky top-0 z-20 shrink-0 space-y-4 bg-background pb-3">
          <ProfileHeaderCard
            name={profile?.name || ""}
            email={profile?.email || ""}
            profileImage={profile?.profileImage}
            joinedAt={profile?.joinedAt}
            isChanged={isChanged}
            isSaving={isSaving}
            onSave={handleSave}
            onReset={handleReset}
            errorMessage={errorMessage}
            successMessage={successMessage}
            onAvatarUpload={handleAvatarUpload}
            onAvatarRemove={handleAvatarRemove}
            isUploadingAvatar={isUploadingAvatar}
            isRemovingAvatar={isRemovingAvatar}
          />

          {/* Fixed TabsList Navigation */}
          <TabsList className="w-full h-9 bg-muted p-1 gap-0.5 rounded-md grid grid-cols-3">
            <TabsTrigger value="personal">
              Personal
            </TabsTrigger>
            <TabsTrigger value="account">
              Account
            </TabsTrigger>
            <TabsTrigger value="collections">
              Collections
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Scrollable Tabs Content Container */}
        <div
          ref={scrollContainerRef}
          className="flex-1 min-h-0 overflow-y-auto pr-1 pb-16"
        >
          {/* Tab 1: Personal */}
          <TabsContent
            value="personal"
            className="mt-0 space-y-0 focus-visible:outline-none focus-visible:ring-0"
          >
            <PersonalTabContent
              name={name}
              setName={setName}
              email={profile?.email || ""}
              dob={dob}
              setDob={setDob}
              currencySymbol={currencySymbol}
              setCurrencySymbol={setCurrencySymbol}
              startingAllowance={startingAllowance}
              setStartingAllowance={setStartingAllowance}
              defaultPaymentMethod={defaultPaymentMethod}
              setDefaultPaymentMethod={setDefaultPaymentMethod}
              customPaymentMethods={paymentMethodsData?.custom || []}
              profileImage={profile?.profileImage}
            />
          </TabsContent>

          {/* Tab 2: Account */}
          <TabsContent
            value="account"
            className="mt-0 space-y-6 focus-visible:outline-none focus-visible:ring-0"
          >
            <AccountTabContent />
          </TabsContent>

          {/* Tab 3: Collections */}
          <TabsContent
            value="collections"
            className="mt-0 space-y-6 focus-visible:outline-none focus-visible:ring-0"
          >
            <CollectionsTabContent />
          </TabsContent>
        </div>
      </Tabs>

      {/* Interactive Avatar Crop & Adjust Modal */}
      <ImageCropModal
        open={cropModalOpen}
        imageSrc={cropImageSrc}
        onClose={handleCropClose}
        onConfirm={handleCropConfirm}
        isUploading={isUploadingAvatar}
      />
    </div>
  );
}
