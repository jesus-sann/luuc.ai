"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, Loader2, Files } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFilesSelect?: (files: File[]) => void;
  isLoading?: boolean;
  acceptedTypes?: string[];
  multiple?: boolean;
  maxFiles?: number;
}

export function FileUpload({
  onFileSelect,
  onFilesSelect,
  isLoading = false,
  acceptedTypes = [".pdf", ".docx", ".doc", ".txt"],
  multiple = false,
  maxFiles = 10,
}: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        if (multiple) {
          const newFiles = [...selectedFiles, ...acceptedFiles].slice(0, maxFiles);
          setSelectedFiles(newFiles);
          onFilesSelect?.(newFiles);
        } else {
          const file = acceptedFiles[0];
          setSelectedFiles([file]);
          onFileSelect(file);
        }
      }
    },
    [onFileSelect, onFilesSelect, multiple, maxFiles, selectedFiles]
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
    maxFiles: multiple ? maxFiles : 1,
    disabled: isLoading,
    multiple,
  });

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    if (multiple) {
      onFilesSelect?.(newFiles);
    } else if (newFiles.length === 0) {
      // Reset for single file mode
    }
  };

  const removeAllFiles = () => {
    setSelectedFiles([]);
    onFilesSelect?.([]);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="w-full space-y-3">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
          isDragActive
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
            : "border-slate-300 hover:border-slate-400 dark:border-slate-600 dark:hover:border-slate-500",
          isLoading && "cursor-not-allowed opacity-50",
          selectedFiles.length > 0 && !multiple && "hidden"
        )}
      >
        <input {...getInputProps()} />
        {multiple ? (
          <Files className="mb-3 h-10 w-10 text-slate-400" />
        ) : (
          <Upload className="mb-3 h-10 w-10 text-slate-400" />
        )}
        {isDragActive ? (
          <p className="text-sm text-blue-600">
            {multiple ? "Suelta los archivos aquí..." : "Suelta el archivo aquí..."}
          </p>
        ) : (
          <>
            <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">
              {multiple
                ? "Arrastra archivos o haz clic para seleccionar"
                : "Arrastra un archivo o haz clic para seleccionar"}
            </p>
            <p className="text-xs text-slate-500">
              {multiple
                ? `Hasta ${maxFiles} archivos • ${acceptedTypes.join(", ")}`
                : `Formatos soportados: ${acceptedTypes.join(", ")}`}
            </p>
          </>
        )}
      </div>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          {/* Header for multiple files */}
          {multiple && selectedFiles.length > 1 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">
                {selectedFiles.length} {selectedFiles.length === 1 ? "archivo" : "archivos"} seleccionados
              </span>
              {!isLoading && (
                <button
                  onClick={removeAllFiles}
                  className="text-xs text-red-600 hover:text-red-700 dark:text-red-400"
                >
                  Eliminar todos
                </button>
              )}
            </div>
          )}

          {/* File cards */}
          {selectedFiles.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {isLoading ? (
                  <Loader2 className="h-6 w-6 flex-shrink-0 animate-spin text-blue-600" />
                ) : (
                  <File className="h-6 w-6 flex-shrink-0 text-blue-600" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-300">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              {!isLoading && (
                <button
                  onClick={() => removeFile(index)}
                  className="ml-2 rounded-full p-1 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  <X className="h-4 w-4 text-slate-500" />
                </button>
              )}
            </div>
          ))}

          {/* Add more files button (for multiple mode) */}
          {multiple && selectedFiles.length < maxFiles && !isLoading && (
            <div
              {...getRootProps()}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-500 transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-600 dark:hover:border-blue-500 dark:hover:bg-blue-950/20"
            >
              <input {...getInputProps()} />
              <Upload className="h-4 w-4" />
              <span>Agregar más archivos</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
