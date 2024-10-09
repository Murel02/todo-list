const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

const DATA_FILE = path.join(__dirname, 'task.json');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());


//Læser tasks fra fil
const readTasksFromFile = () => {
  if(fs.existsSync(DATA_FILE)){
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
  } else{
      return [];
  }
};


// Laver tasks fra json til string
const writeTaskToFile = (tasks) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
};


// viser html filen
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
});


// Endpoint for at tilføje en ny task til filen
app.post('/api/tasks', (req, res) => {
   const newTask = req.body.taskname;

   if(newTask){
       const tasks = readTasksFromFile();
       tasks.push(newTask);
       writeTaskToFile(tasks);
       res.status(201).json({message: 'Task tilføjet', tasks});
   } else{
       res.status(400).json({message: 'ingen task fundet'});
   }
});

app.listen(PORT, () => {
   console.log(`Server running on http://localhost:${PORT}/`);
});
