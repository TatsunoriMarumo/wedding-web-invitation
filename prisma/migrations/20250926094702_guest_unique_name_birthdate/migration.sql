/*
  Warnings:

  - A unique constraint covering the columns `[lastName,firstName,birthDate]` on the table `Guest` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Guest_lastName_firstName_idx";

-- CreateIndex
CREATE INDEX "Guest_lastName_firstName_birthDate_idx" ON "public"."Guest"("lastName", "firstName", "birthDate");

-- CreateIndex
CREATE UNIQUE INDEX "uniq_guest_name_dob" ON "public"."Guest"("lastName", "firstName", "birthDate");
