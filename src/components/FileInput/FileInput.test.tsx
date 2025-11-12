import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { FileInput } from './FileInput';

describe('FileInput', () => {
  it.each([
    [['.xlsx'], '.xlsx'],
    [['.xlsx', '.csv'], '.xlsx,.csv'],
  ])(
    'renders a file input with single expected accept attributes',
    (acceptedFileTypes, expectedAccept) => {
      const onFileSelect = vi.fn();
      render(
        <FileInput
          label="select file"
          acceptedFileTypes={acceptedFileTypes}
          onFileSelect={onFileSelect}
        />,
      );

      const fileInput = screen.getByLabelText(
        'select file',
      ) as HTMLInputElement;
      expect(fileInput).toBeInTheDocument();
      expect(fileInput.type).toBe('file');
      expect(fileInput.accept).toBe(expectedAccept);
    },
  );

  it('renders a file input with multiple expected accept attributes', () => {
    const onFileSelect = vi.fn();
    render(
      <FileInput
        label="select file"
        acceptedFileTypes={['.xlsx', '.csv']}
        onFileSelect={onFileSelect}
      />,
    );

    const fileInput = screen.getByLabelText('select file') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();
    expect(fileInput.type).toBe('file');
    expect(fileInput.accept).toBe('.xlsx,.csv');
  });

  it('calls onFileSelect callback with File object when file is selected', async () => {
    const user = userEvent.setup();
    const onFileSelect = vi.fn();
    render(<FileInput label="select file" onFileSelect={onFileSelect} />);

    const fileInput = screen.getByLabelText('select file') as HTMLInputElement;
    const file = new File(['test content'], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    await user.upload(fileInput, file);

    expect(onFileSelect).toHaveBeenCalledTimes(1);
    expect(onFileSelect).toHaveBeenCalledWith(file);
  });

  it('calls onError callback when file selection fails', () => {
    const onFileSelect = vi.fn();
    const onError = vi.fn();
    render(
      <FileInput
        label="select file"
        acceptedFileTypes={['.xlsx']}
        onFileSelect={onFileSelect}
        onError={onError}
      />,
    );

    const fileInput = screen.getByLabelText('select file') as HTMLInputElement;

    // Simulate an error by triggering change event with no files
    Object.defineProperty(fileInput, 'files', {
      value: null,
      writable: false,
    });

    fireEvent.change(fileInput);

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(new Error('File selection failed'));
  });

  it('handles file input change events correctly', async () => {
    const user = userEvent.setup();
    const onFileSelect = vi.fn();
    render(<FileInput label="select file" onFileSelect={onFileSelect} />);

    const fileInput = screen.getByLabelText('select file') as HTMLInputElement;
    const file = new File(['content'], 'data.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    await user.upload(fileInput, file);

    expect(fileInput.files).toHaveLength(1);
    expect(fileInput.files?.[0]).toBe(file);
    expect(onFileSelect).toHaveBeenCalledWith(file);
  });
});
