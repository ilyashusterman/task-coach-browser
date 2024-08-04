import React, { useState } from 'react';

const TaskApp = () => {
  const [tasks, setTasks] = useState([
    {
      name: 'Task 1',
      description: 'This is task 1',
      steps: [
        { name: 'Step 1', time: 10 },
        { name: 'Step 2', time: 20 },
      ],
    },
    {
      name: 'Task 2',
      description: 'This is task 2',
      steps: [
        { name: 'Step 3', time: 30 },
        { name: 'Step 4', time: 40 },
      ],
    },
  ]);

  const [newTask, setNewTask] = useState({
    name: '',
    description: '',
    steps: [{ name: '', time: '' }],
  });

  const [currentView, setCurrentView] = useState('list');
  const [isCreatingTask, setIsCreatingTask] = useState(false);

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
            className="w-full p-2 border border-gray-300 rounded text-gray-800"
          />
          <input
            type="number"
            placeholder="Step Time (minutes)"
            value={step.time}
            onChange={(e) => {
              const updatedSteps = [...newTask.steps];
              updatedSteps[index].time = e.target.value;
              setNewTask({ ...newTask, steps: updatedSteps });
            }}
            className="w-full p-2 border border-gray-300 rounded text-gray-800"
          />
        </div>
      ))}
    </div>
  );

  const handleCreateTask = () => {
    setIsCreatingTask(false);
    setTasks([...tasks, newTask]);
    setNewTask({
      name: '',
      description: '',
      steps: [{ name: '', time: '' }],
    });
  };

  return (
    <div className="bg-gray-100 h-screen p-4">
      {isCreatingTask ? (
        renderCreateTaskView()
      ) : (
        <button
          onClick={() => setCurrentView('create')}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Create New Task
        </button>
      )}
      {currentView === 'list' && renderListView()}
      {currentView === 'focus' && renderFocusView()}
      {currentView === 'kanban' && renderKanbanView()}
    </div>
  );
};

export default TaskApp;