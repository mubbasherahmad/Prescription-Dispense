import { useState } from 'react';

const Prescriptions = () => {
  // Sample prescription data
  const [prescriptions] = useState([
    {
      id: 1,
      prescriptionId: "RX-2024-001",
      patientName: "John Smith",
      doctorName: "Dr. Johnson",
      dateIssued: "2024-01-15",
      status: "Active"
    },
    {
      id: 2,
      prescriptionId: "RX-2024-002", 
      patientName: "John Smith",
      doctorName: "Dr. Johnson",
      dateIssued: "2024-01-20",
      status: "Active"
    },
    {
      id: 3,
      prescriptionId: "RX-2024-003",
      patientName: "John Smith", 
      doctorName: "Dr. Johnson",
      dateIssued: "2024-01-22",
      status: "Active"
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Filled': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
            <p className="text-gray-600 text-sm mt-1">Manage and track your prescription medications</p>
          </div>
          <div className="space-x-3">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium">
              Create Prescription
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        <div className="w-full px-4">
          {/* Prescriptions Table */}
          <div className="bg-white rounded-lg border border-gray-300 mb-6">
            <h3 className="text-lg font-bold p-4 border-b border-gray-300">All Prescriptions</h3>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 border-b border-gray-300">Prescription ID</th>
                  <th className="text-left p-3 border-b border-gray-300">Patient</th>
                  <th className="text-left p-3 border-b border-gray-300">Doctor</th>
                  <th className="text-left p-3 border-b border-gray-300">Date</th>
                  <th className="text-left p-3 border-b border-gray-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((prescription) => (
                  <tr key={prescription.id} className="border-b border-gray-200">
                    <td className="p-3">{prescription.prescriptionId}</td>
                    <td className="p-3">{prescription.patientName}</td>
                    <td className="p-3">{prescription.doctorName}</td>
                    <td className="p-3">{prescription.dateIssued}</td>
                    <td className="p-3">{prescription.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Prescriptions;