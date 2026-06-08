TABLE: users

id UUID PK

name VARCHAR(100)

email VARCHAR(255) UNIQUE

password VARCHAR(255)

role ENUM

ADMIN
LEAD
MEMBER

avatar_url

department

is_active

created_at

updated_at

------------------------------------------------

TABLE: projects

id UUID PK

name

description

status

priority

created_by FK

start_date

end_date

created_at

updated_at

------------------------------------------------

TABLE: project_members

id UUID PK

project_id FK

user_id FK

role_in_project

joined_at

------------------------------------------------

TABLE: tasks

id UUID PK

project_id FK

assigned_to FK

created_by FK

title

description

status

priority

deadline

estimated_hours

actual_hours

created_at

updated_at

------------------------------------------------

TABLE: comments

id UUID PK

task_id FK

user_id FK

content

edited

created_at

------------------------------------------------

TABLE: attachments

id UUID PK

task_id FK

uploaded_by FK

file_name

file_url

file_size

created_at

------------------------------------------------

TABLE: notifications

id UUID PK

user_id FK

title

message

type

is_read

created_at

------------------------------------------------

TABLE: activity_logs

id UUID PK

user_id FK

project_id FK

action

metadata

created_at

------------------------------------------------

RELATIONSHIPS

projects.created_by
→ users.id

project_members.project_id
→ projects.id

project_members.user_id
→ users.id

tasks.project_id
→ projects.id

tasks.assigned_to
→ users.id

comments.task_id
→ tasks.id

notifications.user_id
→ users.id

AUTH PROVIDER

Spring Security

JWT

USER ROLES

ADMIN

Full Platform Access

LEAD

Project Management Access

MEMBER

Assigned Task Access

FILE STORAGE

AWS S3

/project-files

/task-files

/profile-images

SENSITIVE DATA

Passwords

Stored using BCrypt

JWT Secret

Stored in Environment Variables

AWS Keys

Stored in Environment Variables