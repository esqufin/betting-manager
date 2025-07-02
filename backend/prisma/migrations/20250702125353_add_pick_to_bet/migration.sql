/*
  Warnings:

  - Added the required column `date` to the `MultiEntry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bet" ADD COLUMN "pick" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MultiEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "betId" INTEGER NOT NULL,
    "match" TEXT NOT NULL,
    "odds" REAL NOT NULL,
    "pick" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    CONSTRAINT "MultiEntry_betId_fkey" FOREIGN KEY ("betId") REFERENCES "Bet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MultiEntry" ("betId", "id", "match", "odds", "pick") SELECT "betId", "id", "match", "odds", "pick" FROM "MultiEntry";
DROP TABLE "MultiEntry";
ALTER TABLE "new_MultiEntry" RENAME TO "MultiEntry";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
