export const dynamic = 'force-dynamic';

import Link from 'next/link';
import getDb from '@/lib/db';
import { formatDate } from '@/lib/utils';

function getDocuments() {
  const db = getDb();
  return db.prepare(`
    SELECT d.*,
      COUNT(dr.id)             as total,
      SUM(dr.sent)             as sent_count,
      SUM(dr.responded)        as responded_count,
      SUM(dr.registered)       as registered_count
    FROM group_documents d
    LEFT JOIN document_recipients dr ON d.id = dr.document_id
    GROUP BY d.id
    ORDER BY d.created_at DESC
  `).all() as {
    id: number; title: string; description: string;
    document_date: string; deadline: string; created_at: string;
    total: number; sent_count: number; responded_count: number; registered_count: number;
  }[];
}

function Progress({ value, total, color }: { value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-10 text-left">{value}/{total}</span>
    </div>
  );
}

export default function DocumentsPage() {
  const docs = getDocuments();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📋 מסמכים לקבוצה</h1>
          <p className="text-gray-500 text-sm mt-1">מעקב שליחת מסמכים ורישום להורים</p>
        </div>
        <Link
          href="/documents/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
        >
          + מסמך חדש
        </Link>
      </div>

      {docs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-gray-500 mb-4">אין מסמכים עדיין</p>
          <Link href="/documents/new" className="text-blue-600 hover:underline text-sm">
            צור מסמך ראשון
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {docs.map((doc) => (
            <Link
              key={doc.id}
              href={`/documents/${doc.id}`}
              className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h2 className="font-semibold text-gray-800">{doc.title}</h2>
                  {doc.description && (
                    <p className="text-gray-500 text-sm mt-0.5 line-clamp-1">{doc.description}</p>
                  )}
                </div>
                <div className="text-xs text-gray-400 flex-shrink-0 mr-4">
                  {doc.document_date && <div>תאריך: {formatDate(doc.document_date)}</div>}
                  {doc.deadline && <div className="text-orange-600">דדליין: {formatDate(doc.deadline)}</div>}
                </div>
              </div>

              {doc.total > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">נשלח</div>
                    <Progress value={doc.sent_count} total={doc.total} color="bg-blue-400" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">ענה / אישר</div>
                    <Progress value={doc.responded_count} total={doc.total} color="bg-green-400" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">נרשם</div>
                    <Progress value={doc.registered_count} total={doc.total} color="bg-purple-400" />
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
