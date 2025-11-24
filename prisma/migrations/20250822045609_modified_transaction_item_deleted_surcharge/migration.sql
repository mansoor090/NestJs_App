/*
  Warnings:

  - You are about to drop the column `dueDate` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `paidAt` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHash` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Surcharge` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `status` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."ProductType" AS ENUM ('MONTHLY_BILL', 'LATE_SURCHARGE');

-- DropForeignKey
ALTER TABLE "public"."Surcharge" DROP CONSTRAINT "Surcharge_transactionId_fkey";

-- AlterTable
ALTER TABLE "public"."Transaction" DROP COLUMN "dueDate",
DROP COLUMN "paidAt",
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "status" "public"."TransactionStatus" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "passwordHash",
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "public"."Surcharge";

-- CreateTable
CREATE TABLE "public"."Items" (
    "id" TEXT NOT NULL,
    "productType" "public"."ProductType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "transactionId" TEXT NOT NULL,

    CONSTRAINT "Items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Items" ADD CONSTRAINT "Items_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "public"."Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
