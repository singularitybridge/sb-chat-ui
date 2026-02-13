import { ApiResponseMessage, ChatMessage, FileMetadata, Metadata } from '../types/chat';

export const removeRAGCitations = (text: string): string => {
  return text.replace(/【\d+:\d+†source】/g, '');
};

export const mapApiMessageToChatMessage = (apiMessage: ApiResponseMessage): ChatMessage => {
  const textValue = apiMessage.content?.[0]?.text?.value ||
                    (apiMessage.role === 'system' ? `System: ${apiMessage.message_type}` : 'No content available');

  const mappedMetadata: Metadata = {
    message_type: apiMessage.message_type,
    ...(apiMessage.data || {})
  };

  if (apiMessage.message_type === 'action_execution' && apiMessage.data?.messageId) {
    mappedMetadata.messageId = apiMessage.data.messageId;
  }

  // Extract fileMetadata if attachments exist
  let fileMetadata: FileMetadata | undefined;
  if (apiMessage.data?.attachments && Array.isArray(apiMessage.data.attachments) && apiMessage.data.attachments.length > 0) {
    const attachment = apiMessage.data.attachments[0];
    if (attachment.fileName && attachment.mimeType && attachment.url) {
      fileMetadata = {
        id: attachment.fileId || undefined,
        type: attachment.mimeType.startsWith('image/') ? 'image' : 'file',
        url: attachment.url,
        fileName: attachment.fileName,
        fileSize: attachment.fileSize || attachment.size || 0,
        mimeType: attachment.mimeType,
      };
    }
  }

  const chatMessage = {
    id: apiMessage.id,
    content: removeRAGCitations(textValue),
    role: apiMessage.role,
    metadata: mappedMetadata,
    createdAt: apiMessage.created_at,
    fileMetadata,
  };

  return chatMessage;
};
