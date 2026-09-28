import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

// Load DATABASE_URL from .env.local / .env when running locally
for (const file of [".env.local", ".env"]) {
  try { process.loadEnvFile(file); } catch {}
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Add your TiDB connection string to .env.local");
  process.exit(1);
}

// Keep in sync with lib/schema.ts
const ddl = [
`CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'admin',
  employee_id INT,
  created_at VARCHAR(32) NOT NULL DEFAULT ''
)`,
`CREATE TABLE departments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description VARCHAR(1000) DEFAULT '',
  color VARCHAR(16) DEFAULT '#6C5DD3'
)`,
`CREATE TABLE employees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(64) DEFAULT '',
  position VARCHAR(255) NOT NULL,
  department_id INT,
  join_date VARCHAR(10) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  avatar_color VARCHAR(16) DEFAULT '#6C5DD3',
  base_salary DOUBLE NOT NULL DEFAULT 0,
  address VARCHAR(1000) DEFAULT ''
)`,
`CREATE TABLE attendance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT NOT NULL,
  date VARCHAR(10) NOT NULL,
  check_in VARCHAR(8),
  check_out VARCHAR(8),
  status VARCHAR(32) NOT NULL DEFAULT 'present'
)`,
`CREATE TABLE leaves (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT NOT NULL,
  type VARCHAR(32) NOT NULL,
  start_date VARCHAR(10) NOT NULL,
  end_date VARCHAR(10) NOT NULL,
  reason VARCHAR(1000) DEFAULT '',
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  applied_on VARCHAR(32) NOT NULL
)`,
`CREATE TABLE payroll (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT NOT NULL,
  month INT NOT NULL,
  year INT NOT NULL,
  basic DOUBLE NOT NULL,
  bonus DOUBLE NOT NULL DEFAULT 0,
  deduction DOUBLE NOT NULL DEFAULT 0,
  net DOUBLE NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  paid_on VARCHAR(10)
)`,
`CREATE TABLE documents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(32) NOT NULL DEFAULT 'general',
  upload_date VARCHAR(10) NOT NULL,
  size VARCHAR(32) DEFAULT '—'
)`,
`CREATE TABLE tasks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description VARCHAR(2000) DEFAULT '',
  assignee_id INT,
  due_date VARCHAR(10),
  priority VARCHAR(16) NOT NULL DEFAULT 'medium',
  status VARCHAR(32) NOT NULL DEFAULT 'todo',
  created_at VARCHAR(32) NOT NULL
)`,
];

type Value = string | number | null;

async function main() {
  const db = await mysql.createConnection({
    uri: process.env.DATABASE_URL,
    ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true },
  });

  // returns the auto-increment id of the inserted row
  async function insert(table: string, cols: string[], values: Value[]): Promise<number> {
    const [res] = await db.execute<mysql.ResultSetHeader>(
      `INSERT INTO ${table} (${cols.join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`,
      values,
    );
    return res.insertId;
  }

  // drop and recreate every table for a clean reseed
  for (const t of ["tasks","documents","payroll","leaves","attendance","employees","departments","users"]) {
    await db.query(`DROP TABLE IF EXISTS ${t}`);
  }
  for (const stmt of ddl) await db.query(stmt);

  const depts = [
    ["Engineering", "Product & platform engineering", "#6C5DD3"],
    ["Design", "Product & brand design", "#3DB2FF"],
    ["Marketing", "Growth & communications", "#F6A723"],
    ["Human Resources", "People operations", "#1DBF73"],
    ["Sales", "Client acquisition & accounts", "#F45252"],
  ];
  const deptIds: number[] = [];
  for (const d of depts) deptIds.push(await insert("departments", ["name", "description", "color"], d));

  const colors = ["#6C5DD3","#3DB2FF","#F6A723","#1DBF73","#F45252","#8B5CF6","#EC4899"];
  const employeesData: [string, string, string, string, number, string, string, number][] = [
    ["Ayesha Rahman","ayesha.rahman@officehub.io","+880 1711-000111","Senior Software Engineer",deptIds[0],"2022-03-14","active",68000],
    ["Tanvir Ahmed","tanvir.ahmed@officehub.io","+880 1711-000112","Frontend Developer",deptIds[0],"2023-01-09","active",52000],
    ["Nusrat Jahan","nusrat.jahan@officehub.io","+880 1711-000113","UI/UX Designer",deptIds[1],"2021-11-02","active",55000],
    ["Rafiul Islam","rafiul.islam@officehub.io","+880 1711-000114","Product Designer",deptIds[1],"2023-06-20","on_leave",50000],
    ["Sadia Akter","sadia.akter@officehub.io","+880 1711-000115","Marketing Manager",deptIds[2],"2020-08-11","active",60000],
    ["Mahin Chowdhury","mahin.chowdhury@officehub.io","+880 1711-000116","Content Strategist",deptIds[2],"2024-02-05","active",42000],
    ["Farzana Yasmin","farzana.yasmin@officehub.io","+880 1711-000117","HR Manager",deptIds[3],"2019-05-19","active",58000],
    ["Imran Kabir","imran.kabir@officehub.io","+880 1711-000118","Recruiter",deptIds[3],"2023-09-01","active",40000],
    ["Sabbir Hossain","sabbir.hossain@officehub.io","+880 1711-000119","Sales Executive",deptIds[4],"2022-12-15","active",45000],
    ["Nabila Islam","nabila.islam@officehub.io","+880 1711-000120","Account Manager",deptIds[4],"2021-07-23","inactive",47000],
    ["Kamrul Hasan","kamrul.hasan@officehub.io","+880 1711-000121","Backend Engineer",deptIds[0],"2023-04-18","active",63000],
    ["Rima Sultana","rima.sultana@officehub.io","+880 1711-000122","QA Engineer",deptIds[0],"2024-01-22","active",44000],
  ];
  const empCols = ["name", "email", "phone", "position", "department_id", "join_date", "status", "avatar_color", "base_salary", "address"];
  const empIds: number[] = [];
  for (const [i, e] of employeesData.entries()) {
    empIds.push(await insert("employees", empCols, [...e.slice(0, 7), colors[i % colors.length], e[7], "Dhaka, Bangladesh"]));
  }

  // users (login accounts) - admin + one per employee sample
  const userCols = ["name", "email", "password", "role", "employee_id", "created_at"];
  await insert("users", userCols, ["Admin User", "admin@officehub.io", bcrypt.hashSync("admin123", 10), "admin", null, new Date().toISOString()]);
  await insert("users", userCols, ["Farzana Yasmin", "farzana.yasmin@officehub.io", bcrypt.hashSync("password123", 10), "hr", empIds[6], new Date().toISOString()]);

  // attendance for last 14 days for each employee
  function fmtDate(d: Date) { return d.toISOString().slice(0,10); }
  const today = new Date();
  for (const empId of empIds) {
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const day = d.getDay();
      if (day === 5 || day === 6) continue; // Fri/Sat weekend (BD)
      const roll = Math.random();
      let status = "present", checkIn = "09:0" + Math.floor(Math.random()*9), checkOut = "18:0" + Math.floor(Math.random()*9);
      if (roll < 0.06) { status = "absent"; checkIn = ""; checkOut = ""; }
      else if (roll < 0.16) { status = "late"; checkIn = "10:1" + Math.floor(Math.random()*5); }
      await insert("attendance", ["employee_id", "date", "check_in", "check_out", "status"], [empId, fmtDate(d), checkIn || null, checkOut || null, status]);
    }
  }

  // leaves
  const leaveSamples: Value[][] = [
    [empIds[3], "annual", "2026-08-05", "2026-08-09", "Family trip to Sylhet", "pending"],
    [empIds[1], "sick", "2026-07-28", "2026-07-29", "Fever", "approved"],
    [empIds[5], "casual", "2026-08-12", "2026-08-12", "Personal errand", "pending"],
    [empIds[8], "sick", "2026-07-15", "2026-07-16", "Food poisoning", "approved"],
    [empIds[2], "annual", "2026-09-01", "2026-09-05", "Eid vacation", "pending"],
    [empIds[9], "unpaid", "2026-07-01", "2026-07-10", "Extended personal leave", "rejected"],
  ];
  for (const l of leaveSamples) {
    await insert("leaves", ["employee_id", "type", "start_date", "end_date", "reason", "status", "applied_on"], [...l, new Date().toISOString()]);
  }

  // payroll - last 2 months
  const now = new Date();
  for (const [idx, empId] of empIds.entries()) {
    const basic = employeesData[idx][7];
    for (let m = 0; m < 2; m++) {
      const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const bonus = m === 0 ? Math.round(basic * 0.05) : 0;
      const deduction = Math.round(basic * 0.02);
      const net = basic + bonus - deduction;
      const status = m === 0 ? "pending" : "paid";
      await insert("payroll", ["employee_id", "month", "year", "basic", "bonus", "deduction", "net", "status", "paid_on"],
        [empId, d.getMonth()+1, d.getFullYear(), basic, bonus, deduction, net, status, status === "paid" ? fmtDate(d) : null]);
    }
  }

  // documents
  const docSamples: Value[][] = [
    [empIds[0], "Employment Contract.pdf", "contract", "300 KB"],
    [empIds[0], "NID Copy.pdf", "id", "120 KB"],
    [empIds[2], "Design Certification.pdf", "certificate", "540 KB"],
    [empIds[6], "HR Policy Handbook.pdf", "general", "1.1 MB"],
    [empIds[9], "Resignation Letter.pdf", "contract", "90 KB"],
    [empIds[4], "Marketing Certification.pdf", "certificate", "410 KB"],
  ];
  for (const d of docSamples) {
    await insert("documents", ["employee_id", "name", "category", "upload_date", "size"], [d[0], d[1], d[2], fmtDate(new Date()), d[3]]);
  }

  // tasks
  const taskSamples: Value[][] = [
    ["Finalize Q3 hiring plan","Coordinate with department heads on headcount", empIds[6], "2026-08-10", "high", "in_progress"],
    ["Prepare payroll report","Compile July payroll summary for finance", empIds[6], "2026-08-06", "high", "todo"],
    ["Onboard new backend engineer","Setup accounts, laptop, and orientation", empIds[7], "2026-08-08", "medium", "todo"],
    ["Update employee handbook","Add new remote work policy section", empIds[6], "2026-08-20", "low", "todo"],
    ["Design new dashboard icons","Icon set for HR management redesign", empIds[2], "2026-08-07", "medium", "in_progress"],
    ["Review leave requests","Approve/reject pending leave applications", empIds[6], "2026-08-05", "high", "done"],
  ];
  for (const t of taskSamples) {
    await insert("tasks", ["title", "description", "assignee_id", "due_date", "priority", "status", "created_at"], [...t, new Date().toISOString()]);
  }

  console.log("Seed complete:", { departments: deptIds.length, employees: empIds.length });
  await db.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
