-- DropIndex
DROP INDEX "Folder_name_parentPath_key";

-- AlterTable
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_pkey" PRIMARY KEY ("path");

-- DropIndex
DROP INDEX "Folder_path_key";
