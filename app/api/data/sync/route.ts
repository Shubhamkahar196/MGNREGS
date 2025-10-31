import { NextRequest,NextResponse } from "next/server";
import { MGNREGSApiClient } from "@/app/lib/api-client";
import {prisma}  from '@/app/lib/database'

const apiClient = new MGNREGSApiClient();

export async function POST(request: NextRequest){
    
}