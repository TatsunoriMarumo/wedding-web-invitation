/*
  Warnings:

  - Added the required column `birthDate` to the `Guest` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."InvitationToken_inviteeName_idx";

-- DropIndex
DROP INDEX "public"."InvitationToken_isUsed_idx";

-- AlterTable
ALTER TABLE "public"."Guest" ADD COLUMN     "birthDate" DATE NOT NULL;
