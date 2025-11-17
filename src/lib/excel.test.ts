import readXlsxFile, { type CellValue, type Row } from 'read-excel-file';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  Category,
  PaymentClass,
  PaymentSubclass,
  readExcelFile,
} from './excel';

vi.mock('read-excel-file', () => ({
  default: vi.fn(),
}));

const mockReadXlsxFile = vi.mocked(readXlsxFile);

interface RawRow {
  valueDate: CellValue;
  entryDate: CellValue;
  paymentClass: CellValue;
  paymentSubclass: CellValue;
  category: CellValue;
  payer: CellValue;
  description: CellValue;
  additionalInfo: CellValue;
  totalSum: CellValue;
}

const baseRow: RawRow = {
  valueDate: '01.01.2024',
  entryDate: '02.01.2024',
  paymentClass: PaymentClass.Expense,
  paymentSubclass: PaymentSubclass.OutboundPayment,
  category: Category.ServiceFee,
  payer: 'Payer',
  description: 'Description',
  additionalInfo: 'Info',
  totalSum: 123.45,
};

const createRawRow = (overrides: Partial<RawRow> = {}): Row => {
  const row = {
    ...baseRow,
    ...overrides,
  };

  return [
    row.valueDate,
    row.entryDate,
    row.paymentClass,
    row.paymentSubclass,
    row.category,
    row.payer,
    row.description,
    row.additionalInfo,
    row.totalSum,
  ] as Row;
};

const createRowsWithHeaders = (dataRows: Row[]): Row[] => [
  ...Array.from({ length: 6 }, () => [] as Row),
  ...dataRows,
];

describe('readExcelFile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reads and maps valid rows into OutputRowData objects', async () => {
    const file = { name: 'mock.xlsx' } as File;
    const rows = createRowsWithHeaders([
      createRawRow({
        payer: 'ACME Oy',
        totalSum: '456.78',
      }),
    ]);

    mockReadXlsxFile.mockResolvedValue(rows);

    const result = await readExcelFile(file);

    expect(mockReadXlsxFile).toHaveBeenCalledWith(
      file,
      expect.objectContaining({ dateFormat: 'dd.mm.yyyy' }),
    );
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      date: new Date(2024, 0, 1),
      receiptNumber: 1,
      total: 456.78,
      payeeOrPayer: 'Acme Oy',
      bankingFee: 456.78,
      description: 'Holvi, palvelumaksu',
    });
  });

  it('skips rows with non-string dates', async () => {
    const rows = createRowsWithHeaders([
      createRawRow({
        valueDate: 42,
        entryDate: 24,
      }),
    ]);

    mockReadXlsxFile.mockResolvedValue(rows);

    const result = await readExcelFile({} as File);

    expect(result).toHaveLength(0);
  });

  it('throws when encountering an invalid payment class', async () => {
    const rows = createRowsWithHeaders([
      createRawRow({
        paymentClass: 'invalid-class',
      }),
    ]);

    mockReadXlsxFile.mockResolvedValue(rows);

    await expect(readExcelFile({} as File)).rejects.toThrow(
      /Invalid paymentClass/,
    );
  });

  it('throws when encountering an invalid payment subclass', async () => {
    const rows = createRowsWithHeaders([
      createRawRow({
        paymentSubclass: 'invalid-subclass',
      }),
    ]);

    mockReadXlsxFile.mockResolvedValue(rows);

    await expect(readExcelFile({} as File)).rejects.toThrow(
      /Invalid paymentSubclass/,
    );
  });

  it('throws when encountering an invalid category', async () => {
    const rows = createRowsWithHeaders([
      createRawRow({
        category: 'invalid-category',
      }),
    ]);

    mockReadXlsxFile.mockResolvedValue(rows);

    await expect(readExcelFile({} as File)).rejects.toThrow(/Invalid category/);
  });

  it('throws a TypeError for invalid totalSum values', async () => {
    const rows = createRowsWithHeaders([
      createRawRow({
        totalSum: 'not-a-number',
      }),
    ]);

    mockReadXlsxFile.mockResolvedValue(rows);

    await expect(readExcelFile({} as File)).rejects.toThrow(/Invalid totalSum/);
  });
});
