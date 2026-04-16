package edu.brooklyn.cisc3130.taskboard.data;

import edu.brooklyn.cisc3130.taskboard.model.Task;
import edu.brooklyn.cisc3130.taskboard.repository.TaskRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final TaskRepository taskRepository;

    public DataInitializer(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @Override
    public void run(String... args) {
        if (taskRepository.count() == 0) {
            taskRepository.save(new Task(
                    null, "Complete Homework 6",
                    "Finish Spring Data JPA assignment",
                    false, Task.Priority.HIGH, null, null));

            taskRepository.save(new Task(
                    null, "Study for Midterm",
                    "Review chapters 1-5",
                    false, Task.Priority.HIGH, null, null));

            taskRepository.save(new Task(
                    null, "Buy groceries",
                    "Milk, eggs, bread",
                    true, Task.Priority.LOW, null, null));

            taskRepository.save(new Task(
                    null, "Create an appointment",
                    "Call Doctor",
                    false, Task.Priority.MEDIUM, null, null));

            taskRepository.save(new Task(
                    null, "Go for a run",
                    "Run 3 miles in the park",
                    false, Task.Priority.LOW, null, null));

            taskRepository.save(new Task(
                    null, "Submit homework",
                    "Upload homework to the class portal before deadline",
                    false, Task.Priority.MEDIUM, null, null));

            taskRepository.save(new Task(
                    null, "Read a book",
                    "Read 30 pages of a novel",
                    true, Task.Priority.LOW, null, null));

            taskRepository.save(new Task(
                    null, "Prepare for meeting",
                    "Review agenda and notes before team sync",
                    false, Task.Priority.MEDIUM, null, null));

            taskRepository.save(new Task(
                    null, "Work on project",
                    "Finish backend API endpoints",
                    true, Task.Priority.HIGH, null, null));

            taskRepository.save(new Task(
                    null, "Plan weekend trip",
                    "Book hotel and create itinerary",
                    false, Task.Priority.LOW, null, null));
        }
    }
}