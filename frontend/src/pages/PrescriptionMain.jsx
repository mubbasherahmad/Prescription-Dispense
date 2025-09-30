import React, { useState } from 'react';
import { Search, Bell, MoreHorizontal, Filter, Home, FileText, CheckSquare, Package, Pill } from 'lucide-react';
import { NavLink } from 'react-router-dom';
export default function PrescriptionMain() {
  const [prescriptions] = useState([
    {
      id: 1,
      patient: 'John Smith',
      age: 23,
      medication: 'Lisinopril - 10 mg',
      frequency: 'Once daily, 30 days',
      dateCreated: '23-06-2025',
      expiry: '29-09-2025',
      status: 'DISPENSED'
    },
    {
      id: 2,
      patient: 'John Smith',
      age: 23,
      medication: 'Lisinopril - 10 mg',
      frequency: 'Once daily, 30 days',
      dateCreated: '23-06-2025',
      expiry: '29-09-2025',
      status: 'DISPENSED'
    },
    {
      id: 3,
      patient: 'John Smith',
      age: 23,
      medication: 'Lisinopril - 10 mg',
      frequency: 'Once daily, 30 days',
      dateCreated: '23-06-2025',
      expiry: '29-09-2025',
      status: 'DISPENSED'
    },
    {
      id: 4,
      patient: 'John Smith',
      age: 23,
      medication: 'Lisinopril - 10 mg',
      frequency: 'Once daily, 30 days',
      dateCreated: '23-06-2025',
      expiry: '29-09-2025',
      status: 'DISPENSED'
    },
    {
      id: 5,
      patient: 'John Smith',
      age: 23,
      medication: 'Lisinopril - 10 mg',
      frequency: 'Once daily, 30 days',
      dateCreated: '23-06-2025',
      expiry: '29-09-2025',
      status: 'DISPENSED'
    },
    {
      id: 6,
      patient: 'John Smith',
      age: 23,
      medication: 'Lisinopril - 10 mg',
      frequency: 'Once daily, 30 days',
      dateCreated: '23-06-2025',
      expiry: '29-09-2025',
      status: 'DISPENSED'
    },
    {
      id: 7,
      patient: 'John Smith',
      age: 23,
      medication: 'Lisinopril - 10 mg',
      frequency: 'Once daily, 30 days',
      dateCreated: '23-06-2025',
      expiry: '29-09-2025',
      status: 'DISPENSED'
    },
    {
      id: 8,
      patient: 'John Smith',
      age: 23,
      medication: 'Lisinopril - 10 mg',
      frequency: 'Once daily, 30 days',
      dateCreated: '23-06-2025',
      expiry: '29-09-2025',
      status: 'DISPENSED'
    },
    {
      id: 9,
      patient: 'John Smith',
      age: 23,
      medication: 'Lisinopril - 10 mg',
      frequency: 'Once daily, 30 days',
      dateCreated: '23-06-2025',
      expiry: '29-09-2025',
      status: 'DISPENSED'
    },
    {
      id: 10,
      patient: 'John Smith',
      age: 23,
      medication: 'Lisinopril - 10 mg',
      frequency: 'Once daily, 30 days',
      dateCreated: '23-06-2025',
      expiry: '29-09-2025',
      status: 'DISPENSED'
    }
  ]);
  const navClass = ({ isActive }) =>
    `w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 ${
      isActive ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
    }`;
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
           <div className="p-6">
             <h1 className="text-2xl font-semibold">
               Prescript<span className="text-blue-500">Ease</span>
             </h1>
           </div>
   
           <nav className="flex-1 px-4">
             <NavLink to="/" className={navClass}>
               <Home size={20} />
               <span>Home</span>
             </NavLink>
   
             <NavLink to="/PrescriptionMain" className={navClass}>
               <FileText size={20} />
               <span>Prescriptions</span>
             </NavLink>
   
             <NavLink to="/validation-queue" className={navClass}>
               <CheckSquare size={20} />
               <span>Validation Queue</span>
             </NavLink>
   
             <NavLink to="/dispensations" className={navClass}>
               <Package size={20} />
               <span>Dispensations</span>
             </NavLink>
   
             <NavLink to="/DrugPage" className={navClass}>
               <Pill size={20} />
               <span>Drug Inventory</span>
             </NavLink>
           </nav>
   
           <div className="p-4">
             <button className="w-full bg-red-400 hover:bg-red-500 text-white py-3 rounded-lg flex items-center justify-center gap-2">
               <span>→</span>
               <span>Log Out</span>
             </button>
           </div>
         </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-700">PRESCRIPTIONS</h2>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-gray-100 rounded-lg">
              <Bell size={20} className="text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold">M</span>
              </div>
              <span className="text-gray-700">Marlene</span>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              LIST
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2">
              <span>Filter</span>
              <Filter size={16} />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for..."
                className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
            </div>
            
            <button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium">
              Create Prescription
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto px-8 py-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600 w-12">
                  <input type="checkbox" className="w-4 h-4" />
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Patient</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Age</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Medications</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Date Created</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Expiry</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map((prescription) => (
                <tr key={prescription.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <input type="checkbox" className="w-4 h-4" />
                  </td>
                  <td className="py-4 px-4 text-gray-800">{prescription.patient}</td>
                  <td className="py-4 px-4 text-gray-800">{prescription.age}</td>
                  <td className="py-4 px-4">
                    <div className="text-gray-800">{prescription.medication}</div>
                    <div className="text-sm text-gray-500">{prescription.frequency}</div>
                  </td>
                  <td className="py-4 px-4 text-gray-800">{prescription.dateCreated}</td>
                  <td className="py-4 px-4 text-gray-800">{prescription.expiry}</td>
                  <td className="py-4 px-4">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm font-medium">
                      {prescription.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <button className="p-1 hover:bg-gray-200 rounded">
                      <MoreHorizontal size={20} className="text-gray-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


