import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Extract 3D model UUID from SVGNODE in shape data
function extract3DModelUUID(dataStr: any): string | null {
  try {
    if (dataStr?.shape && Array.isArray(dataStr.shape)) {
      for (const shape of dataStr.shape) {
        let shapeStr: string;
        if (typeof shape === 'string') {
          shapeStr = shape;
        } else if (shape.gge) {
          shapeStr = shape.gge;
        } else {
          continue;
        }

        if (shapeStr.startsWith('SVGNODE')) {
          const parts = shapeStr.split('~');
          if (parts.length > 1) {
            try {
              const svgData = JSON.parse(parts[1]);
              if (svgData.attrs && svgData.attrs.uuid) {
                return svgData.attrs.uuid;
              }
            } catch (e) {
              // Continue to next shape if JSON parse fails
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error extracting 3D model UUID:', error);
  }

  return null;
}

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

    // Extract 3D model UUID from SVGNODE in shape data
    const uuid_3d = extract3DModelUUID(footprintData);

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
