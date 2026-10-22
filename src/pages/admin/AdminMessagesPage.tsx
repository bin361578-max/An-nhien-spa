import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDateTimeVN } from '../../utils/formatters';
import { ContactMessage } from '../../types';
import { MessageSquare, Mail, Phone, CheckCircle, Trash2, Eye } from 'lucide-react';

export const AdminMessagesPage: React.FC = () => {
  const { messages, updateMessageStatus, deleteMessage } = useApp();
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  const handleMarkAsRead = (msg: ContactMessage) => {
    updateMessageStatus(msg.id, 'read');
    if (selectedMessage && selectedMessage.id === msg.id) {
      setSelectedMessage({ ...selectedMessage, status: 'read' });
    }
  };

  const handleMarkAsReplied = (msg: ContactMessage) => {
    updateMessageStatus(msg.id, 'replied');
    if (selectedMessage && selectedMessage.id === msg.id) {
      setSelectedMessage({ ...selectedMessage, status: 'replied' });
    }
  };

  const handleDelete = (id: string) => {
    deleteMessage(id);
    if (selectedMessage && selectedMessage.id === id) {
      setSelectedMessage(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E0DBCB]">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#1F2F23]">
            Quản Lý Tin Nhắn Liên Hệ
          </h2>
          <p className="text-xs text-[#5F7463] mt-0.5">
            Các yêu cầu tư vấn và câu hỏi từ khách hàng gửi qua form website
          </p>
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-white rounded-2xl border border-[#DFDAC8] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F5] border-b border-[#E0DBCB] text-[#556D5B] font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Thời gian</th>
                <th className="py-3.5 px-4">Khách hàng</th>
                <th className="py-3.5 px-4">Tiêu đề / Chủ đề</th>
                <th className="py-3.5 px-4">Nội dung tóm tắt</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EFE6]">
              {messages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Chưa có tin nhắn liên hệ nào.
                  </td>
                </tr>
              ) : (
                messages.map((m) => (
                  <tr
                    key={m.id}
                    className={`hover:bg-[#FAF9F5]/70 transition-colors ${
                      m.status === 'unread' ? 'bg-[#FAF8F0] font-medium' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 text-[#718575] tabular-nums whitespace-nowrap">
                      {formatDateTimeVN(m.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#203124]">
                      {m.name}
                      <div className="text-[11px] text-[#718575] font-normal">{m.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#2A3E2F] max-w-[180px] truncate">
                      {m.subject}
                    </td>
                    <td className="py-3.5 px-4 text-[#5D7060] max-w-xs truncate">
                      {m.message}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          m.status === 'unread'
                            ? 'bg-amber-100 text-amber-800'
                            : m.status === 'read'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {m.status === 'unread' ? 'Chưa đọc' : m.status === 'read' ? 'Đã đọc' : 'Đã phản hồi'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            handleMarkAsRead(m);
                            setSelectedMessage(m);
                          }}
                          className="p-1.5 text-[#3E5C44] hover:bg-[#F2EFE6] rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(m.id)}
                          className="p-1.5 text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Xóa tin nhắn"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#DFDAC8] space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE5D7]">
              <div>
                <span className="text-[10px] uppercase font-semibold text-[#667A6B]">Nội dung liên hệ</span>
                <h3 className="font-serif text-lg font-bold text-[#203124]">{selectedMessage.subject}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-[#FAF9F5] p-3.5 rounded-xl border border-[#DFDAC8] space-y-1">
                <div>Từ: <strong>{selectedMessage.name}</strong></div>
                <div>Điện thoại: <strong>{selectedMessage.phone}</strong></div>
                <div>Email: {selectedMessage.email}</div>
                <div>Gửi lúc: {formatDateTimeVN(selectedMessage.createdAt)}</div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-[#DFDAC8] space-y-1">
                <span className="font-semibold text-[#273B2C] block">Nội dung thư:</span>
                <p className="text-sm text-[#4E6252] leading-relaxed whitespace-pre-line">
                  {selectedMessage.message}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => handleMarkAsReplied(selectedMessage)}
                  className="py-2 px-3 bg-emerald-700 text-white rounded-xl font-semibold hover:bg-emerald-800 flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Đánh dấu đã phản hồi khách</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  className="py-2 px-4 border border-[#D5D0BF] text-[#465E4B] rounded-xl font-semibold hover:bg-[#FAF9F5]"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
