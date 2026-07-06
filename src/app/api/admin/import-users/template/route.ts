import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import * as XLSX from 'xlsx';

export async function GET(request: Request) {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== 'ADMIN' && session.user.role !== 'SUPERADMIN')
  ) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') === 'xlsx' ? 'xlsx' : 'csv';

  const headers = ['email', 'group'];
  const exampleRows = [
    ['prenom.nom@exemple.fr', 'Classe A'],
    ['autre@exemple.fr', ''],
  ];

  if (format === 'csv') {
    const csv = [headers, ...exampleRows]
      .map((row) => row.map((v) => `"${v.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    // BOM UTF-8 pour Excel Windows
    const content = '\uFEFF' + csv;

    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="template-import-participants.csv"',
      },
    });
  }

  // XLSX
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...exampleRows]);
  worksheet['!cols'] = [{ wch: 32 }, { wch: 20 }];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Import');

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="template-import-participants.xlsx"',
    },
  });
}
