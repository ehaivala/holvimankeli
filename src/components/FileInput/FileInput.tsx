import React, { useId } from 'react';

interface FileInputProps {
  label: string;
  acceptedFileTypes?: string[];
  onFileSelect: (file: File) => void;
  onError?: (error: Error) => void;
}

export function FileInput({
  label,
  acceptedFileTypes,
  onFileSelect,
  onError,
}: FileInputProps) {
  const inputId = useId();

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const fileInput = event.target;
    const files = fileInput.files;

    if (files === null || files.length === 0) {
      if (onError !== undefined) {
        onError(new Error('File selection failed'));
      }
      return;
    }

    const file = files[0];

    if (file === undefined) {
      if (onError !== undefined) {
        onError(new Error('File selection failed'));
      }
      return;
    }

    try {
      onFileSelect(file);
    } catch (error) {
      if (onError !== undefined) {
        onError(error instanceof Error ? error : new Error(String(error)));
      }
    }
  };

  return (
    <div>
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        type="file"
        accept={acceptedFileTypes ? acceptedFileTypes.join(',') : undefined}
        onChange={handleFileChange}
        aria-label={label}
      />
    </div>
  );
}
