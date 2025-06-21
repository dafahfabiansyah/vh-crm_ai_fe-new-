import { useState, useEffect } from 'react';
import { whatsappService, type WhatsAppSession } from '@/services';

export const useWhatsAppSessions = () => {
  const [selectedSession, setSelectedSession] = useState<WhatsAppSession | null>(null);
  const [sessions, setSessions] = useState<WhatsAppSession[]>([]);
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
    setSessions((prev) =>
      prev.map((s) => (s.id === selectedSession.id ? selectedSession : s))
    );
    // Show success message
    console.log("Session saved:", selectedSession);
  };

  const handleDelete = () => {
    if (!selectedSession) return;
    setSessions((prev) => prev.filter((s) => s.id !== selectedSession.id));
    if (sessions.length > 1) {
      setSelectedSession(
        sessions.find((s) => s.id !== selectedSession.id) || sessions[0]
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
