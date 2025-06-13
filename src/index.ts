#!/usr/bin/env node

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';

const program = new Command();
const TODO_FILE = path.join(process.cwd(), 'todos.json');

interface Todo {
  id: number;
  task: string;
  completed: boolean;
}

function loadTodos(): Todo[] {
  if (!fs.existsSync(TODO_FILE)) {
    return [];
  }
  const data = fs.readFileSync(TODO_FILE, 'utf8');
  return JSON.parse(data);
}

function saveTodos(todos: Todo[]) {
  fs.writeFileSync(TODO_FILE, JSON.stringify(todos, null, 2), 'utf8');
}

program
  .name('todo')
  .description('A simple CLI todo list application')
  .version('1.0.0');

program
  .command('add <task>')
  .description('Add a new todo item')
  .action((task: string) => {
    const todos = loadTodos();
    const newId = todos.length > 0 ? Math.max(...todos.map(todo => todo.id)) + 1 : 1;
    todos.push({ id: newId, task, completed: false });
    saveTodos(todos);
    console.log(`Added todo: "${task}" (ID: ${newId})`);
  });

program
  .command('list')
  .description('List all todo items')
  .action(() => {
    const todos = loadTodos();
    if (todos.length === 0) {
      console.log('No todo items yet!');
      return;
    }
    todos.forEach(todo => {
      console.log(`${todo.id}. [${todo.completed ? 'x' : ' '}] ${todo.task}`);
    });
  });

program
  .command('complete <id>')
  .description('Mark a todo item as completed')
  .action((id: string) => {
    const todoId = parseInt(id, 10);
    if (isNaN(todoId)) {
      console.error('Error: Invalid ID. Please provide a number.');
      return;
    }

    const todos = loadTodos();
    const todoIndex = todos.findIndex(todo => todo.id === todoId);

    if (todoIndex === -1) {
      console.error(`Error: Todo with ID ${todoId} not found.`);
      return;
    }

    todos[todoIndex].completed = true;
    saveTodos(todos);
    console.log(`Marked todo ${todoId} as completed.`);
  });

program
  .command('remove <id>')
  .description('Remove a todo item')
  .action((id: string) => {
    const todoId = parseInt(id, 10);
    if (isNaN(todoId)) {
      console.error('Error: Invalid ID. Please provide a number.');
      return;
    }

    let todos = loadTodos();
    const initialLength = todos.length;
    todos = todos.filter(todo => todo.id !== todoId);

    if (todos.length === initialLength) {
      console.error(`Error: Todo with ID ${todoId} not found.`);
      return;
    }

    saveTodos(todos);
    console.log(`Removed todo ${todoId}.`);
  });

program.parse(process.argv);
