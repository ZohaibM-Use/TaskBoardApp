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

            taskRepository.save(createTask(
                    "Complete Homework 6",
                    "Finish Spring Data JPA assignment",
                    false,
                    Task.Priority.HIGH
            ));

            taskRepository.save(createTask(
                    "Study for Midterm",
                    "Review chapters 1-5",
                    false,
                    Task.Priority.HIGH
            ));

            taskRepository.save(createTask(
                    "Buy groceries",
                    "Milk, eggs, bread",
                    true,
                    Task.Priority.LOW
            ));

            taskRepository.save(createTask(
                    "Create an appointment",
                    "Call Doctor",
                    false,
                    Task.Priority.MEDIUM
            ));

            taskRepository.save(createTask(
                    "Go for a run",
                    "Run 3 miles in the park",
                    false,
                    Task.Priority.LOW
            ));

            taskRepository.save(createTask(
                    "Submit homework",
                    "Upload homework to the class portal before deadline",
                    false,
                    Task.Priority.MEDIUM
            ));

            taskRepository.save(createTask(
                    "Read a book",
                    "Read 30 pages of a novel",
                    true,
                    Task.Priority.LOW
            ));

            taskRepository.save(createTask(
                    "Prepare for meeting",
                    "Review agenda and notes before team sync",
                    false,
                    Task.Priority.MEDIUM
            ));

            taskRepository.save(createTask(
                    "Work on project",
                    "Finish backend API endpoints",
                    true,
                    Task.Priority.HIGH
            ));

            taskRepository.save(createTask(
                    "Plan weekend trip",
                    "Book hotel and create itinerary",
                    false,
                    Task.Priority.LOW
            ));
        }
    }

    private Task createTask(String title, String description, Boolean completed, Task.Priority priority) {
        Task task = new Task();
        task.setTitle(title);
        task.setDescription(description);
        task.setCompleted(completed);
        task.setPriority(priority);
        task.setDeleted(false);
        return task;
    }
}