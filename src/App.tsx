import { useState } from 'react';

import { FileInput } from './components/FileInput/FileInput';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File): void => {
    setSelectedFile(file);
  };

  const handleError = (error: Error): void => {
    console.error('File selection error:', error);
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
      </main>
    </div>
  );
}

export default App;
