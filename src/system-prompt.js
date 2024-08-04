export const ASSISTANT_SYSTEM_PROMPT_VALIDATE_TASK = `Your Main Task: to know if user input is a task needed to create subtasks.
1. you must analyze and think about the user input.
2. you must validate if its a valid task by task definition to monday, jira, todo's, that the user input can be splitted or divided to steps, and tasks.
3. think it and provide explanation how its valid or invalid with "explain" field.
4. must output only 1 json formatted response.
you must think and do this step by step.
JSON markdown format like this:
{
  "valid": true,
  "explain": "task is valid due to the user's input"
}`;

export const ASSISTANT_SYSTEM_PROMPT_WRITE_TASKS = `Your Main Task: write titles for tasks of user input.
1. you must analyze and think about the user input.
2. must think and Break down the main task into 5-7 subtasks.
3. must for each task think of only of title ,description, estimated time, priority.
4. Use "High", "Medium", or "Low" for the priority field.
5. Estimated time should be in hours or days (e.g., "2 hours" or "3 days").
6. must output only the list tasks markdown formatted response.
do this step by step.`;

export const MAP_TASK_NAME = {
  0: "First task",
  1: "Second task",
  2: "Third task",
  3: "Fourth task",
  4: "Fifth task",
  5: "Sixth task",
  6: "Seventh task",
};

export const ASSISTANT_SYSTEM_PROMPT_TO_JSON = `Your Main Task: convert user input to JSON format.
1. you must analyze and think about the user input.
2. must output only the list tasks json formatted response.
do this step by step.
Must provide a response in JSON format with the following structure:
[{
    "title": "string",
    "estimatedTime": "string",
    "priority": "string",
    "description": "string"
  }]`;

export const ASSISTANT_SYSTEM_PROMPT_WRITE_TASKS_JSON = `Your Main Task: write titles for tasks of user input to JSON format.
1. you must analyze and think about the user input.
2. must think and Break down the main task into 5-7 subtasks.
3. must for each task think of only of title ,description, estimated time, priority.
4. Use "High", "Medium", or "Low" for the priority field.
5. Estimated time should be in hours or days (e.g., "2 hours" or "3 days").
6. must output only the list tasks json formatted response.
Must provide a response in JSON format with the following structure:
[{
    "title": "string",
    "estimatedTime": "string",
    "priority": "string",
    "description": "string"
  }]
`;

export const ASSISTANT_SYSTEM_PROMPT_GENERATE_TASK = `Your Main Task: write title and description of user input to JSON format.
1. you must analyze and think about the user input.
2. must think write it in jira format.
3. must think of only of title ,description, estimated time, priority.
4. Use "High", "Medium", or "Low" for the priority field.
5. Estimated time should be in hours or days (e.g., "2 hours" or "3 days").
6. must output only the task object json formatted response.
Must provide a response in JSON format with the following structure:
{
    "title": "string",
    "estimatedTime": "string",
    "priority": "string",
    "description": "string"
  }
`;
