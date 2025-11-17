import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  beforeEach,
  describe,
  expect,
  it,
  type MockedFunction,
  vi,
} from 'vitest';

import App from './App';
import { type OutputRowData, readExcelFile } from './lib/excel';

vi.mock('./lib/excel', async () => {
  const actual =
    await vi.importActual<typeof import('./lib/excel')>('./lib/excel');

  return {
    ...actual,
    readExcelFile: vi.fn(),
  };
});

const mockReadExcelFile = readExcelFile as MockedFunction<typeof readExcelFile>;

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
}

function createDeferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

function createRow(overrides?: Partial<OutputRowData>): OutputRowData {
  return {
    date: new Date('2024-01-01T00:00:00.000Z'),
    description: 'Holvi, palvelumaksu',
    payeeOrPayer: 'Payer',
    receiptNumber: 1,
    total: 42,
    bankingFee: 42,
    ...overrides,
  };
}

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders parsed rows after a successful file import', async () => {
    const user = userEvent.setup();
    const rows: OutputRowData[] = [
      createRow({ description: 'first row', total: 7 }),
    ];

    mockReadExcelFile.mockResolvedValueOnce(rows);

    render(<App />);

    const fileInput = screen.getByLabelText('Select file');
    const file = new File(['mock content'], 'transactions.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText(rows[0]!.description)).toBeInTheDocument();
      expect(screen.getByText(String(rows[0]!.total))).toBeInTheDocument();
    });

    expect(mockReadExcelFile).toHaveBeenCalledTimes(1);
    expect(mockReadExcelFile).toHaveBeenCalledWith(file);
  });

  it('shows an error message when parsing fails', async () => {
    const user = userEvent.setup();
    const error = new Error('Parsing failed');

    mockReadExcelFile.mockRejectedValueOnce(error);

    render(<App />);

    const fileInput = screen.getByLabelText('Select file');
    const file = new File(['mock content'], 'broken.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText('Ruh roh')).toBeInTheDocument();
    });

    expect(screen.getByText(`Selected file: ${file.name}`)).toBeInTheDocument();
    expect(mockReadExcelFile).toHaveBeenCalledTimes(1);
  });

  it('ignores stale parsing results when a newer file is selected', async () => {
    const user = userEvent.setup();

    const firstRows: OutputRowData[] = [
      createRow({ description: 'first description', total: 11 }),
    ];
    const secondRows: OutputRowData[] = [
      createRow({ description: 'second description', total: 22 }),
    ];

    const firstDeferred = createDeferred<OutputRowData[]>();
    mockReadExcelFile.mockReturnValueOnce(firstDeferred.promise);
    mockReadExcelFile.mockResolvedValueOnce(secondRows);

    render(<App />);

    const fileInput = screen.getByLabelText('Select file');
    const firstFile = new File(['first'], 'first.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const secondFile = new File(['second'], 'second.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    await user.upload(fileInput, firstFile);
    await user.upload(fileInput, secondFile);

    await waitFor(() => {
      expect(
        screen.getByText(`Selected file: ${secondFile.name}`),
      ).toBeInTheDocument();
      expect(screen.getByText(secondRows[0]!.description)).toBeInTheDocument();
    });

    firstDeferred.resolve(firstRows);

    await waitFor(() => {
      expect(
        screen.queryByText(firstRows[0]!.description),
      ).not.toBeInTheDocument();
      expect(screen.getByText(secondRows[0]!.description)).toBeInTheDocument();
    });
  });
});
