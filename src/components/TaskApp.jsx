import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  Circle,
  Clock,
  ArrowRight,
  Pause,
  Plus,
} from "lucide-react";

const TaskApp = () => {
  const [tasks, setTasks] = useState([]);
  const [currentView, setCurrentView] = useState("list");
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentStep, setCurrentStep] = useState(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [newTask, setNewTask] = useState({
    name: "",
    description: "",
    steps: [],
  });

  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    setTasks(storedTasks);
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    const handleResize = () => {
      setCurrentView(window.innerWidth >= 768 ? "kanban" : "list");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const startTask = (task) => {
    setSelectedTask(task);
    setCurrentStep(task.steps[0]);
    setCurrentView("focus");
  };

  const completeStep = () => {
    if (currentStep) {
      const updatedTasks = tasks.map((task) => {
        if (task.id === selectedTask.id) {
          const updatedSteps = task.steps.map((step) =>
            step.id === currentStep.id ? { ...step, completed: true } : step
          );
          return { ...task, steps: updatedSteps };
        }
        return task;
      });
      setTasks(updatedTasks);
      const nextStep = selectedTask.steps.find(
        (step) => !step.completed && step.id > currentStep.id
      );
      if (nextStep) {
        setCurrentStep(nextStep);
      } else {
        setCurrentView(window.innerWidth >= 768 ? "kanban" : "list");
        setSelectedTask(null);
        setCurrentStep(null);
      }
    }
  };

  const addNewTask = () => {
    if (newTask.name && newTask.steps.length > 0) {
      const task = {
        ...newTask,
        id: Date.now(),
        totalTime: newTask.steps.reduce((sum, step) => sum + step.time, 0),
        completed: false,
      };
      setTasks([...tasks, task]);
      setNewTask({ name: "", description: "", steps: [] });
      setIsCreatingTask(false);
    }
  };

  const renderListView = () => (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div key={task.id} className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {task.name}
          </h2>
          <p className="text-gray-600 mb-2">{task.description}</p>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">
              <Clock className="inline mr-2 text-blue-500" />
              {task.totalTime} min
            </span>
            <button
              onClick={() => startTask(task)}
              className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-green-600 transition-colors"
            >
              Start Task
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderFocusView = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        {selectedTask.name}
      </h2>
      <div className="bg-blue-50 p-4 rounded-lg mb-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {currentStep.name}
        </h3>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">
            <Clock className="inline mr-2 text-blue-500" />
            {currentStep.time} min
          </span>
          <div className="space-x-4">
            <button className="text-yellow-500 hover:text-yellow-600">
              <Pause />
            </button>
            <button
              onClick={completeStep}
              className="text-green-500 hover:text-green-600"
            >
              <CheckCircle />
            </button>
            <button className="text-blue-500 hover:text-blue-600">
              <ArrowRight />
            </button>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {selectedTask.steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-center ${
              step.completed ? "text-green-500" : "text-gray-500"
            }`}
          >
            {step.completed ? (
              <CheckCircle className="mr-2" />
            ) : (
              <Circle className="mr-2" />
            )}
            <span>
              {index + 1}. {step.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderKanbanView = () => (
    <div className="flex space-x-4 overflow-x-auto p-4">
      <div className="flex-shrink-0 w-80">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">To Do</h2>
        <div className="space-y-4">
          {tasks
            .filter((task) => !task.completed)
            .map((task) => (
              <div key={task.id} className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {task.name}
                </h3>
                <p className="text-gray-600 mb-2">{task.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">
                    <Clock className="inline mr-2 text-blue-500" />
                    {task.totalTime} min
                  </span>
                  <button
                    onClick={() => startTask(task)}
                    className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-green-600 transition-colors"
                  >
                    Start
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
      <div className="flex-shrink-0 w-80">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          In Progress
        </h2>
        {/* Add in-progress tasks here */}
      </div>
      <div className="flex-shrink-0 w-80">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Completed</h2>
        {tasks
          .filter((task) => task.completed)
          .map((task) => (
            <div
              key={task.id}
              className="bg-green-50 p-4 rounded-lg shadow-md mb-4"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {task.name}
              </h3>
              <p className="text-gray-600 mb-2">{task.description}</p>
            </div>
          ))}
      </div>
    </div>
  );

  const renderCreateTaskView = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Create New Task
      </h2>
      <input
        type="text"
        placeholder="Task Name"
        value={newTask.name}
        onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
        className="w-full p-2 mb-4 border border-gray-300 rounded text-gray-800"
      />
      <textarea
        placeholder="Task Description"
        value={newTask.description}
        onChange={(e) =>
          setNewTask({ ...newTask, description: e.target.value })
        }
        className="w-full p-2 mb-4 border border-gray-300 rounded text-gray-800"
      />
      <h3 className="text-xl font-semibold text-gray-800 mb-2">Steps</h3>
      {newTask.steps.map((step, index) => (
        <div key={index} className="flex mb-2">
          <input
            type="text"
            placeholder="Step Name"
            value={step.name}
            onChange={(e) => {
              const updatedSteps = [...newTask.steps];
              updatedSteps[index].name = e.target.value;
              setNewTask({ ...newTask, steps: updatedSteps });
            }}
            className="flex-grow p-2 mr-2 border border-gray-300 rounded text-gray-800"
          />
          <input
            type="number"
            placeholder="Time (min)"
            value={step.time}
            onChange={(e) => {
              const updatedSteps = [...newTask.steps];
              updatedSteps[index].time = parseInt(e.target.value);
              setNewTask({ ...newTask, steps: updatedSteps });
            }}
            className="w-20 p-2 border border-gray-300 rounded text-gray-800"
          />
        </div>
      ))}
      <button
        onClick={() =>
          setNewTask({
            ...newTask,
            steps: [...newTask.steps, { name: "", time: 0 }],
          })
        }
        className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-600 transition-colors mb-4"
      >
        Add Step
      </button>
      <div className="flex justify-end">
        <button
          onClick={addNewTask}
          className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-green-600 transition-colors"
        >
          Create Task
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Task Master</h1>
          <button
            onClick={() => setIsCreatingTask(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            <Plus className="inline-block mr-2" />
            New Task
          </button>
        </div>
        {isCreatingTask && renderCreateTaskView()}
        {!isCreatingTask && (
          <>
            {currentView === "list" && renderListView()}
            {currentView === "focus" && renderFocusView()}
            {currentView === "kanban" && renderKanbanView()}
          </>
        )}
      </div>
    </div>
  );
};

export default TaskApp;
