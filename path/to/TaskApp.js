import React, { useState } from 'react';
import { Plus } from 'react-feather';

const TaskApp = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ name: '', description: '', steps: [{ name: '', time: 0 }] });
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [currentView, setCurrentView] = useState('list');

  const addNewTask = () => {
    // Add new task to the list
    setTasks([...tasks, newTask]);
    setNewTask({ name: '', description: '', steps: [{ name: '', time: 0 }] });
  };

  const renderListView = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Task List</h2>
      {tasks.map((task, index) => (
        <div key={index} className="mb-4">
          <p className="text-gray-600">{task.name}</p>
          <p className="text-gray-600 mb-2">{task.description}</p>
          <ul>
            {task.steps.map((step, stepIndex) => (
              <li key={stepIndex}>
                <span>{step.name} ({step.time} min)</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );

  const renderFocusView = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Task Focus</h2>
      {tasks.map((task, index) => (
        <div key={index} className="mb-4">
          <p className="text-gray-600">{task.name}</p>
          <p className="text-gray-600 mb-2">{task.description}</p>
          <ul>
            {task.steps.map((step, stepIndex) => (
              <li key={stepIndex}>
                <span>{step.name} ({step.time} min)</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );

  const renderKanbanView = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Task Kanban</h2>
      {tasks.map((task, index) => (
        <div key={index} className="mb-4">
          <p className="text-gray-600">{task.name}</p>
          <p className="text-gray-600 mb-2">{task.description}</p>
          <ul>
            {task.steps.map((step, stepIndex) => (
              <li key={stepIndex}>
                <span>{step.name} ({step.time} min)</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );

  const renderCreateTaskView = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Create New Task</h2>
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
              updatedSteps[index].time = e.target.value;
              setNewTask({ ...newTask, steps: updatedSteps });
            }}
            className="p-2 border border-gray-300 rounded text-gray-800"
          />
        </div>
      ))}
    </div>
  );

  return (
    <div>
      {isCreatingTask ? renderCreateTaskView() : null}
      {currentView === 'list' ? renderListView() : null}
      {currentView === 'focus' ? renderFocusView() : null}
      {currentView === 'kanban' ? renderKanbanView() : null}
    </div>
  );
};

export default TaskApp;
