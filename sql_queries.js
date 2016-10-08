module.exports.getProjectsList = `SELECT 
	p.id as project_id,
	p.name as project_name,
	t.id as task_id,
	t.name as task_name,
	t.status as task_status,
	t.priority as task_priority,
	t.deadline
 from PROJECT p
LEFT JOIN TASKS t ON t.project_id = p.id
WHERE p.user_id=?`;
module.exports.addProject = `INSERT INTO PROJECT
	(name, user_id) VALUES
	('new project', ?)`;
module.exports.addTask = `INSERT INTO TASKS
	(name, project_id) VALUES
	(?, ?)`; // проэкт как бы из воздуха, а задачи в проекте. Задача зависит от проекта( из нг модел)
module.exports.getProjectById = `SELECT * FROM PROJECT p WHERE p.id =`;
module.exports.getTask = `SELECT * FROM TASKS WHERE id =`; //
module.exports.deleteProjectsById = `DELETE FROM PROJECT WHERE id =`;
module.exports.deleteTask = `DELETE FROM TASKS WHERE id =`; //
module.exports.updateProjectById = `UPDATE PROJECT
SET name=?
WHERE id=?`;
module.exports.updateTask = `UPDATE TASKS
SET name=?, status=?, priority=?
WHERE id=?`;
module.exports.login = `SELECT * FROM USER WHERE email=? AND password=?`;
module.exports.addUser = `INSERT INTO USER
(email, password, last_name, first_name, date, sex)
VALUES
(?, ?, ?, ?, ?, ?)`;
module.exports.getProjectByIdWithTasks = `SELECT 
	p.id as project_id,
	p.name as project_name,
	t.id as task_id,
	t.name as task_name
from PROJECT p
INNER JOIN TASKS t ON t.project_id = p.id
WHERE p.id =`;