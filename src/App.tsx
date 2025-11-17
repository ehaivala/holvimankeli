import { useRef, useState } from 'react';

import { FileInput } from './components/FileInput/FileInput';
import { OutputRowData, readExcelFile } from './lib/excel';

function App() {
  const fileRef = useRef<File | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [hasError, setHasError] = useState(false);
  const [rows, setRows] = useState<OutputRowData[]>([]);

  const handleFileSelect = (file: File) => {
    fileRef.current = file;
    setHasError(false);
    setSelectedFile(file);
    setRows([]);

    readExcelFile(file)
      .then((rows) => {
        if (fileRef.current === file) {
          setRows(rows);
        }
      })
      .catch((_error) => {
        if (fileRef.current === file) {
          setHasError(true);
          setRows([]);
        }
      });
  };

  const handleError = (_error: Error): void => {
    setHasError(true);
  };

  return (
    <div className="App">
      <header>
        <h1>Holvimankeli</h1>
      </header>
      <main>
        <FileInput
          label="Select file"
          acceptedFileTypes={['.xlsx']}
          onFileSelect={handleFileSelect}
          onError={handleError}
        />
        {hasError && <p>Ruh roh</p>}
        {selectedFile !== null && <p>Selected file: {selectedFile.name}</p>}
        {selectedFile !== null && rows.length > 0 && (
          <div>
            <table>
              <thead>
                <tr>
                  <td>Pvm</td>
                  <td>Selite</td>
                  <td>Maksaja/Saaja</td>
                  <td>Tosite nro.</td>
                  <td>Tili</td>
                  <td>Jäsenmaksut</td>
                  <td>Osallistumismaksut</td>
                  <td>Vuokrakulut</td>
                  <td>Muut</td>
                  <td>Pankkikulut</td>
                  <td>Korkotuotot</td>
                  <td>Vero</td>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={`row-${index}`}>
                    <td>{row.date.toLocaleDateString()}</td>
                    <td>{row.description}</td>
                    <td>{row.payeeOrPayer}</td>
                    <td>{row.receiptNumber}</td>
                    <td>{row.total}</td>
                    <td>{row.membershipFee}</td>
                    <td>{row.participationFee}</td>
                    <td>{row.rentExpense}</td>
                    <td>{row.otherExpense}</td>
                    <td>{row.bankingFee}</td>
                    <td>{row.interestRevenue}</td>
                    <td>{row.tax}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
