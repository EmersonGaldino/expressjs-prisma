/*
  Warnings:

  - A unique constraint covering the columns `[User]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `User` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "User" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User.User_unique" ON "User"("User");
