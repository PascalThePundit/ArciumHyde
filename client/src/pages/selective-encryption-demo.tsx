import React, { useState } from 'react';
import Layout from '../components/Layout';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';

const SelectiveEncryptionDemoPage: React.FC = () => {
  const [medicalData, setMedicalData] = useState('');
  const [encryptedData, setEncryptedData] = useState<string | null>(null);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEncrypted, setIsEncrypted] = useState(false);

  const handleEncrypt = async () => {
    if (!medicalData.trim()) {
      alert("Please enter medical data first");
      return;
    }
    
    setIsLoading(true);
    setEncryptedData(null);
    setIsEncrypted(false);
    
    // Simulate selective encryption process
    setTimeout(() => {
      // Create a realistic encrypted record using base64 encoding to simulate encryption
      const encodedData = btoa(medicalData); // This is mock "encryption" for demo purposes
      const mockEncrypted = `AES-256-ENCRYPTED-PATIENT-RECORD:${encodedData}:${Math.random().toString(36).substr(2, 8)}`;
      setEncryptedData(mockEncrypted);
      setIsEncrypted(true);
      setIsLoading(false);
    }, 1500);
  };

  const handleDecrypt = async () => {
    if (!encryptedData || !isEncrypted) {
      return;
    }
    
    setIsLoading(true);
    
    // Simulate decryption process
    setTimeout(() => {
      // Handle the format: AES-256-ENCRYPTED-PATIENT-RECORD:encodedData:randomString
      const parts = encryptedData.split(':');
      if (parts.length >= 2) {
        try {
          // The encoded data is in the second part (index 1)
          const encodedPart = parts[1];
          const decoded = atob(encodedPart);
          setEncryptedData(decoded); // Show the decoded data in the encrypted field area
          setIsEncrypted(false); // Update state to reflect decryption
        } catch (e) {
          setEncryptedData('Decryption failed - invalid data format');
        }
      } else {
        setEncryptedData('Decryption failed - unexpected format');
      }
      setIsLoading(false);
    }, 1500);
  };

  const sampleMedicalData = `Patient ID: PM-2023-4872
Name: Sarah Johnson
Age: 34
DOB: 1989-05-12
Gender: Female
Allergies: Penicillin, Latex
Current Medications: Levothyroxine 75mcg daily, Metformin 500mg BID
Vital Signs: BP 128/82, HR 76, Temp 98.4°F, Weight 156lbs
Chief Complaint: Follow-up for hypothyroidism and diabetes management
Diagnosis: Hypothyroidism, Type 2 Diabetes, Mild Depression
Lab Results: TSH 2.1, A1C 6.8, LDL 95, HDL 58
Next Appointment: 2023-12-15
`;

  const fieldOptions = [
    "Patient ID", "Name", "Age", "DOB", "Gender", 
    "Allergies", "Medications", "Vital Signs", 
    "Chief Complaint", "Diagnosis", "Lab Results", "Appointment"
  ];

  const handleFieldToggle = (field: string) => {
    if (selectedFields.includes(field)) {
      setSelectedFields(selectedFields.filter(f => f !== field));
    } else {
      setSelectedFields([...selectedFields, field]);
    }
  };

  return (
    <Layout>
      <Header />
      <div className="min-h-[calc(100vh-8rem)] p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl mb-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              <span className="text-white font-bold">ARCI</span>
              <span className="text-primary-purple font-extrabold">U</span>
              <span className="text-white font-bold">M</span>
              <span className="text-primary-purple font-extrabold">HYDE</span>
            </h1>
            <h2 className="text-2xl font-bold text-white mb-4">Selective Medical Record Encryption</h2>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Securely encrypt specific fields of medical records while maintaining accessibility for authorized healthcare providers. 
              Selective encryption protects patient privacy while enabling necessary healthcare operations.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Medical Record</h3>
              <div className="mb-4">
                <label className="block text-gray-400 text-sm mb-2">Patient Medical Data:</label>
                <textarea
                  value={medicalData}
                  onChange={(e) => setMedicalData(e.target.value)}
                  className="w-full h-56 p-3 bg-gray-800 rounded-lg text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-purple text-xs"
                  placeholder={sampleMedicalData}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-400 text-sm mb-2">Select Fields to Encrypt:</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {fieldOptions.map((field) => (
                    <div key={field} className="flex items-center">
                      <input
                        type="checkbox"
                        id={field}
                        checked={selectedFields.includes(field)}
                        onChange={() => handleFieldToggle(field)}
                        className="mr-2"
                      />
                      <label htmlFor={field} className="text-gray-300 text-xs">{field}</label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  onClick={handleEncrypt} 
                  disabled={isLoading || !medicalData.trim()}
                  className="flex-1"
                >
                  {isLoading && !isEncrypted ? 'Encrypting...' : 'Encrypt Record'}
                </Button>
                {isEncrypted && (
                  <Button 
                    onClick={handleDecrypt} 
                    disabled={isLoading || !encryptedData}
                    className="flex-1"
                  >
                    {isLoading ? 'Decrypting...' : 'Decrypt Record'}
                  </Button>
                )}
              </div>
            </Card>

            <Card className="p-6 flex flex-col">
              <h3 className="text-xl font-semibold text-white mb-4">Encrypted Record</h3>
              <div className="flex-1">
                {encryptedData ? (
                  <div className="p-4 bg-gray-900 rounded-lg h-full overflow-auto">
                    <p className="text-gray-400 text-xs mb-2">AES-256 Encrypted Data:</p>
                    <p className="text-primary-purple break-all text-xs font-mono">
                      {isEncrypted ? encryptedData : `Decrypted: ${encryptedData}`}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-900 rounded-lg h-full flex items-center justify-center text-gray-500">
                    Encrypted medical record will appear here...
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Encryption Details</h3>
              <div className="space-y-4">
                <div className="p-3 bg-gray-800 rounded border border-gray-700">
                  <p className="text-gray-400 text-sm">Algorithm:</p>
                  <p className="text-white">AES-256-GCM</p>
                </div>
                <div className="p-3 bg-gray-800 rounded border border-gray-700">
                  <p className="text-gray-400 text-sm">Encrypted Fields:</p>
                  <p className="text-white text-sm">{selectedFields.length > 0 ? selectedFields.join(', ') : 'All fields'}</p>
                </div>
                <div className="p-3 bg-gray-800 rounded border border-gray-700">
                  <p className="text-gray-400 text-sm">Authorized Access:</p>
                  <p className="text-white">Primary Care, Endocrinologist</p>
                </div>
                <div className="p-3 bg-gray-800 rounded border border-gray-700">
                  <p className="text-gray-400 text-sm">Security Level:</p>
                  <p className="text-primary-purple">HIPAA Compliant</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center p-6">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="text-xl font-semibold text-white mb-2">Selective Protection</h3>
              <p className="text-gray-400">Encrypt only sensitive fields while keeping others accessible</p>
            </Card>

            <Card className="text-center p-6">
              <div className="text-4xl mb-3">🏥</div>
              <h3 className="text-xl font-semibold text-white mb-2">Healthcare Access</h3>
              <p className="text-gray-400">Authorized providers access needed data for treatment</p>
            </Card>

            <Card className="text-center p-6">
              <div className="text-4xl mb-3">🛡️</div>
              <h3 className="text-xl font-semibold text-white mb-2">Privacy Control</h3>
              <p className="text-gray-400">Maintain patient privacy while enabling care</p>
            </Card>
          </div>

          <Card className="text-center p-8">
            <h3 className="text-xl font-semibold text-white mb-4">About Selective Medical Encryption</h3>
            <p className="text-gray-300 mb-4">
              Selective encryption in healthcare enables precise control over which portions of medical records are encrypted. 
              This allows healthcare systems to protect the most sensitive information (like allergies, mental health records, 
              or genetic information) while keeping other data accessible for emergency situations or routine care.
            </p>
            <p className="text-gray-300">
              This approach balances patient privacy with the clinical need for accessible medical information, 
              ensuring that healthcare providers can deliver appropriate care while maintaining HIPAA compliance.
            </p>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default SelectiveEncryptionDemoPage;
