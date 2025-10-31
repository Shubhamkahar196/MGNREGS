import { NextRequest, NextResponse } from "next/server";
import { MGNREGSApiClient } from "../../../lib/api-client";
import { prisma } from "../../../lib/database";

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
                      
    const performanceData = apiData.records.map((record: any) => ({
      districtId: record.district_id || districtId,
      month: parseInt(record.month) || new Date().getMonth() + 1,
      year: parseInt(record.year) || new Date().getFullYear(),
      totalHouseholds: parseInt(record.total_households) || 0,
      totalWorkers: parseInt(record.total_workers) || 0,
      personDays: parseInt(record.person_days) || 0,
      womenParticipation: parseFloat(record.women_participation) || 0,
      scstParticipation: parseFloat(record.scst_participation) || 0,
      totalFunds: parseFloat(record.total_funds) || 0,
      fundsUtilized: parseFloat(record.funds_utilized) || 0,
    }));

    // store in database using transaction for better performance

    const results = await prisma.$transaction(
      performanceData.map((data: any) =>
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
  } catch (error: any) {
    console.log('Sync error:', error);
    return NextResponse.json(
        {success: false, error: error.message || 'sync failed'},
        {status: 500}
    )
  }
}
