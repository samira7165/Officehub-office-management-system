import { mysqlTable, varchar, int, double } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 32 }).notNull().default("admin"), // admin | hr | employee
  employeeId: int("employee_id"),
  createdAt: varchar("created_at", { length: 32 }).notNull().default(""),
});

export const departments = mysqlTable("departments", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 1000 }).default(""),
  color: varchar("color", { length: 16 }).default("#6C5DD3"),
});

export const employees = mysqlTable("employees", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 64 }).default(""),
  position: varchar("position", { length: 255 }).notNull(),
  departmentId: int("department_id"),
  joinDate: varchar("join_date", { length: 10 }).notNull(),
  status: varchar("status", { length: 32 }).notNull().default("active"), // active | inactive | on_leave
  avatarColor: varchar("avatar_color", { length: 16 }).default("#6C5DD3"),
  baseSalary: double("base_salary").notNull().default(0),
  address: varchar("address", { length: 1000 }).default(""),
});

export const attendance = mysqlTable("attendance", {
  id: int("id").primaryKey().autoincrement(),
  employeeId: int("employee_id").notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  checkIn: varchar("check_in", { length: 8 }),
  checkOut: varchar("check_out", { length: 8 }),
  status: varchar("status", { length: 32 }).notNull().default("present"), // present | absent | late | half_day
});

export const leaves = mysqlTable("leaves", {
  id: int("id").primaryKey().autoincrement(),
  employeeId: int("employee_id").notNull(),
  type: varchar("type", { length: 32 }).notNull(), // sick | casual | annual | unpaid
  startDate: varchar("start_date", { length: 10 }).notNull(),
  endDate: varchar("end_date", { length: 10 }).notNull(),
  reason: varchar("reason", { length: 1000 }).default(""),
  status: varchar("status", { length: 32 }).notNull().default("pending"), // pending | approved | rejected
  appliedOn: varchar("applied_on", { length: 32 }).notNull(),
});

export const payroll = mysqlTable("payroll", {
  id: int("id").primaryKey().autoincrement(),
  employeeId: int("employee_id").notNull(),
  month: int("month").notNull(),
  year: int("year").notNull(),
  basic: double("basic").notNull(),
  bonus: double("bonus").notNull().default(0),
  deduction: double("deduction").notNull().default(0),
  net: double("net").notNull(),
  status: varchar("status", { length: 32 }).notNull().default("pending"), // pending | paid
  paidOn: varchar("paid_on", { length: 10 }),
});

export const documents = mysqlTable("documents", {
  id: int("id").primaryKey().autoincrement(),
  employeeId: int("employee_id"),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 32 }).notNull().default("general"), // contract | id | certificate | general
  uploadDate: varchar("upload_date", { length: 10 }).notNull(),
  size: varchar("size", { length: 32 }).default("—"),
});

export const tasks = mysqlTable("tasks", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  description: varchar("description", { length: 2000 }).default(""),
  assigneeId: int("assignee_id"),
  dueDate: varchar("due_date", { length: 10 }),
  priority: varchar("priority", { length: 16 }).notNull().default("medium"), // low | medium | high
  status: varchar("status", { length: 32 }).notNull().default("todo"), // todo | in_progress | done
  createdAt: varchar("created_at", { length: 32 }).notNull(),
});
