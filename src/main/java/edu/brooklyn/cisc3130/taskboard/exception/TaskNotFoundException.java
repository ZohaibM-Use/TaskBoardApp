package edu.brooklyn.cisc3130.taskboard.exception;

public class TaskNotFoundException extends RuntimeException {

    public TaskNotFoundException(Integer id){
        super("Task with ID " + id + " not found");
    }
}
