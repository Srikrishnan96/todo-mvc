

function AppView() {
    var incompleteTaskListView;
    var completedTaskListView;
    var taskLayerBreadCrumbViewInstance;
    var controllerHelpers = null;

    this.helpers = {
        INVERSE: {
            completed: "incomplete",
            incomplete: "completed",
        },
        STATUS_SWITCH_NAME: {
            completed: "Mark incomplete",
            incomplete: "Mark completed"
        }
    }

    this.fetchTasks = function(taskID) {
        return controllerHelpers.fetchTasks(taskID);
    }
    this.fetchTasksAndUpdateView = function(taskID, taskName) {

        var subTaskList = controllerHelpers.fetchTasks(taskID);

        if(!subTaskList) return;

        incompleteTaskListView.setTasks(subTaskList);
        completedTaskListView.setTasks(subTaskList);
        taskLayerBreadCrumbViewInstance.addLayer(taskID, taskName);
    }
    this.deleteTask = function(superTaskID, taskID) {
        controllerHelpers.deleteTask(superTaskID, taskID);
    }
    this.putNewTask = function(superTaskID, taskName) {
        return controllerHelpers.putNewTask(superTaskID, taskName);
    }
    this.updateTask = function(task) {
        var ID = task.ID;
        var name = task.name;
        var superTaskID = task.superTaskID;
        var status = task.status;
        var hasSubTasks = task.hasSubTasks;

        controllerHelpers.updateTask({
            ID: ID,
            name: name,
            status: status,
            superTaskID: superTaskID,
            hasSubTasks: hasSubTasks,
        });
    }

    this.onSwitchStatus = function(task, taskNode) {
        if(task.status === "completed") {
            incompleteTaskListView.removeTaskNode(task.ID, taskNode);
            completedTaskListView.appendTaskNode(task, taskNode);
        } else {
            completedTaskListView.removeTaskNode(task.ID, taskNode);
            incompleteTaskListView.appendTaskNode(task, taskNode);
        }
    }
    this.addBreadCrumbLayer = function(taskID, taskName) {
        taskLayerBreadCrumbViewInstance.addLayer(taskID, taskName);
    }
    this.newSubListComponent = function(superTaskID) {
        incompleteTaskListView.newSubListComponent(superTaskID);
        completedTaskListView.newSubListComponent(superTaskID);
    }

    this.initAppView = function(controllerHelperFunctions) {
        var appComponent = document.getElementById("app");
        var homeTaskList = controllerHelperFunctions.fetchTasks("HOME");

        controllerHelpers = controllerHelperFunctions;

        var appDataHelpers = {
            fetchTasks: this.fetchTasks,
            fetchTasksAndUpdateView: this.fetchTasksAndUpdateView,
            deleteTask: this.deleteTask,
            putNewTask: this.putNewTask,
            updateTask: this.updateTask,
            onSwitchStatus: this.onSwitchStatus,
            statusHelpers: this.helpers,
            addBreadCrumbLayer: this.addBreadCrumbLayer,
            newSubListComponent: this.newSubListComponent,
        };

        incompleteTaskListView = new TaskListView("incomplete","HOME", homeTaskList, appDataHelpers);
        completedTaskListView = new TaskListView("completed","HOME", homeTaskList, appDataHelpers);
        taskLayerBreadCrumbViewInstance = new TaskLayerBreadCrumbView({ID: "HOME", name: "HOME"}, appDataHelpers);

        appComponent.appendChild(appHeadingView());
        appComponent.appendChild(taskLayerBreadCrumbViewInstance.render());
        appComponent.appendChild(addTaskView(incompleteTaskListView.onAddTask.bind(incompleteTaskListView)));
        appComponent.appendChild(incompleteTaskListView.render());
        appComponent.appendChild(completedTaskListView.render());
    }
}


function MakeReRenderable(constructor) {
    Object.assign(constructor.prototype, MakeReRenderable.prototype);
}
MakeReRenderable.prototype.reRender = function() {
    this.node.replaceWith(this.render());
}
MakeReRenderable.prototype.render = function() {}



function appHeadingView() {
    var headingComponent = document.createElement("h2");

    headingComponent.innerText = "TODOS APP";
    headingComponent.className = "app-heading";

    return headingComponent;
}
function addTaskView(onAddTask) {
    var addTaskComponent = document.createElement('div');
    var addTaskInput = document.createElement('input');
    var addTaskButton = document.createElement('button');

    function inputHandler(e) {
        if(e.keyCode !== 13) return;

        var taskName = e.target.value;

        if(taskName.trim() === "") return;
        e.target.value = "";
        onAddTask(taskName);
    }
    function buttonHandler(e) {
        var taskName = e.target.previousSibling.value;

        if(taskName.trim() === "") return;

        e.target.previousSibling.value = "";
        onAddTask(taskName);
    }

    addTaskButton.id = "add-task-button";
    addTaskButton.innerText = "Add task";
    addTaskButton.addEventListener("click", buttonHandler);

    addTaskInput.id = "add-task-input";
    addTaskInput.setAttribute("reference-ID", "add-task-input");
    addTaskInput.placeholder = "New task name";
    addTaskInput.addEventListener("keyup", inputHandler);
    addTaskInput.autofocus = true;

    addTaskComponent.id = "add-task";
    addTaskComponent.appendChild(addTaskInput);
    addTaskComponent.appendChild(addTaskButton);

    return addTaskComponent;
}



function TaskLayerBreadCrumbView(homeLayer, appView) {
    this.layers = [homeLayer];
    this.node = null;
    this.appView = appView;
    this.boundGoToLayerHandler = this.goToLayerHandler.bind(this);
}
//Making TaskLayerBreadCrumbView Component a ReRenderable
MakeReRenderable(TaskLayerBreadCrumbView);

TaskLayerBreadCrumbView.prototype.goToLayerHandler = function(e) {
    var taskID = e.target.getAttribute("taskID");
    var taskName = e.target.innerText;
    var layerIndex = this.layers.findIndex(function(layer) {
        return layer.ID == taskID;
    });

    this.layers = this.layers.slice(0, layerIndex);
    this.reRender();
    this.appView.fetchTasksAndUpdateView(taskID, taskName);
}
TaskLayerBreadCrumbView.prototype.getNewLayer = function(layerID, layerName) {
    var layerNode = document.createElement('span');
    var layerNameNode = document.createElement('span');
    var layerNameDivider = document.createElement('span');

    layerNode.className = "layer-level";

    layerNameNode.innerText = layerName;
    layerNameNode.className = "layer-level-name";
    layerNameNode.setAttribute("taskID", layerID);

    layerNameDivider.innerText = " / ";
    layerNameDivider.className = "layer-level-divider";

    if(layerName !== "HOME") layerNode.appendChild(layerNameDivider);
    layerNode.appendChild(layerNameNode);

    return layerNode;
}
TaskLayerBreadCrumbView.prototype.addLayer = function(taskID, taskName) {
    this.layers.push({ID: taskID, name: taskName});
    this.reRender();
}
TaskLayerBreadCrumbView.prototype.render = function() {
    var breadCrumbNode = document.createElement("div");

    breadCrumbNode.id = "task-layer-level-nav";
    this.layers.forEach((function(layer, index) {
        var layerNode = this.getNewLayer(layer.ID, layer.name);

        breadCrumbNode.appendChild(layerNode);

        if(index !== this.layers.length-1) {
            layerNode.lastChild.addEventListener("click", this.goToLayerHandler.bind(this));
        }
    }).bind(this));

    this.node = breadCrumbNode;
    return this.node;
}



function TaskView(ID, name, status, superTaskID, hasSubTasks, onRemoveTask, onSwitchStatus, helpersFromAppView) {
    this.ID = ID
    this.name = name;
    this.status = status;
    this.superTaskID = superTaskID;
    this.hasSubTasks = hasSubTasks;
    this.onRemoveTask = onRemoveTask;
    this.onSwitchStatus = onSwitchStatus;
    this.helpersFromAppView = helpersFromAppView;
    this.node = null;
}
//Making TaskLayerBreadCrumbView Component a ReRenderable
MakeReRenderable(TaskView);

TaskView.prototype.removeHandler = function(e) {
    this.onRemoveTask(this.ID, this.node);
}
TaskView.prototype.statusSwitchHandler = function(e) {
    this.status = this.helpersFromAppView.statusHelpers.INVERSE[this.status];
    this.helpersFromAppView.updateTask(this);
    this.onSwitchStatus(this.ID, this.status, this.node);
    this.reRender();
}
TaskView.prototype.getSubTaskListHandler = function(e) {
    this.helpersFromAppView.fetchTasksAndUpdateView(this.ID, this.name);
}

const onEditButtonClick = function(e) {
    var nameNode = e.target.previousSibling;
    var name = nameNode.innerText;

    taskView.renderEditorInput(nameNode);
}
const onEditorInputChange = function(e) {
    var inputNode = e.target;
    var newName = inputNode.value;

    if(newName.trim() !== "") {
        taskView.updateTask("name", newName, inputNode.parentNode.getAttribute("task-ID"));
    }
    taskView.renderNewNameNode(inputNode);
}
const renderEditorInput = function(nameNode) {
    var editInput = document.createElement("input");

    editInput.value = nameNode.innerText;
    editInput.addEventListener('change', taskController.onEditorInputChange);

    nameNode.replaceWith(editInput);
}
const renderNewNameNode = function(inputNode) {
    var taskComponent = inputNode.parent;
    var newName = inputNode.value.trim() === "" ? taskComponent.getAttribute("task-name") : inputNode.value;
    var newNameNode = document.createElement("span");

    newNameNode.innerText = newName;
    newNameNode.addEventListener("click", this.GETSUBTASKS);
    newNameNode.className = "task-name";

    taskComponent.setAttribute("task-name", newName);
    inputNode.replaceWith(newNameNode);
}

TaskView.prototype.editHandler = function(e) {
    var editInput = document.createElement("input");
    var nameNode = e.target.previousSibling;

    editInput.value = nameNode.innerText;
    editInput.addEventListener('change', (function(evt) {
        if(evt.target.value.trim() !== "") {
            this.name = evt.target.value;
            this.helpersFromAppView.updateTask(this);
            nameNode.innerText = evt.target.value;
        }
        evt.target.replaceWith(nameNode);
    }).bind(this));
    nameNode.replaceWith(editInput);
    editInput.focus();
}
TaskView.prototype.addSubTaskHandler = function() {
    var hasSubTasks = !!this.helpersFromAppView.fetchTasks(this.ID);
    var addTaskInput = document.querySelector("[reference-ID=add-task-input]");
    if(hasSubTasks) {
        this.helpersFromAppView.fetchTasksAndUpdateView(this.ID, this.name);
    } else {
        this.helpersFromAppView.newSubListComponent(this.ID);
        this.helpersFromAppView.addBreadCrumbLayer(this.ID, this.name);
    }
    addTaskInput.focus();
}
TaskView.prototype.render = function() {

    var taskComponent = document.createElement("div");
    var addSubTasksNode = document.createElement("span");
    var taskName = document.createElement("span");
    var taskRemoveButton = document.createElement("button");
    var taskStatusSwitchButton = document.createElement("button");
    var taskNameEditButton = document.createElement("button");

    taskComponent.className = "task-container";
    taskComponent.setAttribute("reference-ID", `${this.ID}`);

    addSubTasksNode.innerText = 'add';
    addSubTasksNode.className = 'material-icons';
    addSubTasksNode.addEventListener('click', this.addSubTaskHandler.bind(this));

    taskName.className = "task-name";
    taskName.addEventListener("click", this.getSubTaskListHandler.bind(this));
    taskName.innerText = this.name;

    taskNameEditButton.className = "task-edit";
    taskNameEditButton.addEventListener("click", this.editHandler.bind(this));
    taskNameEditButton.innerText = "Edit";

    taskRemoveButton.className = "task-remove";
    taskRemoveButton.addEventListener("click", this.removeHandler.bind(this));
    taskRemoveButton.innerText = "Remove";

    taskStatusSwitchButton.className = "task-status-switch";
    taskStatusSwitchButton.addEventListener("click", this.statusSwitchHandler.bind(this));
    taskStatusSwitchButton.innerText = this.helpersFromAppView.statusHelpers.STATUS_SWITCH_NAME[this.status];
    if(this.hasSubTasks) taskStatusSwitchButton.disabled = true;

    taskComponent.appendChild(addSubTasksNode);
    taskComponent.appendChild(taskName);
    taskComponent.appendChild(taskNameEditButton);
    taskComponent.appendChild(taskRemoveButton);
    taskComponent.appendChild(taskStatusSwitchButton);

    this.node = taskComponent;

    return this.node;
};



function TaskListView(listStatus, intiSuperTaskValue, initialTasks, helpersFromAppView) {
    this.listStatus = listStatus;
    this.listSuperTaskID = intiSuperTaskValue;
    this.tasks = initialTasks.filter(function(task) {
        return task.status === listStatus;
    });
    this.node = null;
    this.helpersFromAppView = helpersFromAppView;
}
//Making TaskLayerBreadCrumbView Component a ReRenderable
MakeReRenderable(TaskListView);

TaskListView.prototype.onAddTask = function(taskName) {
    var task = this.helpersFromAppView.putNewTask(this.listSuperTaskID, taskName);
    var taskComponent = new TaskView(
        task.ID,
        task.name,
        task.status,
        task.superTaskID,
        task.hasSubTasks,
        this.onRemoveTask.bind(this),
        this.onSwitchStatus.bind(this),
        this.helpersFromAppView
    );

    this.tasks.push(task);
    this.node.appendChild(taskComponent.render());
}
TaskListView.prototype.onRemoveTask = function(taskID, taskComponent) {
    this.helpersFromAppView.deleteTask(this.listSuperTaskID, taskID);
    this.tasks.filter(function(task) {
        return task.ID !== taskID;
    });
    this.node.removeChild(taskComponent);
}
TaskListView.prototype.onSwitchStatus = function(taskID, newStatus, taskComponent) {
    var taskIndex = this.tasks.findIndex(function(task) {
        return task.ID = taskID;
    });
    this.tasks[taskIndex].status = newStatus;
    this.helpersFromAppView.onSwitchStatus(this.tasks[taskIndex], taskComponent);
}
TaskListView.prototype.appendTaskNode = function(task, taskNode) {
    this.tasks.push(task);
    this.node.appendChild(taskNode);
}
TaskListView.prototype.removeTaskNode = function(taskID, taskNode) {
    this.tasks.filter(function(task) {
        return task.ID !== taskID;
    });
    this.node.removeChild(taskNode);
}
TaskListView.prototype.setTasks = function(newTasks) {
    if(!newTasks.length) return;
    this.listSuperTaskID = newTasks[0].superTaskID;

    this.tasks = newTasks.filter((function(task) {
        return task.status === this.listStatus;
    }).bind(this));

    this.reRender();
}
TaskListView.prototype.newSubListComponent = function(superTaskID) {
    this.tasks = [];
    this.listSuperTaskID = superTaskID;
    this.node.replaceWith(this.render());
}
TaskListView.prototype.render = function() {
    var taskListComponent = document.createElement('div');
    var taskListHeading = document.createElement("h4");
    var taskListArr = this.tasks;

    taskListComponent.id = 'task-list';
    taskListComponent.setAttribute('reference-ID', 'task-list');

    taskListHeading.innerText = this.listStatus.toUpperCase();

    taskListComponent.appendChild(taskListHeading);

    taskListArr.forEach((function(task) {
        var taskComponent = new TaskView(
            task.ID,
            task.name,
            task.status,
            task.superTaskID,
            task.hasSubTasks,
            this.onRemoveTask.bind(this),
            this.onSwitchStatus.bind(this),
            this.helpersFromAppView,
        );
        taskListComponent.appendChild(taskComponent.render());
    }).bind(this));
    this.node = taskListComponent;

    return this.node;
}