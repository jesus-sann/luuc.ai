"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  acceptedTypes?: string[];
}

export function FileUpload({
  onFileSelect,
  isLoading = false,
  acceptedTypes = [".pdf", ".docx", ".doc", ".txt"],
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setSelectedFile(file);
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/msword": [".doc"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
    disabled: isLoading,
  });

  const removeFile = () => {
    setSelectedFile(null);
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-slate-300 hover:border-slate-400",
            isLoading && "cursor-not-allowed opacity-50"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="mb-4 h-12 w-12 text-slate-400" />
          {isDragActive ? (
            <p className="text-sm text-blue-600">Suelta el archivo aquí...</p>
          ) : (
            <>
              <p className="mb-1 text-sm font-medium text-slate-700">
                Arrastra un archivo o haz clic para seleccionar
              </p>
              <p className="text-xs text-slate-500">
                Formatos soportados: {acceptedTypes.join(", ")}
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            {isLoading ? (
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            ) : (
              <File className="h-8 w-8 text-blue-600" />
            )}
            <div>
              <p className="text-sm font-medium text-slate-700">
                {selectedFile.name}
              </p>
              <p className="text-xs text-slate-500">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          {!isLoading && (
            <button
              onClick={removeFile}
              className="rounded-full p-1 hover:bg-slate-200"
            >
              <X className="h-5 w-5 text-slate-500" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
