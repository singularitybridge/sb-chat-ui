import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Loader2, DollarSign } from 'lucide-react';
import { StickyFormLayout } from '../../components/admin/StickyFormLayout';
import { Button } from '../../components/ui/button';
import { useAssistantStore } from '../../store/useAssistantStore';
import {
  getSessionsList,
  EnrichedSession,
  SessionListFilters,
} from '../../services/api/sessionReviewService';
import { format } from 'date-fns';

const PAGE_SIZE = 20;

export const SessionsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { assistants, assistantsLoaded, loadAssistants } = useAssistantStore();

  const [sessions, setSessions] = useState<EnrichedSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);

  // Filters
  const [channelFilter, setChannelFilter] = useState<string>('');
  const [agentFilter, setAgentFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [channelUserIdFilter, setChannelUserIdFilter] = useState<string>('');

  useEffect(() => {
    if (!assistantsLoaded) {
      loadAssistants();
    }
  }, [assistantsLoaded, loadAssistants]);

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const filters: SessionListFilters = {
        limit: PAGE_SIZE,
        offset,
      };
      if (channelFilter) filters.channel = channelFilter;
      if (agentFilter) filters.agentId = agentFilter;
      if (statusFilter) filters.status = statusFilter as 'active' | 'inactive';
      if (channelUserIdFilter) filters.channelUserId = channelUserIdFilter;

      const response = await getSessionsList(filters);
      setSessions(response.sessions);
      setTotal(response.pagination.total);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [offset, channelFilter, agentFilter, statusFilter, channelUserIdFilter]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);



  const hasMore = offset + PAGE_SIZE < total;
  const hasPrev = offset > 0;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    try {
      return format(new Date(dateStr), 'MMM dd, yyyy HH:mm');
    } catch {
      return '-';
    }
  };

  return (
    <StickyFormLayout
      title={t('SessionReview.title')}
      subtitle={t('SessionReview.subtitle')}
    >
      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={channelFilter}
          onChange={(e) => { setChannelFilter(e.target.value); setOffset(0); }}
          className="px-3 py-2 border border-border rounded-md bg-background text-sm"
        >
          <option value="">{t('SessionReview.filters.allChannels')}</option>
          <option value="web">Web</option>
          <option value="telegram">Telegram</option>
          <option value="whatsapp">WhatsApp</option>
        </select>

        <select
          value={agentFilter}
          onChange={(e) => { setAgentFilter(e.target.value); setOffset(0); }}
          className="px-3 py-2 border border-border rounded-md bg-background text-sm"
        >
          <option value="">{t('SessionReview.filters.allAgents')}</option>
          {assistants.map((a) => (
            <option key={a._id} value={a._id}>
              {a.name}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setOffset(0); }}
          className="px-3 py-2 border border-border rounded-md bg-background text-sm"
        >
          <option value="">{t('SessionReview.filters.allStatuses')}</option>
          <option value="active">{t('SessionReview.filters.active')}</option>
          <option value="inactive">{t('SessionReview.filters.inactive')}</option>
        </select>

        <input
          type="text"
          value={channelUserIdFilter}
          onChange={(e) => { setChannelUserIdFilter(e.target.value); setOffset(0); }}
          placeholder={t('SessionReview.filters.channelUserId')}
          className="px-3 py-2 border border-border rounded-md bg-background text-sm w-48"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center p-8 text-muted-foreground">
          <p>{t('SessionReview.noSessions')}</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 text-sm font-medium text-muted-foreground rtl:text-right ltr:text-left">
                    {t('SessionReview.table.agentName')}
                  </th>
                  <th className="py-3 text-sm font-medium text-muted-foreground rtl:text-right ltr:text-left">
                    {t('SessionReview.table.channel')}
                  </th>
                  <th className="py-3 text-sm font-medium text-muted-foreground rtl:text-right ltr:text-left">
                    {t('SessionReview.table.channelUserId')}
                  </th>
                  <th className="py-3 text-sm font-medium text-muted-foreground rtl:text-right ltr:text-left">
                    {t('SessionReview.table.status')}
                  </th>
                  <th className="py-3 text-sm font-medium text-muted-foreground rtl:text-right ltr:text-left">
                    Cost
                  </th>
                  <th className="py-3 text-sm font-medium text-muted-foreground rtl:text-right ltr:text-left">
                    {t('SessionReview.table.messages')}
                  </th>
                  <th className="py-3 text-sm font-medium text-muted-foreground rtl:text-right ltr:text-left">
                    {t('SessionReview.table.createdAt')}
                  </th>
                  <th className="py-3 text-sm font-medium text-muted-foreground rtl:text-right ltr:text-left">
                    {t('SessionReview.table.lastActivity')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr
                    key={session.sessionId}
                    className="border-b border-border hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/admin/sessions/${session.sessionId}`)}
                  >
                    <td className="py-3 text-sm">{session.agentName}</td>
                    <td className="py-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                        {session.channel}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-muted-foreground truncate max-w-[200px]">
                      {session.channelUserId || '-'}
                    </td>
                    <td className="py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          session.active
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        {session.active ? t('SessionReview.filters.active') : t('SessionReview.filters.inactive')}
                      </span>
                    </td>
                    <td
                      className="py-3 text-sm cursor-pointer hover:text-primary transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/costs?sessionId=${session.sessionId}`);
                      }}
                    >
                      {session.totalCost && session.totalCost > 0 ? (
                        <span className="inline-flex items-center gap-1 text-primary hover:underline">
                          <DollarSign className="w-3 h-3" />
                          {session.totalCost.toFixed(4)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">&mdash;</span>
                      )}
                    </td>
                    <td className="py-3 text-sm">{session.messageCount}</td>
                    <td className="py-3 text-sm text-muted-foreground">
                      {formatDate(session.createdAt)}
                    </td>
                    <td className="py-3 text-sm text-muted-foreground">
                      {formatDate(session.lastMessageAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <span className="text-sm text-muted-foreground">
              {offset + 1}-{Math.min(offset + PAGE_SIZE, total)} of {total}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!hasPrev}
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              >
                {t('common.back')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!hasMore}
                onClick={() => setOffset(offset + PAGE_SIZE)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </StickyFormLayout>
  );
};
