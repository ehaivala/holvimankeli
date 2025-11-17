import readXlsxFile from 'read-excel-file';

import { parseDateStr } from './utils/date';
import { capitalizeAll, isString } from './utils/string';

export enum PaymentClass {
  Expense = 'expense',
  Income = 'income',
}

export enum PaymentSubclass {
  OutboundPayment = 'outboundpayment',
  Order = 'order',
  IbanPayment = 'iban_payment',
}

export enum Category {
  ServiceFee = 'Palvelumaksut',
  MembershipFee = 'Jäsenmaksu',
  Merchandice = 'Myyntiartikkelit',
  GeneralExpense = 'Yleiset menot',
  Lanparty = 'Lanit',
}

export function isPaymentClass(value: unknown): value is PaymentClass {
  return Object.values(PaymentClass).includes(value as PaymentClass);
}

export function isPaymentSubclass(value: unknown): value is PaymentSubclass {
  return Object.values(PaymentSubclass).includes(value as PaymentSubclass);
}

export function isCategory(value: unknown): value is Category {
  return Object.values(Category).includes(value as Category);
}

export type ExcelRowData = {
  valueDate: Date;
  entryDate: Date;
  paymentClass: PaymentClass;
  paymentSubclass: PaymentSubclass;
  category: string;
  payer: string;
  description: string;
  additionalInfo: string;
  totalSum: number;
};

/**
 * Reads an Excel file and returns an array of objects.
 * Data starts from row 7 (0-indexed row 6).
 * Columns A-I are mapped to the object properties.
 *
 * @param file - The Excel file to read
 * @returns Promise that resolves to an array of ExcelRowData objects
 * @throws Error if the file cannot be read or parsed
 */
export async function readExcelFile(file: File): Promise<OutputRowData[]> {
  // Read the Excel file starting from row 7 (0-indexed: 6)
  // Columns A-I (0-indexed: 0-8)
  const rows = await readXlsxFile(file, { dateFormat: 'dd.mm.yyyy' });

  // Skip first 6 rows (rows 0-5), start from row 6 (which is row 7 in Excel)
  const dataRows = rows.slice(6);

  // Map rows to ExcelRowData objects
  const result: OutputRowData[] = [];

  for (const row of dataRows) {
    // Extract columns A-I (indices 0-8)
    const [
      valueDate,
      entryDate,
      paymentClass,
      paymentSubclass,
      category,
      payer,
      description,
      additionalInfo,
      totalSum,
    ] = row;

    const parsedValueDate = isString(valueDate)
      ? parseDateStr(valueDate)
      : null;
    const parsedEntryDate = isString(entryDate)
      ? parseDateStr(entryDate)
      : null;

    if (!parsedValueDate || !parsedEntryDate) {
      continue;
    }

    if (!isPaymentClass(paymentClass)) {
      throw new Error(
        `Invalid paymentClass: ${paymentClass}. Expected one of: ${Object.values(PaymentClass).join(', ')}`,
      );
    }

    if (!isPaymentSubclass(paymentSubclass)) {
      throw new Error(
        `Invalid paymentSubclass: ${paymentSubclass}. Expected one of: ${Object.values(PaymentSubclass).join(', ')}`,
      );
    }

    if (!isCategory(category)) {
      throw new Error(
        `Invalid category: ${category}. Expected one of: ${Object.values(Category).join(', ')}`,
      );
    }

    // Convert totalSum to number
    const parsedTotalSum =
      typeof totalSum === 'number'
        ? totalSum
        : typeof totalSum === 'string'
          ? Number.parseFloat(totalSum)
          : Number(totalSum);

    if (Number.isNaN(parsedTotalSum)) {
      throw new TypeError(`Invalid totalSum: ${totalSum}`);
    }

    result.push(
      transformRow(
        {
          valueDate: parsedValueDate,
          entryDate: parsedEntryDate,
          paymentClass: paymentClass,
          paymentSubclass: paymentSubclass,
          category: category,
          payer: String(payer ?? '').toLowerCase(),
          description: String(description ?? ''),
          additionalInfo: String(additionalInfo ?? ''),
          totalSum: parsedTotalSum,
        },
        result.length + 1,
      ),
    );
  }

  return result;
}

export type OutputRowData = {
  date: Date;
  description: string;
  payeeOrPayer: string;
  receiptNumber: number;
  total: number;
  membershipFee?: number;
  participationFee?: number;
  rentExpense?: number;
  otherExpense?: number;
  bankingFee?: number;
  interestRevenue?: number;
  tax?: number;
};

export function transformRow(row: ExcelRowData, index: number): OutputRowData {
  const staticOutput = {
    date: row.valueDate,
    receiptNumber: index,
    total: row.totalSum,
  };

  if (row.category === Category.ServiceFee) {
    return {
      ...staticOutput,
      payeeOrPayer: capitalizeAll(row.payer.toLowerCase()),
      bankingFee: row.totalSum,
      description: 'Holvi, palvelumaksu',
    };
  }

  if (row.category === Category.MembershipFee) {
    const name = capitalizeAll(row.payer.toLowerCase());
    return {
      ...staticOutput,
      payeeOrPayer: name,
      membershipFee: row.totalSum,
      description: `${row.description}`,
    };
  }

  if (row.category === Category.Merchandice) {
    const name = capitalizeAll(row.payer.toLowerCase());
    return {
      ...staticOutput,
      payeeOrPayer: name,
      otherExpense: row.totalSum,
      description: `Verkkokauppaosto: ${row.description}`,
    };
  }

  if (row.paymentClass === PaymentClass.Expense) {
    return {
      ...staticOutput,
      payeeOrPayer: capitalizeAll(row.payer.toLowerCase()),
      otherExpense: row.totalSum,
      description: row.description,
    };
  }

  if (row.category === Category.Lanparty) {
    return {
      ...staticOutput,
      payeeOrPayer: capitalizeAll(row.payer.toLowerCase()),
      participationFee: row.totalSum,
      description: `${row.description}`,
    };
  }

  return {
    ...staticOutput,
    payeeOrPayer: 'UNDEFINED',
    description: 'UNDEFINED',
  };
}
