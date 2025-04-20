import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';

interface XlsxViewerProps {
  url: string;
}

const XlsxViewer: React.FC<XlsxViewerProps> = ({ url }) => {
  const [data, setData] = useState<any[][]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAndParse = async () => {
      try {
        const res = await fetch(url);
        const arrayBuffer = await res.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        setData(jsonData as any[][]);
      } catch (err) {
        console.error('XLSX parse error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAndParse();
  }, [url]);

  if (loading) return <p>Loading spreadsheet...</p>;
  if (!data.length) return <p>No data available</p>;

  return (
    <div className="overflow-auto">
      <table className="table-auto border-collapse border border-gray-300 w-full">
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className={rowIndex === 0 ? 'font-semibold bg-gray-100' : ''}>
              {row.map((cell, colIndex) => (
                <td key={colIndex} className="border p-1 text-xs">
                  {cell !== undefined ? String(cell) : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default XlsxViewer;
