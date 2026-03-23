'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Bell, Megaphone } from 'lucide-react';
import { popupApi, Popup } from '@/lib/api';

const POPUP_STORAGE_KEY = 'popup_dismissed';

interface DismissedPopup {
  id: number;
  dismissedAt: string;
}

function getDismissedPopups(): DismissedPopup[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(POPUP_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function setDismissedPopup(id: number) {
  if (typeof window === 'undefined') return;
  try {
    const dismissed = getDismissedPopups();
    const existing = dismissed.find(d => d.id === id);
    if (!existing) {
      dismissed.push({ id, dismissedAt: new Date().toISOString() });
      localStorage.setItem(POPUP_STORAGE_KEY, JSON.stringify(dismissed));
    }
  } catch {
    // ignore
  }
}

function shouldShowPopup(popup: Popup): boolean {
  const dismissed = getDismissedPopups();
  const dismissedPopup = dismissed.find(d => d.id === popup.id);

  if (!dismissedPopup) return true;

  if (popup.show_frequency === 'once') {
    return false;
  }

  if (popup.show_frequency === 'daily') {
    const dismissedDate = new Date(dismissedPopup.dismissedAt).toDateString();
    const today = new Date().toDateString();
    return dismissedDate !== today;
  }

  return true;
}

export function PopupNotification() {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPopups = useCallback(async () => {
    try {
      setLoading(true);
      const response = await popupApi.getActivePopups();
      const activePopups = response.data || [];
      const filteredPopups = activePopups.filter(shouldShowPopup);
      setPopups(filteredPopups);
      if (filteredPopups.length > 0) {
        setVisible(true);
        await popupApi.recordShow(filteredPopups[0].id);
      }
    } catch (error) {
      console.error('获取弹窗失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPopups();
  }, [fetchPopups]);

  const handleClose = async () => {
    if (popups.length > 0) {
      setDismissedPopup(popups[currentIndex].id);
    }

    if (currentIndex < popups.length - 1) {
      setCurrentIndex(prev => prev + 1);
      const nextPopup = popups[currentIndex + 1];
      if (nextPopup) {
        await popupApi.recordShow(nextPopup.id);
      }
    } else {
      setVisible(false);
    }
  };

  const handleClick = async () => {
    if (popups.length > 0) {
      const popup = popups[currentIndex];
      await popupApi.recordClick(popup.id);
      
      if (popup.link_url) {
        window.open(popup.link_url, '_blank');
      }
      
      setDismissedPopup(popup.id);
      handleClose();
    }
  };

  if (loading || !visible || popups.length === 0) {
    return null;
  }

  const currentPopup = popups[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-lg shadow-xl overflow-hidden">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 p-1 rounded-full bg-white/80 hover:bg-white transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            {currentPopup.type === 'notification' ? (
              <div className="p-2 bg-blue-100 rounded-full">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
            ) : (
              <div className="p-2 bg-purple-100 rounded-full">
                <Megaphone className="w-5 h-5 text-purple-600" />
              </div>
            )}
            <h2 className="text-xl font-semibold text-gray-900">
              {currentPopup.title}
            </h2>
          </div>

          {currentPopup.image_url && (
            <div className="mb-4 rounded-lg overflow-hidden">
              <img
                src={currentPopup.image_url}
                alt={currentPopup.title}
                className="w-full h-auto object-cover cursor-pointer"
                onClick={handleClick}
              />
            </div>
          )}

          <p className="text-gray-600 mb-4 whitespace-pre-wrap">
            {currentPopup.content}
          </p>

          <div className="flex gap-3">
            {currentPopup.link_url && (
              <button
                onClick={handleClick}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                查看详情
              </button>
            )}
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              关闭
            </button>
          </div>
        </div>

        {popups.length > 1 && (
          <div className="px-6 pb-4">
            <div className="flex items-center justify-center gap-2">
              {popups.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
