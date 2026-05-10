package edu.brooklyn.cisc3130.taskboard.dto;

import edu.brooklyn.cisc3130.taskboard.model.Task;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TaskResponse {
    private Integer id;
    private String title;
    private String description;
    private Boolean completed;
    private String priority;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TaskResponse fromEntity(Task task){
        TaskResponse response = new TaskResponse();
        response.setId(task.getId());
        response.setTitle(task.getTitle());
        response.setDescription(task.getDescription());
        response.setCompleted(task.getCompleted());
        response.setPriority(task.getPriority().name());
        response.setCreatedAt(task.getCreatedAt());
        response.setUpdatedAt(task.getUpdatedAt());
        return response;
    }
}
