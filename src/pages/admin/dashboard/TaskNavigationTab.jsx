// components/TaskNavigationTabs.js
"use client"

import { Filter, ChevronDown, ChevronUp } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import taskApi from "../../../Api/dashoardTasksApi" // Adjust path as needed

export default function TaskNavigationTabs({
  dashboardType,
  taskView,
  setTaskView,
  searchQuery,
  setSearchQuery,
  filterStaff,
  setFilterStaff,
  departmentData,
  getFrequencyColor,
  dashboardStaffFilter,
  departmentFilter
}) {
  const [currentPage, setCurrentPage] = useState(1)
  const [displayedTasks, setDisplayedTasks] = useState([])
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMoreData, setHasMoreData] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [isFilterExpanded, setIsFilterExpanded] = useState(false)
  const [taskCounts, setTaskCounts] = useState({
    recent: 0,
    upcoming: 0,
    overdue: 0
  })
  const itemsPerPage = 50

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
    setDisplayedTasks([])
    setHasMoreData(true)
    setTotalCount(0)
  }, [taskView, dashboardType, dashboardStaffFilter, departmentFilter])

  // Helper function to format date in Indian format (DD/MM/YYYY)
  const formatDateToIndianFormat = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date)) return ""
    const day = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  // Helper function to format datetime in Indian format (DD/MM/YYYY HH:MM:SS)
  const formatDateTimeToIndianFormat = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date)) return ""
    const day = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, "0")
    const minutes = date.getMinutes().toString().padStart(2, "0")
    const seconds = date.getSeconds().toString().padStart(2, "0")
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
  }

  // Helper function to check if date is today
  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    const checkDate = new Date(date);

    if (isNaN(checkDate.getTime())) return false;

    return (
      checkDate.getDate() === today.getDate() &&
      checkDate.getMonth() === today.getMonth() &&
      checkDate.getFullYear() === today.getFullYear()
    );
  };

  // Function to parse various date formats and convert to Indian format
  const parseAndFormatDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== "string") return ""

    let date;

    // Handle YYYY-MM-DD format
    if (dateStr.includes("-") && dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
      date = new Date(dateStr)
    }
    // Handle DD/MM/YYYY format (already Indian format)
    else if (dateStr.includes("/")) {
      const parts = dateStr.split(" ")
      const datePart = parts[0]
      const dateComponents = datePart.split("/")

      if (dateComponents.length === 3) {
        const [day, month, year] = dateComponents.map(Number)
        if (day && month && year) {
          date = new Date(year, month - 1, day)

          // If time part exists, add it
          if (parts.length > 1) {
            const timePart = parts[1]
            const timeComponents = timePart.split(":")
            if (timeComponents.length >= 2) {
              const [hours, minutes, seconds] = timeComponents.map(Number)
              date.setHours(hours || 0, minutes || 0, seconds || 0)
            }
          }
        }
      }
    }
    // Handle other date formats
    else {
      date = new Date(dateStr)
    }

    // If date is invalid, return original string
    if (!date || isNaN(date.getTime())) {
      return dateStr
    }

    // Return in Indian format with time if available
    const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0 || date.getSeconds() !== 0
    return hasTime ? formatDateTimeToIndianFormat(date) : formatDateToIndianFormat(date)
  }

  // Function to get task status based on submission_date
  const getTaskStatus = (submissionDate, status) => {
    if (submissionDate || status === 'Yes') {
      return "Completed";
    } else {
      return "Pending";
    }
  }

  // Function to load all task counts
  const loadTaskCounts = useCallback(async () => {
    try {
      const [recentData, overdueData, notDoneData] = await Promise.all([
        taskApi.getRecentTasks(),
        taskApi.getOverdueTasks(),
        taskApi.getNotDoneTasks()
      ]);

      // Filter recent tasks for today only
      const todayRecentTasks = recentData.filter(task =>
        isToday(task.task_start_date)
      );

      // Filter overdue tasks: task_start_date < today AND submission_date is null
      const filteredOverdueTasks = overdueData.filter(task => {
        const taskStartDate = parseTaskStartDate(task.task_start_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (taskStartDate) {
          const taskDate = new Date(taskStartDate);
          taskDate.setHours(0, 0, 0, 0);

          const isTaskDateBeforeToday = taskDate < today;
          const isSubmissionNull = !task.submission_date || task.submission_date === null || task.submission_date === '';

          return isTaskDateBeforeToday && isSubmissionNull;
        }
        return false;
      });

      setTaskCounts({
        recent: todayRecentTasks.length,
        upcoming: notDoneData.length,
        overdue: filteredOverdueTasks.length
      });

    } catch (error) {
      console.error('Error loading task counts:', error);
    }
  }, []);

  // Function to load tasks from API
  const loadTasksFromApi = useCallback(async (page = 1, append = false) => {
    if (isLoadingMore) return;

    try {
      setIsLoadingMore(true)

      let apiData = [];

      // Call appropriate API based on taskView
      switch (taskView) {
        case "recent":
          apiData = await taskApi.getRecentTasks();
          break;
        case "overdue":
          apiData = await taskApi.getOverdueTasks();
          break;
        case "upcoming": // Assuming "upcoming" maps to "not-done"
          apiData = await taskApi.getNotDoneTasks();
          break;
        default:
          apiData = await taskApi.getRecentTasks();
      }

      if (!apiData || apiData.length === 0) {
        setHasMoreData(false)
        if (!append) {
          setDisplayedTasks([])
        }
        setIsLoadingMore(false)
        return
      }

      // Process the data
      const processedTasks = apiData.map((task) => {
        const taskStartDate = parseTaskStartDate(task.task_start_date)
        const completionDate = task.submission_date ? parseTaskStartDate(task.submission_date) : null

        let status = "pending"
        if (completionDate || task.status === 'Yes') {
          status = "completed"
        } else if (taskStartDate && isDateInPast(taskStartDate)) {
          status = "overdue"
        }

        return {
          id: task.task_id,
          title: task.task_description,
          assignedTo: task.name || "Unassigned",
          taskStartDate: parseAndFormatDate(task.task_start_date),
          originalTaskStartDate: task.task_start_date,
          status: getTaskStatus(task.submission_date, task.status), // Add status field
          submissionDate: task.submission_date ? parseAndFormatDate(task.submission_date) : null,
          frequency: task.frequency || "one-time",
          rating: task.color_code_for || 0,
          department: task.department || "N/A",
          remarks: task.remark || "",
          rawTaskStartDate: task.task_start_date,
          rawSubmissionDate: task.submission_date,
        }
      })

      // Apply filters
      let filteredTasks = processedTasks.filter((task) => {
        // Apply search filter
        if (searchQuery && searchQuery.trim() !== "") {
          const query = searchQuery.toLowerCase().trim()
          const matchesSearch = (
            (task.title && task.title.toLowerCase().includes(query)) ||
            (task.id && task.id.toString().includes(query)) ||
            (task.assignedTo && task.assignedTo.toLowerCase().includes(query)) ||
            (task.remarks && task.remarks.toLowerCase().includes(query)) ||
            (task.taskStartDate && task.taskStartDate.toLowerCase().includes(query)) ||
            (task.status && task.status.toLowerCase().includes(query))
          )
          if (!matchesSearch) return false;
        }

        // For Recent tab, filter only today's tasks
        if (taskView === "recent") {
          if (!isToday(task.rawTaskStartDate)) return false;
        }

        // For Overdue tab, filter tasks where task_start_date < today AND submission_date is null
        if (taskView === "overdue") {
          const taskStartDate = parseTaskStartDate(task.rawTaskStartDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          // Check if task_start_date is before today AND submission_date is null
          if (taskStartDate) {
            const taskDate = new Date(taskStartDate);
            taskDate.setHours(0, 0, 0, 0);

            const isTaskDateBeforeToday = taskDate < today;
            const isSubmissionNull = !task.rawSubmissionDate || task.rawSubmissionDate === null || task.rawSubmissionDate === '';

            if (!(isTaskDateBeforeToday && isSubmissionNull)) {
              return false;
            }
          } else {
            return false; // Skip tasks with invalid start dates
          }
        }

        return true;
      })

      if (append) {
        setDisplayedTasks(prev => [...prev, ...filteredTasks])
      } else {
        setDisplayedTasks(filteredTasks)
      }

      // Set total count
      setTotalCount(filteredTasks.length)
      setHasMoreData(false)

    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }, [taskView, searchQuery, isLoadingMore])

  // Helper functions
  const parseTaskStartDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== "string") return null

    if (dateStr.includes("-") && dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
      const parsed = new Date(dateStr)
      return isNaN(parsed) ? null : parsed
    }

    if (dateStr.includes("/")) {
      const parts = dateStr.split(" ")
      const datePart = parts[0]
      const dateComponents = datePart.split("/")
      if (dateComponents.length !== 3) return null

      const [day, month, year] = dateComponents.map(Number)
      if (!day || !month || !year) return null

      const date = new Date(year, month - 1, day)
      if (parts.length > 1) {
        const timePart = parts[1]
        const timeComponents = timePart.split(":")
        if (timeComponents.length >= 2) {
          const [hours, minutes, seconds] = timeComponents.map(Number)
          date.setHours(hours || 0, minutes || 0, seconds || 0)
        }
      }
      return isNaN(date) ? null : date
    }

    const parsed = new Date(dateStr)
    return isNaN(parsed) ? null : parsed
  }

  const isDateInPast = (date) => {
    if (!date || !(date instanceof Date)) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const checkDate = new Date(date)
    checkDate.setHours(0, 0, 0, 0)
    return checkDate < today
  }

  // Initial load when component mounts or key dependencies change
  useEffect(() => {
    loadTasksFromApi(1, false)
    loadTaskCounts()
  }, [taskView, dashboardType, dashboardStaffFilter, departmentFilter])

  // Load when search changes
  useEffect(() => {
    if (currentPage === 1) {
      loadTasksFromApi(1, false)
    }
  }, [searchQuery])

  // Reset local staff filter when dashboardStaffFilter changes
  useEffect(() => {
    if (dashboardStaffFilter !== "all") {
      setFilterStaff("all")
    }
  }, [dashboardStaffFilter])

  // Render table headers based on task view
  const renderTableHeaders = () => {
    const baseHeaders = [
      { key: 'seq', label: 'Seq No.' },
      { key: 'id', label: 'Task ID' },
      { key: 'title', label: 'Task Description' },
      { key: 'assignedTo', label: 'Assigned To' },
    ];

    if (dashboardType === "checklist") {
      baseHeaders.push({ key: 'department', label: 'Department' });
    }

    baseHeaders.push(
      { key: 'taskStartDate', label: 'Task Start Date' },
      { key: 'frequency', label: 'Frequency' }
    );

    // Add Status column for Recent tasks
    if (taskView === "recent") {
      baseHeaders.push({ key: 'status', label: 'Status' });
    }

    // Add Remarks column only for Not Done tasks
    if (taskView === "upcoming") {
      baseHeaders.push({ key: 'remarks', label: 'Remarks' });
    }

    return baseHeaders;
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white">
      {/* Tab Headers with Counts */}
      <div className="grid grid-cols-3">
        <button
          className={`py-3 text-center font-medium transition-colors relative ${taskView === "recent" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          onClick={() => setTaskView("recent")}
        >
          {dashboardType === "delegation" ? "Today Tasks" : "Today's Tasks"}
          {/* <span className="absolute top-1 right-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {taskCounts.recent}
          </span> */}
        </button>
        <button
          className={`py-3 text-center font-medium transition-colors relative ${taskView === "upcoming" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          onClick={() => setTaskView("upcoming")}
        >
          {dashboardType === "delegation" ? "Future Tasks" : "Not Done Tasks"}
          {/* <span className="absolute top-1 right-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {taskCounts.upcoming}
          </span> */}
        </button>
        <button
          className={`py-3 text-center font-medium transition-colors relative ${taskView === "overdue" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          onClick={() => setTaskView("overdue")}
        >
          Overdue Tasks
          {/* <span className="absolute top-1 right-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {taskCounts.overdue}
          </span> */}
        </button>
      </div>

      <div className="p-4">
        {/* Total Count Display */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">
              Total Tasks:
              <span className="ml-2 text-blue-600 font-bold">{totalCount}</span>
            </span>
            <div className="text-xs text-gray-500">
              Showing {displayedTasks.length} of {totalCount} tasks
            </div>
          </div>
        </div>

        {displayedTasks.length === 0 && !isLoadingMore ? (
          <div className="text-center p-8 text-gray-500">
            <p>
              {taskView === "recent"
                ? "No tasks found for today."
                : `No tasks found for ${taskView} view.`
              }
            </p>
            {(dashboardStaffFilter !== "all" || departmentFilter !== "all") && (
              <p className="text-sm mt-2">Try adjusting your filters to see more results.</p>
            )}
          </div>
        ) : (
          <div
            className="task-table-container overflow-x-auto"
            style={{ maxHeight: "400px", overflowY: "auto" }}
          >
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  {renderTableHeaders().map((header) => (
                    <th
                      key={header.key}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayedTasks.map((task, index) => {
                  const sequenceNumber = index + 1;

                  return (
                    <tr key={`${task.id}-${task.taskStartDate}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                        {sequenceNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{task.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.assignedTo}</td>
                      {dashboardType === "checklist" && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.department}</td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {task.taskStartDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFrequencyColor(task.frequency)}`}>
                          {task.frequency.charAt(0).toUpperCase() + task.frequency.slice(1)}
                        </span>
                      </td>

                      {/* Status column - only for Recent tasks */}
                      {taskView === "recent" && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                        </td>
                      )}

                      {/* Remarks column - only for Not Done tasks */}
                      {taskView === "upcoming" && (
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {task.remarks || "—"}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {isLoadingMore && (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-500 mt-2">Loading tasks...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}