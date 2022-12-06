/*
  Warnings:

  - You are about to drop the column `User` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[Login]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `Login` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User.User_unique";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "User",
ADD COLUMN     "Login" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User.Login_unique" ON "User"("Login");
