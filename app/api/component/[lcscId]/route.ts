import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ lcscId: string }> }
) {
  try {
    const { lcscId } = await context.params;

    if (!lcscId) {
      return NextResponse.json(
        { error: 'LCSC ID is required' },
        { status: 400 }
      );
    }

    const response = await axios.get(
      `https://easyeda.com/api/products/${lcscId}/components?version=6.4.19.5`,
      {
        headers: {
          'Accept': 'application/json, text/javascript, */*',
          'Accept-Encoding': 'gzip, deflate',
          'User-Agent': 'easyeda2kicad-web/1.0.0',
        },
      }
    );

    const data = response.data;

    if (!data.success || !data.result) {
      return NextResponse.json(
        { error: 'Component not found' },
        { status: 404 }
      );
    }

    const result = data.result;

    // Footprint data is retrieved from packageDetail
    const footprintData = result.packageDetail?.dataStr;
    const uuid_3d = footprintData?.head?.uuid_3d || null;

    return NextResponse.json({
      success: true,
      lcscId,
      data: {
        title: result.title,
        description: result.description,
        dataStr: footprintData, // Returns dataStr from packageDetail
        '3d_model': uuid_3d,
      },
    });
  } catch (error) {
    console.error('Error fetching component:', error);
    return NextResponse.json(
      { error: 'Failed to fetch component data' },
      { status: 500 }
    );
  }
}
