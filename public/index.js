
// Event listener for DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
    loadTask(); // Call the function to load tasks when the page is loaded
});

// Function to load tasks from the server
function loadTask(){
    fetch('/api/tasks')  // Fetch tasks from the API endpoint
        .then(response => response.json())  // Parse the JSON response
        .then(tasks => {
            const taskList = document.getElementById('tasks');  // Get the task list element
            taskList.innerHTML = '';  // Clear the current task list

            // Loop through the tasks and display them in the list
            tasks.forEach((task, index) => {
                const li = document.createElement('li');  // Create a new list item

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.style.marginRight = '10px';
                checkbox.checked = task.completed;
                checkbox.onclick = () => toggleTaskCompletion(task, li);

                const taskNameSpan = document.createElement('span');
                taskNameSpan.textContent = task.name;
                taskNameSpan.style.textDecoration = task.completed ? 'line-through' : 'none'

                const deleteButton = document.createElement('button');  // Create a delete button
                deleteButton.textContent = 'Delete';  // Set button text
                deleteButton.onclick = () => deleteTask(index);  // Set the delete functionality

                li.appendChild(checkbox);
                li.appendChild(taskNameSpan);
                li.appendChild(deleteButton);  // Add the delete button to the list
                taskList.appendChild(li);  // Add the task to the list
            });
        });
}

function toggleTaskCompletion(task, listItem){
    task.completed = !task.completed;
    listItem.style.textDecoration = task.completed ? 'line-through' : 'none';

    fetch(`api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
            'Content-type' : 'application/json',
        },
        body: JSON.stringify({completed: task.completed}),
    })
        .then(response => {
            if(!response.ok){
                throw new Error('Failed to update task completion status');
            }
            return response.json();
        })
        .catch(error => {
           console.error('Error task completion status:', error);
        });
}

// Event listener for task form submission
document.getElementById('taskform').addEventListener('submit', function(event){
    event.preventDefault();  // Prevent default form submission

    const task = document.getElementById('taskName').value;  // Get the task input value

    if(task){
        addTask(task);  // Call the function to add the task
        document.getElementById('taskName').value = '';  // Clear the input field
    }
});

// Function to add a new task
function addTask(taskName){
    fetch('/api/tasks', {  // Make a POST request to the API
        method: 'POST',
        headers: {
            'Content-type': 'application/json',  // Set the request headers to JSON
        },
        body: JSON.stringify({taskName:taskName, completed: false})  // Send the task in the request body
    })
        .then(response => {
            if(response.ok){
                return  response.json();  // Parse the response if successful
            } else{
                throw new Error('Something went wrong');  // Handle errors
            }
        })
        .then(data => {
            const taskList = document.getElementById('tasks');  // Get the task list element
            const li = document.createElement('li');  // Create a new list item

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.style.marginRight = '10px';
            checkbox.checked = false;
            checkbox.onclick = () => toggleTaskCompletion({ name: taskName, completed: false }, li);

            const taskNameSpan = document.createElement('span');
            taskNameSpan.textContent = taskName;
            taskNameSpan.style.textDecoration = 'none';

            const deleteButton = document.createElement('button');  // Create a delete button
            deleteButton.textContent = 'Delete';  // Set button text
            deleteButton.onclick = () => deleteTask(data.tasks.length - 1);  // Use the latest index for deletion

            li.appendChild(checkbox);
            li.appendChild(taskNameSpan);
            li.appendChild(deleteButton);  // Add the delete button to the list item
            taskList.appendChild(li);  // Add the task to the list
        })
        .catch(error => {
            console.error(error);  // Log any errors
        });
}

// Function to delete a task by ID
function deleteTask(taskID){
    fetch(`/api/tasks/${taskID}`,{  // Make a DELETE request to the API
        method: 'DELETE',
    })
        .then(response => {
            if(!response){
                throw new Error('Network not okay');  // Handle network errors
            }
            return response.json();  // Parse the JSON response
        })
        .then(data => {
            console.log('Task deleted successfully');  // Log success
            loadTask();  // Reload the task list after deletion
        })
        .catch(error => {
            console.error("Error deleting request:", error);  // Log any errors
        });
}
