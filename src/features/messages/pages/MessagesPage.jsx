import { useState, useEffect, useRef } from 'react';
import { useWorkspaceStore } from '../../../store/useWorkspaceStore';
import {
  MessageSquare, Search, Send, Smile, Image as ImageIcon,
  Mic, Square, ChevronLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { api } from '../../../lib/axios';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useSocket } from '../../../app/providers/SocketProvider';
import { getInitials, cn } from '../../../lib/utils';
import { formatTimeAgo } from '../../../lib/dateUtils';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export default function MessagesPage() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { activeWorkspace } = useWorkspaceStore();

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [search, setSearch] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [typingUsers, setTypingUsers] = useState([]);

  const listRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const emojiPickerRef = useRef(null);

  /* Close emoji picker on outside click */
  useEffect(() => {
    if (!showEmojiPicker) return;
    const onClick = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('touchstart', onClick);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('touchstart', onClick);
    };
  }, [showEmojiPicker]);

  // ================== LOAD CHATS ==================
  useEffect(() => {
    if (!activeWorkspace?._id) return;
    const fetchChats = async () => {
      try {
        const res = await api.get(`/workspaces/${activeWorkspace._id}/chats`);
        setChats(res.data || []);
      } catch (error) {
        console.error('Failed to load chats', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchChats();
  }, [activeWorkspace?._id]);

  // ================== LOAD MESSAGES ==================
  useEffect(() => {
    if (!selectedChat || !activeWorkspace?._id) return;
    const fetchMessages = async () => {
      setIsMessagesLoading(true);
      try {
        const res = await api.get(
          `/workspaces/${activeWorkspace._id}/projects/${selectedChat.task.project._id}/tasks/${selectedChat.task._id}/comments?type=comment`
        );
        setMessages(res.data || []);
      } catch (error) {
        console.error('Failed to load messages', error);
      } finally {
        setIsMessagesLoading(false);
      }
    };
    fetchMessages();
  }, [selectedChat, activeWorkspace?._id]);

  // ================== SOCKET ==================
  useEffect(() => {
    if (!socket || !selectedChat) return;
    const taskId = selectedChat.task._id;

    socket.emit('task:join', taskId);

    const handleNewComment = (data) => {
      if (data.taskId !== taskId) return;
      if (data.comment?.type !== 'comment') return;
      setMessages((prev) => {
        if (prev.find((c) => c._id === data.comment._id)) return prev;
        return [...prev, data.comment];
      });
      if (activeWorkspace?._id) {
        api.get(`/workspaces/${activeWorkspace._id}/chats`)
          .then((res) => setChats(res.data || []))
          .catch(() => {});
      }
    };

    const handleDeleteComment = (data) => {
      if (data.taskId !== taskId) return;
      setMessages((prev) => prev.filter((c) => c._id !== data.commentId));
    };

    const handleTypingStart = (data) => {
      if (data.taskId !== taskId || data.userId === user._id) return;
      setTypingUsers((prev) => {
        if (prev.find((u) => u.userId === data.userId)) return prev;
        return [...prev, { userId: data.userId, name: data.name }];
      });
    };

    const handleTypingStop = (data) => {
      if (data.taskId !== taskId) return;
      setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
    };

    socket.on('comment:created', handleNewComment);
    socket.on('comment:deleted', handleDeleteComment);
    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);

    return () => {
      socket.emit('task:leave', taskId);
      socket.off('comment:created', handleNewComment);
      socket.off('comment:deleted', handleDeleteComment);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
    };
  }, [socket, selectedChat, user, activeWorkspace?._id]);

  // Auto-scroll (smooth)
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages.length]);

  // Reset unread on chat select
  useEffect(() => {
    if (!selectedChat) setTypingUsers([]);
  }, [selectedChat]);

  // ================== SEND MESSAGE ==================
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    setIsPosting(true);
    try {
      await api.post(
        `/workspaces/${activeWorkspace._id}/projects/${selectedChat.task.project._id}/tasks/${selectedChat.task._id}/comments`,
        { content: newMessage, type: 'comment' }
      );
      setNewMessage('');
      if (socket) socket.emit('typing:stop', { taskId: selectedChat.task._id });
    } catch (error) {
      toast.error('Failed to send');
    } finally {
      setIsPosting(false);
    }
  };

  const handleTyping = () => {
    if (!socket || !selectedChat) return;
    socket.emit('typing:start', { taskId: selectedChat.task._id });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing:stop', { taskId: selectedChat.task._id });
    }, 2000);
  };

  // ================== IMAGE UPLOAD ==================
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedChat) return;
    setIsPosting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await api.post(
        `/workspaces/${activeWorkspace._id}/projects/${selectedChat.task.project._id}/tasks/${selectedChat.task._id}/comments/upload`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      await api.post(
        `/workspaces/${activeWorkspace._id}/projects/${selectedChat.task.project._id}/tasks/${selectedChat.task._id}/comments`,
        { content: '', type: 'comment', messageType: 'image', attachments: [uploadRes.data] }
      );
      toast.success('Image sent');
    } catch (error) {
      toast.error('Failed to send image');
    } finally {
      setIsPosting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ================== VOICE ==================
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((t) => t.stop());
        if (audioBlob.size > 0 && selectedChat) {
          setIsPosting(true);
          try {
            const file = new File([audioBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
            const formData = new FormData();
            formData.append('file', file);
            const uploadRes = await api.post(
              `/workspaces/${activeWorkspace._id}/projects/${selectedChat.task.project._id}/tasks/${selectedChat.task._id}/comments/upload`,
              formData,
              { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            await api.post(
              `/workspaces/${activeWorkspace._id}/projects/${selectedChat.task.project._id}/tasks/${selectedChat.task._id}/comments`,
              { content: '', type: 'comment', messageType: 'voice', attachments: [uploadRes.data] }
            );
            toast.success('Voice sent');
          } catch (error) {
            toast.error('Failed to send voice');
          } finally {
            setIsPosting(false);
          }
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((p) => p + 1), 1000);
    } catch (error) {
      toast.error('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const addEmoji = (emoji) => {
    setNewMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const filteredChats = chats.filter((c) => {
    if (!search.trim()) return true;
    return c.task.title.toLowerCase().includes(search.toLowerCase());
  });

  const formatTime = (s) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (!activeWorkspace) {
    return (
      <div className="p-6 sm:p-10 text-center text-sm text-slate-500">
        Please select a workspace to view chats.
      </div>
    );
  }

  return (
    <div className="h-[calc(100dvh-4rem)] sm:h-[calc(100vh-4rem)] flex bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">

      {/* LEFT: Chat List */}
      <div
        className={cn(
          'w-full md:w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 min-w-0',
          selectedChat && 'hidden md:flex'
        )}
      >
        <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800">
          <h1 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2.5 sm:mb-3">
            <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500" /> Chats
          </h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              placeholder="Search chats..."
              className="pl-9 h-9 sm:h-10 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-xs sm:text-sm text-slate-500">Loading...</div>
          ) : filteredChats.length === 0 ? (
            <div className="p-5 sm:p-6 text-center text-xs sm:text-sm text-slate-500">
              No chats yet. Comments on tasks will appear here.
            </div>
          ) : (
            filteredChats.map((chat) => (
              <button
                key={chat.task._id}
                onClick={() => setSelectedChat(chat)}
                className={cn(
                  'w-full text-left p-2.5 sm:p-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors',
                  selectedChat?.task._id === chat.task._id &&
                    'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-l-indigo-500'
                )}
              >
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
                    <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {chat.task.title}
                      </p>
                      {chat.lastMessage && (
                        <span className="text-[9px] sm:text-[10px] text-slate-500 shrink-0 whitespace-nowrap">
                          {formatTimeAgo(chat.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-500 truncate mt-0.5">
                      {chat.lastMessage?.content ||
                        (chat.lastMessage?.messageType === 'image'
                          ? '📷 Image'
                          : chat.lastMessage?.messageType === 'voice'
                          ? '🎤 Voice'
                          : 'No messages')}
                    </p>
                    <span className="text-[9px] sm:text-[10px] text-indigo-600 dark:text-indigo-400 mt-0.5 sm:mt-1 inline-block truncate">
                      {chat.task.project?.name} · {chat.task.commentCount} messages
                    </span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* RIGHT: Chat Window */}
      <div className={cn('flex-1 flex flex-col min-w-0', !selectedChat && 'hidden md:flex')}>
        {!selectedChat ? (
          <div className="flex-1 flex items-center justify-center text-center p-6 sm:p-8">
            <div>
              <MessageSquare className="h-12 w-12 sm:h-16 sm:w-16 text-slate-300 dark:text-slate-600 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-1.5 sm:mb-2">
                Select a chat
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Choose a conversation from the list to start messaging.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="p-2.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setSelectedChat(null)}
                className="md:hidden p-1 -ml-1 text-slate-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Back to chats"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {selectedChat.task.title}
                </h2>
                <p className="text-[10px] sm:text-xs text-slate-500 truncate">
                  {selectedChat.task.project?.name} · {messages.length} messages
                </p>
              </div>
            </div>

            {/* Messages */}
            <div ref={listRef} className="flex-1 overflow-y-auto p-2.5 sm:p-4 space-y-2.5 sm:space-y-3">
              {isMessagesLoading ? (
                <div className="text-center text-xs sm:text-sm text-slate-500">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <p className="text-xs sm:text-sm text-slate-500 italic">No messages yet. Say hi! 👋</p>
                </div>
              ) : (
                <AnimatePresence>
                  {messages.map((msg) => {
                    const isOwn = msg.author?._id === user._id;
                    const isImage =
                      msg.messageType === 'image' ||
                      msg.attachments?.[0]?.type === 'image';
                    const isVoice =
                      msg.messageType === 'voice' ||
                      msg.attachments?.[0]?.type === 'audio';
                    return (
                      <motion.div
                        key={msg._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          'flex gap-2 group',
                          isOwn ? 'flex-row-reverse' : 'flex-row'
                        )}
                      >
                        <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-[10px] sm:text-xs shrink-0 overflow-hidden">
                          {msg.author?.avatar?.url ? (
                            <img
                              src={msg.author.avatar.url}
                              alt=""
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            getInitials(msg.author?.name)
                          )}
                        </div>
                        <div
                          className={cn(
                            'flex-1 min-w-0 max-w-[80%] sm:max-w-[75%] flex flex-col',
                            isOwn ? 'items-end' : 'items-start'
                          )}
                        >
                          <div
                            className={cn(
                              'flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap',
                              isOwn && 'flex-row-reverse'
                            )}
                          >
                            <span className="text-[10px] sm:text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[100px] sm:max-w-none">
                              {msg.author?.name}
                            </span>
                            <span className="text-[9px] sm:text-[10px] text-slate-500 shrink-0">
                              {formatTimeAgo(msg.createdAt)}
                            </span>
                          </div>
                          <div
                            className={cn(
                              'p-2 sm:p-2.5 rounded-2xl relative max-w-full',
                              isOwn
                                ? 'bg-indigo-600 text-white rounded-tr-sm'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm'
                            )}
                          >
                            {isImage && msg.attachments?.[0]?.url && (
                              <img
                                src={msg.attachments[0].url}
                                alt="attachment"
                                className="rounded-lg max-w-full max-h-40 sm:max-h-48 mb-1.5 sm:mb-2 object-cover"
                              />
                            )}
                            {isVoice && msg.attachments?.[0]?.url && (
                              <audio
                                controls
                                src={msg.attachments[0].url}
                                className="max-w-full mb-1.5 sm:mb-2"
                              />
                            )}
                            {msg.content && (
                              <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">
                                {msg.content}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}

              {typingUsers.length > 0 && (
                <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-500 italic">
                  <div className="flex gap-1">
                    <span
                      className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    />
                    <span
                      className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <span
                      className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                  <span className="truncate">
                    {typingUsers.map((u) => u.name).join(', ')} typing...
                  </span>
                </div>
              )}
            </div>

            {/* Recording bar */}
            {isRecording && (
              <div className="mx-2 sm:mx-4 mb-2 flex items-center gap-2 sm:gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2">
                <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 bg-red-500 rounded-full animate-pulse shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-red-700 dark:text-red-400 truncate">
                  Recording... {formatTime(recordingTime)}
                </span>
                <button
                  onClick={stopRecording}
                  className="ml-auto p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shrink-0"
                  aria-label="Stop recording"
                >
                  <Square className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Composer */}
            <div className="p-2 sm:p-3 border-t border-slate-200 dark:border-slate-800 flex items-end gap-1 sm:gap-1.5">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full shrink-0"
                title="Send image"
                aria-label="Send image"
              >
                <ImageIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={cn(
                  'p-2 rounded-full shrink-0',
                  isRecording
                    ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
                title="Record voice"
                aria-label={isRecording ? 'Stop recording' : 'Start recording'}
              >
                {isRecording ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>
              <div className="flex-1 relative min-w-0">
                <textarea
                  rows={1}
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 sm:py-2.5 text-xs sm:text-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 resize-none pr-9 sm:pr-10"
                  style={{ minHeight: '40px', maxHeight: '100px' }}
                />
                <div ref={emojiPickerRef} className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="text-slate-400 hover:text-indigo-500 p-0.5"
                    aria-label="Emoji"
                  >
                    <Smile className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute bottom-full mb-2 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-1.5 sm:p-2 flex gap-0.5 sm:gap-1 z-10">
                      {['👍', '❤️', '🔥', '😂', '🎉', '😮'].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => addEmoji(emoji)}
                          className="hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded text-base sm:text-lg"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <Button
                type="button"
                onClick={handleSendMessage}
                className="h-9 sm:h-11 px-2.5 sm:px-3 shrink-0"
                isLoading={isPosting}
                disabled={!newMessage.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}