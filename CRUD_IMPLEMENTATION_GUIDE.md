# CRUD Implementation Guide - Landmark Timetable System

**Status:** ✅ Complete Implementation & Full Frontend-Backend Integration

---

## Overview

This document provides comprehensive details on the implemented CRUD (Create, Read, Update, Delete) operations for the Landmark Metropolitan University Timetable Management System.

All entities have been fully implemented with:
- ✅ Backend models with database queries
- ✅ Validated API controllers
- ✅ Secure routes with authentication
- ✅ Frontend management panels with modals
- ✅ Real-time data synchronization

---

## Entities Implemented

### 1. **Schools**
Manages academic schools/faculties within the institution.

#### Backend
- **Model:** [backend/models/School.js](backend/models/School.js)
- **Controller:** [backend/controllers/schoolController.js](backend/controllers/schoolController.js)
- **Routes:** [backend/routes/schoolRoutes.js](backend/routes/schoolRoutes.js)

#### API Endpoints
```
POST   /api/schools              → Create school (Admin only)
GET    /api/schools              → List all schools
GET    /api/schools/:id          → Get school by ID
PUT    /api/schools/:id          → Update school (Admin only)
DELETE /api/schools/:id          → Delete school (Admin only)
```

#### Required Fields
- `name` (string, min 2 chars) - School name
- `code` (string, required) - School code
- `description` (string, optional) - Description

#### Frontend
- **Management Panel:** Admin Dashboard → Schools tab
- **Form:** Modal dialog with name, code, and description fields
- **Features:** Search, filter, create, edit, delete operations

---

### 2. **Departments**
Organizes courses and specialties within schools.

#### Backend
- **Model:** [backend/models/Department.js](backend/models/Department.js)
- **Controller:** [backend/controllers/departmentController.js](backend/controllers/departmentController.js)
- **Routes:** [backend/routes/departmentRoutes.js](backend/routes/departmentRoutes.js)

#### API Endpoints
```
POST   /api/departments           → Create department (Admin only)
GET    /api/departments           → List all departments
GET    /api/departments/:id       → Get department by ID
PUT    /api/departments/:id       → Update department (Admin only)
DELETE /api/departments/:id       → Delete department (Admin only)
```

#### Required Fields
- `name` (string, min 2 chars)
- `code` (string)
- `school_id` (foreign key, validated)
- `description` (string, optional)

#### Frontend
- **Management Panel:** Admin Dashboard → Departments tab
- **Form:** Modal with school selection dropdown
- **Features:** View school name and specialty count; search, filter, full CRUD

---

### 3. **Specialties**
Define specialized programs within departments.

#### Backend
- **Model:** [backend/models/Specialty.js](backend/models/Specialty.js)
- **Controller:** [backend/controllers/specialtyController.js](backend/controllers/specialtyController.js)
- **Routes:** [backend/routes/specialtyRoutes.js](backend/routes/specialtyRoutes.js)

#### API Endpoints
```
POST   /api/specialties                  → Create specialty (Admin only)
GET    /api/specialties                  → List all specialties
GET    /api/specialties/:id              → Get specialty by ID
GET    /api/specialties/department/:id   → Get by department (Route order: specific first)
PUT    /api/specialties/:id              → Update specialty (Admin only)
DELETE /api/specialties/:id              → Delete specialty (Admin only)
```

#### Required Fields
- `name` (string, min 2 chars)
- `code` (string)
- `department_id` (foreign key, required)

#### Frontend
- **Management Panel:** Admin Dashboard → Specialties tab
- **Form:** Department selector with school information
- **Features:** Search across name/code/department, full CRUD

---

### 4. **Courses**
Defines academic courses offered.

#### Backend
- **Model:** [backend/models/Course.js](backend/models/Course.js)
- **Controller:** [backend/controllers/courseController.js](backend/controllers/courseController.js)
- **Routes:** [backend/routes/courseRoutes.js](backend/routes/courseRoutes.js)

#### API Endpoints
```
POST   /api/courses          → Create course (Admin only)
GET    /api/courses          → List all courses
GET    /api/courses/:id      → Get course by ID
PUT    /api/courses/:id      → Update course (Admin only)
DELETE /api/courses/:id      → Delete course (Admin only)
```

#### Required Fields
- `course_code` (string, min 2 chars)
- `course_name` (string, min 3 chars)
- `credits` (number, 1-10)
- `department_id` (foreign key)
- `level_id` (foreign key)
- `semester` (1 or 2)

#### Frontend
- **Management Panel:** Admin Dashboard → Courses tab
- **Form:** Multi-select form with department and level dropdowns
- **Features:** Filter by code or name, credit validation, full CRUD

---

### 5. **Lecturers**
Manages faculty and staff.

#### Backend
- **Model:** [backend/models/Lecturer.js](backend/models/Lecturer.js)
- **Controller:** [backend/controllers/lecturerController.js](backend/controllers/lecturerController.js)
- **Routes:** [backend/routes/lecturerRoutes.js](backend/routes/lecturerRoutes.js)

#### API Endpoints
```
POST   /api/lecturers                   → Create lecturer (Admin only)
GET    /api/lecturers                   → List all lecturers
GET    /api/lecturers/:id               → Get lecturer by ID
PUT    /api/lecturers/:id               → Update lecturer (Admin only)
DELETE /api/lecturers/:id               → Delete lecturer (Admin only)
POST   /api/lecturers/assign-course     → Assign course to lecturer
GET    /api/lecturers/:id/courses       → Get courses assigned to lecturer
```

#### Required Fields
- `user_id` (foreign key, links to user account)
- `employee_id` (string, min 2 chars)
- `department_id` (optional)
- `specialization` (string, optional, max 200 chars)

#### Frontend
- **Management Panel:** Admin Dashboard → Lecturers tab
- **Form:** Links to existing user accounts, department selector
- **Features:** Search by name/email/employee ID, specialization tracking, full CRUD

---

### 6. **Rooms**
Manages lecture halls, classrooms, and facilities.

#### Backend
- **Model:** [backend/models/Room.js](backend/models/Room.js)
- **Controller:** [backend/controllers/roomController.js](backend/controllers/roomController.js)
- **Routes:** [backend/routes/roomRoutes.js](backend/routes/roomRoutes.js)

#### API Endpoints
```
POST   /api/rooms                                    → Create room (Admin only)
GET    /api/rooms                                    → List all rooms
GET    /api/rooms/:id                               → Get room by ID
PUT    /api/rooms/:id                               → Update room (Admin only)
DELETE /api/rooms/:id                               → Delete room (Admin only)
GET    /api/rooms/:roomId/availability/:timeSlotId  → Check room availability
```

#### Required Fields
- `room_number` (string)
- `building` (string)
- `capacity` (number, 1-500)
- `type` (enum: "Classroom", "Lecture Hall", "Laboratory", "Auditorium")

#### Frontend
- **Management Panel:** Admin Dashboard → Rooms tab
- **Form:** Building, capacity, type selector
- **Features:** Search by room/building/type, capacity validation, full CRUD

---

### 7. **Levels**
Manages academic year levels (100, 200, 300, etc.).

#### Backend
- **Controller:** [backend/controllers/dashboardController.js](backend/controllers/dashboardController.js) (getLevels, getLevelById, createLevel, updateLevel, deleteLevel)
- **Routes:** [backend/routes/dashboardRoutes.js](backend/routes/dashboardRoutes.js)

#### API Endpoints
```
POST   /api/dashboard/levels       → Create level (Admin only)
GET    /api/dashboard/levels       → List all levels
GET    /api/dashboard/levels/:id   → Get level by ID
PUT    /api/dashboard/levels/:id   → Update level (Admin only)
DELETE /api/dashboard/levels/:id   → Delete level (Admin only)
```

#### Required Fields
- `level_number` (number, positive)

#### Frontend
- **Management Panel:** Admin Dashboard → Levels tab
- **Form:** Numeric level input (100, 200, 300, etc.)
- **Features:** Simple create/edit/delete operations, full CRUD

---

## Validation Rules

All input data is validated according to the middleware rules defined in [backend/middleware/validation.js](backend/middleware/validation.js):

| Entity | Validation Rules |
|--------|------------------|
| **School** | Name ≥ 2 chars, Code required, Description ≤ 500 chars |
| **Department** | Name ≥ 2 chars, Code required, School required, Description ≤ 500 chars |
| **Specialty** | Name ≥ 2 chars, Code required, Department required |
| **Course** | Code ≥ 2 chars, Name ≥ 3 chars, Credits 1-10, Semester ∈ {1,2}, All fields required |
| **Lecturer** | User ID required, Employee ID ≥ 2 chars, Specialization ≤ 200 chars |
| **Room** | Number required, Building required, Capacity 1-500, Type ∈ {valid list} |
| **Level** | Level number > 0 |

---

## Frontend Integration

### Admin Dashboard Location
**File:** [frontend/admin-dashboard.html](frontend/admin-dashboard.html)

### Management Script
**File:** [frontend/js/admin.js](frontend/js/admin.js)

### Tab Navigation
Each entity has a dedicated management section:
```javascript
handleAdminTab('schools')      // School Management
handleAdminTab('departments')  // Department Management
handleAdminTab('specialties')  // Specialty Management
handleAdminTab('courses')      // Course Management
handleAdminTab('lecturers')    // Lecturer Management
handleAdminTab('rooms')        // Room Management
handleAdminTab('levels')       // Level Management
```

### Standard Operations on All Entities

**Create:**
1. Click "Add [Entity]" button
2. Fill form with required fields
3. Submit → Validation → Database insert
4. Success notification → List refresh

**Read:**
1. Load [Entity] tab → Fetch from API
2. Render data table with inline data
3. Support search/filter operations

**Update:**
1. Click edit button on any row
2. Modal opens with pre-filled data
3. Modify fields → Submit
4. Validation → Database update
5. Success notification → List refresh

**Delete:**
1. Click delete button on any row
2. Confirmation modal appears
3. Confirm → Database delete
4. Success notification → List refresh

---

## Database Schema Integration

All entities use PostgreSQL with proper foreign key relationships:

```
schools
├── id (PK)
├── name, code, description

departments (FK: school_id)
├── id (PK)
├── school_id
├── name, code, description

specialties (FK: department_id)
├── id (PK)
├── department_id
├── name, code

courses (FK: department_id, level_id)
├── id (PK)
├── course_code, course_name, credits
├── semester

lecturers (FK: user_id, department_id)
├── id (PK)
├── user_id
├── employee_id, specialization

rooms
├── id (PK)
├── room_number, building, capacity, type

levels
├── id (PK)
├── level_number
```

---

## Authentication & Authorization

All endpoints require:
- ✅ `Authorization: Bearer <token>` header
- ✅ Valid JWT token from `/api/auth/login`

**Create/Update/Delete** operations additionally require:
- ✅ User role = `admin`

**Read** operations available to all authenticated users.

---

## Error Handling

All endpoints return standardized responses:

### Success Response
```json
{
  "success": true,
  "data": { /* entity data */ }
}
```

### Validation Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["Field error 1", "Field error 2"]
}
```

### Generic Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Testing CRUD Operations

### Test with cURL
```bash
# Create School
curl -X POST http://localhost:5000/api/schools \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"School of Science","code":"SOS","description":"Science faculty"}'

# Get All Schools
curl http://localhost:5000/api/schools \
  -H "Authorization: Bearer <token>"

# Update School
curl -X PUT http://localhost:5000/api/schools/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"School of Science Updated","code":"SOS","description":"Updated description"}'

# Delete School
curl -X DELETE http://localhost:5000/api/schools/1 \
  -H "Authorization: Bearer <token>"
```

### Test via Admin Dashboard
1. Navigate to `frontend/admin-dashboard.html`
2. Login with admin credentials
3. Click on any entity tab (Schools, Departments, etc.)
4. Use the management panel to create, read, update, delete

---

## Features Implemented

✅ **Complete CRUD** - Create, Read, Update, Delete for all 7 entities
✅ **Input Validation** - Server-side validation with detailed error messages
✅ **Search & Filter** - Real-time search across key fields
✅ **Modal Forms** - User-friendly dialog-based forms
✅ **Relationships** - Proper foreign key handling and cascading
✅ **Authentication** - JWT-based access control
✅ **Authorization** - Role-based access (admin-only for modifications)
✅ **Real-time Updates** - Data refreshes after operations
✅ **Notifications** - Success/error feedback to user
✅ **Data Integrity** - Foreign key validation before insert/update
✅ **Responsive Design** - Works on desktop and tablet views

---

## Common Issues & Solutions

### Issue: 401 Unauthorized
**Solution:** Ensure valid JWT token is included in `Authorization` header

### Issue: 400 Validation Error
**Solution:** Check error messages returned; verify all required fields are provided with correct format

### Issue: 403 Forbidden on Create/Update/Delete
**Solution:** User must have `admin` role to perform write operations

### Issue: 404 Not Found
**Solution:** Verify the entity ID exists in the database

### Issue: Cascade Delete Errors
**Solution:** Delete child entities first (e.g., delete departments before schools)

---

## Notes for Future Development

- Add bulk import/export functionality
- Implement audit logging for all modifications
- Add soft delete option for data recovery
- Implement advanced filtering and sorting
- Add role-based field visibility
- Implement scheduled timetable generation

---

## Files Summary

| File | Purpose |
|------|---------|
| [backend/models/*.js](backend/models/) | Database query logic |
| [backend/controllers/*.js](backend/controllers/) | Business logic & API handlers |
| [backend/routes/*.js](backend/routes/) | Route definitions & middleware |
| [backend/middleware/validation.js](backend/middleware/validation.js) | Input validation rules |
| [frontend/admin-dashboard.html](frontend/admin-dashboard.html) | Admin interface layout |
| [frontend/js/admin.js](frontend/js/admin.js) | Frontend CRUD operations |

---

**Last Updated:** May 13, 2026  
**Implementation Status:** ✅ COMPLETE & TESTED
