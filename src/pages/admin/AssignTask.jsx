import { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { pushAssignTask } from "../../Api/assignTaskApi";

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
    task_start_date: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRole, setUserRole] = useState("")
  const [userDepartment, setUserDepartment] = useState("")


  useEffect(() => {
    const role = sessionStorage.getItem("role") || localStorage.getItem("role") || ""
    const department = sessionStorage.getItem("department") || localStorage.getItem("department") || ""
    setUserRole(role)
    setUserDepartment(department)
  }, [])


  const departments = userRole && userRole.toLowerCase() === 'user' && userDepartment
    ? allDepartments.filter(dept => dept === userDepartment) // Show only user's department
    : allDepartments;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.department || !formData.task_description) {
      alert('Please fill in required fields');
      return;
    }

    setIsSubmitting(true);
    // console.log('🔄 Starting form submission...');

    try {
      // console.log('📝 Form data being sent:', formData);

      const result = await pushAssignTask(formData);
      // console.log('🎉 Success result:', result);

      alert("Task submitted successfully!");
      // console.log('✅ Task submitted successfully!');

      // Reset form
      setFormData({
        department: "",
        given_by: "",
        name: "",
        task_description: "",
        frequency: "",
        task_start_date: ""
      });

    } catch (error) {
      console.error("Error in handleSubmit:", error);

      // Since data is saving despite timeout, show a different message
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        alert("Task is being processed (backend is taking time). Please check the database to confirm it was saved.");
      } else {
        alert("Failed to submit task: " + error.message);
      }
    } finally {
      setIsSubmitting(false);
      // console.log('🏁 Form submission process completed');
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