import { useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, FileImage, QrCode } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { APP_CONFIG, buildTableQrUrl } from '../../config';

export default function AdminQrTab() {
  const [tableNum, setTableNum] = useState('1');
  const canvasRef = useRef(null);

  const qrUrl = buildTableQrUrl(tableNum);

  const downloadPng = () => {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `qr-table-${tableNum}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const downloadPdf = () => {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (!canvas) return;
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
    const pageW = pdf.internal.pageSize.getWidth();

    pdf.setFontSize(18);
    pdf.text(APP_CONFIG.cafeName, pageW / 2, 20, { align: 'center' });
    pdf.setFontSize(12);
    pdf.text(`Столик №${tableNum}`, pageW / 2, 30, { align: 'center' });
    pdf.addImage(imgData, 'PNG', pageW / 2 - 40, 40, 80, 80);
    pdf.setFontSize(9);
    pdf.text('Отсканируйте для заказа', pageW / 2, 130, { align: 'center' });
    pdf.setFontSize(7);
    pdf.text(qrUrl, pageW / 2, 138, { align: 'center', maxWidth: pageW - 20 });
    pdf.save(`qr-table-${tableNum}.pdf`);
  };

  return (
    <div className="max-w-lg">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center">
            <QrCode className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Генератор QR-кодов</h3>
            <p className="text-sm text-slate-500">Для печати на столиках</p>
          </div>
        </div>

        <label className="block text-sm font-medium text-slate-700 mb-2">
          Номер столика
        </label>
        <input
          type="number"
          min="1"
          max="999"
          value={tableNum}
          onChange={(e) => setTableNum(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-lg font-semibold outline-none focus:ring-2 focus:ring-slate-900 mb-6"
        />

        <div
          ref={canvasRef}
          className="flex flex-col items-center p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 mb-4"
        >
          <QRCodeCanvas
            value={qrUrl}
            size={200}
            level="H"
            includeMargin
            bgColor="#ffffff"
            fgColor="#1d1d1f"
          />
          <p className="text-xs text-slate-400 mt-4 break-all text-center">{qrUrl}</p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={downloadPng}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            <FileImage className="w-4 h-4" />
            PNG
          </button>
          <button
            type="button"
            onClick={downloadPdf}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>
    </div>
  );
}
