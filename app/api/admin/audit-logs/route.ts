import { getAuditLogs } from '@/lib/audit-service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const action = searchParams.get('action') as any;
    const userId = searchParams.get('userId') as string | undefined;
    const adminId = searchParams.get('adminId') as string | undefined;

    // Get admin check from header (in production, verify JWT token properly)
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { logs, total } = await getAuditLogs(limit, offset, {
      action,
      userId,
      adminId,
    });

    return NextResponse.json(
      {
        success: true,
        logs,
        pagination: {
          total,
          limit,
          offset,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Audit logs retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve audit logs' },
      { status: 500 }
    );
  }
}
