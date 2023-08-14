document.addEventListener('DOMContentLoaded', () => {
    const apiBaseUrl = 'https://mockapi.io/projects/64d68e012a017531bc12bfa6/todoapp'; // API URL'si

    const addbtn = document.querySelector('.todoapp__button');
    addbtn.addEventListener('click', () => {
        createTodo();
    });

    const selectAllCheckbox = document.getElementById('select-all-checkbox');
    const todoCheckboxes = document.querySelectorAll('.new-checkbox');

    selectAllCheckbox.addEventListener('change', () => {
        const isChecked = selectAllCheckbox.checked;
        todoCheckboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
        });
    });

    function taskNerde(task, taskId) {
        const todolist = document.querySelector('#todoapp__list');
        const tr = document.createElement('tr');
        const checkboxinput = document.createElement('input');
        checkboxinput.type = 'checkbox';
        checkboxinput.classList.add('new-checkbox');
        const checkbox = document.createElement('td');
        checkbox.appendChild(checkboxinput);
        tr.appendChild(checkbox);

        const todoname = document.createElement('td');
        todoname.classList.add('new-name');
        todoname.textContent = task.content;
        tr.appendChild(todoname);

        const tododescription = document.createElement('td');
        tododescription.classList.add('new-description');
        tododescription.textContent = task.description;
        tr.appendChild(tododescription);

        const statusCell = document.createElement("td");
        const pendingSpan = document.createElement("span");
        pendingSpan.classList.add("pending");
        pendingSpan.textContent = "pending";
        statusCell.appendChild(pendingSpan);
        tr.appendChild(statusCell);

        pendingSpan.addEventListener("click", function () {
            const newStatus = !task.status; 
            updateStatus(taskId, newStatus); 
            task.status = newStatus;
            if (newStatus == true) {
                pendingSpan.textContent = "completed";
                pendingSpan.style.backgroundColor = "green";
                todoname.style.textDecoration = "line-through";
                tododescription.style.textDecoration = "line-through";
                tr.style.backgroundColor = "#f0f0f0";
            } else {
                pendingSpan.textContent = "pending";
                pendingSpan.style.backgroundColor = "red";
                todoname.style.textDecoration = "none";
                tododescription.style.textDecoration = "none";
                tr.style.backgroundColor = "white";
            }
            saveTasksToLocalStorage();
        });

        function updateStatus(taskId, newStatus) {
            fetch(`https://64d68e012a017531bc12bfa5.mockapi.io/todoapp/${taskId}`, {
              method: "PUT",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ status: newStatus }),
            })
              .then((res) => {
                if (!res.ok) {
                  throw new Error("HTTP error " + res.status);
                }
              })
              .catch((error) => {
                console.error("Error:", error);
              });
          }

        const actionCell = document.createElement('td');
        const editspan = document.createElement('span');
        editspan.textContent = 'Edit';
        editspan.classList.add('edit');

        const deletespan = document.createElement('span');
        deletespan.textContent = 'Delete';
        deletespan.classList.add('delete');

        actionCell.appendChild(editspan);
        actionCell.appendChild(deletespan);
        tr.appendChild(actionCell);

        function Delete(taskId) {
            fetch(`${apiBaseUrl}/${taskId}`, { // API URL'si burada kullanılmalı
                method: 'DELETE',
            })
                .then((res) => {
                    if (res.ok) {
                        console.log('Task is deleted.');
                        const taskRow = document.querySelector(`[data-task-id="${taskId}"]`);
                        if (taskRow) {
                            taskRow.remove();
                        }
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        }

        deletespan.setAttribute('data-task-id', taskId);
        deletespan.addEventListener('click', function () {
            const taskIdToDelete = deletespan.getAttribute('data-tadk-id');
            Delete(taskIdToDelete);
            todolist.removeChild(tr);
        });

        function Editcell(tdElement) {
            const input = document.createElement('input');
            input.type = 'text';
            input.classList.add('edit-input');

            input.value = tdElement.textContent;
            tdElement.textContent = '';
            tdElement.appendChild(input);

            return input;
        }

        function Edit(taskId, tr) {
            const nameCell = tr.querySelector(".new-name");
            const descriptionCell = tr.querySelector(".new-description");

            const nameinput = Editcell(nameCell);
            const descriptioninput = Editcell(descriptionCell);

            const editButton = tr.querySelector(".edit");
            editButton.textContent = "Save";

            function handleSaveClick() {
                const updatedTitle = nameinput.value;
                const updatedDescription = descriptioninput.value;

                const updateTaskData = {
                    content: updatedTitle,
                    description: updatedDescription,
                };

                fetch(`https://64d68e012a017531bc12bfa5.mockapi.io/todoapp/${taskId}`, {
                    method: "PUT",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify(updateTaskData),
                })
                    .then((res) => {
                        if (res.ok) {
                            return res.json();
                        }
                    })
                    .then((updatedTask) => {
                        console.log("Task updated:", updatedTask);

                        nameCell.textContent = updatedTitle;
                        descriptionCell.textContent = updatedDescription;
                        editButton.textContent = "Edit";
                        editButton.removeEventListener("click", handleSaveClick);
                        editButton.addEventListener("click", handleEditClick);
                    })
                    .catch((error) => {
                        console.error("Error:", error);
                    });
            }

            function handleEditClick() {
                editButton.removeEventListener("click", handleEditClick);
                editButton.addEventListener("click", handleSaveClick);
            }

            editButton.removeEventListener("click", handleEditClick);
            editButton.addEventListener("click", handleSaveClick);
        }

        todolist.appendChild(tr);

        editspan.setAttribute("data-task-id", taskId);
        editspan.addEventListener("click", function () {
            const taskIdToEdit = editspan.getAttribute("data-task-id");
            Edit(taskIdToEdit, tr);
        });
    
    }

   
    todolist.appendChild(tr);

    addbtn.addEventListener('click', () => {
        createTodo();
    });

    function createTodo() {
        const todotitle = document.querySelector('.todotitle');
        const description = document.querySelector('.description');

        if (todotitle.value.trim() === '') {
            console.log('Görev boş bırakılamaz.');
            alert('Lütfen alanı doldurunuz.');
            return;
        }

        const newTask = {
            content: todotitle.value,
            description: description.value,
            status: true,
        };

        taskNerde(newTask);

        fetch(`${apiBaseUrl}`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(newTask),
        })
            .then((res) => {
                if (res.ok) {
                    return res.json();
                }
            })
            .then((task) => {
                console.log('New task added:', task);
                taskNerde(task);
            })
            .catch((error) => {
                console.error('Error:', error);
            });

        todotitle.value = '';
        description.value = '';
    }



    function loadTasksFromLocalStorage() {
        const savedTasks = localStorage.getItem("tasks");
        if (savedTasks) {
            const tasks = JSON.parse(savedTasks);
            tasks.forEach((task) => {
                taskNerde(task);
            });
        }
    }

    function loadTaskStatusFromLocalStorage() {
        const savedTaskStatus = localStorage.getItem("taskStatus");
        if (savedTaskStatus) {
            const taskStatus = JSON.parse(savedTaskStatus);
            const pendingSpans = document.querySelectorAll(".pending");
            pendingSpans.forEach((pendingSpans, index) => {
                if (taskStatus[index]) {
                    completeTaskUI(pendingSpans);
                }
            });
        }
    }

    function completeTaskUI(pendingSpan) {
        pendingSpan.textContent = "Completed";
        pendingSpan.style.backgroundColor = "green";
        const tr = pendingSpan.parentElement.parentElement;
        const nameCell = tr.querySelector(".new-name");
        const descriptionCell = tr.querySelector(".new-description");
        nameCell.style.textDecoration = "line-through";
        descriptionCell.style.textDecoration = "line-through";
        tr.style.backgroundColor = "#f0f0f0";
    }

    loadTasksFromLocalStorage();
    loadTaskStatusFromLocalStorage();

    function saveTasksToLocalStorage() {
        const tasks = Array.from(document.querySelectorAll(".new-name")).map(
            (nameCell) => {
                const tr = nameCell.parentElement;
                return {
                    content: nameCell.textContent,
                    description: tr.querySelector(".new-description").textContent,
                };
            }
        );
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    function saveTaskStatusToLocalStorage() {
        const pendingSpans = document.querySelectorAll(".pending");
        const taskstatus = Array.from(pendingSpans).map(
            (pendingSpan) => pendingSpan.textContent === "Completed"
        );
        localStorage.setItem("taskstatus", JSON.stringify(taskstatus));
    }

    window.addEventListener('beforeunload', () => {
        saveTasksToLocalStorage();
        saveTaskStatusToLocalStorage();
    });

    console.log();

});