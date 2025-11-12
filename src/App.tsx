import { useState } from 'react';

import { FileInput } from './components/FileInput/FileInput';

function App() {
  const [hasError, setHasError] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File): void => {
    setHasError(false);
    setSelectedFile(file);
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
        {selectedFile !== null && <p>Selected file: {selectedFile.name}</p>}
        {hasError && <p>Ruh roh</p>}
      </main>
    </div>
  );
}

export default App;
