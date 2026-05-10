package edu.brooklyn.cisc3130.taskboard.exception;

public class InvalidTaskDataException extends RuntimeException {

    public InvalidTaskDataException (String message){
        super(message);
    }
}
