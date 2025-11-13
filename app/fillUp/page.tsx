"use client";

import Image from "next/image";
import { redirect } from "next/navigation";
import { useState } from "react";

export default function fillUp() {
    const [preview, setPreview] = useState<string | null>(null);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        redirect("/dashboard");
    }

    function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    }

    return (
        <div className="min-h-screen bg-gray-200 flex items-center justify-center">
            <div className="w-full max-w-sm bg-neutral-300 p-6 rounded-lg shadow">
                <h1 className="text-xl font-semibold mb-4 text-gray-800">
                    Fill Up Profile
                </h1>

                <form onSubmit={handleSubmit}>
                    {/* PROFILE IMAGE */}
                    <h2 className="text-md font-semibold text-gray-700 mb-2">
                        Profile Picture
                    </h2>

                    <div className="mb-4">
                        {preview && (
                            <Image
                                width={120}
                                height={120}
                                src={preview}
                                alt="Preview"
                                className="w-24 h-24 object-cover rounded-full mb-2 border"
                            />
                        )}

                        <label className="block mb-1 text-gray-700">
                            Upload Image
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImage}
                            className="w-full px-3 py-2 border border-gray-500 rounded bg-white"
                        />
                    </div>

                    {/* PERSONAL INFO */}
                    <h2 className="text-md font-semibold text-gray-700 mb-2">
                        Personal Information
                    </h2>

                    <div className="mb-4">
                        <label className="block mb-1 text-gray-700">
                            Full Name
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-500 rounded focus:outline-none focus:ring focus:ring-blue-300"
                            placeholder="Enter Full Name"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-1 text-gray-700">
                            Employee / Teacher ID
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-500 rounded focus:outline-none focus:ring focus:ring-blue-300"
                            placeholder="Enter ID"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-1 text-gray-700">
                            Gender
                        </label>
                        <select
                            className="w-full px-3 py-2 border border-gray-500 rounded bg-white focus:outline-none focus:ring focus:ring-blue-300"
                            required
                        >
                            <option value="">Select Gender</option>
                            <option>Male</option>
                            <option>Female</option>
                            <option>Panzerkampfwagen VI</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block mb-1 text-gray-700">Age</label>
                        <input
                            type="number"
                            className="w-full px-3 py-2 border border-gray-500 rounded focus:outline-none focus:ring focus:ring-blue-300"
                            placeholder="Enter Age"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-1 text-gray-700">
                            Date of Birth
                        </label>
                        <input
                            type="date"
                            className="w-full px-3 py-2 border border-gray-500 rounded focus:outline-none focus:ring focus:ring-blue-300"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-1 text-gray-700">
                            Civil Status
                        </label>
                        <select
                            className="w-full px-3 py-2 border border-gray-500 rounded bg-white focus:outline-none focus:ring focus:ring-blue-300"
                            required
                        >
                            <option value="">Select Status</option>
                            <option>Single</option>
                            <option>Married</option>
                            <option>Widowed</option>
                            <option>Separated</option>
                            <option>Divorced</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block mb-1 text-gray-700">
                            Nationality
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-500 rounded focus:outline-none focus:ring focus:ring-blue-300"
                            placeholder="Enter Nationality"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-1 text-gray-700">
                            Religion
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-500 rounded focus:outline-none focus:ring focus:ring-blue-300"
                            placeholder="Enter Religion"
                            required
                        />
                    </div>

                    {/* CONTACT INFO */}
                    <h2 className="text-md font-semibold text-gray-700 mb-2">
                        Contact Information
                    </h2>

                    <div className="mb-4">
                        <label className="block mb-1 text-gray-700">
                            Contact Number
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-500 rounded focus:outline-none focus:ring focus:ring-blue-300"
                            placeholder="Enter Contact Number"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-1 text-gray-700">
                            Email Address
                        </label>
                        <input
                            type="email"
                            className="w-full px-3 py-2 border border-gray-500 rounded focus:outline-none focus:ring focus:ring-blue-300"
                            placeholder="Enter Email"
                            required
                        />
                    </div>

                    {/* WORK INFO */}
                    <h2 className="text-md font-semibold text-gray-700 mb-2">
                        Work Information
                    </h2>

                    <div className="mb-4">
                        <label className="block mb-1 text-gray-700">
                            Position / Designation
                        </label>
                        <select
                            className="w-full px-3 py-2 border border-gray-500 rounded bg-white focus:outline-none focus:ring focus:ring-blue-300"
                            required
                        >
                            <option value="">Select Position</option>
                            <option>Teacher I</option>
                            <option>Teacher II</option>
                            <option>Teacher III</option>
                            <option>Master Teacher I</option>
                            <option>Master Teacher II</option>
                            <option>Master Teacher III</option>
                            <option>Principal</option>
                            <option>Administrative Staff</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block mb-1 text-gray-700">
                            Plantilla No.{" "}
                            <span className="text-sm text-gray-600">
                                (optional)
                            </span>
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-500 rounded focus:outline-none focus:ring focus:ring-blue-300"
                            placeholder="Enter Plantilla Number"
                        />
                    </div>

                    {/* GOVERNMENT IDs */}
                    <h2 className="text-md font-semibold text-gray-700 mb-2">
                        Government IDs
                    </h2>

                    <div className="mb-4">
                        <label className="block mb-1 text-gray-700">
                            Pag-IBIG No.{" "}
                            <span className="text-sm text-gray-600">
                                (optional)
                            </span>
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-500 rounded focus:outline-none focus:ring focus:ring-blue-300"
                            placeholder="1234-5678-9012"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-1 text-gray-700">
                            PhilHealth No.{" "}
                            <span className="text-sm text-gray-600">
                                (optional)
                            </span>
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-500 rounded focus:outline-none focus:ring focus:ring-blue-300"
                            placeholder="Enter PhilHealth No."
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-1 text-gray-700">
                            TIN{" "}
                            <span className="text-sm text-gray-600">
                                (optional)
                            </span>
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-500 rounded focus:outline-none focus:ring focus:ring-blue-300"
                            placeholder="Enter TIN"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-1 text-gray-700">
                            GSIS BP No.{" "}
                            <span className="text-sm text-gray-600">
                                (optional)
                            </span>
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-500 rounded focus:outline-none focus:ring focus:ring-blue-300"
                            placeholder="Enter GSIS BP No."
                        />
                    </div>

                    {/* APPOINTMENTS */}
                    <h2 className="text-md font-semibold text-gray-700 mb-2">
                        Appointment Details
                    </h2>

                    <div className="mb-4">
                        <label className="block mb-1 text-gray-700">
                            Date of Original Appointment
                        </label>
                        <input
                            type="date"
                            className="w-full px-3 py-2 border border-gray-500 rounded focus:outline-none focus:ring focus:ring-blue-300"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-1 text-gray-700">
                            Date of Latest Appointment
                        </label>
                        <input
                            type="date"
                            className="w-full px-3 py-2 border border-gray-500 rounded focus:outline-none focus:ring focus:ring-blue-300"
                            required
                        />
                    </div>

                    {/* EDUCATION */}
                    <h2 className="text-md font-semibold text-gray-700 mb-2">
                        Educational Background
                    </h2>

                    <div className="mb-4">
                        <label className="block mb-1 text-gray-700">
                            Subject of Specialization
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-500 rounded focus:outline-none focus:ring focus:ring-blue-300"
                            placeholder="Enter Specialization"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-1 text-gray-700">
                            Bachelor`&#39;`s Degree
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-500 rounded focus:outline-none focus:ring focus:ring-blue-300"
                            placeholder="Enter Bachelor's Degree"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-1 text-gray-700">
                            Post Graduate{" "}
                            <span className="text-sm text-gray-600">
                                (optional)
                            </span>
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-500 rounded focus:outline-none focus:ring focus:ring-blue-300"
                            placeholder="Enter Post Graduate Degree"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                    >
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
}
