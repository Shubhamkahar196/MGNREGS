import { NextRequest, NextResponse } from "next/server";
import {prisma} from '../../../lib/database'

export async function GET(request:NextRequest){
    try {
        const {searchParams} = new URL(request.url);
        const districtId = searchParams.get('districtId');
        const year = searchParams.get('year');

        if(!districtId){
            return NextResponse.json(
                {success: false, error: 'District ID Requied'},
                {status: 400}
            );
        }

        const whereClause: { districtId: string; year?: number } = { districtId };
        if(year){
            whereClause.year = parseInt(year);
        }

        const performance = await prisma.performance.findMany({
            where: whereClause,
            orderBy: [
                {year: 'desc'},
            {month: 'desc'}
            ],
            include: {
                district: true
            }
        });

        return NextResponse.json({
            success: true,
            data: performance
        });
    } catch (error) {
        console.error('Data fetch error : ',error);
        return NextResponse.json(
            {success: false, error: 'Failed to fetch data'},
            {status: 500}
        )
    }
}