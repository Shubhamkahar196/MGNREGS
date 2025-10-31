-- CreateTable
CREATE TABLE "District" (
    "id" TEXT NOT NULL,
    "districtId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Performance" (
    "id" TEXT NOT NULL,
    "districtId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "totalHouseholds" INTEGER NOT NULL,
    "totalWorkers" INTEGER NOT NULL,
    "personDays" INTEGER NOT NULL,
    "womenParticipation" DOUBLE PRECISION NOT NULL,
    "scstParticipation" DOUBLE PRECISION NOT NULL,
    "totalFunds" DOUBLE PRECISION NOT NULL,
    "fundsUtilized" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Performance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "District_districtId_key" ON "District"("districtId");

-- CreateIndex
CREATE UNIQUE INDEX "Performance_districtId_month_year_key" ON "Performance"("districtId", "month", "year");

-- AddForeignKey
ALTER TABLE "Performance" ADD CONSTRAINT "Performance_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE CASCADE ON UPDATE CASCADE;
