# 📋Taskboard App

A RESTful task management API built with Spring Boot. Taskboard allows users to manage tasks with full CRUD functionality, including validation, filtering, and pagination. Users can create tasks with proper validation, view tasks with filtering and pagination support, update tasks with robust error handling, and delete tasks using soft-delete capabilities. The application persists data in a relational database with proper entity relationships, secures endpoints through user authentication, handles errors gracefully, and includes application health monitoring for improved reliability.

---

## 🎥 Demo Videos

[![API Endpoints](https://img.shields.io/badge/Watch-API_Endpoints-blue?style=for-the-badge&logo=loom)](https://www.loom.com/share/b66d4139111d473997c66b6abb84307c)

[![JPA & Database Integration](https://img.shields.io/badge/Watch-JPA_%26_Database_Integration-orange?style=for-the-badge&logo=loom)](https://www.loom.com/share/3cf28d22d49c47b49febb416d54fff38)

---

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

### Get Completed Tasks

**`GET /api/tasks/completed`**
 
Returns a list of all tasks marked as completed.
 
**Response `200 OK`**
```json
[
  {
    "id": 1,
    "title": "Complete Assignment",
    "description": "Finish the Spring Boot project",
    "completed": true,
    "priority": "HIGH"
  }
]
```
 
---
 
### Get Incomplete Tasks
 
**`GET /api/tasks/incomplete`**
 
Returns a list of all tasks that have not yet been completed.
 
**Response `200 OK`**
```json
[
  {
    "id": 2,
    "title": "Study for Exam",
    "description": "Review all chapters",
    "completed": false,
    "priority": "MEDIUM"
  }
]
```
 
---
 
### Get Tasks by Priority
 
**`GET /api/tasks/priority/{priority}`**
 
Returns all tasks matching the given priority level.
 
| Parameter  | Type   | Description                             |
|------------|--------|-----------------------------------------|
| `priority` | String | Priority level: `LOW`, `MEDIUM`, `HIGH` |
 
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
 
**Response `400 Bad Request`** — Returned when an invalid priority value is provided.
 
---
 
### Search Tasks
 
**`GET /api/tasks/search?keyword={keyword}`**
 
Returns all tasks whose title or description contains the given keyword.
 
| Query Param | Type   | Required | Description     |
|-------------|--------|----------|-----------------|
| `keyword`   | String | ✅ Yes   | The search term |
 
**Example Request**
```
GET /api/tasks/search?keyword=exam
```
 
**Response `200 OK`**
```json
[
  {
    "id": 2,
    "title": "Study for Exam",
    "description": "Review all chapters",
    "completed": false,
    "priority": "MEDIUM"
  }
]
```
 
---
 
### Get Tasks Paginated
 
**`GET /api/tasks/paginated`**
 
Returns a paginated and sorted list of tasks.
 
| Query Param | Type    | Required | Default | Description                         |
|-------------|---------|----------|---------|-------------------------------------|
| `page`      | Integer | ❌ No    | `0`     | Page number (zero-indexed)          |
| `size`      | Integer | ❌ No    | `10`    | Number of tasks per page            |
| `sortBy`    | String  | ❌ No    | `id`    | Field to sort by (e.g. `priority`)  |
 
**Example Request**
```
GET /api/tasks/paginated?page=0&size=5&sortBy=priority
```
 
**Response `200 OK`**
```json
{
  "content": [
    {
      "id": 1,
      "title": "Complete Assignment",
      "description": "Finish the Spring Boot project",
      "completed": false,
      "priority": "HIGH"
    }
  ],
  "totalElements": 10,
  "totalPages": 2,
  "size": 5,
  "number": 0
}
```
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
