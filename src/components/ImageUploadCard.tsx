import { useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IconPhoto,
  IconUpload,
  IconX,
  IconAlertCircle,
  IconTrash,
} from "@tabler/icons-react";
import { storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { toast } from "sonner";

interface ImageUploadCardProps {
  title: string;
  description: string;
  imageUrl?: string | null;
  riderId: string;
  imageType: "car" | "plateNumber" | "driverLicense" | "vehicleLicense";
  onUploadComplete: (downloadUrl: string) => void;
  onDeleteComplete: () => void;
  disabled?: boolean;
}

export function ImageUploadCard({
  title,
  description,
  imageUrl,
  riderId,
  imageType,
  onUploadComplete,
  onDeleteComplete,
  disabled = false,
}: ImageUploadCardProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const validTypes = ["image/png", "image/jpeg", "image/jpg"];

      if (validTypes.includes(file.type)) {
        setSelectedFile(file);
        handleUpload(file);
      } else {
        toast.error("Please upload an image file (PNG, JPG)");
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    multiple: false,
    disabled: uploading || disabled,
  });

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      setUploadProgress(0);

      // Get file extension
      const fileExtension = file.name.split(".").pop() || "jpg";

      // Create reference: riders/{riderId}/verification/{imageType}_{timestamp}.{ext}
      const timestamp = Date.now();
      const fileName = `${imageType}_${timestamp}.${fileExtension}`;
      const storageRef = ref(
        storage,
        `riders/${riderId}/verification/${fileName}`,
      );

      // Upload file with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        (error) => {
          console.error("Upload error:", error);
          toast.error("Failed to upload image");
          setUploading(false);
          setSelectedFile(null);
        },
        async () => {
          // Upload completed successfully
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          toast.success("Image uploaded successfully");
          onUploadComplete(downloadURL);
          setUploading(false);
          setSelectedFile(null);
        },
      );
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
      setUploading(false);
      setSelectedFile(null);
    }
  };

  const handleDelete = async () => {
    if (!imageUrl) return;

    try {
      setDeleting(true);

      // Call parent callback to handle deletion
      // Parent will delete from Storage AND update Firestore
      await onDeleteComplete();

      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete image");
    } finally {
      setDeleting(false);
    }
  };

  const cancelUpload = () => {
    setSelectedFile(null);
    setUploading(false);
    setUploadProgress(0);
  };

  // If image exists, show it
  if (imageUrl) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="relative  min-w-62.5 min-h-100  rounded-lg overflow-hidden border"
            style={{
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              // backgroundAttachment: "fixed",
            }}
          >
            {/* <img
              src={imageUrl}
              alt={title}
              className="w-full h-auto max-h-[400px] object-contain bg-muted"
            /> */}
          </div>
          {/* <p className="text-xs text-muted-foreground mt-2 text-center">
            Image uploaded successfully
          </p> */}
          {!disabled && (
            <>
              <Button
                variant="destructiveGhost"
                className="mt-2 w-full rounded-full"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={deleting}
              >
                <IconTrash className="size-4" />
                {deleting ? "Deleting..." : "Delete"}
              </Button>

              {/* Delete Confirmation Dialog */}
              <Dialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete {title}?</DialogTitle>
                    <DialogDescription>
                      This will permanently delete the {title.toLowerCase()}.
                      This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setDeleteDialogOpen(false)}
                      disabled={deleting}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      {deleting ? "Deleting..." : "Delete"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  // If no image, show upload interface
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {uploading ? (
          // Upload Progress State
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-6 border-2 border-dashed rounded-lg bg-accent/30">
              <div className="flex-shrink-0">
                <IconPhoto className="h-12 w-12 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium truncate">
                    {selectedFile?.name}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 flex-shrink-0"
                    onClick={cancelUpload}
                  >
                    <IconX className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Upload Dropzone State
          <div
            {...getRootProps()}
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
              isDragActive
                ? "border-primary bg-primary/5 scale-[1.02]"
                : "border-muted-foreground/25 hover:border-primary hover:bg-accent/50"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <input {...getInputProps()} />

            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-muted p-4">
                <IconUpload
                  className={`h-8 w-8 ${
                    isDragActive ? "text-primary" : "text-muted-foreground"
                  }`}
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {isDragActive
                    ? "Drop the image here"
                    : "No image uploaded yet"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isDragActive
                    ? "Release to upload"
                    : "Drag and drop an image here, or click to browse"}
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled}
                className="mt-2"
              >
                <IconUpload className="mr-2 h-4 w-4" />
                Select Image
              </Button>

              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                <IconAlertCircle className="h-3.5 w-3.5" />
                <span>PNG or JPG images only</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
