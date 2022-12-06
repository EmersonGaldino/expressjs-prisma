/*
  Warnings:

  - You are about to drop the column `UserId` on the `Favorites` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Favorites` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Favorites" DROP COLUMN "UserId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Favorites" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorites" ADD FOREIGN KEY ("MoveId") REFERENCES "Move"("id") ON DELETE CASCADE ON UPDATE CASCADE;
