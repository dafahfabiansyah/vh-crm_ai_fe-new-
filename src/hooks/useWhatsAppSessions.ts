import { useState, useEffect } from 'react';
import { whatsappService } from '@/services';

export const useWhatsAppSessions = () => {
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [sessions, setSessions] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch WhatsApp business sessions
  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await whatsappService.getAllBusinessSessions();

      if (response.success && response.data.sessions.length > 0) {
        setSessions(response.data.sessions);
        setSelectedSession(response.data.sessions[0]);
      } else {
        // No sessions found
        setSessions([]);
        setSelectedSession(null);
      }
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch sessions"
      );
      // No fallback - show empty state
      setSessions([]);
      setSelectedSession(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!selectedSession) return;
    setSessions((prev: any[]) =>
      prev.map((s: any) => (s.id === selectedSession.id ? selectedSession : s))
    );
    // Show success message
    console.log("Session saved:", selectedSession);
  };

  const handleDelete = () => {
    if (!selectedSession) return;
    setSessions((prev: any[]) => prev.filter((s: any) => s.id !== selectedSession.id));
    if (sessions.length > 1) {
      setSelectedSession(
        sessions.find((s: any) => s.id !== selectedSession.id) || sessions[0]
      );
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return {
    selectedSession,
    setSelectedSession,
    sessions,
    loading,
    error,
    fetchSessions,
    handleSave,
    handleDelete,
  };
};
