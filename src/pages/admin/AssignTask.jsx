import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { pushAssignTask } from "../../Api/assignTaskApi";
import { useAuth } from "../../context/AuthContext";

const departmentHODs = {
  Mandir: "Komal Sahu and Rinku Gautam",
  "Main Gate": "Komal Sahu and Rinku Gautam",
  "Main Gate Front Area": "Komal Sahu and Rinku Gautam",
  "Admin Office - Ground Floor": "Moradhwaj Verma and Shivraj Sharma",
  "Admin Office - First Floor": "Moradhwaj Verma and Shivraj Sharma",
  "Cabins ग्राउंड फ्लोर: and first floor": "Moradhwaj Verma and Shivraj Sharma",
  "Weight Office & Kata In/Out": "Vipin Pandey & Rajendra Tiwari",
  "New Lab": "Mukesh Patle & Sushil",
  "Canteen Area 1 & 2": "Tuleshwar Verma",
  "Labour Colony & Bathroom": "Tuleshwar Verma",
  "Plant Area": "Tuleshwar Verma",
  "Pipe Mill": "Ravi Kumar Singh, G. Ram Mohan Rao, Hullash Paswan",
  "Patra Mill Foreman Office": "Sparsh Jha and Toman Sahu",
  "Patra Mill DC Panel Room": "Danveer Singh Chauhan",
  "Patra Mill AC Panel Room": "Danveer Singh Chauhan",
  "SMS Panel Room": "Deepak Bhalla",
  "SMS Office": "Baldev Singh",
  "CCM Office": "Rinku Singh",
  "CCM Panel Room": "Rinku Singh",
  "Store Office": "Pramod and Suraj",
  Workshop: "Dhanji Yadav",
  "Car Parking Area": "Department HOD",
  default: "Department HOD",
};

const allDepartments = [
  "Mandir",
  "Car Parking Area",
  "Main Gate",
  "Main Gate Front Area",
  "Admin Office - Ground Floor",
  "Cabins ग्राउंड फ्लोर: and first floor",
  "Admin Office - First Floor",
  "Weight Office & Kata In/Out",
  "New Lab",
  "Canteen Area 1 & 2",
  "Pipe Mill",
  "Patra Mill Foreman Office",
  "Patra Mill DC Panel Room",
  "Patra Mill AC Panel Room",
  "SMS Panel Room",
  "SMS Office",
  "CCM Office",
  "CCM Panel Room",
  "Store Office",
  "Workshop",
  "Labour Colony & Bathroom",
  "Plant Area",
];

const givenByOptions = ["AAKASH AGRAWAL", "SHEELESH MARELE", "AJIT KUMAR GUPTA"];
const doerNames = ["Housekeeping Staff", "Company Reja"];
const frequencies = ["one-time", "daily", "weekly", "monthly"];

export default function AssignTask() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    department: "",
    given_by: "",
    name: "",
    task_description: "",
    frequency: "",
    task_start_date: "",
    hod: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [userDepartment, setUserDepartment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const role = user?.role || "";
    const department = user?.department || "";
    setUserRole(role);
    setUserDepartment(department);

    if (role.toLowerCase() === "user" && department) {
      setFormData((prev) => ({
        ...prev,
        department,
        hod: departmentHODs[department] || departmentHODs.default,
      }));
    }
  }, [user]);

  const departments = useMemo(() => {
    if (userRole.toLowerCase() === "user" && userDepartment) {
      return allDepartments.filter((dept) => dept === userDepartment);
    }
    return allDepartments;
  }, [userDepartment, userRole]);

  const updateHod = (dept) => departmentHODs[dept] || departmentHODs.default;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "department" && value) {
        next.hod = updateHod(value);
      }
      return next;
    });
  };

  const validate = () => {
    if (!formData.department) return "Department is required";
    if (!formData.task_description.trim()) return "Task description is required";
    if (!formData.frequency) return "Frequency is required";
    if (!formData.task_start_date) return "Start date is required";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      await pushAssignTask({
        ...formData,
        task_description: formData.task_description.trim(),
      });
      setSuccess("Task submitted successfully.");
      setFormData({
        department: userRole.toLowerCase() === "user" ? userDepartment : "",
        given_by: "",
        name: "",
        task_description: "",
        frequency: "",
        task_start_date: "",
        hod: userRole.toLowerCase() === "user" ? updateHod(userDepartment) : "",
      });
    } catch (err) {
      if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        setError("Task is being processed. Please verify in a moment.");
      } else {
        setError(err?.message || "Failed to submit task");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Housekeeping</p>
              <h1 className="text-xl font-semibold text-gray-800">Assign Task</h1>
            </div>
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2 text-sm text-blue-700">
                <span className="h-2.5 w-2.5 rounded-full border-2 border-blue-700 border-t-transparent animate-spin" />
                Submitting...
              </span>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}
            {success ? (
              <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                {success}
              </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                  disabled={userRole.toLowerCase() === "user" && !!userDepartment}
                  required
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Department HOD</label>
                <input
                  name="hod"
                  value={formData.hod}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                  disabled
                  placeholder="Auto populated"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Given By</label>
                <select
                  name="given_by"
                  value={formData.given_by}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select</option>
                  {givenByOptions.map((person) => (
                    <option key={person} value={person}>
                      {person}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Doer Name</label>
                <select
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select</option>
                  {doerNames.map((doer) => (
                    <option key={doer} value={doer}>
                      {doer}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Task Description</label>
              <textarea
                name="task_description"
                value={formData.task_description}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the task clearly"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Frequency</label>
                <select
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select</option>
                  {frequencies.map((freq) => (
                    <option key={freq} value={freq}>
                      {freq}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  name="task_start_date"
                  value={formData.task_start_date}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg text-sm font-medium shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Task"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
