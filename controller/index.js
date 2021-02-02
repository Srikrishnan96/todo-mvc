
function AppController(getTasks, addTask, deleteTask, updateTask) {

    this.fetchTasks = function (taskID) {
        return getTasks(taskID);
    }
    this.deleteTask = function (superTaskID, taskID) {
        deleteTask(superTaskID, taskID);
    }
    this.putNewTask = function (superTaskID, taskName) {
        return addTask(superTaskID, taskName);
    }
    this.updateTask = function (updatedTask) {
        updateTask(updatedTask);
    }
}