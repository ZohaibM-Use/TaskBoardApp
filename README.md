# 📋Taskboard App

A RESTful task management API built with Spring Boot. Campus Taskboard allows users to create, read, update, and delete tasks (CRUD) — each with a title, description, priority level, and completion status.

[Walkthrough](https://www.loom.com/share/b66d4139111d473997c66b6abb84307c)

## 🚀 How to Run the Application

### Prerequisites

- Java 17 or higher
- Maven 3.6+

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/campus-taskboard.git
   cd campus-taskboard
   ```

2. **Build the project**
   ```bash
   ./mvnw clean install
   ```

3. **Run the application**
   ```bash
   ./mvnw spring-boot:run
   ```

4. The API will be available at:
   ```
   http://localhost:8080
   ```
### Alternative: Running with an IDE
 
You can also run the application directly from an IDE such as **IntelliJ IDEA**, **Eclipse**, or **VS Code**.
 
1. **Import the project**
   - Open your IDE and select **File > Open** (or **Import Project**)
   - Navigate to the cloned repository folder and open it as a **Maven project**
 
2. **Let dependencies download**
   - Your IDE should automatically detect `pom.xml` and download all required dependencies
 
3. **Run the application**
   - Locate `CampusTaskboardApplication.java` under `src/main/java/edu/brooklyn/cisc3130/taskboard/`
   - As this file is the main entry point, run it in your ide of choice
 
4. The API will be available at:
   ```
   http://localhost:8080
   ```
 
---

## 📡 API Endpoints

Base URL: `http://localhost:8080/api/tasks`

---

### Get All Tasks

**`GET /api/tasks`**

Returns a list of all tasks.

**Response `200 OK`**
```json
[
  {
    "id": 1,
    "title": "Complete Assignment",
    "description": "Finish the Spring Boot project",
    "completed": false,
    "priority": "HIGH"
  }
]
```

---

### Get Task by ID

**`GET /api/tasks/{id}`**

Returns a single task by its ID.

| Parameter | Type    | Description          |
|-----------|---------|----------------------|
| `id`      | Integer | The ID of the task   |

**Response `200 OK`**
```json
{
  "id": 1,
  "title": "Complete Assignment",
  "description": "Finish the Spring Boot project",
  "completed": false,
  "priority": "HIGH"
}
```

**Response `404 Not Found`** — Task with the given ID does not exist.

---

### Create a Task

**`POST /api/tasks`**

Creates a new task.

**Request Body**
```json
{
  "title": "Study for Exam",
  "description": "Review chapters 4 through 7",
  "completed": false,
  "priority": "MEDIUM"
}
```

| Field         | Type    | Required | Constraints                              |
|---------------|---------|----------|------------------------------------------|
| `title`       | String  | ✅ Yes   | 3–100 characters                         |
| `description` | String  | ❌ No    | Max 500 characters                       |
| `completed`   | Boolean | ❌ No    | Defaults to `false`                      |
| `priority`    | String  | ❌ No    | `"LOW"`, `"MEDIUM"`, `"HIGH"` — defaults to `"MEDIUM"` |

**Response `201 Created`**
```json
{
  "id": 2,
  "title": "Study for Exam",
  "description": "Review chapters 4 through 7",
  "completed": false,
  "priority": "MEDIUM"
}
```

**Response `400 Bad Request`** — Returned when validation fails.
```json
{
  "title": "Title must be between 3 and 100 characters"
}
```

---

### Update a Task

**`PUT /api/tasks/{id}`**

Updates an existing task by its ID.

| Parameter | Type    | Description        |
|-----------|---------|--------------------|
| `id`      | Integer | The ID of the task |

**Request Body**
```json
{
  "title": "Study for Exam",
  "description": "Review all chapters",
  "completed": true,
  "priority": "HIGH"
}
```

**Response `200 OK`**
```json
{
  "id": 2,
  "title": "Study for Exam",
  "description": "Review all chapters",
  "completed": true,
  "priority": "HIGH"
}
```

**Response `404 Not Found`** — Task with the given ID does not exist.

**Response `400 Bad Request`** — Returned when validation fails.

---

### Delete a Task

**`DELETE /api/tasks/{id}`**

Deletes a task by its ID.

| Parameter | Type    | Description        |
|-----------|---------|--------------------|
| `id`      | Integer | The ID of the task |

**Response `204 No Content`** — Task successfully deleted.

**Response `404 Not Found`** — Task with the given ID does not exist.

---
