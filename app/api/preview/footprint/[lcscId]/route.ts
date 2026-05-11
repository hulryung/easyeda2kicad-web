import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { parseEasyEDAFootprint, convertToKiCadFootprint } from '@/lib/kicad-parser';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lcscId: string }> }
) {
  try {
    const { lcscId } = await params;

    // Fetch component data from EasyEDA API
    const response = await axios.get(
      `https://easyeda.com/api/products/${lcscId}/components?version=6.4.19.5`,
      {
        headers: {
          'Accept': 'application/json, text/javascript, */*; q=0.01',
          'Accept-Language': 'en-US,en;q=0.9',
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://easyeda.com/',
          'X-Requested-With': 'XMLHttpRequest',
        },
      }
    );

    const result = response.data.result;

    // Footprint data is in packageDetail.dataStr
    const footprintData = result.packageDetail?.dataStr;

    if (!footprintData) {
      return NextResponse.json(
        { error: 'No footprint data available' },
        { status: 404 }
      );
    }

    // Parse and convert footprint
    const footprintStr = typeof footprintData === 'string'
      ? footprintData
      : JSON.stringify(footprintData);

    const parsed = parseEasyEDAFootprint(footprintStr);
    const kicadFootprint = convertToKiCadFootprint(parsed, parsed.originX, parsed.originY, lcscId);

    // Return as plain text
    return new NextResponse(kicadFootprint, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error generating footprint preview:', error);
    return NextResponse.json(
      { error: 'Failed to generate footprint preview' },
      { status: 500 }
    );
  }
}
