import { NextRequest, NextResponse } from 'next/server';
import { LocationService } from '../../lib/location';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    
    if (lat && lng) {
      const location = await LocationService.getDistrictFromCoordinates(
        parseFloat(lat),
        parseFloat(lng)
      );
      return NextResponse.json({ success: true, data: location });
    }
    
    return NextResponse.json(
      { success: false, error: 'Coordinates required' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to get location' },
      { status: 500 }
    );
  }
}