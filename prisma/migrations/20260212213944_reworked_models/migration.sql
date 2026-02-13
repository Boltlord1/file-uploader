/*
  Warnings:

  - The primary key for the `File` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `folderId` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `File` table. All the data in the column will be lost.
  - The primary key for the `Folder` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Folder` table. All the data in the column will be lost.
  - You are about to drop the column `parentId` on the `Folder` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name,folderPath]` on the table `File` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,parentPath]` on the table `Folder` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `folderPath` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_folderId_fkey";

-- DropForeignKey
ALTER TABLE "Folder" DROP CONSTRAINT "Folder_parentId_fkey";

-- AlterTable
ALTER TABLE "File" DROP CONSTRAINT "File_pkey",
DROP COLUMN "folderId",
DROP COLUMN "id",
ADD COLUMN     "folderPath" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Folder" DROP CONSTRAINT "Folder_pkey",
DROP COLUMN "id",
DROP COLUMN "parentId",
ADD COLUMN     "parentPath" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "File_name_folderPath_key" ON "File"("name", "folderPath");

-- CreateIndex
CREATE UNIQUE INDEX "Folder_name_parentPath_key" ON "Folder"("name", "parentPath");

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_parentPath_fkey" FOREIGN KEY ("parentPath") REFERENCES "Folder"("path") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_folderPath_fkey" FOREIGN KEY ("folderPath") REFERENCES "Folder"("path") ON DELETE RESTRICT ON UPDATE CASCADE;
