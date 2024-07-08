/*
  Warnings:

  - The values [ENGINEEER] on the enum `EmployeRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EmployeRole_new" AS ENUM ('ADMIN', 'INTERN', 'ENGINEER');
ALTER TABLE "Employee" ALTER COLUMN "role" TYPE "EmployeRole_new" USING ("role"::text::"EmployeRole_new");
ALTER TYPE "EmployeRole" RENAME TO "EmployeRole_old";
ALTER TYPE "EmployeRole_new" RENAME TO "EmployeRole";
DROP TYPE "EmployeRole_old";
COMMIT;
