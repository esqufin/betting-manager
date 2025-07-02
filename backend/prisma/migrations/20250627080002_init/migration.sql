-- CreateTable
CREATE TABLE "Channel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "cashback" REAL,
    "type" TEXT NOT NULL,
    "period" TEXT,
    "weekStart" TEXT,
    "monthStart" INTEGER
);

-- CreateTable
CREATE TABLE "Bet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "channelId" INTEGER NOT NULL,
    "match" TEXT,
    "stake" REAL NOT NULL,
    "odds" REAL NOT NULL,
    "betType" TEXT,
    "result" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "kind" TEXT NOT NULL DEFAULT 'Single',
    CONSTRAINT "Bet_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MultiEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "betId" INTEGER NOT NULL,
    "match" TEXT NOT NULL,
    "odds" REAL NOT NULL,
    "pick" TEXT NOT NULL,
    CONSTRAINT "MultiEntry_betId_fkey" FOREIGN KEY ("betId") REFERENCES "Bet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "channelId" INTEGER NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "date" DATETIME NOT NULL,
    "comment" TEXT,
    "correction" REAL,
    "fxRate" REAL,
    CONSTRAINT "Transaction_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
