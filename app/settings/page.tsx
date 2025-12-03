"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dropzone,
  DropzoneEmptyState,
  useDropzoneContext,
  formatBytes,
} from "@/components/dropzone";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  TwitterIcon,
  GitHubIcon,
  CodePenIcon,
  LinkedInIcon,
  InstagramIcon,
  YouTubeIcon,
  TwitchIcon,
  FacebookIcon,
} from "@/components/icons/SocialIcons";
import { useSupabaseUpload } from "@/hooks/use-supabase-upload";
import { saveUserSettings, getUserSettings } from "@/app/actions/settings";
import { toast } from "sonner";
import { UserSettings } from "@/types/user-settings";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle, File, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Custom Dropzone Content without upload button
 * Files will be uploaded when user clicks "Save Changes"
 */
const DropzoneContentWithoutButton = ({
  className,
}: {
  className?: string;
}) => {
  const {
    files,
    setFiles,
    successes,
    errors,
    maxFileSize,
    maxFiles,
    isSuccess,
  } = useDropzoneContext();

  const exceedMaxFiles = files.length > maxFiles;

  /**
   * Removes a file from the selected files list
   */
  const handleRemoveFile = (fileName: string) => {
    setFiles(files.filter((file) => file.name !== fileName));
  };

  // Show success message when upload completes
  if (isSuccess) {
    return (
      <div
        className={cn(
          "flex flex-row items-center gap-x-2 justify-center",
          className
        )}
      >
        <CheckCircle size={16} className="text-primary" />
        <p className="text-primary text-sm">Avatar uploaded successfully!</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {/* List all selected files */}
      {files.map((file, idx) => {
        const fileError = errors.find((e) => e.name === file.name);
        const isSuccessfullyUploaded = !!successes.find((e) => e === file.name);

        return (
          <div
            key={`${file.name}-${idx}`}
            className="flex items-center gap-x-4 border-b py-2 first:mt-4 last:mb-4"
          >
            {/* Image preview or generic file icon */}
            {file.type.startsWith("image/") ? (
              <div className="h-10 w-10 rounded border overflow-hidden shrink-0 bg-muted flex items-center justify-center">
                <img
                  src={file.preview}
                  alt={file.name}
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-10 w-10 rounded border bg-muted flex items-center justify-center">
                <File size={18} />
              </div>
            )}

            {/* File name and status */}
            <div className="shrink grow flex flex-col items-start truncate">
              <p title={file.name} className="text-sm truncate max-w-full">
                {file.name}
              </p>
              {/* Show validation errors */}
              {file.errors.length > 0 ? (
                <p className="text-xs text-destructive">
                  {file.errors
                    .map((e) =>
                      e.message.startsWith("File is larger than")
                        ? `File is larger than ${formatBytes(maxFileSize, 2)} (Size: ${formatBytes(file.size, 2)})`
                        : e.message
                    )
                    .join(", ")}
                </p>
              ) : !!fileError ? (
                <p className="text-xs text-destructive">
                  Failed to upload: {fileError.message}
                </p>
              ) : isSuccessfullyUploaded ? (
                <p className="text-xs text-primary">
                  Successfully uploaded file
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {formatBytes(file.size, 2)} • Ready to upload
                </p>
              )}
            </div>

            {/* Remove button */}
            {!isSuccessfullyUploaded && (
              <Button
                size="icon"
                variant="link"
                className="shrink-0 justify-self-end text-muted-foreground hover:text-foreground"
                onClick={() => handleRemoveFile(file.name)}
              >
                <X />
              </Button>
            )}
          </div>
        );
      })}

      {/* Warning if too many files selected */}
      {exceedMaxFiles && (
        <p className="text-sm text-left mt-2 text-destructive">
          You may upload only up to {maxFiles} file, please remove{" "}
          {files.length - maxFiles} file
          {files.length - maxFiles > 1 ? "s" : ""}.
        </p>
      )}
    </div>
  );
};

/**
 * Settings page component
 * Allows users to update their profile information including:
 * - Profile picture (uploaded to Supabase Storage)
 * - Display name
 * - Social media links (website, Twitter, GitHub, etc.)
 */
function Settings() {
  // Form state management
  const [settings, setSettings] = useState<Partial<UserSettings>>({
    avatar_url: null,
    display_name: "",
    website: "",
    twitter: "",
    github: "",
    codepen: "",
    linkedin: "",
    instagram: "",
    youtube: "",
    twitch: "",
    facebook: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);

  // Use ref to store uploaded avatar URL to avoid closure issues
  const uploadedAvatarUrlRef = useRef<string | null>(null);

  // Configure dropzone for avatar upload
  const dropzoneProps = useSupabaseUpload({
    bucketName: "user_avatar",
    path: "",
    allowedMimeTypes: ["image/png", "image/jpeg"],
    maxFiles: 1,
    maxFileSize: 1000 * 1000, // 1MB
    onUploadComplete: (files) => {
      // Update avatar URL when upload completes
      if (files.length > 0) {
        const avatarUrl = files[0].url;
        setCurrentAvatarUrl(avatarUrl);
        uploadedAvatarUrlRef.current = avatarUrl;
        setSettings((prev) => ({ ...prev, avatar_url: avatarUrl }));
      }
    },
    onUploadError: (error) => {
      console.error("Avatar upload error:", error);
    },
  });

  /**
   * Load existing user settings on component mount
   */
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      const result = await getUserSettings();

      if (result.success && result.settings) {
        setSettings(result.settings);
        setCurrentAvatarUrl(result.settings.avatar_url);
      } else if (result.error) {
        toast.error(result.error);
      }

      setIsLoading(false);
    };

    loadSettings();
  }, []);

  /**
   * Updates form field values
   */
  const handleInputChange = (field: keyof UserSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Saves all settings to the database
   * If there are new files selected, upload them first before saving
   */
  const handleSave = async () => {
    setIsSaving(true);

    try {
      let avatarUrlToSave = currentAvatarUrl;

      // Check if there are files to upload
      const hasFilesToUpload =
        dropzoneProps.files.length > 0 && !dropzoneProps.isSuccess;

      if (hasFilesToUpload) {
        // Check if files have validation errors
        const hasErrors = dropzoneProps.files.some(
          (file) => file.errors.length > 0
        );
        if (hasErrors) {
          toast.error("Please fix file validation errors before saving");
          setIsSaving(false);
          return;
        }

        // Upload files first
        toast.loading("Uploading avatar...", { id: "avatar-upload" });

        // Reset ref before upload
        uploadedAvatarUrlRef.current = null;

        await dropzoneProps.onUpload();
        toast.dismiss("avatar-upload");

        // Wait for the onUploadComplete callback to update ref
        // Poll for up to 3 seconds
        let retries = 30; // 30 * 100ms = 3 seconds
        while (retries > 0 && !uploadedAvatarUrlRef.current) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          retries--;
        }

        // Use the uploaded URL if available
        if (uploadedAvatarUrlRef.current) {
          avatarUrlToSave = uploadedAvatarUrlRef.current;
        } else {
          // If ref is still null, something went wrong
          console.error("Upload completed but URL not captured");
          toast.error("Failed to capture uploaded avatar URL");
          setIsSaving(false);
          return;
        }
      }

      // Save settings to database with the correct avatar URL
      const result = await saveUserSettings({
        avatar_url: avatarUrlToSave,
        display_name: settings.display_name || null,
        website: settings.website || null,
        twitter: settings.twitter || null,
        github: settings.github || null,
        codepen: settings.codepen || null,
        linkedin: settings.linkedin || null,
        instagram: settings.instagram || null,
        youtube: settings.youtube || null,
        twitch: settings.twitch || null,
        facebook: settings.facebook || null,
      });

      if (result.success) {
        toast.success("Settings saved successfully!");

        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent("userSettingsUpdated"));
      } else {
        toast.error(result.error || "Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("An error occurred while saving settings");
    }

    setIsSaving(false);
  };

  // Show loading state while fetching settings
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="w-8 h-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl py-8 px-4">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your profile information and social links
          </p>
        </div>

        <div className="space-y-4">
          <Label htmlFor="profile_picture">Profile Picture</Label>
          <div className="flex items-center gap-4">
            <Avatar className="size-20 border">
              <AvatarImage
                src={currentAvatarUrl || undefined}
                alt="Profile picture"
              />
              <AvatarFallback className="text-2xl">
                {settings.display_name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Dropzone {...dropzoneProps} className="w-full">
                <DropzoneEmptyState />
                <DropzoneContentWithoutButton />
              </Dropzone>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Image file (png or jpeg) should be less than 1mb. Preferably a
            square image of at least 150px dimension. Files will be uploaded
            when you click "Save Changes".
          </p>
        </div>

        {/* Display Name */}
        <div className="space-y-2">
          <Label htmlFor="display_name">Display name</Label>
          <InputGroup>
            <InputGroupInput
              id="display_name"
              type="text"
              value={settings.display_name || ""}
              onChange={(e) =>
                handleInputChange("display_name", e.target.value)
              }
              placeholder="Your display name"
            />
          </InputGroup>
        </div>

        {/* Social Links - Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <InputGroup>
              <InputGroupInput
                id="website"
                type="url"
                value={settings.website || ""}
                onChange={(e) => handleInputChange("website", e.target.value)}
              />
            </InputGroup>
          </div>

          {/* Twitter/X */}
          <div className="space-y-2">
            <Label htmlFor="twitter">X(Twitter) username</Label>
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>
                  <TwitterIcon />
                  x.com/
                </InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                id="twitter"
                type="text"
                value={settings.twitter || ""}
                onChange={(e) => handleInputChange("twitter", e.target.value)}
                placeholder=""
              />
            </InputGroup>
          </div>

          {/* GitHub */}
          <div className="space-y-2">
            <Label htmlFor="github">Github username</Label>
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>
                  <GitHubIcon />
                  github.com/
                </InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                id="github"
                type="text"
                value={settings.github || ""}
                onChange={(e) => handleInputChange("github", e.target.value)}
              />
            </InputGroup>
          </div>

          {/* CodePen */}
          <div className="space-y-2">
            <Label htmlFor="codepen">CodePen username</Label>
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>
                  <CodePenIcon />
                  codepen.io/
                </InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                id="codepen"
                type="text"
                value={settings.codepen || ""}
                onChange={(e) => handleInputChange("codepen", e.target.value)}
                placeholder=""
              />
            </InputGroup>
          </div>

          {/* LinkedIn */}
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn username</Label>
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>
                  <LinkedInIcon />
                  linkedin.com/
                </InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                id="linkedin"
                type="text"
                value={settings.linkedin || ""}
                onChange={(e) => handleInputChange("linkedin", e.target.value)}
                placeholder=""
              />
            </InputGroup>
          </div>

          {/* Instagram */}
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram username</Label>
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>
                  <InstagramIcon />
                  instagram.com/
                </InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                id="instagram"
                type="text"
                value={settings.instagram || ""}
                onChange={(e) => handleInputChange("instagram", e.target.value)}
                placeholder=""
              />
            </InputGroup>
          </div>

          {/* YouTube */}
          <div className="space-y-2">
            <Label htmlFor="youtube">Youtube username</Label>
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>
                  <YouTubeIcon />
                  youtube.com/
                </InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                id="youtube"
                type="text"
                value={settings.youtube || ""}
                onChange={(e) => handleInputChange("youtube", e.target.value)}
                placeholder=""
              />
            </InputGroup>
          </div>

          {/* Twitch */}
          <div className="space-y-2">
            <Label htmlFor="twitch">Twitch username</Label>
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>
                  <TwitchIcon />
                  twitch.tv/
                </InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                id="twitch"
                type="text"
                value={settings.twitch || ""}
                onChange={(e) => handleInputChange("twitch", e.target.value)}
                placeholder=""
              />
            </InputGroup>
          </div>

          {/* Facebook */}
          <div className="space-y-2">
            <Label htmlFor="facebook">Facebook username</Label>
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>
                  <FacebookIcon />
                  facebook.com/
                </InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                id="facebook"
                type="text"
                value={settings.facebook || ""}
                onChange={(e) => handleInputChange("facebook", e.target.value)}
                placeholder=""
              />
            </InputGroup>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t">
          <Button onClick={handleSave} disabled={isSaving} size="lg">
            {isSaving ? (
              <>
                <Spinner className="w-4 h-4 text-primary" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
