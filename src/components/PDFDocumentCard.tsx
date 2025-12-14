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
  IconFileTypePdf,
  IconExternalLink,
  IconUpload,
  IconX,
  IconAlertCircle,
  IconPhoto,
  IconTrash,
} from "@tabler/icons-react";
import { storage } from "@/lib/firebase";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { toast } from "sonner";

interface PDFDocumentCardProps {
  title: string;
  description: string;
  documentUrl?: string | null;
  userId: string;
  documentType: "packingList" | "invoice";
  onUploadComplete: (downloadUrl: string) => void;
  onDeleteComplete: () => void;
  disabled?: boolean;
}

export function PDFDocumentCard({
  title,
  description,
  documentUrl,
  userId,
  documentType,
  onUploadComplete,
  onDeleteComplete,
  disabled = false,
}: PDFDocumentCardProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Helper to check if URL is a PDF
  const isPDF = (url: string) => {
    return (
      url.toLowerCase().includes(".pdf") || url.toLowerCase().includes("pdf?")
    );
  };

  // Helper to check if file is an image
  const isImage = (file: File) => {
    return file.type.startsWith("image/");
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const validTypes = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/jpg",
      ];

      if (validTypes.includes(file.type) || file.type.startsWith("image/")) {
        setSelectedFile(file);
        handleUpload(file);
      } else {
        toast.error("Please upload a PDF or image file (PNG, JPG)");
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
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

      // Get file extension from the uploaded file
      const fileExtension = file.name.split(".").pop() || "pdf";

      // Create reference: customclearance/{userId}/{timestamp}_{documentType}.{extension}
      const timestamp = Date.now();
      const fileName = `${timestamp}_${documentType}.${fileExtension}`;
      const storageRef = ref(storage, `customclearance/${userId}/${fileName}`);

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
          toast.error("Failed to upload document");
          setUploading(false);
          setSelectedFile(null);
        },
        async () => {
          // Upload completed successfully
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          toast.success("Document uploaded successfully");
          onUploadComplete(downloadURL);
          setUploading(false);
          setSelectedFile(null);
        }
      );
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload document");
      setUploading(false);
      setSelectedFile(null);
    }
  };

  const handleDelete = async () => {
    if (!documentUrl) return;

    try {
      setDeleting(true);

      // Create storage reference from the URL
      const storageRef = ref(storage, documentUrl);

      // Delete the file from Firebase Storage
      await deleteObject(storageRef);

      toast.success("Document deleted successfully");
      onDeleteComplete();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete document");
    } finally {
      setDeleting(false);
    }
  };

  const cancelUpload = () => {
    setSelectedFile(null);
    setUploading(false);
    setUploadProgress(0);
  };

  // If document exists, show view-only card
  if (documentUrl) {
    const documentIsPDF = isPDF(documentUrl);

    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-6 border-2 border-dashed rounded-lg hover:border-primary hover:bg-accent/50 transition-colors group">
            <div className="flex-shrink-0">
              {documentIsPDF ? (
                <IconFileTypePdf className="h-16 w-16 text-red-500" />
              ) : (
                <IconPhoto className="h-16 w-16 text-blue-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                {title} ({documentIsPDF ? "PDF" : "Image"})
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Click icons to view or delete
              </p>
            </div>

            {/* Action Icons */}
            <div className="flex items-center gap-2">
              <a
                href={documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  title="View document"
                >
                  <IconExternalLink className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                </Button>
              </a>

              {!disabled && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={deleting}
                  title="Delete document"
                >
                  <IconTrash className="h-5 w-5 text-destructive hover:text-destructive/80 transition-colors" />
                </Button>
              )}
            </div>
          </div>

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogDescription>
                  This will permanently delete the {title.toLowerCase()}{" "}
                  document. This action cannot be undone.
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
        </CardContent>
      </Card>
    );
  }

  // If no document, show upload interface
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
                {selectedFile && isImage(selectedFile) ? (
                  <IconPhoto className="h-12 w-12 text-blue-500" />
                ) : (
                  <IconFileTypePdf className="h-12 w-12 text-red-500" />
                )}
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
                    ? "Drop the file here"
                    : "You don't have a document yet"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isDragActive
                    ? "Release to upload"
                    : "Drag and drop a PDF or image file here, or click to browse"}
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
                Select File
              </Button>

              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                <IconAlertCircle className="h-3.5 w-3.5" />
                <span>PDF or image files (PNG, JPG)</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
