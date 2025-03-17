import React, { useState } from "react";
import {
  PlusCircle,
  BookOpen,
  Users,
  Calendar,
  FileText,
  CheckSquare,
} from "lucide-react";

// Mock data
const courseData = {
  id: "1",
  title: "Professional Debt Collection Skill",
  description:
    "Learn advanced techniques for debt collection management and communication strategies.",
  image: "/api/placeholder/400/200",
  instructor: "Tirta S.Kom",
  createdAt: "2025-01-15T08:30:00Z",
  updatedAt: "2025-03-10T14:45:00Z",
  meetings: [
    {
      id: "m1",
      title: "Introduction to Debt Collection Principles",
      meetingDate: "2025-03-20T09:00:00Z",
      modules: [
        {
          id: "mod1",
          title: "Basic Concepts of Debt Collection",
          content: "path/to/file.pdf",
        },
        { id: "mod2", title: "Legal Framework", content: "path/to/file.pdf" },
      ],
      quizzes: [
        {
          id: "q1",
          title: "Debt Collection Fundamentals Quiz",
          questions: "[]",
        },
      ],
      tasks: [
        {
          id: "t1",
          title: "Case Study Analysis",
          taskQuestion:
            "Analyze the provided case study and provide your recommendations.",
        },
      ],
    },
    {
      id: "m2",
      title: "Communication Strategies",
      meetingDate: "2025-03-27T09:00:00Z",
      modules: [
        {
          id: "mod3",
          title: "Effective Communication Techniques",
          content: "path/to/file.pdf",
        },
        {
          id: "mod4",
          title: "Handling Difficult Conversations",
          content: "path/to/file.pdf",
        },
      ],
      quizzes: [
        { id: "q2", title: "Communication Skills Assessment", questions: "[]" },
      ],
      tasks: [
        {
          id: "t2",
          title: "Role Playing Exercise",
          taskQuestion:
            "Record a video demonstrating proper debt collection communication.",
        },
      ],
    },
  ],
  students: [
    {
      id: "s1",
      name: "John Doe",
      email: "john@example.com",
      status: "enrolled",
    },
    {
      id: "s2",
      name: "Jane Smith",
      email: "jane@example.com",
      status: "enrolled",
    },
  ],
};

const DetailCoursePage = () => {
  const [selectedMeeting, setSelectedMeeting] = useState(
    courseData.meetings[0]
  );
  const [activeTab, setActiveTab] = useState("modules");

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Course Header */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">{courseData.title}</h1>
          <p className="text-gray-600 mb-4">{courseData.description}</p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Instructor: {courseData.instructor}</span>
            <span>•</span>
            <span>
              Last updated:{" "}
              {new Date(courseData.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <button className="px-4 py-2 border rounded flex items-center gap-2 hover:bg-gray-50">
            <Users size={16} /> Students ({courseData.students.length})
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2 hover:bg-blue-700">
            <PlusCircle size={16} /> Add Meeting
          </button>
        </div>
      </div>

      {/* Course Content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1 border rounded-lg p-4 bg-gray-50">
          <h2 className="font-semibold mb-4">Meetings</h2>
          <div className="space-y-2">
            {courseData.meetings.map((meeting) => (
              <div
                key={meeting.id}
                className={`p-3 rounded-md cursor-pointer ${
                  selectedMeeting.id === meeting.id
                    ? "bg-blue-100 border border-blue-300"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => setSelectedMeeting(meeting)}
              >
                <h3 className="font-medium text-sm">{meeting.title}</h3>
                <div className="flex items-center mt-1 text-xs text-gray-500">
                  <Calendar size={12} className="mr-1" />
                  {new Date(meeting.meetingDate).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3 border rounded-lg">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-lg">{selectedMeeting.title}</h2>
            <div className="flex items-center mt-1 text-sm text-gray-500">
              <Calendar size={14} className="mr-1" />
              {new Date(selectedMeeting.meetingDate).toLocaleDateString()}
            </div>
          </div>

          {/* Custom Tabs */}
          <div className="p-4">
            <div className="flex border-b mb-4">
              <button
                className={`px-4 py-2 flex items-center gap-1 ${
                  activeTab === "modules"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600"
                }`}
                onClick={() => setActiveTab("modules")}
              >
                <BookOpen size={16} /> Modules
              </button>
              <button
                className={`px-4 py-2 flex items-center gap-1 ${
                  activeTab === "quizzes"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600"
                }`}
                onClick={() => setActiveTab("quizzes")}
              >
                <FileText size={16} /> Quizzes
              </button>
              <button
                className={`px-4 py-2 flex items-center gap-1 ${
                  activeTab === "tasks"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600"
                }`}
                onClick={() => setActiveTab("tasks")}
              >
                <CheckSquare size={16} /> Tasks
              </button>
            </div>

            {/* Modules Tab Content */}
            {activeTab === "modules" && (
              <div className="space-y-4">
                {selectedMeeting.modules.map((module) => (
                  <div
                    key={module.id}
                    className="border rounded-lg p-4 bg-gray-50"
                  >
                    <h3 className="font-medium">{module.title}</h3>
                    <div className="flex items-center mt-2 text-sm">
                      <a
                        href="#"
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        <FileText size={14} className="mr-1" /> View Module
                      </a>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button className="px-3 py-1 text-sm border rounded hover:bg-gray-100">
                        Edit
                      </button>
                      <button className="px-3 py-1 text-sm border rounded hover:bg-gray-100">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-center mt-4">
                  <button className="w-full md:w-auto px-4 py-2 border rounded flex items-center justify-center gap-2 hover:bg-gray-50">
                    <PlusCircle size={16} /> Add Module
                  </button>
                </div>
              </div>
            )}

            {/* Quizzes Tab Content */}
            {activeTab === "quizzes" && (
              <div className="space-y-4">
                {selectedMeeting.quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="border rounded-lg p-4 bg-gray-50"
                  >
                    <h3 className="font-medium">{quiz.title}</h3>
                    <div className="flex items-center mt-2 text-sm">
                      <a
                        href="#"
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        <FileText size={14} className="mr-1" /> View Quiz
                      </a>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button className="px-3 py-1 text-sm border rounded hover:bg-gray-100">
                        Edit
                      </button>
                      <button className="px-3 py-1 text-sm border rounded hover:bg-gray-100">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-center mt-4">
                  <button className="w-full md:w-auto px-4 py-2 border rounded flex items-center justify-center gap-2 hover:bg-gray-50">
                    <PlusCircle size={16} /> Add Quiz
                  </button>
                </div>
              </div>
            )}

            {/* Tasks Tab Content */}
            {activeTab === "tasks" && (
              <div className="space-y-4">
                {selectedMeeting.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="border rounded-lg p-4 bg-gray-50"
                  >
                    <h3 className="font-medium">{task.title}</h3>
                    <p className="text-sm text-gray-600 mt-2">
                      {task.taskQuestion}
                    </p>
                    <div className="mt-4 flex gap-2">
                      <button className="px-3 py-1 text-sm border rounded hover:bg-gray-100">
                        Edit
                      </button>
                      <button className="px-3 py-1 text-sm border rounded hover:bg-gray-100">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-center mt-4">
                  <button className="w-full md:w-auto px-4 py-2 border rounded flex items-center justify-center gap-2 hover:bg-gray-50">
                    <PlusCircle size={16} /> Add Task
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailCoursePage;
