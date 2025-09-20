-- CreateEnum
CREATE TYPE "public"."AttendanceStatus" AS ENUM ('ATTEND', 'DECLINE');

-- CreateEnum
CREATE TYPE "public"."AllergenCategory" AS ENUM ('DOG', 'FOOD');

-- CreateTable
CREATE TABLE "public"."Guest" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "attendance" "public"."AttendanceStatus" NOT NULL,
    "invitationTokenId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InvitationToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "inviteeName" TEXT NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvitationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Allergen" (
    "id" SERIAL NOT NULL,
    "category" "public"."AllergenCategory" NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Allergen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GuestAllergy" (
    "guestId" INTEGER NOT NULL,
    "allergenId" INTEGER NOT NULL,
    "notedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuestAllergy_pkey" PRIMARY KEY ("guestId","allergenId")
);

-- CreateIndex
CREATE INDEX "Guest_lastName_firstName_idx" ON "public"."Guest"("lastName", "firstName");

-- CreateIndex
CREATE INDEX "Guest_attendance_idx" ON "public"."Guest"("attendance");

-- CreateIndex
CREATE INDEX "Guest_invitationTokenId_idx" ON "public"."Guest"("invitationTokenId");

-- CreateIndex
CREATE UNIQUE INDEX "InvitationToken_token_key" ON "public"."InvitationToken"("token");

-- CreateIndex
CREATE INDEX "InvitationToken_isUsed_idx" ON "public"."InvitationToken"("isUsed");

-- CreateIndex
CREATE INDEX "InvitationToken_inviteeName_idx" ON "public"."InvitationToken"("inviteeName");

-- CreateIndex
CREATE INDEX "Allergen_category_idx" ON "public"."Allergen"("category");

-- CreateIndex
CREATE UNIQUE INDEX "Allergen_category_name_key" ON "public"."Allergen"("category", "name");

-- CreateIndex
CREATE INDEX "GuestAllergy_allergenId_idx" ON "public"."GuestAllergy"("allergenId");

-- AddForeignKey
ALTER TABLE "public"."Guest" ADD CONSTRAINT "Guest_invitationTokenId_fkey" FOREIGN KEY ("invitationTokenId") REFERENCES "public"."InvitationToken"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GuestAllergy" ADD CONSTRAINT "GuestAllergy_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "public"."Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GuestAllergy" ADD CONSTRAINT "GuestAllergy_allergenId_fkey" FOREIGN KEY ("allergenId") REFERENCES "public"."Allergen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
