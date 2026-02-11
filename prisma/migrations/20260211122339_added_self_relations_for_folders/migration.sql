-- AlterTable
ALTER TABLE "Folder" ADD COLUMN     "parentId" INTEGER DEFAULT 1;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
