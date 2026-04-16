package edu.brooklyn.cisc3130.taskboard.repository;

import edu.brooklyn.cisc3130.taskboard.model.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Integer> {

    // Find all completed tasks
    List<Task> findByCompletedTrue();

    // Find all incomplete tasks
    List<Task> findByCompletedFalse();

    // Find tasks by priority
    List<Task> findByPriority(Task.Priority priority);

    // Find tasks by title containing (case-insensitive)
    List<Task> findByTitleContainingIgnoreCase(String title);

    // Find completed tasks by priority
    List<Task> findByCompletedAndPriority(Boolean completed, Task.Priority priority);

    // Custom query using JPQL
    @Query("""
    SELECT t FROM Task t
    WHERE LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
    OR LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
    """)
    List<Task> searchTasks(@Param("keyword") String keyword);

    // Paginated query for completed tasks
    Page<Task> findByCompletedTrue(Pageable pageable);

    // Count tasks by priority
    long countByPriority(Task.Priority priority);
}
