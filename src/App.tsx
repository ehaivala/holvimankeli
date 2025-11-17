import { useRef, useState } from 'react';

import { FileInput } from './components/FileInput/FileInput';
import { ExcelRowData, readExcelFile } from './lib/excel';

function App() {
  const fileRef = useRef<File | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [hasError, setHasError] = useState(false);
  const [rows, setRows] = useState<ExcelRowData[]>([]);

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
                  <th>Value date</th>
                  <th>Entry date</th>
                  <th>Payment class</th>
                  <th>Payment subclass</th>
                  <th>Category</th>
                  <th>Payer</th>
                  <th>Description</th>
                  <th>Additional info</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={`row-${index}`}>
                    <td>{row.valueDate.toISOString()}</td>
                    <td>{row.entryDate.toISOString()}</td>
                    <td>{row.paymentClass}</td>
                    <td>{row.paymentSubclass}</td>
                    <td>{row.category}</td>
                    <td>{row.payer}</td>
                    <td>{row.description}</td>
                    <td>{row.additionalInfo}</td>
                    <td>{row.totalSum}</td>
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
