// TASK: import helper functions from utils - solved
import {
  getTasks, 
  createNewTask, 
  patchTask, 
  putTask, 
  deleteTask} from "./utils/taskFunctions.js"

// TASK: import initialData - solved
import {initialData} from "./initialData.js";

/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// localStorage.clear() // clear storage


// Function checks if local storage already has data, if not it loads initialData to localStorage

// intializeData function 
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true')
  } else {
    console.log('Data already exists in localStorage');
  }
}

// TASK: Get elements from the DOM - solved
const elements = {
  headerBoardName: document.querySelector("#header-board-name"),
  columnDivs: document.querySelectorAll(".column-div"),
  editTaskModal: document.querySelector(".edit-task-modal-window"),
  filterDiv: document.querySelector("#filterDiv"),
  hideSideBarBtn: document.querySelector("#hide-side-bar-btn"),
  showSideBarBtn: document.querySelector("#show-side-bar-btn"),
  themeSwitch: document.querySelector("#switch"),
  createNewTaskBtn: document.querySelector("#add-new-task-btn"),
  modalWindow: document.querySelector(".modal-window")
};
let activeBoard = ""

// Extracts unique board names from tasks - solved
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"))
    activeBoard = localStorageBoard ? localStorageBoard :  boards[0];  // changed ; to :
    elements.headerBoardName.textContent = activeBoard 
    styleActiveBoard(activeBoard)
    refreshTasksUI();

  }
}

// Creates different boards in the DOM - solved
// TASK: Fix Bugs

// displayBoards function 
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener('click', () => {  // added eventListener, arrow function
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard))
      styleActiveBoard(activeBoard)
    });
    boardsContainer.appendChild(boardElement);
  });

}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs

// filterAndDisplayTasksByBoard function 
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName);  // added strictly equal to

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    tasksContainer.setAttribute("class", "tasks-container")  // added setAttribute to set the value of the taskContainer attrubute
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => {  // added strictly equal to
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal - solved
      taskElement.addEventListener('click', () => {   // added evenListener
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);
    });
  });
}

// refreshTaskUI function
function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs - solved

// styleActiveBoard function
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { 
    
    if(btn.textContent === boardName) {
      btn.classList.add('active')   // added classList to manipulate the lists of classes for an HTML element
    }
    else {
      btn.classList.remove('active');  // added classList
    }
  });
}


// addTaskToUI function 
function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`); 
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');

  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.classList.add('task-div');
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);

  
  tasksContainer.appendChild(taskElement);
  refreshTasksUI();  // added for Visual Feedback: After certain actions like creating, editing, or completing a task, calling this function would provide immediate visual feedback to the user by updating the task list

//this code is to update the list of tasks stored in localStorage by adding a new task and then saving the updated list back to localStorage
initialData.push(task); // added
localStorage.setItem('tasks',JSON.stringify(initialData)) // added

}


// setupEventListeners Function
function setupEventListeners() {
  // Cancel editing task event listener - solved
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener('click', () => { // added eventListener
    toggleModal(false, elements.editTaskModal)
  });

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener('click', () => toggleSidebar(false)); // added eventListener
  elements.showSideBarBtn.addEventListener('click', () => toggleSidebar(true));  // added eventListener

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener('submit',  (event) => {
    addTask(event)
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' : 'none';   // changed => to :
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

// addTask function
function addTask(event) {
  event.preventDefault();

  //Assign user input to the task object - solved
    const task = {
      title: document.getElementById("title-input").value,
      description: document.getElementById("desc-input").value,
      status : document.getElementById("select-status").value,
      board : activeBoard
    };
    
    const newTask = createNewTask(task);
    if (newTask) {
      addTaskToUI(newTask);
      toggleModal(false);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
      event.target.reset();
      refreshTasksUI();
    }
}

// toggleSidebar function - solved
function toggleSidebar(show) {
  const sidebar = document.querySelector(".side-bar") // assigns class name .side-bar to the variable
  sidebar.style.display = show ? 'block' : 'none';   // if truthy it's set to block, if falsy sets to none
  elements.showSideBarBtn.style.display = show ? 'none' : 'block';
}

// toggleTheme function - solved
function toggleTheme() {
  const logo = document.getElementById("logo") // "logo" assigned to variable logo

  if(document.body.classList.toggle('light-theme') === true) { // updates to light-theme if strictly true
    logo.setAttribute('src', "./assets/logo-light.svg")
  } else {
    logo.setAttribute('src', "./assets/logo-dark.svg") // if no light then remains in dark-theme
  }
}


// openEditTaskModal function - solved
function openEditTaskModal(task) {
  // Set task details in modal inputs - solved
  
  const titleInput = document.getElementById("edit-task-title-input");
  const descInput = document.getElementById("edit-task-desc-input");
  const statusSelect = document.getElementById("edit-select-status");

  // Get button elements from the task modal - solved
  // sets the value of elements to match the properties of the task object passed to the function
  titleInput.value = task.title;  
  descInput.value = task.description;
  statusSelect.value = task.status;

  // Call saveTaskChanges upon click of Save Changes button - solved
  // when clicked, calls the functions with the tak's id
  const saveTaskChangesBtn = document.getElementById("save-task-changes-btn");
  const deleteTaskBtn = document.getElementById("delete-task-btn");

  saveTaskChangesBtn.addEventListener("click", () => {
    saveTaskChanges(task.id);
  });

  // Delete task using a helper function and close the task modal - solved

  deleteTaskBtn.addEventListener("click", () => {
    deleteTask(task.id);
    toggleModal(false, elements.editTaskModal);
  });

  toggleModal(true, elements.editTaskModal); // Show the edit task modal - only deletes when you refresh page :/
}

//  saveTaskChanges function - solved
function saveTaskChanges(taskId) {
  // Get new user inputs - solved
  const titleInput = document.getElementById("edit-task-title-input");
  const descInput = document.getElementById("edit-task-desc-input");
  const statusSelect = document.getElementById("edit-select-status");
  
  const newTitle = titleInput.value;
  const newDescription = descInput.value;
  const newStatus = statusSelect.value;

  // Create an object with the updated task details - solved
  const updateTask ={
  id: taskId,
  title: titleInput.value,
  description: descInput.value,
  status: statusSelect.value,

};
  // Update task using a helper function - solved
  patchTask(taskId, updateTask); // handles the updating of tasks in the data store or server

  // Close the modal and refresh the UI to reflect the changes - solved
  toggleModal(false, elements.editTaskModal);

  refreshTasksUI(); // calls to update the user interface
}

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  initializeData();
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}
