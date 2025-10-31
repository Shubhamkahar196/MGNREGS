import { NextRequest, NextResponse } from "next/server";
import { MGNREGSApiClient } from "../../../lib/api-client";
import { prisma } from "../../../lib/database";

interface PerformanceRecord {
  districtId: string;
  month: number;
  year: number;
  totalHouseholds: number;
  totalWorkers: number;
  personDays: number;
  womenParticipation: number;
  scstParticipation: number;
  totalFunds: number;
  fundsUtilized: number;
}

const apiClient = new MGNREGSApiClient();

export async function POST(request: NextRequest) {
  try {
    const { districtId } = await request.json();

    if (!districtId) {
      return NextResponse.json(
        { success: false, error: "District ID required" },
        { status: 400 }
      );
    }

    //fetch data from gove api with retry logic

    const apiData = await apiClient.getDistrictPerformanceWithRetry(districtId);

    if (!apiData || !apiData.records) {
      return NextResponse.json(
        { success: false, error: "No data received from API" },
        { status: 404 }
      );
    }

    // transform and store in database

    const performanceData: PerformanceRecord[] = apiData.records.map((record: unknown) => {
      const r = record as Record<string, unknown>;
      return {
        districtId: (r.district_id as string) || districtId,
        month: parseInt(r.month as string) || new Date().getMonth() + 1,
        year: parseInt(r.year as string) || new Date().getFullYear(),
        totalHouseholds: parseInt(r.total_households as string) || 0,
        totalWorkers: parseInt(r.total_workers as string) || 0,
        personDays: parseInt(r.person_days as string) || 0,
        womenParticipation: parseFloat(r.women_participation as string) || 0,
        scstParticipation: parseFloat(r.scst_participation as string) || 0,
        totalFunds: parseFloat(r.total_funds as string) || 0,
        fundsUtilized: parseFloat(r.funds_utilized as string) || 0,
      };
    });

    // store in database using transaction for better performance

    const results = await prisma.$transaction(
      performanceData.map((data) =>
        prisma.performance.upsert({
          where: {
            districtId_month_year: {
              districtId: data.districtId,
              month: data.month,
              year: data.year,
            },
          },
          update: data,
          create: data,
        })
      )
    );

    return NextResponse.json({
        success: true,
        message: `Synced ${results.length} records`,
        data: results
    })
  } catch (error: unknown) {
    console.log('Sync error:', error);
    const errorMessage = error instanceof Error ? error.message : 'sync failed';
    return NextResponse.json(
        {success: false, error: errorMessage},
        {status: 500}
    )
  }
}