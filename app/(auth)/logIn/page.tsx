export default function LogIn() {
    return (
        <div className="min-h-screen bg-gray-200 flex items-center justify-center">
            <div className="w-full max-w-sm bg-neutral-300 p-6 rounded-lg shadow">
                <h1 className="text-xl font-semibold mb-4 text-gray-800">
                    Log In
                </h1>

                <div className="mb-4">
                    <label className="block mb-1 text-gray-700">Username</label>
                    <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-500 rounded focus:outline-none focus:ring focus:ring-blue-300"
                        placeholder="Enter username"
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-1 text-gray-700">Password</label>
                    <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-500 rounded focus:outline-none focus:ring focus:ring-blue-300"
                        placeholder="Enter password"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                >
                    Submit
                </button>

                <div className="flex items-center my-4">
                    <span className="flex-grow h-px bg-gray-500"></span>
                    <span className="px-2 gray-700 text-sm">or</span>
                    <span className="flex-grow h-px bg-gray-500"></span>
                </div>

                <p className="text-center text-sm gray-700">
                    No Account?{" "}
                    <a
                        href="/signUp"
                        className="text-blue-600 hover:underline font-medium"
                    >
                        Sign Up
                    </a>
                </p>
            </div>
        </div>
    );
}
