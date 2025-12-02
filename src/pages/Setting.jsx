import React, { useEffect, useState } from 'react';
import { Plus, User, Building, X, Save, Edit, Trash2, Search, Eye, EyeOff } from 'lucide-react';
import AdminLayout from '../components/layout/AdminLayout';
import { usersAPI } from '../Api/settingsApi';

const Setting = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  // const [currentDeptId, setCurrentDeptId] = useState(null);
  const [usernameFilter, setUsernameFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Data states
  const [userData, setUserData] = useState([]);

  const [userForm, setUserForm] = useState({
    user_name: '',
    email_id: '',
    number: '',
    employee_id: '',
    role: 'user',
    status: 'active',
    user_access: '',
    department: '',
    password: ''
  });


  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getUsers();
      // console.log('📊 API RESPONSE:', response.data); // Add this to see the actual response structure

      // Check the actual response structure
      if (response.data && Array.isArray(response.data)) {
        setUserData(response.data);
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setUserData(response.data.data);
      } else {
        console.error('Unexpected API response structure:', response.data);
        setUserData([]);
      }
    } catch (err) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  // User CRUD operations
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!userForm.user_name || !userForm.password) {
        setError('Username and password are required');
        return;
      }

      await usersAPI.createUser(userForm);
      await fetchUsers();
      resetUserForm();
      setShowUserModal(false);
      setError('');
    } catch (err) {
      setError(`Failed to create user: ${err.response?.data?.error || err.message}`);
      console.error('Error creating user:', err);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      if (!userForm.user_name) {
        setError('Username is required');
        return;
      }

      await usersAPI.updateUser(currentUserId, userForm);
      await fetchUsers();
      resetUserForm();
      setShowUserModal(false);
      setError('');
    } catch (err) {
      setError(`Failed to update user: ${err.response?.data?.error || err.message}`);
      console.error('Error updating user:', err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await usersAPI.deleteUser(userId);
        await fetchUsers();
      } catch (err) {
        setError('Failed to delete user');
        console.error('Error deleting user:', err);
      }
    }
  };

  const handleEditUser = (user) => {
    setUserForm({
      user_name: user.user_name || '',
      email_id: user.email_id || '',
      number: user.number || '',
      employee_id: user.employee_id || '',
      role: user.role || 'user',
      status: user.status || 'active',
      user_access: user.user_access || '',
      department: user.department || '',
      password: '' // Don't show current password for security
    });
    setCurrentUserId(user.id);
    setIsEditing(true);
    setShowUserModal(true);
    setShowPassword(false);
  };

  // Form handlers
  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    setUserForm(prev => ({ ...prev, [name]: value }));
  };

  const resetUserForm = () => {
    setUserForm({
      user_name: '',
      email_id: '',
      number: '',
      employee_id: '',
      role: 'user',
      status: 'active',
      user_access: '',
      department: '',
      password: ''
    });
    setIsEditing(false);
    setCurrentUserId(null);
    setShowPassword(false);
  };



  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Filter handlers
  const clearUsernameFilter = () => {
    setUsernameFilter('');
  };

  // Filtered data
  const filteredUsers = userData.filter(user =>
    user.role !== "admin" &&
    (!usernameFilter || user.user_name?.toLowerCase().includes(usernameFilter.toLowerCase()))
  );

  const getStatusColor = (status) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'manager': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header and Tabs */}
        <div className="my-5 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-600">User Management System</h1>

          <div className="flex items-center gap-4">
            <div className="flex border border-gray-200 rounded-md overflow-hidden">
              {/* <button
                className={`flex items-center px-4 py-3 text-sm font-medium ${activeTab === 'users' ? 'bg-gray-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                onClick={() => setActiveTab('users')}
              >
                <User size={18} className="mr-2" />
                Users
              </button> */}
              {/* <button
                className={`flex items-center px-4 py-3 text-sm font-medium ${activeTab === 'departments' ? 'bg-gray-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                onClick={() => setActiveTab('departments')}
              >
                <Building size={18} className="mr-2" />
                Departments
              </button> */}
            </div>

            <button
              onClick={() => activeTab === 'users' ? setShowUserModal(true) : setShowDeptModal(true)}
              className="rounded-md bg-blue-600 py-2 px-4 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="flex items-center">
                <Plus size={18} className="mr-2" />
                <span>Add {activeTab === 'users' ? 'User' : 'Department'}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-700">User List</h2>

              {/* Username Filter */}
              <div className="relative">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Filter by username..."
                      value={usernameFilter}
                      onChange={(e) => setUsernameFilter(e.target.value)}
                      className="w-48 pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    {usernameFilter && (
                      <button
                        onClick={clearUsernameFilter}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="h-[calc(100vh-275px)] overflow-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
                  <p className="mt-2 text-gray-600">Loading users...</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.user_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.email_id || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.number || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.employee_id || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.department || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit User"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={user.role === "admin"}
                              className={`${user.role === "admin"
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-red-600 hover:text-red-900"
                                }`}
                              title={
                                user.role === "admin"
                                  ? "Admin users cannot be deleted"
                                  : "Delete User"
                              }
                            >
                              <Trash2 size={18} />
                            </button>

                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* User Modal with Password Field */}
        {showUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    {isEditing ? 'Edit User' : 'Create New User'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowUserModal(false);
                      resetUserForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={isEditing ? handleUpdateUser : handleAddUser}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Username */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Username *
                      </label>
                      <input
                        type="text"
                        name="user_name"
                        value={userForm.user_name}
                        onChange={handleUserInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password {!isEditing && '*'}
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={userForm.password}
                          onChange={handleUserInputChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required={!isEditing}
                          placeholder={isEditing ? "Leave blank to keep current" : "Enter password"}
                        />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {isEditing && (
                        <p className="text-xs text-gray-500 mt-1">
                          Only enter if you want to change the password
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email_id"
                        value={userForm.email_id}
                        onChange={handleUserInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="number"
                        value={userForm.number}
                        onChange={handleUserInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Employee ID */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employee ID
                      </label>
                      <input
                        type="text"
                        name="employee_id"
                        value={userForm.employee_id}
                        onChange={handleUserInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department
                      </label>
                      <input
                        type="text"
                        name="department"
                        value={userForm.department}
                        onChange={handleUserInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Role */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      <select
                        name="role"
                        value={userForm.role}
                        onChange={handleUserInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        {/* <option value="manager">Manager</option> */}
                      </select>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        name="status"
                        value={userForm.status}
                        onChange={handleUserInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>


                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserModal(false);
                        resetUserForm();
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                    >
                      <Save size={18} className="mr-2" />
                      {isEditing ? 'Update User' : 'Create User'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Department Modal */}
        {showDeptModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    {currentDeptId ? 'Edit Department' : 'Create New Department'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowDeptModal(false);
                      resetDeptForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={currentDeptId ? handleUpdateDepartment : handleAddDepartment}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department Name *
                      </label>
                      <input
                        type="text"
                        name="department"
                        value={deptForm.department}
                        onChange={handleDeptInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Given By
                      </label>
                      <input
                        type="text"
                        name="given_by"
                        value={deptForm.given_by}
                        onChange={handleDeptInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeptModal(false);
                        resetDeptForm();
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                    >
                      <Save size={18} className="mr-2" />
                      {currentDeptId ? 'Update Department' : 'Create Department'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Setting;
