// Import required modules
const express = require('express');
const path = require('path');
const fs = require('fs');

// Initialize an Express app
const app = express();

// Set the server port to an environment variable or 3000
const PORT = process.env.PORT || 3000;

// Define the path to the task.json file for reading and writing tasks
const DATA_FILE = path.join(__dirname, 'task.json');

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Parse incoming JSON request bodies
app.use(express.json());

// Function to read tasks from the file, returns tasks as an array
const readTasksFromFile = () => {
    if (fs.existsSync(DATA_FILE)) { // Check if the file exists
        const data = fs.readFileSync(DATA_FILE, 'utf8'); // Read file contents
        return JSON.parse(data); // Parse and return JSON data
    } else {
        return []; // Return empty array if file does not exist
    }
};

// Function to write tasks to the task.json file
const writeTaskToFile = (tasks) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2)); // Write tasks as formatted JSON to file
    } catch (err) {
        console.error('Error writing to the file:', err);
    }
};


// Route for serving the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // Send the HTML file to the client
});

app.get('/api/tasks', (req, res) => {
    const tasks = readTasksFromFile();
    res.status(200).json(tasks);
});

// Endpoint to handle adding a new task to the file
app.post('/api/tasks', (req, res) => {
    const newTask = {
        name: req.body.taskName,  // Extract the task name from the request body
        completed: false
    };

    if (newTask.name) { // If task is not empty
        const tasks = readTasksFromFile(); // Read existing tasks from file
        tasks.push(newTask); // Add the new task to the array
        writeTaskToFile(tasks); // Write the updated task list back to the file
        res.status(201).json({ message: 'Task tilføjet', tasks }); // Respond with success and the updated task list
    } else {
        res.status(400).json({ message: 'ingen task fundet' }); // Respond with an error if task is missing
    }
});

app.delete('/api/tasks/:index', (req,res) => {
   const taskIndex = parseInt(req.params.index, 10);
   const tasks = readTasksFromFile();

   if(taskIndex >= 0 && taskIndex < tasks.length){
       tasks.splice(taskIndex, 1);
       writeTaskToFile(tasks);
       res.status(200).json({message: 'Task deleted', tasks});
   } else{
       res.status(404).json({message: 'Task not found'});
   }
});

app.put('/api/tasks/:index', (req, res) => {
   const taskIndex = parseInt(req.params.index, 10);
   const tasks = readTasksFromFile();

   if(taskIndex >= 0 && taskIndex < tasks.length){
       tasks[taskIndex].completed = req.body.completed;
       writeTaskToFile(tasks);
       res.status(200).json({message: 'Task status updated', tasks});
   } else{
       res.status(404).json({message: 'Task not found'});
   }
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/`); // Log that the server is running
});
