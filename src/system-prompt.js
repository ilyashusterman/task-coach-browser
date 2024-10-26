export const ASSISTANT_SYSTEM_PROMPT_VALIDATE_TASK = `Your Main Task: to validate if user input is a task like in jira or todo.
1. you must analyze and think about the user input if its valid task or not.
2. you must validate if its a valid task by task definition to monday, jira, todo's, that the user input can be splitted or divided to steps, and tasks.
3. think it and provide explanation how its valid or invalid with "explanation" field.
you must think and do this step by step.
you must replay and return only json output with "valid" field and "explanation" field.
JSON string markdown format:
'''json
{
  "valid": true,
  "explanation": "task is valid due to the user's input"
}'''
#####TOOL_CHOICE_START######
{
    "name": "validate_task",
    "description": "Validates if the input text can be recognized as a task, providing an explanation on validity.",
    "parameters": {
        "type": "object",
        "properties": {
            "valid": {
                "type": "boolean",
                "description": "Indicates if the input is a valid task."
            },
            "explanation": {
                "type": "string",
                "description": "Provides a detailed explanation on why the input is considered valid or invalid as a task."
            }
        },
        "required": [
            "valid",
            "explanation"
        ]
    }
}
#####TOOL_CHOICE_END######
`;
export const ASSISTANT_SYSTEM_PROMPT_WRITE_TASKS = `Your Main Task: write titles for tasks of user input.
1. you must analyze and think about the user input.
2. must think and Break down the main task into 5-7 subtasks.
3. must for each task think of only of title ,description, estimated time, priority.
4. Use "High", "Medium", or "Low" for the priority field.
5. Estimated time should be in hours or days (e.g., "2 hours" or "3 days").
6. must output only the list tasks markdown formatted response.
do this step by step.`;

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
  #####TOOL_CHOICE_START######
  {
      "name": "write_tasks_json",
      "description": "Writes task titles and details in a structured JSON format based on user input, providing task breakdowns with title, description, estimated time, and priority.",
      "parameters": {
        "type": "object",
        "properties": {
          "tasks": {
            "type": "array",
            "description": "List of tasks with title, description, estimated time, and priority fields.",
            "items": {
              "type": "object",
              "properties": {
                "title": {
                  "type": "string",
                  "description": "The title of the task, summarizing the main activity."
                },
                "description": {
                  "type": "string",
                  "description": "A brief description of what the task entails."
                },
                "estimatedTime": {
                  "type": "string",
                  "description": "Estimated time required to complete the task, in hours or days."
                },
                "priority": {
                  "type": "string",
                  "enum": ["High", "Medium", "Low"],
                  "description": "The priority level of the task."
                }
              },
              "required": ["title", "description", "estimatedTime", "priority"]
            }
          }
        },
        "required": ["tasks"]
      }
  }
  #####TOOL_CHOICE_END######
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
