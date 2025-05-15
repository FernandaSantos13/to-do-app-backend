-- CreateTable
CREATE TABLE "ToDo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false
);
