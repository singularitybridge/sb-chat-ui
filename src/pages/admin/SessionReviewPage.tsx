import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Loader2, DollarSign } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { SBChatKitUI } from '../../components/sb-chat-kit-ui/SBChatKitUI';
import { getSessionById } from '../../services/api/sessionService';
import { getSessionReviewMessages } from '../../services/api/sessionReviewService';
import { getCostSummary } from '../../services/api/costTrackingService';
import { mapApiMessageToChatMessage } from '../../utils/messageTransform';
import { useAssistantStore } from '../../store/useAssistantStore';
import { Avatar, AvatarStyles, getAvatarUrl } from '../../components/Avatar';
import { ModelIndicator } from '../../components/ModelIndicator';
import { ChatMessage } from '../../types/chat';
import { format } from 'date-fns';

export const SessionReviewPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { assistantsLoaded, loadAssistants, getAssistantById } = useAssistantStore();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionData, setSessionData] = useState<any>(null);
  const [sessionCost, setSessionCost] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!assistantsLoaded) {
      loadAssistants();
    }
  }, [assistantsLoaded, loadAssistants]);

  useEffect(() => {
    if (!sessionId) return;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [session, rawMessages, costSummary] = await Promise.all([
          getSessionById(sessionId),
          getSessionReviewMessages(sessionId),
          getCostSummary(undefined, undefined, undefined, sessionId).catch(() => null),
        ]);

        setSessionData(session);
        setSessionCost(costSummary?.totalCost ?? null);

        // Transform and reverse (API returns newest-first)
        const transformed = rawMessages.map(mapApiMessageToChatMessage).reverse();
        setMessages(transformed);
      } catch (err: any) {
        console.error('Failed to load session review data:', err);
        setError(err.message || 'Failed to load session data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [sessionId]);

  const assistant = sessionData?.assistantId
    ? getAssistantById(sessionData.assistantId)
    : undefined;

  const formatDate = (dateStr: string | number | null | undefined) => {
    if (!dateStr) return '-';
    try {
      return format(new Date(dateStr), 'MMM dd, yyyy HH:mm');
    } catch {
      return '-';
    }
  };

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{error}</p>
        <Button variant="outline" onClick={() => navigate('/admin/sessions')}>
          {t('SessionReview.backToSessions')}
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* Back button */}
      <div className="shrink-0 px-6 pt-4 pb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin/sessions')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          {t('SessionReview.backToSessions')}
        </Button>
      </div>

      {/* Session metadata card */}
      {sessionData && (
        <div className="shrink-0 mx-6 mb-4 p-4 rounded-xl border border-border bg-card">
          <div className="flex items-start gap-4">
            {assistant && (
              <Avatar
                avatarStyle={AvatarStyles.avatar}
                imageUrl={getAvatarUrl(assistant.avatarImage)}
                active={true}
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-lg font-semibold truncate">
                  {assistant?.name || sessionData.assistantId}
                </h2>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    sessionData.active
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  }`}
                >
                  {sessionData.active !== false
                    ? t('SessionReview.filters.active')
                    : t('SessionReview.filters.inactive')}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                {sessionData.channel && (
                  <span>
                    {t('SessionReview.filters.channel')}: {' '}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                      {sessionData.channel}
                    </span>
                  </span>
                )}
                {sessionData.channelUserId && (
                  <span>{t('SessionReview.table.channelUserId')}: {sessionData.channelUserId}</span>
                )}
                {assistant?.llmModel && (
                  <span className="flex items-center gap-1">
                    Model: <ModelIndicator modelName={assistant.llmModel} size="small" showBadge={false} />
                  </span>
                )}
                {sessionCost !== null && sessionCost > 0 && (
                  <span
                    className="inline-flex items-center gap-1 cursor-pointer hover:text-primary transition-colors"
                    onClick={() => navigate(`/admin/costs?sessionId=${sessionId}`)}
                  >
                    <DollarSign className="w-3 h-3" />
                    Cost: ${sessionCost.toFixed(4)}
                  </span>
                )}
                <span>{t('SessionReview.table.createdAt')}: {formatDate(sessionData.createdAt)}</span>
                <span>{t('SessionReview.table.messages')}: {messages.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Read-only chat */}
      <div className="flex-1 min-h-0 mx-6 mb-4 rounded-xl border border-border bg-card overflow-hidden">
        <SBChatKitUI
          messages={messages}
          assistant={assistant ? {
            name: assistant.name,
            description: assistant.description || '',
            avatar: assistant.avatarImage || '',
          } : undefined}
          assistantName={assistant?.name || 'Assistant'}
          isLoading={false}
          readOnly={true}
        />
      </div>
    </div>
  );
};
