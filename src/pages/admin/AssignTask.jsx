import { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { pushAssignTask } from "../../Api/assignTaskApi";

// Add this HOD mapping object after imports
const departmentHODs = {
  "Mandir": "Komal Sahu and Rinku Gautam",
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
  "Workshop": "Dhanji Yadav",
  "Car Parking Area": "Department HOD",
  "default": "Department HOD"
};

export default function AssignTask() {
  // Simple options
  const allDepartments = ["Mandir", "Car Parking Area", "Main Gate", "Main Gate Front Area", "Admin Office - Ground Floor", "Cabins ग्राउंड फ्लोर: and first floor", "Admin Office - First Floor", "Weight Office & Kata In/Out", "New Lab", "Canteen Area 1 & 2", "Pipe Mill", "Patra Mill Foreman Office", "Patra Mill DC Panel Room", "Patra Mill AC Panel Room", "SMS Panel Room", "SMS Office", "CCM Office", "CCM Panel Room", "Store Office", "Workshop", "Labour Colony & Bathroom", "Plant Area"];
  const givenBy = ["AAKASH AGRAWAL", "SHEELESH MARELE", "AJIT KUMAR GUPTA"];
  const doerNames = ["Housekeeping Staff", "Company Reja"];
  const frequencies = ["one-time", "daily", "weekly", "monthly"];

  // Form state
  const [formData, setFormData] = useState({
    department: "",
    given_by: "",
    name: "",
    task_description: "",
    frequency: "",
    task_start_date: "",
    hod: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRole, setUserRole] = useState("")
  const [userDepartment, setUserDepartment] = useState("")

  useEffect(() => {
    const role = sessionStorage.getItem("role") || localStorage.getItem("role") || ""
    const department = sessionStorage.getItem("department") || localStorage.getItem("department") || ""
    setUserRole(role)
    setUserDepartment(department)

    // Auto-set department and HOD for users
    if (role.toLowerCase() === 'user' && department) {
      setFormData(prev => ({
        ...prev,
        department: department,
        hod: departmentHODs[department] || departmentHODs.default
      }))
    }
  }, [])

  const departments = userRole && userRole.toLowerCase() === 'user' && userDepartment
    ? allDepartments.filter(dept => dept === userDepartment)
    : allDepartments;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updatedData = { ...prev, [name]: value };

      // Auto-populate HOD when department is selected (only for admin)
      if (name === "department" && value && userRole.toLowerCase() !== 'user') {
        updatedData.hod = departmentHODs[value] || departmentHODs.default;
      }

      return updatedData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.department || !formData.task_description) {
      alert('Please fill in required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await pushAssignTask(formData);
      alert("Task submitted successfully!");

      // Reset form
      setFormData({
        department: userRole.toLowerCase() === 'user' ? userDepartment : "",
        given_by: "",
        name: "",
        task_description: "",
        frequency: "",
        task_start_date: "",
        hod: userRole.toLowerCase() === 'user' ? (departmentHODs[userDepartment] || departmentHODs.default) : ""
      });

    } catch (error) {
      console.error("Error in handleSubmit:", error);

      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        alert("Task is being processed (backend is taking time). Please check the database to confirm it was saved.");
      } else {
        alert("Failed to submit task: " + error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-bold tracking-tight mb-6 text-gray-500">
          Assign Task
        </h1>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Department */}
            <div>
              <label className="block text-sm font-medium mb-1">Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                disabled={userRole && userRole.toLowerCase() === 'user' && userDepartment}
              >
                <option value="">Select</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Given By */}
            <div>
              <label className="block text-sm font-medium mb-1">Given By</label>
              <select
                name="given_by"
                value={formData.given_by}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Select</option>
                {givenBy.map(person => (
                  <option key={person} value={person}>{person}</option>
                ))}
              </select>
            </div>

            {/* Department HOD - Dynamic based on department selection */}
            <div>
              <label className="block text-sm font-medium mb-1">Department HOD</label>
              <select
                name="hod"
                value={formData.hod}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                disabled={userRole && userRole.toLowerCase() === 'user' && userDepartment}
              >
                <option value="">Select</option>
                {/* If user role, auto-select their department's HOD */}
                {userRole && userRole.toLowerCase() === 'user' && userDepartment ? (
                  <option value={departmentHODs[userDepartment] || departmentHODs.default}>
                    {departmentHODs[userDepartment] || departmentHODs.default}
                  </option>
                ) : (
                  /* If admin role, show HOD based on selected department */
                  <option value={departmentHODs[formData.department] || departmentHODs.default}>
                    {departmentHODs[formData.department] || departmentHODs.default}
                  </option>
                )}
              </select>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1">Doer Name</label>
              <select
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Select</option>
                {doerNames.map(doer => (
                  <option key={doer} value={doer}>{doer}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">Task Description</label>
              <textarea
                name="task_description"
                value={formData.task_description}
                onChange={handleChange}
                rows="3"
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Enter task description"
              />
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium mb-1">Frequency</label>
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Select</option>
                {frequencies.map(freq => (
                  <option key={freq} value={freq}>{freq}</option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                name="task_start_date"
                value={formData.task_start_date}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit Task"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </AdminLayout>
  );
}