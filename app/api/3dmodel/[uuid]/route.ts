import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await context.params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'obj';

    if (!uuid) {
      return NextResponse.json(
        { error: 'UUID is required' },
        { status: 400 }
      );
    }

    let url = '';
    if (format === 'step') {
      url = `https://modules.easyeda.com/qAxj6KHrDKw4blvCG8QJPs7Y/${uuid}`;
    } else {
      url = `https://modules.easyeda.com/3dmodel/${uuid}`;
    }

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'easyeda2kicad-web/1.0.0',
      },
      responseType: format === 'step' ? 'arraybuffer' : 'text',
    });

    if (format === 'step') {
      return new NextResponse(response.data, {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${uuid}.step"`,
        },
      });
    }

    return new NextResponse(response.data, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.error('Error fetching 3D model:', error);
    return NextResponse.json(
      { error: 'Failed to fetch 3D model' },
      { status: 500 }
    );
  }
}
