import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-20 text-center">
      <div className="max-w-md w-full space-y-5">
        <div className="font-serif text-7xl font-bold text-[#8FA893]">404</div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#233527]">
          Không Tìm Thấy Trang
        </h1>
        <p className="text-sm text-[#5D7060] leading-relaxed">
          Đường dẫn quý khách đang tìm kiếm không tồn tại hoặc đã được dời sang vị trí mới.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#425E47] hover:bg-[#344D39] text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
          >
            <Home className="w-4 h-4" />
            <span>Về trang chủ An Nhiên</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
