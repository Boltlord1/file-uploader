-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "hash" VARCHAR(255) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Folder" (
    "path" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "parentPath" TEXT,

    CONSTRAINT "Folder_pkey" PRIMARY KEY ("path")
);

-- CreateTable
CREATE TABLE "File" (
    "name" VARCHAR(255) NOT NULL,
    "mime" VARCHAR(255) NOT NULL,
    "url" VARCHAR(255) NOT NULL,
    "size" INTEGER NOT NULL,
    "uploaded" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "folderPath" TEXT NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("name","folderPath")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sid" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sid_key" ON "Session"("sid");

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_parentPath_fkey" FOREIGN KEY ("parentPath") REFERENCES "Folder"("path") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_folderPath_fkey" FOREIGN KEY ("folderPath") REFERENCES "Folder"("path") ON DELETE RESTRICT ON UPDATE CASCADE;
