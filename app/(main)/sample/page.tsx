import React, { useState } from "react";
import { Camera, Edit2, Save, X, User, Mail, Phone, MapPin, Calendar, Briefcase, FileText, Shield } from "lucide-react";

const TeacherProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    // Personal Information
    name: "Maria Clara Santos",
    age: "32",
    gender: "Female",
    dateOfBirth: "1992-05-15",
    civilStatus: "Married",
    contactNumber: "+63 912 345 6789",
    address: "123 Mabini Street, Cebu City, Central Visayas",
    email: "maria.santos@edutrack.ph",
    
    // Employment Information
    employeeId: "EMP-2020-001234",
    position: "Master Teacher I",
    plantillaNo: "DECS-ITEM-2020-0456",
    
    // Government IDs
    pagibigNo: "1234-5678-9012",
    philHealthNo: "12-345678901-2",
    gsisNo: "1234567890123",
    tinNo: "123-456-789-000",
    
    // Appointment Dates
    dateOfOriginalAppointment: "2015-06-01",
    dateOfLatestAppointment: "2020-08-15"
  });

  const handleInputChange = (field, value) => {
    setProfileData({ ...profileData, [field]: value });
  };

  const handleSave = () => {
    setIsEditing(false);
    // Add save logic here
  };

  const InputField = ({ label, value, field, type = "text", icon: Icon }) => (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-600 uppercase tracking-wide flex items-center gap-2">
        {Icon && <Icon size={14} className="text-blue-600" />}
        {label}
      </label>
      {isEditing ? (
        <input
          type={type}
          value={value}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      ) : (
        <p className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-800 font-medium">{value}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          {/* Top Banner */}
          <div className="h-32 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 relative">
            <div className="absolute top-4 left-6">
              <h1 className="text-2xl font-bold text-white">EduTrack Teacher Profile</h1>
              <p className="text-blue-100 text-sm">Department of Education</p>
            </div>
            <button className="absolute top-4 right-6 bg-white/90 hover:bg-white p-2 rounded-lg shadow transition">
              <Camera size={18} className="text-gray-700" />
            </button>
          </div>

          {/* Profile Header Section */}
          <div className="px-6 pb-6">
            <div className="flex items-end gap-6 -mt-16">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-32 h-32 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-gray-200">
                  <img
                    src="https://via.placeholder.com/128"
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button className="absolute bottom-1 right-1 bg-blue-600 hover:bg-blue-700 p-2 rounded-lg shadow-lg transition">
                  <Camera size={16} className="text-white" />
                </button>
              </div>

              {/* Name and Basic Info */}
              <div className="flex-1 mt-20">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">{profileData.name}</h2>
                    <p className="text-lg text-blue-600 font-semibold">{profileData.position}</p>
                    <p className="text-sm text-gray-600 mt-1">Employee ID: {profileData.employeeId}</p>
                  </div>

                  {/* Edit/Save Buttons */}
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSave}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg shadow-lg transition"
                        >
                          <Save size={18} />
                          Save Changes
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-5 py-2.5 rounded-lg shadow-lg transition"
                        >
                          <X size={18} />
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-lg transition"
                      >
                        <Edit2 size={18} />
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Personal & Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Personal & Contact Information Combined Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex flex-col gap-6">
                {/* Personal Information Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <User className="text-blue-600" size={20} />
                    <h3 className="text-lg font-bold text-gray-800">Personal Information</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <InputField label="Full Name" value={profileData.name} field="name" icon={User} />
                    <div className="grid grid-cols-2 gap-3">
                      <InputField label="Age" value={profileData.age} field="age" type="number" />
                      <InputField label="Gender" value={profileData.gender} field="gender" />
                    </div>
                    <InputField label="Date of Birth" value={profileData.dateOfBirth} field="dateOfBirth" type="date" icon={Calendar} />
                    <InputField label="Civil Status" value={profileData.civilStatus} field="civilStatus" />
                  </div>
                </div>

                <div className="border-t border-gray-200"></div>

                {/* Contact Information Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Phone className="text-blue-600" size={20} />
                    <h3 className="text-lg font-bold text-gray-800">Contact Information</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <InputField label="Contact Number" value={profileData.contactNumber} field="contactNumber" type="tel" icon={Phone} />
                    <InputField label="Email Address" value={profileData.email} field="email" type="email" icon={Mail} />
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-600 uppercase tracking-wide flex items-center gap-2">
                        <MapPin size={14} className="text-blue-600" />
                        Address
                      </label>
                      {isEditing ? (
                        <textarea
                          value={profileData.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                          rows="3"
                        />
                      ) : (
                        <p className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-800 font-medium">{profileData.address}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Middle & Right Columns - Employment & Government IDs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Employment Information & Appointment Dates Combined Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-5">
                <Briefcase className="text-blue-600" size={20} />
                <h3 className="text-lg font-bold text-gray-800">Employment Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <InputField label="Employee ID" value={profileData.employeeId} field="employeeId" icon={FileText} />
                <InputField label="Position/Designation" value={profileData.position} field="position" icon={Briefcase} />
                <InputField label="Plantilla No." value={profileData.plantillaNo} field="plantillaNo" icon={FileText} />
              </div>

              <div className="border-t border-gray-200 my-5"></div>

              <div className="mb-3">
                <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Calendar size={16} className="text-blue-600" />
                  Appointment History
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Date of Original Appointment" value={profileData.dateOfOriginalAppointment} field="dateOfOriginalAppointment" type="date" icon={Calendar} />
                  <InputField label="Date of Latest Appointment" value={profileData.dateOfLatestAppointment} field="dateOfLatestAppointment" type="date" icon={Calendar} />
                </div>
              </div>
            </div>

            {/* Government IDs Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-5">
                <Shield className="text-blue-600" size={20} />
                <h3 className="text-lg font-bold text-gray-800">Government IDs & Numbers</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="PAG-IBIG No." value={profileData.pagibigNo} field="pagibigNo" icon={Shield} />
                <InputField label="PhilHealth No." value={profileData.philHealthNo} field="philHealthNo" icon={Shield} />
                <InputField label="GSIS No." value={profileData.gsisNo} field="gsisNo" icon={Shield} />
                <InputField label="TIN No." value={profileData.tinNo} field="tinNo" icon={Shield} />
              </div>
            </div>

            {/* Service Record Card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-4">Service Record (Current School)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <p className="text-sm text-blue-100 mb-1">Years at This School</p>
                  <p className="text-3xl font-bold">
                    {(() => {
                      const originalDate = new Date(profileData.dateOfOriginalAppointment);
                      const today = new Date();
                      const years = today.getFullYear() - originalDate.getFullYear();
                      const months = today.getMonth() - originalDate.getMonth();
                      const days = today.getDate() - originalDate.getDate();
                      
                      let totalYears = years;
                      let totalMonths = months;
                      
                      if (days < 0) {
                        totalMonths--;
                      }
                      if (totalMonths < 0) {
                        totalYears--;
                        totalMonths += 12;
                      }
                      
                      return `${totalYears}y ${totalMonths}m`;
                    })()}
                  </p>
                  <p className="text-xs text-blue-200 mt-1">Since joining this school</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <p className="text-sm text-blue-100 mb-1">Years in Current Position</p>
                  <p className="text-3xl font-bold">
                    {(() => {
                      const latestDate = new Date(profileData.dateOfLatestAppointment);
                      const today = new Date();
                      const years = today.getFullYear() - latestDate.getFullYear();
                      const months = today.getMonth() - latestDate.getMonth();
                      const days = today.getDate() - latestDate.getDate();
                      
                      let totalYears = years;
                      let totalMonths = months;
                      
                      if (days < 0) {
                        totalMonths--;
                      }
                      if (totalMonths < 0) {
                        totalYears--;
                        totalMonths += 12;
                      }
                      
                      return `${totalYears}y ${totalMonths}m`;
                    })()}
                  </p>
                  <p className="text-xs text-blue-200 mt-1">Since latest appointment</p>
                </div>
              </div>
              <div className="mt-4 bg-white/5 backdrop-blur rounded-xl p-3 text-sm">
                <p className="text-blue-100">
                  <span className="font-semibold">Note:</span> Date of original appointment marks when the teacher joined this school. Latest appointment updates when promoted within the school.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;