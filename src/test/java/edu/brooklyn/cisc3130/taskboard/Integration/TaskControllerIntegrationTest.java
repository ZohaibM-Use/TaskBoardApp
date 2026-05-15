package edu.brooklyn.cisc3130.taskboard.Integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.brooklyn.cisc3130.taskboard.dto.TaskRequest;
import edu.brooklyn.cisc3130.taskboard.model.Task;
import edu.brooklyn.cisc3130.taskboard.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class TaskControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        taskRepository.deleteAll();
    }

    @Test
    void testCreateTask() throws Exception {
        TaskRequest taskRequest = new TaskRequest();
        taskRequest.setTitle("Test Task");
        taskRequest.setDescription("Test Description");
        taskRequest.setCompleted(false);
        taskRequest.setPriority("HIGH");

        mockMvc.perform(MockMvcRequestBuilders.post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(taskRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Test Task"))
                .andExpect(jsonPath("$.id").exists());
    }

    @Test
    void testGetTaskById() throws Exception {
        Task task = new Task();
        task.setTitle("Test Task");
        task.setDescription("Test Description");
        task.setCompleted(false);
        task.setPriority(Task.Priority.HIGH);
        Task savedTask = taskRepository.save(task);

        mockMvc.perform(MockMvcRequestBuilders.get("/api/tasks/" + savedTask.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Test Task"));
    }

    @Test
    void testGetTaskByIdNotFound() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/api/tasks/999"))
                .andExpect(status().isNotFound());
    }
}